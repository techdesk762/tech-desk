---
title: "Baseline July 2026: What to Use Now and What Needs a Fallback"
description: "A practical sort of the July 2026 Baseline digest into safe-now and fallback-first features, plus how to write Baseline status into your browser-support policy."
pubDate: "2026-11-08T04:40:03.339Z"
tags: ["baseline","web-platform","lighthouse","javascript"]
cover: "/images/baseline-july-2026-what-to-use-now-and-what-needs-a-fallback.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "July 2026 Baseline monthly digest"
    url: "https://web.dev/blog/baseline-digest-jul-2026?hl=en"
---
You can stop shipping a polyfill for `Array.fromAsync()` and start using the `rect()` CSS shape function today. Several other features in the July 2026 Baseline digest need a bit more care before you rely on them. The more useful change is a new Lighthouse audit that can show you where your own site stands.

The [July 2026 Baseline monthly digest](https://web.dev/blog/baseline-digest-jul-2026?hl=en) was written by Jeremy Wagner and published on August 10, 2026. It is a community roundup, so it mixes platform features, articles, and tools. Here is how we'd sort it.

## Who should care

- **Front-end teams with a written browser-support policy.** If your policy says "last two versions" or points at a usage threshold, the digest is a good prompt to check whether it can reference Baseline status instead.
- **Anyone maintaining polyfills or small utility dependencies.** Dennis Morello's article in the digest argues that newly Baseline APIs let you replace external dependencies with built-in features.
- **Teams already using Lighthouse in CI or audits.** The new Baseline audit lands in a report you probably already read.
- **Teams experimenting with AI coding agents.** Ahmad Alfy ran Google's modern-web-guidance agentic coding skill against a production React application.

## What changed

Lighthouse now has a Baseline Features audit that tracks which Baseline features a site uses.

Two features reached Baseline Widely available: `Array.fromAsync()` and the `rect()` CSS basic shape function. The notes say `Array.fromAsync()` is safe without polyfills.

`Intl.Locale` is newly available in Baseline, supported across all core browser engines.

Morello's article covers four APIs that reached Baseline in 2026: the Navigation API, container style queries, `:open`, and `Math.sumPrecise()`. MDN also updated its image file type and format guide.

## What to do this week

**Safe to use now (Widely available):**

- `Array.fromAsync()` works like `Array.from()` but accepts async iterables and gives you an array back. If you have a hand-rolled `for await` loop that pushes into an array, this replaces it:

```js
async function* pages() {
  yield 1;
  yield 2;
}

const all = await Array.fromAsync(pages());
```

- `rect()` defines rectangular clip paths and offset paths using inset distances from the containing block's edges. If you used `inset()` or a custom path for simple rectangles, it is now an option without a fallback.

**Use deliberately (newly available):**

- `Intl.Locale` is supported across all core engines, but it is newly available, not Widely available. It gives you a standard way to parse and query language, script, and region subtags. Replacing custom string-splitting on locale tags is a good use. Check it against your own support policy first.
- The four APIs from Morello's article reached Baseline in 2026. The digest notes don't say whether each is newly or Widely available, so look up each feature's status before you delete a dependency. Do this one feature at a time.

**Then audit your policy:**

1. Run Lighthouse and read the Baseline Features audit. Treat it as an inventory of which Baseline features your site already uses.
2. Open your browser-support policy. If it only lists browser versions, add a line that says which Baseline tier you accept without a fallback. Many teams will pick Widely available for production-critical paths and newly available for progressive enhancement.
3. Search your codebase for polyfills and small packages that overlap with the features above. Make a list, not a pull request, until you've confirmed status.
4. If you use MDN's image format guide, recheck your image format choices against the updated browser-support details.

## Our take

Our take: the Lighthouse audit is the most important item here, even though it is the least flashy. Baseline status is only useful if it is wired into a tool people already run. An audit that shows which Baseline features a site uses makes the conversation concrete. What we can't say from the notes is how much it will help with decisions, such as flagging what you could safely adopt. Treat it as a view of what you use today.

The "replace your dependencies" argument deserves some skepticism. Reaching Baseline means a feature is supported across core engines. It does not mean the built-in version matches the behavior of the library you ship. Before you swap anything out, run your tests against the native version. That applies most to the newly available features, where edge-case behavior has had the least time in production.

We'd also be cautious about reading too much into the agentic skill experiment. The notes say Alfy tested whether it finds outdated patterns and surfaces current best practices in a real codebase. They don't give results. Our recommendation: if you try a tool like this, have it propose changes only for features your policy already allows, so an agent doesn't quietly lower your support floor.

## What we don't know yet

- Whether each of the four APIs in Morello's article is newly or Widely available. The notes say only that they reached Baseline in 2026.
- How the Lighthouse Baseline audit scores or groups results, or whether it can fail a build. The notes describe it only as tracking which Baseline features a site uses and helping spot modern capabilities.
- What Alfy found when he ran the modern-web-guidance skill. The notes describe the test, not the outcome.
- What the updated MDN image guide concludes about specific formats.

If you spot a Baseline update or community post the digest missed, the digest invites you to report it for future issues. You can also send Baseline feedback through the issue tracker. Page content is licensed under Creative Commons Attribution 4.0, and code samples use the Apache 2.0 License.