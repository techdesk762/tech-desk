---
title: "Size GKE Node Pools for Agent Sessions, Not Requests"
description: "AI agent sessions idle about 80% of the time. Here is how that breaks usual GKE autoscaling and node-sizing assumptions, and a break-even model to test."
pubDate: "2026-11-19T04:53:46.561Z"
tags: ["gke","ai-agents","capacity-planning","kubernetes"]
cover: "/images/size-gke-node-pools-for-agent-sessions-not-requests.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Agents are sessions, not requests: size GKE node pools for AI agent sessions"
    url: "https://developers.googleblog.com/agents-are-sessions-not-requests-size-gke-node-pools-for-ai-agent-sessions/"
---
If you size GKE node pools for AI agents the way you size them for web services, you will probably overpay or lose session state. Agent sessions behave differently. They stay open all day but do real work only in short bursts. A [Google Developers post](https://developers.googleblog.com/agents-are-sessions-not-requests-size-gke-node-pools-for-ai-agent-sessions/) lays out a cost model for this, and its most useful part is the break-even logic, not the product names.

## Who should care

- Platform teams planning GKE capacity for coding agents, chat assistants, or any agent that keeps a workspace between prompts.
- Teams running one Pod per session who have noticed that CPU graphs look flat while the node bill climbs.
- Anyone evaluating Agent Substrate or AX and wondering whether the savings justify the extra moving parts.

If your agents are short, stateless, and finish in one call, this is mostly not about you. Normal request-based autoscaling still fits.

## What changed

The post argues for treating an agent as a session, not a request. A web request finishes in milliseconds and keeps nothing. An agent session stays open for a workday, and the post cites a July 2026 study of agent traces that found the agent waiting on the user about 80% of the time in typical multi-prompt sessions. A turn averages about 6.5 minutes of work.

The alternative to holding a Pod all day is to "park" idle sessions. Agent Substrate 1.0 is generally available on GKE and can snapshot an idle actor to object storage, freeing its worker. AX is a newer layer that defines what the agent is.

## What to do this week

Start by measuring your own duty cycle. The authors' numbers come from this arithmetic:

```
active share = prompts per hour × minutes per turn ÷ 60
2 × 6.5 ÷ 60 ≈ 22% of the day
```

Then work through these steps:

1. **Pull your real numbers.** You need prompts per hour per session, minutes of agent work per turn, and peak concurrent sessions. Averages will hide the peaks that matter.
2. **Compare at equal CPU guarantees.** In the post's model, one Pod per session holds 1 vCPU and 1 GiB all day, so a c3-standard-4 fits 3 Pods. 100 coding agents need 34 nodes, about USD 1,288 a month. Overcommitting CPU (0.25 vCPU request, 1 vCPU limit) fits 12 Pods per node and needs only 9 nodes, but that is not the same guarantee. Don't compare the two.
3. **Check your scale against the break-even.** Parking pays off from about 37 coding sessions, or 13 for a chat assistant working about a minute an hour. The reason is that the control-plane node is a fixed cost.
4. **If you try Agent Substrate, write the suspend logic yourself.** It does not suspend idle actors automatically. Your harness must call suspend after a timeout. The post's model uses 2 minutes.
5. **Handle saturation.** When all workers are held, requests wait 5 seconds by default, then return HTTP 503. Decide how your client behaves on that.
6. **Schedule the pool.** The GKE autoscaling option follows worker Pods, not suspended actors. A scheduled job should scale the pool to zero after hours. Running all 730 hours costs nearly twice the one-Pod bill.

## Our take

**What matters.** The break-even framing is the real contribution. With a 2-minute idle timeout, the same 100 agents need 15 warm-pool nodes plus one always-on control-plane node, cutting the node bill nearly 40%. That is a large saving, but it depends on prompt rate. At 4 prompts an hour, the pool grows to 27 nodes and savings fall to 4%. Above that rate, one Pod per session is cheaper. In our view, the prompt rate matters more than any feature of the tooling.

**What's overhyped or unproven.** The 22% duty cycle rests on the authors' own assumption of 2 prompts an hour over 8 hours. The pool-full numbers show how fast that margin goes. At 2 prompts an hour, the pool is full about once in 3,000 turns. At 2.5 prompts an hour, it is full for 3% of turns. A 25% increase in usage moves you from rare to routine. Heavy users of coding agents may sit well above 2 prompts an hour, and a few of them can erode the savings. Also, parking does not preserve everything. Scaling Pods to zero keeps persistent-volume files but loses process and memory. The AX path keeps `/workspace` through a volume snapshot, but processes restart. Agent Substrate snapshots memory by default, falling back to files. Which of those you get matters a lot if your agent holds long-running tool processes.

**Recommendation.** Don't adopt parking on the strength of a 40% headline. Model your own prompt-rate distribution first, including your busiest hour. If you are well below the break-even session count, or most users run hot, stay with one Pod per session and tune requests. If you are above it with bursty, human-paced use, a pilot is worth running. We'd expect the idle timeout and the pool-full policy to become the knobs teams argue about most. Treat AX as something to watch, not to build on, until it has a stable release.

## What we don't know yet

- **How well the model transfers.** The numbers come from the authors' cost model and a specific machine type. We haven't tested any of this, and your pricing, region, and agent footprint may differ.
- **Resume latency.** The notes don't say how long restoring a snapshot takes. That is the cost users feel on the first prompt after idle time.
- **AX's maturity.** It is in active development ahead of its first stable release. Budgets, policies, and gateways are on its roadmap, not shipped.
- **Real-world prompt rates.** The July 2026 study gives the 80% waiting figure, but your workload may be more or less bursty.
- **Governance.** gVisor, Agent Substrate, and OpenRL were donated to the CNCF in November 2026. What that means for roadmap and compatibility is not covered in the notes.