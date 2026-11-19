---
title: "What Google's ABFS means for teams with huge Git monorepos"
description: "Google open-sourced ABFS, which cut Android checkout from about 36 minutes to under 8 seconds. Here's which ideas you can borrow without Google-scale infrastructure."
pubDate: "2026-11-19T04:52:32.801Z"
tags: ["git","monorepo","build-systems","developer-tooling"]
cover: "/images/what-google-s-abfs-means-for-teams-with-huge-git-monorepos.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Accelerating development for massive Git repositories"
    url: "https://developers.googleblog.com/accelerating-development-for-massive-git-repositories/"
---
If your clone, sync and first build take long enough that people avoid starting fresh workspaces, Google's newly open-sourced ABFS is worth a read. Not necessarily because you should run it, but because it shows which three costs dominate in a huge repository: moving file contents you never read, trusting timestamps, and rebuilding work CI already did.

The numbers come from Android, so treat them as an upper bound for your own tree. But the techniques behind them are separable, and some are usable without a custom kernel module.

## Who should care

- Teams with monorepos or multi-repo trees where a fresh checkout takes tens of minutes.
- Platform and developer-experience engineers who maintain CI caching and build infrastructure.
- Anyone running AI coding agents against large codebases. Google's post says slow sync and build hamper agents as well as humans, since agents need quick setup and parallel workspaces.
- Android and AOSP vendors, whose trees grow two to three times larger than AOSP and pass 3,000 repositories.

If your repo clones in a minute and builds in five, this is interesting reading but not an action item.

## What changed

Google released [Another Build File Service (ABFS)](https://developers.googleblog.com/accelerating-development-for-massive-git-repositories/) as open source on GitHub. It combines a Linux kernel filesystem module (CASFS), user-space daemons, and server-side infrastructure, with content addressing throughout. Git objects are ingested into a gRPC CAS server. Workspaces mount lazily, downloading file contents on first read. A modified Ninja ("Ninja-go") replaces timestamp checks with cached lookups. On Android, checkout dropped from about 36 minutes to under 8 seconds, and full builds from about 80 minutes to just over 2.

## What to do this week

You probably can't adopt ABFS wholesale in a week. Use it as a diagnostic checklist instead.

1. **Measure where your time goes.** Split a cold start into fetch, checkout and first build. ABFS attacks all three, and you need to know which one hurts most.
2. **Estimate how much of a typical change is already built.** Google reports that editing `system/libbase` leaves 97% of the Cuttlefish build graph (192,249 Ninja actions) identical to CI. Check what fraction of your build graph a typical edit actually touches. If it's small, a shared cache between CI and developer machines is the biggest win available.
3. **Audit for hidden dependencies.** The post says Ninja relies on timestamps, and undeclared dependencies in build rules can produce stale incremental outputs, which is why teams fall back to clean builds. If your team routinely says "just do a clean build," you have this problem. Finding those rules is useful whatever tool you choose.
4. **Read the repo if you're on AOSP.** Releases older than Android 17 need some patching to work with ABFS, so check your branch before planning around it.
5. **If you use Bazel,** note that a proof-of-concept integration exists. Chromium and the Android Common Kernel are reportedly exploring compatibility. Neither is a supported path yet.

## Our take

Our take: the most transferable idea is not the kernel module. It is Ninja-go's two-phase caching. Look up a result by declared inputs, then verify the files the step actually read against current filesystem state. If a hidden dependency's hash differs, the cached result is rejected and the step reruns with tapping. That gives you cache hits without giving up clean-build correctness. Most teams cache either too cautiously or too trustingly, and this design addresses both.

The headline numbers deserve some skepticism. Under 8 seconds for checkout is possible because contents download lazily on first read. That moves cost rather than deleting it: the first build touching a file still pays a fetch. The 2-minute build also depends on a shared cache that can reuse up to 100% of actions. Your result will track how much your CI has already built. The benchmarks ran on a 64-vCPU, 256 GB GCE VM with the server in the same cloud network, so a laptop on home Wi-Fi is not the comparison.

Our recommendation: if you run CI on a big monorepo, prototype a shared action cache with input-plus-read verification before considering a custom filesystem. We'd expect the agent use case to drive adoption. Mounting several release branches side by side, with an agent checking out and fully building a tree in under 10 minutes, is a workflow that cheap, disposable workspaces make practical. Teams without that pressure will likely get most of the value from caching alone.

## What we don't know yet

- How ABFS performs outside Android. The numbers are for one very large tree built with Ninja, and Bazel support is only a proof of concept.
- What it costs to operate. The server side (CAS server, Git-pushers, workspace snapshot indexing) is real infrastructure, and the post as summarized gives no sizing or cost guidance.
- How much patching older AOSP releases need, and how hard the kernel module is to deploy on managed developer fleets.
- How well lazy loading behaves on slower or less reliable networks than the benchmark setup.
- How persistent workspaces, which sync modified files and git/repo state to the server, behave under conflicts across hosts.

We haven't tested ABFS ourselves. Everything above rests on Google's published figures and description.