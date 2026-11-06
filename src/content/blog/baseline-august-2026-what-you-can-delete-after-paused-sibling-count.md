---
title: "Baseline August 2026: What You Can Delete After :paused, sibling-count(), and Declarative Shadow DOM"
description: "A developer's checklist from the August 2026 Baseline digest: three features that are now safe to use, what they replace, and what to drop from your fallbacks."
pubDate: "2026-11-06T04:45:35.824Z"
tags: ["baseline","css","web-components","browser-support"]
cover: "/images/baseline-august-2026-what-you-can-delete-after-paused-sibling-count.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "August 2026 Baseline monthly digest"
    url: "https://web.dev/blog/baseline-digest-aug-2026?hl=en"
---
Three features from August 2026's Baseline updates can let you delete code this week: JavaScript that toggles a "paused" class on media players, scripts that count siblings to size layouts, and `attachShadow()` calls that exist only to get server-rendered web components on screen. Here is how to check which of those apply to you.

The source is the [August 2026 Baseline monthly digest](https://web.dev/blog/baseline-digest-aug-2026?hl=en), written by Jeremy Wagner and published on September 28, 2026. It also lists community articles. This piece covers the three features that affect day-to-day code.

## Who should care

- **Teams with custom audio or video players.** If your UI mirrors playback state through JavaScript-managed classes, `:paused` is relevant.
- **Anyone building grids, tab bars, or card rows** where child sizes depend on how many children exist.
- **Teams server-rendering web components**, especially if you've seen a flash of unstyled content on first load.
- **Anyone using AI coding agents** to write CSS and HTML. The digest links a community post on keeping generated code current (more below).

If none of that describes your codebase, you can skim and move on.

## What changed

Two features reached Baseline Newly available, meaning all core browser engines now support them:

- **`:paused`** is a CSS pseudo-class matching audio and video elements whose playback is paused, including media that has loaded but not yet started. It keeps paused apart from transitional states such as buffering or seeking.
- **`sibling-count()`** is a CSS function returning the total number of children under a shared parent, counting the element itself. It returns an integer usable inside `calc()`.

One feature reached Baseline Widely available: **Declarative Shadow DOM**, defined in HTML with a `<template>` element using `shadowrootmode` set to `open` or `closed`. Widely available means 30 months of support in all core browser engines.

## What to do this week

**1. Audit your Declarative Shadow DOM workarounds.** This is the one that clears the "safe without polyfills" bar. Search for polyfills or feature-detection code around shadow root creation in your server-rendering path:

```html
<my-card>
  <template shadowrootmode="open">
    <style>/* encapsulated styles */</style>
    <slot></slot>
  </template>
</my-card>
```

If you call `Element.attachShadow()` only to hydrate markup the server could have described, that path is a candidate for removal. Keep `attachShadow()` for components created purely on the client, since the notes only say the declarative route removes the need in the server-rendered case.

**2. Check your no-JavaScript story.** The digest says declarative shadow content stays parseable by search engines and clients that don't run JavaScript. If you've been shipping extra markup or prerendering just to expose component content to those clients, test whether the declarative version covers it.

**3. Find player-state JavaScript.** Grep for code that listens to `play` and `pause` events only to flip a class for styling. Where that class drives purely visual changes, `:paused` can replace it. Don't remove logic that also does non-visual work.

**4. Find sibling-counting code.** Look for scripts or inline styles that set custom properties like `--count`, or fixed widths that assume a set number of items. `sibling-count()` can feed `calc()` so each child computes a proportional size, such as a column width, without JavaScript.

**5. Mind the status difference.** `:paused` and `sibling-count()` are Newly available: supported in all core engines, but without the 30-month track record. Check your own browser support policy before deleting fallbacks. If you support older browsers, keep them behind `@supports` and treat the new feature as an enhancement.

**6. Skim the AI-agent post.** Brecht De Ruyte wrote about Google's Modern Web Guidance skill set, which helps AI coding agents produce current, Baseline-aware CSS and HTML. His post combines it with custom design token skills to keep design systems consistent while following modern standards.

## Our take

Declarative Shadow DOM is the important item. The Widely available label is the only one in this digest that says "no polyfill needed," and it addresses a real pain: server-rendered components that flash unstyled content. Teams that postponed web components for SSR reasons should look again.

`:paused` and `sibling-count()` are smaller wins. They are tidy, and removing JavaScript that only mirrors state into CSS is good hygiene. But they are Newly available, not Widely. We wouldn't rip out fallbacks for them yet unless your audience is on current browsers. Treat them as progressive enhancement for now.

Our recommendation: do the Declarative Shadow DOM audit first, since it has the clearest payoff, and set a calendar reminder to revisit the other two once they accumulate more time in the Widely available tier. We'd also expect Baseline-aware agent tooling like the one in the community post to become a normal part of code review, though that is a prediction, not something the digest claims.

## What we don't know yet

- The digest, as summarized in our notes, doesn't give per-browser version numbers for these features, so check your support targets against the Baseline data before removing anything.
- It doesn't say how much real-world code `:paused` or `sibling-count()` will replace. Our suggestions above are our reading, not measurements.
- We haven't tested any of this ourselves, and the notes don't cover edge cases, such as how `:paused` behaves in unusual player setups.
- The notes don't say how well the Modern Web Guidance skill set performs in practice. The post describes the approach; it isn't evidence of results.

Readers can report missed updates or community posts for future editions, and file Baseline feedback on the issue tracker, via the digest.