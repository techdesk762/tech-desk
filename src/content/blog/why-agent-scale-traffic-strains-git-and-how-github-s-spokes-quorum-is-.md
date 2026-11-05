---
title: "Why agent-scale traffic strains Git, and how GitHub's Spokes quorum is changing"
description: "GitHub moved busy repos to Azure by serializing writes per reference, not per repo. What changed in the Spokes quorum, virtual replicas, and what teams should expect."
pubDate: "2026-11-05T06:36:38.841Z"
tags: ["git","infrastructure","architecture","azure"]
cover: "/images/why-agent-scale-traffic-strains-git-and-how-github-s-spokes-quorum-is-.png"
coverAlt: "Abstract diagram of parallel lines branching from a single bottleneck into many independent paths"
sources:
  - title: "The bridge to agent-scale Git infrastructure"
    url: "https://github.blog/engineering/architecture-optimization/the-bridge-to-agent-scale-git-infrastructure/"
---
GitHub's engineering blog has published [a post on the bridge to agent-scale Git infrastructure](https://github.blog/engineering/architecture-optimization/the-bridge-to-agent-scale-git-infrastructure/). It describes the intermediate step between GitHub's current storage design and the one it is building toward. It is worth reading if you run automation, CI, or coding agents that push to the same repositories at high rates. Below is a summary of what it says, followed by our own reading of what it means for you.

## The pressure: growth, power limits, and a migration

According to the post, the schedule was driven by three things: fast-growing traffic from agentic workloads, a hard cap on power capacity in GitHub's data centers and the surrounding region, and physical supply chain constraints. The remaining capacity gave GitHub enough time to migrate safely, but not slowly.

GitHub chose to sequence the work. It would move the data to Azure first and evolve the architecture afterward, rather than change the storage design and the hosting platform at once. Git operations are described as a Tier 0 service, since nearly everything on GitHub depends on repository data.

The first repository copy landed in Azure's Central US region in August 2025. Most repositories now have two of their five replicas in Azure, and Azure serves about half of Git traffic. Spokes, GitHub's repository storage layer, uses preferential routing to send requests to a replica in the same region and availability zone. Traffic therefore follows the data as replicas move.

## Why the busiest repositories were the hard part

The post says that all but a tiny fraction of repositories (0.00001%) are already in both places. The remainder are among the busiest on the platform, and they are held back by a roughly 25ms round trip.

The cause is how the Spokes quorum handles writes:

- A write needs only a majority to commit, but the quorum waits for every healthy replica to respond, up to a timeout.
- The slowest healthy replica therefore sets the latency of every write.
- Each write holds a repository-wide lock until it commits, so that latency also sets the throughput ceiling.

The Azure target region is about 1,000 miles from GitHub's data centers, and a write needs several round trips. A repository already near its throughput limit cannot absorb that cost on every serialized write. The post says it would fall further behind with each push.

## Fix one: serialize per reference, not per repository

Git's consistency guarantee applies to each reference individually. Once the server accepts an update to a ref, no client should later see an older value. That holds for fast-forwards, force pushes, and deletes. Updates to different refs usually don't depend on each other.

So GitHub is narrowing the quorum's scope from the whole repository to individual references. Only writes that contend on the same ref wait for each other. Writes to different refs still pay the cross-region latency, but they can be in flight at the same time. The post notes that agents and developers pushing to their own branches are the common case.

The stated result: write throughput ceilings rise roughly in proportion to the number of refs being written concurrently. In internal testing with realistic traffic, writes to different refs saw 3–4x higher throughput at lower latency. That is GitHub's own measurement, and we haven't verified it.

## Fix two: virtual replicas and independent read scaling

Most repositories are heavily read-skewed, with 100 to 1,000 reads per write according to the post. Today reads and writes share the same replicas and compete for resources, so they can't scale separately. For example, reads would benefit from far more in-memory cache, but that memory is also needed for compaction.

The post describes two new pieces:

- **Virtual write replica.** Object storage (Azure Blob Storage) becomes a quorum member through an ephemeral compute node. It streams incoming writes and serves no reads. A write isn't acknowledged until it is durable in object storage. It also coalesces transactions on disjoint refs into one set of network I/Os, so a busy repository pays one round trip across many concurrent writes. For now it also handles compaction.
- **Virtual read replicas.** These warm their cache from object storage and take read traffic without joining the quorum. They treat object storage as the source of truth and reconcile local state in the background. They can be scaled out on demand.

In GitHub's internal load testing, the harness found ceilings in the current architecture. Against virtual read replicas, it hit its own limits first.

### The caveat

Because read replicas reconcile in the background, they suit some read workloads but not all. Serving every kind of read requires moving that reconciliation in-line, so a replica fetches only the ref state and data that changed since it last caught up. The post lists this as work for later steps.

## What is still unsolved

The post is open that the quorum remains the limiting factor for write throughput. Every write still waits on replicas that each hold a full copy of the repository, though little of a write actually needs ordering. Git objects are immutable and content-addressed, so they can be stored without agreement. The hard part is ordering the small remainder quickly without moving the bottleneck elsewhere.

GitHub also says the commit protocol that got it to a billion repositories won't carry it to the next billion. Much of Spokes (routing, load balancing, the internal API, and the background "sweepers" for placement, repair, and rebalancing) is expected to carry over. The post defers details of the end state to a follow-up post tied to GitHub Universe, which promises a look at write throughput and why a small consensus group remains in the stack.

## What this means for teams running automation

The post makes no promises about user-facing behavior. These are our inferences.

**Branch layout may matter more.** In our view, if per-ref serialization works as described, workflows where each agent or job pushes to its own branch should benefit most. Many writers hitting the same ref still wait on each other. Consider whether a design that funnels all agents into one shared branch is necessary, or whether you can fan out to per-task branches and merge afterward.

**Read-heavy fleets should see the most headroom.** Clone and fetch traffic from CI and agents is the kind of read load the post says it is separating from the write path. The caveat above suggests some read types will arrive later than others.

**Expect some added write latency.** The post says object storage durability adds a little latency to each write. GitHub's argument is that per-ref serialization keeps this from limiting throughput. Latency-sensitive single pushes are different from high-concurrency throughput, so measure both if you depend on them.

**Don't build around internal details.** Replica counts, regions, and the quorum design are GitHub's to change, and the post describes them as a transitional step. Treat them as background, not as an interface.

**Background on the design choice.** Scoping locks to the smallest unit that needs ordering is a standard way to raise throughput in distributed systems. The trade-off is more concurrent state to reason about, which is why the post stresses that Git's guarantees already apply per ref.

## Bottom line

The post describes a staged approach: move data first, narrow the write lock to individual refs, add ephemeral virtual replicas so reads scale separately, then tackle the quorum itself. Some claims rest on internal tests only, and the end-state design is still to come. If you push to GitHub at agent scale, the practical step now is to keep writers on separate refs and watch for the follow-up post.
