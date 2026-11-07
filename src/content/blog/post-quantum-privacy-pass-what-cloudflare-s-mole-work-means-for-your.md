---
title: "Post-Quantum Privacy Pass: What Cloudflare's MOLE Work Means for Your Stack"
description: "Cloudflare's post-quantum Privacy Pass research targets token forgery, not TLS. Here is what MOLE, VOLEitH and UOV mean for rate limiting and your size budgets."
pubDate: "2026-11-07T04:39:16.646Z"
tags: ["post-quantum","privacy-pass","cryptography","rate-limiting"]
cover: "/images/post-quantum-privacy-pass-what-cloudflare-s-mole-work-means-for-your.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "The post-quantum future of web privacy"
    url: "https://blog.cloudflare.com/vole-mole/"
---
If you rate-limit clients without CAPTCHAs or accounts, the token scheme behind that is built on RSA and elliptic curves. A quantum attacker could forge those tokens. Cloudflare's [post on the post-quantum future of web privacy](https://blog.cloudflare.com/vole-mole/) sketches a replacement, and the headline for developers is a size budget: think kilobytes per operation, not bytes.

One scoping note first. This post is about Privacy Pass and anonymous credentials, not the TLS handshake or key exchange. It doesn't tell you what to change in your TLS stack, and our notes from it don't say what is already deployed there.

## Who should care

- **Teams using or planning Privacy Pass-style tokens** for rate limiting, bot mitigation, or abuse control in place of CAPTCHAs, accounts, or fingerprinting.
- **Protocol and API designers** who put tokens in headers, cookies, or request bodies and have assumed a token is a few dozen bytes.
- **Anyone building anonymous credentials.** The post argues that current post-quantum schemes need heavy expertise, and that parameter selection should be separated from protocol design.

If you don't touch any of these, this is background reading, not an action item.

## What changed

Cloudflare describes MOLE (Moderation Of unLinkable Endorsements). An anchor issues an endorsement. A moderator redeems it after agreeing on an anchor set with the client. The client proves it belongs to that set without revealing which anchor issued it, so all clients are treated equally. The moderator then hands back a credential: blind signatures, anonymous credit tokens, or anonymous rate-limited credentials.

To make this post-quantum, Cloudflare uses VOLE-in-the-Head, a zero-knowledge proof system suited to equations over small binary fields. It pairs that with multivariate (UOV and MAYO) signatures. The resulting designs are VOLE-IHAT for endorsements and VOLE-ACT for credentials. Both are still in development.

## What to do this week

Nothing here is shippable, so the work is inventory and planning.

1. **List where you depend on classical anonymous tokens.** Find every place a token's validity rests on RSA or elliptic-curve signatures. Those are the forgery targets: a forged token bypasses rate limiting.
2. **Check your size assumptions.** The post's baseline: ML-DSA-44 signatures are 2,420 bytes, versus 64 bytes for ECDSA-P256. Cloudflare's numbers for its designs are larger than a typical token today:
   - VOLE-IHAT: 5.6KB at issuance, 6.5KB at redemption.
   - VOLE-ACT: 5.4KB at issuance, 12.0KB at spend.

   Check whether your header limits, proxies, mobile payload budgets, and logging can absorb payloads in the 5–12KB range.
3. **Plan for large public keys.** Both designs use UOV public keys of 46.6KB. Ask how clients would fetch, cache, and rotate a key that size.
4. **Keep token formats algorithm-agile.** This is our suggestion, not the post's. The post says multivariate cryptanalysis is immature and parameters may change, so avoid hard-coding sizes or key formats.
5. **Put a reading note on the calendar.** Track UOV and MAYO cryptanalysis, plus the security proofs Cloudflare says are still needed.

## Our take

**What matters.** The most useful point is the privacy asymmetry. Privacy Pass is described as unconditionally private: even a quantum attacker can't link a redemption back to its issuance. The quantum threat is to integrity (forgery), not to client privacy. That matters for prioritization. You don't have a "harvest now, decrypt later" problem with these tokens in the way you do with recorded encrypted traffic. You have a "forge later" problem, which gives you more time.

The post also says that a break in some of its optimizations would only permit token forgery, not violate client privacy. That is a sensible failure mode, because it limits how badly an aggressive choice can hurt users.

**What's unproven.** Everything about the new designs is early. Our reading is that this is a promising research direction, not a roadmap item. The designs rely on UOV, whose cryptanalysis the post itself calls immature. One optimization, computing a hash outside the proof, relies on a stronger one-more-UOV assumption. The "few milliseconds per operation" figure is encouraging, but without security proofs it says little about readiness.

The sizes are the real cost. A 12.0KB spend and a 46.6KB public key are fine for a research prototype and awkward for many production request paths.

**Our recommendation.** Don't migrate anything yet, and don't wait passively either. We'd expect the size problem to push token systems toward fewer, heavier credential exchanges, with a credential spent less often and for more. That shapes API design. If you're drafting a token-bearing API now, budget for multi-kilobyte credentials and make the carrying mechanism swappable.

## What we don't know yet

- **Timeline.** The notes give no deployment dates, standardization path, or release plans for VOLE-IHAT or VOLE-ACT.
- **Final parameters.** Cloudflare says UOV and MAYO have withstood recent attacks, but parameters may change and add cost. We don't know how much.
- **Real-world latency.** "A few milliseconds" per operation is stated. We don't know on what hardware or under what load, and nothing here covers constrained devices.
- **Security proofs.** The post says they are still needed, so the guarantees are not yet established.
- **TLS and key exchange.** The post doesn't cover what is deployed there, so check your TLS libraries' and providers' own documentation for that.
- **Integration.** How these credentials would be carried in HTTP, and how moderators and anchor sets would be governed in practice, is not covered in the material we have.