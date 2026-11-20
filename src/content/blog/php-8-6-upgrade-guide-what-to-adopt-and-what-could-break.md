---
title: "PHP 8.6 Upgrade Guide: What to Adopt and What Could Break"
description: "PHP 8.6 adds partial application, a Duration class and a poll API, but session defaults and stricter return values may break code. Here's what to test first."
pubDate: "2026-11-20T04:50:00.795Z"
tags: ["php","php86","upgrade","backend"]
cover: "/images/php-8-6-upgrade-guide-what-to-adopt-and-what-could-break.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "What's New in PHP 8.6"
    url: "https://www.php.net/releases/8.6/en.php"
---
If you are planning a PHP 8.6 upgrade, test three things before you look at any new syntax: session behavior, file-write error handling, and string trimming. These are the changes most likely to alter how existing code behaves without a single line of yours changing.

The new features are worth a look too, especially partial function application and the stream polling API. But the risk is in the defaults. The official [What's New in PHP 8.6](https://www.php.net/releases/8.6/en.php) page lists both, and this article sorts them by what they mean for your codebase.

## Who should care

- **Anyone running sessions.** Defaults changed, and login flows, embedded widgets, and cross-site redirects are the places to check.
- **Teams with legacy code.** Deprecations hit `mb_ereg()`-style functions, old type-check aliases, and some odd constructs.
- **Library and framework authors.** `SortDirection`, `clamp()`, parameter DocComments, and the new reflection methods are aimed at you.
- **Anyone building async or long-running PHP.** The new `Io\Poll` API is intended as a foundation for event loops.
- **Teams handling security-sensitive transport.** Sodium and TLS stream additions are relevant.

If you write ordinary request/response apps on a framework, the upgrade work is mostly about the behavior changes below.

## What changed

PHP 8.6.0 was released on November 19, 2026. Three groups matter most.

**New tools:** partial function application using `?` and `...` placeholders, a `\Time\Duration` class, `clamp()`, and the `Io\Poll` API for monitoring many streams.

**Behavior changes:** sessions now default to strict mode, HttpOnly cookies, and `SameSite=Lax`. `trim()`, `ltrim()`, and `rtrim()` strip form feed characters by default. `fclose()`, `file_put_contents()`, and `copy()` return `false` when flushing or closing fails. Many functions throw `ValueError` for invalid values.

**Deprecations:** `return` inside `finally`, returning values from `__construct()`/`__destruct()`, mbstring regex functions, and `is_double()`, `is_long()`, `is_integer()`, `doubleval()`.

## What to do this week

**1. Run your test suite on 8.6 with deprecations visible.** Set `error_reporting` to include `E_DEPRECATED` and fail CI on new notices. Then search your code for the deprecated items:

```
grep -rnE "mb_ereg|is_double|is_long|is_integer|doubleval" src/
```

That pattern won't catch `return` inside `finally` or constructor return values, so rely on test runs or a static analysis pass for those.

**2. Exercise every session-dependent flow.** Strict mode, HttpOnly cookies, and `SameSite=Lax` are now the defaults. Check:
- JavaScript that reads the session cookie (HttpOnly will block it).
- Cross-site POST flows, such as payment return pages or SSO callbacks, where `Lax` may stop the cookie being sent.
- Anything that relied on clients supplying their own session IDs, since strict mode rejects uninitialized ones.

If you need the old behavior for a specific flow, set it explicitly rather than depending on defaults. Better still, fix the flow.

**3. Audit file-write code that ignores return values.** `fclose()`, `file_put_contents()`, and `copy()` now return `false` on flush or close failure. Code that never checked the result will keep running as before. Code with strict comparisons or logging around those calls may now see failures it never saw before. That is arguably the point, but it can surface in production as new error paths.

**4. Check anything that trims input.** If you compare, hash, or validate strings after `trim()`, a stray form feed is now removed. Look at signature checks and cache keys.

**5. Look for new `ValueError`s.** The notes say many functions now throw for invalid values but do not list them, so rely on your tests and on the manual's per-function notes.

**6. Then try the new features in a branch.** Good first candidates: replace small wrapper closures with partial application, and swap hand-written min/max logic for `clamp()`.

## Our take

**What matters most.** The defaults and return-value changes. Secure session defaults are the right call, and most apps will be better off. But in our view they are also the likeliest source of upgrade-day surprises, because they fail at runtime in specific flows, not at compile time. Budget testing time there, not on syntax.

**What's promising but unproven.** The `Io\Poll` API is the most interesting addition for infrastructure. Using epoll, kqueue, event ports, or WSAPoll natively means event loop libraries like ReactPHP and AMPHP don't have to work around `stream_select()` limits. But the notes describe it as a foundation, not a finished solution. We'd expect real benefits to show up only after those libraries adopt it, so don't rewrite anything yet. Similarly, `\Time\Duration` fills a real gap, but its value depends on whether frameworks and ORMs accept it in their APIs.

**Our recommendation.** Treat the structured stream errors (`StreamException`, `StreamError`, `StreamErrorCode`, `stream_last_errors()`) as the feature to learn early if you write I/O-heavy code. Typed, inspectable errors beat parsing warning strings. We'd expect library authors to adopt `SortDirection` quickly, since a shared enum is cheap to support, and application developers to find `clamp()` and partial application the most immediately useful day-to-day.

## What we don't know yet

- **The full list of `ValueError` changes.** The announcement says "many functions" without naming them, so the real blast radius is unclear until you run your own tests.
- **Performance.** The notes give no benchmarks for 8.6 or for `Io\Poll` versus `stream_select()`.
- **Ecosystem readiness.** We don't know when major frameworks, static analyzers, and extensions will formally support 8.6.
- **Removal timelines.** The deprecations are announced, but the notes say nothing about when the deprecated functions will be removed.
- **Edge cases in the new APIs.** Details like how partial application interacts with named arguments or by-reference parameters aren't covered in the notes, so check the manual before relying on them.