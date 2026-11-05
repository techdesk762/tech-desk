---
title: "Provable inference for LLMs: what FlashProve proves, and what it costs"
description: "A plain-English look at provable inference, the FlashProve prototype, its proof sizes and GPU costs, and what builders on third-party LLM APIs can do with it today."
pubDate: "2026-11-05T06:40:55.622Z"
tags: ["llm","cryptography","inference","security"]
cover: "/images/provable-inference-for-llms-what-flashprove-proves-and-what-it-costs.png"
coverAlt: "Abstract lattice of linked nodes with a glowing checkmark, suggesting a verified computation"
sources:
  - title: "Progress on provable inference for large language models"
    url: "https://www.anthropic.com/research/provable-inference"
---
If you pay a third party to run a large model, you currently take it on trust that they ran the model you were promised. A new open-source prototype shows that cryptographic proof of that claim is now feasible for one large model. It is not cheap, and it is not yet something you can bolt onto an API contract. But the cost has dropped from absurd to merely expensive, and that changes what is worth planning for.

The work is described in [Progress on provable inference for large language models](https://www.anthropic.com/research/provable-inference). Below is what it means in practice.

## Who should care

- **Teams that buy inference from hosted providers** and want assurance that the model is the one advertised, not a cheaper substitute.
- **Providers and platform teams** who may eventually be asked to demonstrate which model served a request.
- **Security and compliance engineers** thinking about tamper detection on inference servers or regulatory monitoring.
- **Anyone working on text provenance**, such as showing that a piece of text came from a particular model.

If you only call an API for prototypes, this is background reading. If model identity matters to your product or your auditors, it is worth tracking.

## What changed

"Provable inference" means the provider produces a proof, alongside each response, that the output came from a specific committed model. The weights stay private. The prototype, called FlashProve, does this with zkSNARKs.

It works in two phases. In the offline phase, the provider publishes a commitment to the weights. The notes put this at about 39 minutes, and the commitment covers roughly 16 million requests. In the online phase, proofs are produced per request. Proofs are generated after the fact, in batches. A batch of 24 requests took about 223 seconds.

The headline numbers, on Llama 4 Maverick (400B-parameter mixture of experts, 4-bit):

- **Proving speed:** roughly 110 tokens per second on one H100.
- **Proof size:** about 19 MB for a 1,024-token request.
- **Proving cost:** roughly 70–95 times the GPU time of vLLM.
- **Verification:** about 17 seconds on 24 CPU threads (21 seconds on one thread), no GPU needed, with a weight commitment of about 6.5 MB.

Two design choices make this tractable. The prover's work scales with the roughly 17B active parameters, not all 400B. And weights are streamed from host memory (about 290 GB), so a single 80 GB GPU is enough.

The weights are hidden, including which experts ran. The model architecture is deliberately not hidden. Hiding it is left for future work.

For context, earlier systems were far slower. VerInf proved the same model at 14.3 hours per 1,000 tokens with a 93.6 GB proof. zkLLM reached about 2.5 tok/s on a 13B model. A commercial effort, Attestable, reports 53–77 tok/s for a dense 31B model on one H100, but without an open-source release. Those are different models and setups, so treat the comparison as a sense of scale, not a leaderboard.

The approach is software-only and cryptographic, in contrast to trusted-hardware approaches. The authors see the two as complementary.

### The release

There are five artifacts under Apache 2.0: a blog post, a technical report, a protocol specification, code, and Lean proofs. Model weights are not included.

Lean formal proofs cover completeness, soundness, and zero knowledge in the random oracle model. An interactive visualizer helps people audit the statements being proved.

Both a fast C++ verifier and a slower Lean verifier are released. The C++ one carries no formal guarantee, though it agreed with the Lean verifier on all tests.

## What to do this week

None of this is a drop-in service. These are sensible, low-effort steps.

1. **Read the protocol specification and technical report** if your work touches model identity or audit. The Lean proofs and visualizer exist to make the claims checkable, so use them.
2. **Write down what you actually need verified.** Model identity? Which request was served? That a specific model produced a specific text? FlashProve targets "this response came from this committed model." It does not cover everything else you might want.
3. **Check your own models against the constraints.** The design is mixture-of-experts only, with a 1,024-token context cap. A dense model or a long-context workload is outside the prototype's scope.
4. **Do the cost arithmetic for your workload.** Proving costs roughly 70–95 times the GPU time of vLLM. By our arithmetic from the stated rate, 1,024 tokens is about nine seconds of proving on an H100, and a 19 MB proof per request adds storage and transfer. Proving after the fact in batches suggests a sampled-audit pattern, not proofs on every request. That is our reading, not a claim from the release.
5. **If you run inference infrastructure, ask your provider** whether they are working on weight commitments or verification. It costs nothing to ask.
6. **Do not drop other controls.** A proof about one computation is not a full security posture (see below).

In our view, the realistic near-term use for API customers is spot verification: request a proof for a sample of traffic and verify it on ordinary CPUs. Verification needs no GPU, which keeps the customer side cheap. We'd expect the first real deployments to look like audits, not per-call guarantees.

## What we don't know yet

**Exact-match behavior.** Proofs cover an integer version of the model under greedy decoding. Floating-point or sampled outputs may not match exactly. If your production traffic uses sampling, the gap between what is proved and what you receive matters, and the notes do not say how large it is.

**Side channels.** There is no protection against side-channel leaks such as proof timing.

**Training on the side.** Proving that hardware is serving inference does not rule out the same hardware also training on the side. Verified inference is not a verified machine.

**Architecture privacy.** Because the architecture is not hidden, a provider with a proprietary design could not use this as is.

**The C++ verifier.** It agreed with the Lean verifier on all tests, but it carries no formal guarantee. For high-stakes verification, that distinction matters.

**Generalization.** The notes describe one model, one GPU type, and a MoE-only design. Whether the costs hold on other architectures is not established here. Compared with Attestable, which targets a dense 31B model, the release does not show a like-for-like comparison.

**Adoption.** The claimed uses include pacing and regulatory monitoring, tamper detection, text provenance such as proof of scanning effort, and ensuring only approved models are served. These are stated aims. Nothing in the notes shows any provider or regulator using the system.

One related note: Anthropic's Frontier Safety Roadmap goal of a provable-inference prototype by September 30, 2026 was met through a separate project, later renamed "inference verification." So this work sits alongside that effort and is not the same thing.

In our view, the important shift is from "theoretically possible" to "open-source, formally specified, and runnable on one GPU." A 70–95x proving overhead and a 1,024-token cap are real limits. They are also the kind of limits engineering tends to chip away at, and the open release means outsiders can check the claims instead of taking them on trust.
