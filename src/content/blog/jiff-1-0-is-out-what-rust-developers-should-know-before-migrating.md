---
title: "Jiff 1.0 Is Out: What Rust Developers Should Know Before Migrating From chrono or time"
description: "Jiff 1.0 commits to a stable datetime API for Rust. Here is what the guarantee means, how its model differs from chrono and time, and how to evaluate a switch."
pubDate: "2026-11-17T04:47:17.940Z"
tags: ["rust","jiff","datetime","dependencies"]
cover: "/images/jiff-1-0-is-out-what-rust-developers-should-know-before-migrating.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Jiff 1.0: A datetime library for Rust"
    url: "https://burntsushi.net/jiff/"
---
If you maintain a Rust library that exposes datetime types in its public API, Jiff 1.0 is now a dependency you can seriously consider. The author says the 1.0 API is meant to stay put indefinitely, barring a significant defect. That matters more than any single feature, because a datetime type in your public signatures is a promise you make to your own users.

The [Jiff 1.0 announcement](https://burntsushi.net/jiff/) is mostly an API tour. This piece focuses on the parts that bear on a migration decision.

## Who should care

- **Library authors** who expose datetimes in public APIs. The author says Jiff is intended to be a public dependency in other libraries, which is why the stability promise exists.
- **Application developers who handle user-facing time**: scheduling, calendars, logs shown in local time, anything crossing a daylight saving boundary.
- **CLI and tooling authors.** The notes list uv, Cargo, Starship, fd, Nushell, mise, Jujutsu, uutils/coreutils, and AWS LLRT's Temporal implementation as production users.
- **Anyone on a pre-1.0 Jiff (0.2).** The CHANGELOG lists the breaking changes.

If you only need UTC Unix timestamps, the post says the standard library is enough. If you only need to measure elapsed time in a running program, use std's monotonic `Instant`. Neither case needs Jiff.

## What changed

Jiff reached 1.0 with a commitment to keep the API stable indefinitely unless a significant defect forces a change. Its design puts time zones at the center, which the author says avoids many common daylight saving problems automatically.

The types layer like an onion: civil `Date`, `Time`, and `DateTime`; then `Timestamp` and `TimeZone`; and finally `ZonedDateTime`, which combines a timestamp, a civil datetime, and an IANA time zone such as `America/New_York`. Breaking changes from 0.2 are in the CHANGELOG.

## What to do this week

1. **Read the CHANGELOG** if you're on 0.2, and estimate the diff before committing.
2. **Inventory your datetime usage.** Sort call sites into three groups: UTC instants, local or zoned wall-clock time, and durations. Jiff's model pays off most in the second group.
3. **Check your durations.** `Span` holds calendar and physical units together and keeps each unit as given. 2 hours and 120 minutes stay distinct, but you can compare them with `Span::compare`. `SignedDuration` covers only physical units (hours or smaller) and is a signed 96-bit nanosecond count. The post says to prefer `Span` unless it is too bulky or slow.
4. **Audit ambiguity handling.** A civil datetime can map to two instants (a fold, when clocks go back) or none (a gap, when clocks skip ahead). Jiff's default "compatible" strategy takes the first occurrence in a fold and the later time in a gap. Alternatives are earlier, later, and unambiguous, which returns an error. Decide whether silent resolution is acceptable for your domain or whether you want the error.
5. **Prototype one module.** Pick an isolated piece of code, such as a parser or a scheduler, and port it. Since all datetime and duration types implement `FromStr` and `Display`, round-trip tests against your existing string formats are a cheap first check.
6. **Check your formats.** Jiff follows RFC 3339 for `Timestamp`, RFC 9557 for `ZonedDateTime`, and ISO 8601 for durations and civil datetimes. It also offers `strftime`/`strptime`-style formatting, and `jiff::fmt` handles other formats such as RFC 2822.

Parsing is lenient in one respect: missing components default to zero. Add tests if your inputs are untrusted and you need strictness.

## Our take

The stability promise is the real story. Most of the individual ideas here are familiar from other languages. What's new for Rust is a zone-aware datetime library whose author commits to the API and which already runs inside well-known tools. That lowers the risk of exposing its types publicly. We'd treat that as a bigger deal than any feature.

The friendly duration format is a smaller but sensible fix. The post notes ISO 8601 durations are hard to read and lossy: 2000 milliseconds round-trips as 2 seconds. A non-lossy format that `Span` and `SignedDuration` both parse is useful for config files and CLIs. Whether it's a reason to migrate is another matter. It's a nice bonus, not a driver.

Our recommendation: don't rewrite a working chrono or time codebase just because 1.0 shipped. Migrate where you have actual zone-related bugs, or where you're starting a new library that will expose datetimes. We'd expect new projects to pick Jiff more often over the next year, while large existing codebases mostly stay put until a bug forces the issue.

## What we don't know yet

- **Performance.** The notes give no benchmarks, and they only say `Span` may be too bulky or slow in some cases. Measure your own hot paths.
- **Ecosystem integration.** The notes don't say how well Jiff interoperates with the crates that already speak chrono or time, such as database and serialization libraries. Check that before porting anything that touches them.
- **Migration effort from chrono or time.** The notes cover 0.2 to 1.0 changes, not a chrono or time porting guide. Our estimates here would be guesses.
- **Longevity of the guarantee.** "Indefinitely unless a significant defect appears" is a good intention. It will only be proven over years of releases.