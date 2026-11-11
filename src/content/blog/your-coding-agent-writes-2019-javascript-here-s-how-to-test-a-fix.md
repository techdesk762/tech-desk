---
title: "Your Coding Agent Writes 2019 JavaScript. Here's How to Test a Fix"
description: "Chrome's Modern Web Guidance repo injects curated web platform guidance into coding agents. Here's why agents write legacy JS and how to measure whether this helps."
pubDate: "2026-11-11T04:46:02.101Z"
tags: ["ai-agents","javascript","web-platform","developer-tools"]
cover: "/images/your-coding-agent-writes-2019-javascript-here-s-how-to-test-a-fix.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Show HN: Get your coding agent off ~2019 JavaScript, onto modern web primitives"
    url: "https://github.com/GoogleChrome/modern-web-guidance"
---
If your coding agent keeps reaching for a utility library, a polyfill, or a hand-rolled widget where the browser now has a native answer, there is a new thing to try. Chrome's [Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance) repo packages curated web platform guidance as skills your agent can pull into context. You can measure whether it helps on your own codebase in an afternoon.

## Who should care

- **Teams using agents for front-end work.** If generated code regularly needs review comments like "the platform does this now," you are the target audience.
- **Maintainers of older codebases.** The CLI includes a legacy-scan command that checks a codebase for outdated patterns. That is useful with or without an agent.
- **Anyone shipping to real users on a performance or accessibility budget.** The guidance leans toward platform-level performance and accessibility, and toward lightweight fallbacks instead of heavy polyfills.
- **Tool builders.** The repo ships plugin manifests for Claude, Codex, Cursor, Grok, Gemini and Kimi, so it is a reference for how to package this kind of guidance across agents.

## What changed

The repo is a collection of skills that embed web platform best practices and browser compatibility data into coding agents. The stewards include the Chrome, Edge, Firefox and MDN teams, working with the wider community.

The stated problem is that LLM training data is full of legacy code, so agents produce bloated JavaScript where native solutions now exist. Even when a model knows an API exists, it often lacks enough real-world modern examples to write production-ready code. The CLI injects targeted, expert-curated guidance into the agent's context window to close that gap.

The catalog covers 250 web features and 203 real-world use cases.

## What to do this week

Don't just install it and trust your impression. Run a before/after comparison.

1. **Pick 5 to 10 tasks your agent has handled before.** Choose ones where a native feature plausibly exists: a date or duration display, a styled select or switch, an autofill-friendly checkout form, splitting a long task, sanitizing HTML. The guides cover all of these areas.
2. **Run them without the guidance first.** Save the diffs. Note dependencies added, bundle impact, and any polyfills.
3. **Try the CLI without installing.** The notes say it offers search for guides, retrieval by guide ID, and a legacy-scan command. Run the legacy scan on a real repo and see whether its findings match what your reviewers already complain about.
4. **Install via the wizard.** The repo documents an npx command that launches an interactive wizard, and lists alternative install methods. Check the README for the exact command rather than copying one from a blog post, including this one.
5. **Rerun the same tasks with the same prompts.** Compare the diffs on concrete criteria: fewer dependencies, native APIs used, correct handling of browser support, and whether the code actually works.
6. **Check the fallbacks.** The guidance favors lightweight fallbacks over heavy polyfills. Verify that the generated fallback behaves acceptably in the oldest browser you support.
7. **Watch your token usage.** The guides are meant to be token-efficient, but you should confirm the cost against your own context limits.

A fair test also needs a control. Rerun the unguided tasks once more to see how much variance comes from the model alone.

## Our take

**What matters.** The diagnosis is right, and it is the useful part. Models learn from what has been written most, and years of tutorials and Stack Overflow answers outweigh a few months of newer platform features. The notes also point to a subtler failure: the model knows the API exists but has seen too few real examples to use it well. Guidance that supplies worked, vetted patterns attacks that second problem directly. The stewardship by browser vendors and MDN gives the content more credibility than a random prompt file.

**What's unproven.** The repo says evals are used to prune content that models already know. That is a sensible design, but the notes give no eval results, so we can't say how much output quality improves. "Expert-curated" is not the same as "measured to help." A catalog spanning Temporal, Trusted Types, passkeys, post-quantum cryptography and the Prompt API also covers features with very uneven browser support. The value depends on how well the compatibility data is kept current, and agents can still ignore injected guidance.

**Our recommendation.** Treat this as a reviewable dependency, not a magic fix. We'd expect the biggest wins in areas where a native feature replaces a library entirely, such as dates, forms and sanitization, and the smallest where models already write decent code. Keep your own pass/fail results from the test above. If the guidance doesn't change the diffs on your tasks, drop it and save the context budget.

## What we don't know yet

- **Measured impact.** The notes describe evals for pruning but give no results showing improved output.
- **Freshness.** We don't know how often compatibility data is updated, or how the repo handles features that change status.
- **Agent adherence.** Whether each supported agent reliably uses the injected guidance, versus defaulting to its habits, is not covered.
- **Cross-agent parity.** Plugin manifests exist for six agents, but the notes don't say whether the experience is equal across them.
- **Legacy-scan accuracy.** We don't know its false-positive rate or how configurable it is for your support matrix.
- **Context cost.** The guides aim to be token-efficient, but the notes give no per-guide size.

We haven't tested any of this ourselves. The steps above are how we would start.