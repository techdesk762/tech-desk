---
title: "Solid 2.0 Is Stable: What Breaks, What's New, and How to Plan Your Upgrade"
description: "Solid 2.0 removes createResource, batch, and SolidStart, and puts async into the reactive graph. Here's what that means for existing apps and your upgrade plan."
pubDate: "2026-11-18T04:49:06.135Z"
tags: ["solidjs","reactivity","javascript","frameworks"]
cover: "/images/solid-2-0-is-stable-what-breaks-what-s-new-and-how-to-plan-your.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Solid 2.0"
    url: "https://www.solidjs.com/blog/solid-2-0-the-long-hold/"
---
If you have a Solid 1.x app, check it this week for seven APIs that no longer exist, and check whether you depend on SolidStart, which has been retired. Those two facts decide how big your upgrade will be. The headline feature, async values living inside the reactive graph, is the part that will change how you write code afterward.

The [Solid 2.0 announcement](https://www.solidjs.com/blog/solid-2-0-the-long-hold/) declares the release stable. This article focuses on what it means for existing code.

## Who should care

- **Teams with Solid 1.x in production.** Several primitives you may use heavily are gone, and the framework layer around Solid has changed.
- **SolidStart users.** The metaframework is retired, so you need a plan for what replaces it in your stack.
- **Anyone using `createResource` for data loading.** It's on the removal list, and async handling now works differently.
- **Developers comparing reactivity models.** Solid's bet on signals has been joined by Angular, Svelte runes, Vue Vapor, and a TC39 proposal. Solid is now trying to differentiate on what it builds on top of them.
- **Teams who care about observability.** The diagnostics and tooling changes are substantial.

If you're starting a new project, `npm create solid@latest` is the documented entry point.

## What changed

Three things matter most.

**Async is part of the graph.** A computation can return a Promise or an async iterator, and downstream consumers handle it. Per the notes, this automates race-condition handling, and speculative state is rolled back automatically so the server stays the source of truth.

**The framework layer moved into core.** Server functions, which began in SolidStart in early 2022, now live in Solid itself, with RPC over Request/Response and persistent Server Sent Events connections. SolidStart is retired.

**Removed APIs:** `createResource`, `batch`, `startTransition`, `on`, `produce`, `createComputed`, and `createMutable`.

## What to do this week

1. **Inventory removed APIs.** Search your codebase for each of the seven names. A plain grep is enough to size the job:

   ```
   grep -rnE "createResource|batch|startTransition|createComputed|createMutable|produce|\bon\(" src
   ```

   Expect noise from `batch`, `on`, and `produce`, which are common words. Treat the results as a starting list, not a precise count.

2. **Rank by `createResource` usage.** Data loading is where async-in-graph changes the model rather than just renaming something. The announcement says the removed APIs are "no longer needed", so plan to restructure these call sites around computations that return Promises, not look for one-to-one swaps.

3. **Decide your SolidStart exit.** The notes say core plus framework-agnostic Vite plugins now supply every primitive needed to build a metaframework. Identify which SolidStart features you rely on (routing, server functions, deployment) and check how each is covered now. Don't assume a drop-in successor.

4. **Audit integrations.** Solid 2.0 offers web-standard Request/Response primitives and observability hooks, so integrations like Clerk or Sentry need only one plugin. If you use either, check for updated plugins. The Sentry plugin has been updated and works in production builds.

5. **Upgrade a branch, then run in development.** Dev builds report reactive mistakes with a stable code, a source location, and a suggested fix. One example is `STRICT_READ_UNTRACKED`. They also flag waterfalls, bad effect loops, and poorly scaling shapes such as wide fan-outs and fan-ins. Treat this as a free review of your reactive code, and fix what it finds before shipping.

6. **If you use TanStack Query or Router,** note that Single-Flight Mutation works with any router and cache solution, and the announcement cites those two as first-rate integrations.

## Our take

**What's genuinely important:** putting async in the reactive graph is the real bet. In our view, it's the part of 2.0 most likely to matter beyond Solid. Signals are now table stakes across frameworks, so the open question is what you do with them. Race conditions and optimistic state rollback are problems every app hits, and handling them in the primitive instead of in userland is a strong pitch. The stable codes in diagnostics are also underrated: error identifiers you can search for and document are a quiet quality-of-life gain.

**What's unproven:** the experimental ReactiveScript and TSRX support, aimed at improving agent-written code, is the least convincing part. It's experimental by the announcement's own account, and we'd treat it as a curiosity until there's evidence it helps. Retiring SolidStart is also a double-edged choice. Moving primitives into core is clean architecturally, but "you can build a metaframework now" is not the same as "you have one." Existing SolidStart users carry the migration cost.

**Our recommendation:** don't upgrade a large production app on the stable tag alone. Migrate a small, low-risk app first, with the dev diagnostics on, and use what it flags to estimate the effort for the rest. We'd expect the `createResource` rewrites, not the mechanical removals, to take most of your time.

## What we don't know yet

- **Migration tooling.** The notes mention no codemod or step-by-step guide for moving off the seven removed APIs.
- **SolidStart's replacement path.** The notes say the pieces exist, but not what a concrete migration looks like for an existing SolidStart app.
- **Reactive Server Components.** They're promised "in coming weeks", so they aren't here yet. Don't plan around them.
- **Performance.** The notes contain no benchmarks, so we can't say how 2.0 compares with 1.x or other frameworks.
- **Ecosystem readiness.** Beyond Sentry, TanStack, and Clerk-style integrations, we don't know how many third-party libraries already support 2.0.

On release quality, the notes are specific: 23 release candidates over 14 weeks, 971 merged pull requests, 753 closed issues, and a stable bar of one full week with no regressions in ordinary app code and no crashes or hangs. That's a reasonable signal of care, though it's the maintainers' own bar and not independent verification. Your own app is the real test.