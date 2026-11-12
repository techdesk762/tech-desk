---
title: "QuePaxa vs Raft: Why Cloudflare Picked an Unusual Consensus Algorithm"
description: "Cloudflare's Meerkat uses QuePaxa instead of Raft or Multi-Paxos. Here's what that trade means for failure handling, latency, and your own distributed systems."
pubDate: "2026-11-12T04:46:05.452Z"
tags: ["distributed-systems","consensus","raft","cloudflare"]
cover: "/images/quepaxa-vs-raft-why-cloudflare-picked-an-unusual-consensus-algorithm.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Choosing QuePaxa, an unusual consensus algorithm"
    url: "https://blog.cloudflare.com/choosing-quepaxa/"
---
If your consensus layer spans continents, the hard part is rarely the happy path. It is the moment a leader gets slow and your system has to decide whether it is dead. Cloudflare's [write-up on choosing QuePaxa](https://blog.cloudflare.com/choosing-quepaxa/) argues that the best answer is to stop asking that question at all.

That is the practical takeaway for developers: leader-based protocols like Raft tie availability to a failure detector, and failure detectors get worse as your network gets bigger and noisier. QuePaxa is a 2023 design that tries to remove that dependency.

## Who should care

- Anyone running etcd, Consul, ZooKeeper, or a home-grown Raft cluster across regions, where cross-region latency is high and variable.
- Teams who have seen a "healthy" cluster flap leadership and stay unavailable after the underlying fault ended.
- Engineers choosing a consensus library for a new control plane, who default to Raft because everyone does.

If your consensus group lives in one datacenter with sub-millisecond links, most of this is academic for you.

## What changed

Cloudflare built Meerkat, an experimental consensus service for its internal global control plane. Replicas agree on an ordered log of events, which can back things like a key-value store. Unlike etcd, Consul, and ZooKeeper, it is designed to span continents.

Instead of Raft, Multi-Paxos, or Viewstamped Replication, Meerkat runs QuePaxa, published by Tennage, Băsescu and colleagues. It has an optional leader, does not rely on fault detection, and lets competing proposers cooperate rather than fight.

## Why not Raft or Paxos

Cloudflare's reasoning comes down to two failure modes.

**Paxos without a leader can livelock.** Competing proposers can keep blocking each other with ever-higher ballot numbers. Guaranteeing progress needs a partial synchrony assumption.

**Leader-based protocols stall on the leader.** They decide in one round trip, but they stop whenever the leader fails, slows, or gets disconnected. Worse, in an asynchronous network a slow server looks identical to a dead one, so detectors sometimes guess wrong and trigger elections that halt the system.

Timeouts must exceed network latency. The notes say Raft typically uses five to ten round trips, so detecting a failure across the world can take about a second. Raft elections can also suffer destructive interference, producing metastable failures that persist after the original fault, such as a two-second outage, has gone.

Cloudflare has felt this. In 2020, a partial core network switch failure made a consensus-powered system slow its dashboard 80x for six hours. Writes were unavailable, though no data was lost.

## How QuePaxa avoids it

Proposals get random priorities, and the leader's is always the maximum. The leader alone can decide in a single round trip, but any proposer can propose. When proposers collide, they adopt the higher-priority proposal instead of competing. That is the "constructive interference" the notes describe.

Rounds have four phases: propose and adopt, spread, check and decide, and carry forward. Majority intersection keeps decisions safe.

Clients hedge by sending requests to every replica. Non-leaders wait a short timeout before acting. That timeout is local and is not bound by network latency, which is the key difference from a failure-detector timeout. The cost is extra bandwidth. Cloudflare's implementation makes clients wait the hedge timeout instead of replicas, which reduces network messages compared with the paper.

## What to do this week

You probably will not swap your consensus layer. But you can audit your exposure to the failure mode this article describes.

1. **Find your failure-detector timeouts.** For Raft-based systems, check election and heartbeat timeouts against your worst observed cross-region round-trip time. The notes say timeouts must exceed latency, so a long-haul deployment pays for detection in unavailability.
2. **Look for leadership flapping.** Search your logs for repeated elections during past incidents, especially ones that continued after the network recovered. That pattern is the metastable behavior described above.
3. **Test partial failures, not just crashes.** The 2020 incident was a partial switch failure, not a clean node loss. Inject slow links and asymmetric partitions, not only killed processes.
4. **Keep consensus groups local if you can.** If you only need global reads, consider whether the consensus group really has to span continents.
5. **If you are evaluating QuePaxa,** read the paper and treat any implementation as a research artifact until it earns more trust (see below).

## Our take

Our take: the important idea is not QuePaxa specifically but the design principle. Making progress independent of fault-detection timeouts is a real shift. Most of us tune election timeouts as a trade-off between slow recovery and false positives. A protocol that sidesteps the dial deserves attention for wide-area systems.

The results Cloudflare reports are encouraging but narrow. Across nearly all continents, Meerkat never stalled, and over 95% of decisions came from the leader's fast path. When the leader failed, decisions fell to about 65% and recovered after a minute, with slow-path throughput dropping at most to a third. That is graceful degradation, not free resilience. It is also a single team's tests of its own system, so we would not generalize.

We'd also be cautious about the hedging cost. Sending every request to every replica trades bandwidth for latency tolerance. For a control plane with modest write volume that is fine. For a high-throughput data path it may not be. Our recommendation: stay on Raft for single-region or low-latency clusters, where its maturity and tooling outweigh any gains, and look at QuePaxa-style designs only when cross-continent latency variance is your real problem. We'd expect more interest in leader-optional protocols if Cloudflare's verification work lands.

## What we don't know yet

- **Maturity.** QuePaxa is less battle-tested than Raft or Multi-Paxos, and Meerkat is described as experimental.
- **Crash recovery.** Cloudflare is extending QuePaxa's crash-stop design to crash recovery. Until that is done and verified, real-world durability behavior is an open question.
- **Verification status.** Cloudflare is formally verifying the Rust implementation and Meerkat, and using simulation and fault injection. The notes do not say when that finishes.
- **Availability.** The notes do not say whether Meerkat will be released outside Cloudflare.
- **Bandwidth cost at scale.** The notes confirm hedging adds bandwidth cost but give no figures.
- **Convergence.** The paper estimates a 50% chance of deciding each round, while Cloudflare says convergence makes it much higher in practice. We don't have a number for it.