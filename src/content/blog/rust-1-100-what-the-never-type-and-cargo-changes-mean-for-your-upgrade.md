---
title: "Rust 1.100: what the never type and Cargo changes mean for your upgrade"
description: "Rust 1.100 stabilizes the never type and core allocator_api, and changes Cargo's build-dir and dependency handling. Here is what to check before you upgrade."
pubDate: "2026-11-13T04:46:32.308Z"
tags: ["rust","cargo","rustlang","release"]
cover: "/images/rust-1-100-what-the-never-type-and-cargo-changes-mean-for-your-upgrade.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Rust 1.100"
    url: "https://blog.rust-lang.org/2026/11/12/Rust-1.100.0/"
---
Rust 1.100 is mostly a safe upgrade, but it contains one breaking change and one Cargo change that can surprise your CI. Update on a branch, build every target, and look for new "unreachable code" warnings and odd rebuild behavior before you merge.

The headline feature is the stable never type, `!`. The more immediate effects for most teams, though, come from how Cargo now handles build directories, unused dependencies and brand-new package versions. The full announcement is on the [Rust blog](https://blog.rust-lang.org/2026/11/12/Rust-1.100.0/).

## Who should care

- **Anyone on edition 2015, 2018 or 2021.** The never type fallback change applies to you, even though you did not opt in.
- **Teams with CI that uses git worktrees or custom build-dir workarounds.** Cargo's internal layout changed.
- **Library authors with APIs that use `Infallible` or `Result<T, E>` where `E` can never occur.** `!` is now nameable anywhere.
- **Allocator and embedded developers.** The core of `allocator_api` is stable.
- **Security-minded teams** who want a delay before adopting freshly published dependency versions.

If none of these describe you, upgrading is likely uneventful. You also get a handful of small APIs, such as `bool::toggle`, `Box::map`, `str::trim_prefix`/`trim_suffix`, `Vec::from_fn` and `UnsafeCell::replace`.

## What changed

- **Never type (`!`) is stable** after 10 years and 5 failed attempts. It can coerce to any type, and you can name it anywhere, including `Result<T, !>`. `Infallible` is now an alias for it. In editions 2015, 2018 and 2021, never type fallback switches from `()` to `!`, matching edition 2024.
- **`allocator_api` core is stable**, including the `Allocator` trait, so `Vec` and `Box` can use custom allocators.
- **Cargo** gains the `cargo::unused_dependencies` lint, stable dependency cooldowns (`global-min-publish-age`) and a reworked build-dir layout.
- **`core::mem::DropGuard`** and unsafe `std::mem::conjure_zst` are new.

## What to do this week

1. **Upgrade on a branch.**

   ```
   rustup update stable
   ```

2. **Build and test everything, on every edition you use.** The fallback change is described as rarely mattering. It can affect code that ignores a generic result, and the compiler may flag more code as unreachable. If you deny warnings in CI, expect a red build that is really just new diagnostics.

3. **Check for the unused-dependency warning, but read the fine print.** It only appears when all build targets are built, and it never fires for dev-dependencies. A narrow `cargo build` will not show it. Run a full build once to get the real list.

4. **Audit your build-dir assumptions.** The layout change is internal, but build scripts or tests that relied on workarounds may break. This matters most if you use git worktrees. The notes point to cargo#17287 for collected solutions. Start there if something breaks.

5. **Decide on a cooldown.** `global-min-publish-age` in the registry config skips versions published too recently. Three caveats:
   - Versions without a `pubtime` index field are never held back.
   - `cargo install` ignores the minimum age.
   - A single update can override the cooldown with an environment variable.

   Check the Cargo documentation for exact syntax before rolling it out.

6. **Try `DropGuard` if you hand-roll cleanup.** It pairs a value with a closure that runs on drop. `dismiss` returns the value without running the closure. It also implements `Deref` and `DerefMut`. That makes it a good fit for rollback-style, all-or-nothing code paths.

7. **Replace `conjure_zst` workarounds.** If you create zero-sized values by transmuting `()` or using `MaybeUninit` tricks, `std::mem::conjure_zst` is now the dedicated, unsafe way to do it.

## Our take

Stabilizing `!` is the big symbolic win, but in our view the day-to-day payoff is modest. The real value is consistency. `Infallible` becoming an alias means older APIs and new `Result<T, !>` signatures should interoperate. Fallible-trait designs can state "this cannot fail" directly. We'd expect library authors to spend the next few months tidying signatures, not rewriting anything.

The fallback change deserves more attention than it will get. Changing behavior in three older editions is unusual for Rust. The notes call it rare in practice, and we believe that. Still, "rare" across the whole ecosystem means some team will hit it. A run through your test suite is cheap insurance.

The Cargo changes are the most underrated part. Dependency cooldowns are a practical supply-chain control that costs almost nothing to adopt. Our recommendation is to turn one on for CI-driven updates, but only after you know how much of your registry data carries `pubtime`. Versions without it are never held back, so the protection could be patchier than the setting suggests. The allocator stabilization is real progress, but it is a foundation. Wider collection and pointer support is still to come, so don't plan an architecture around it yet.

## What we don't know yet

- **Which code trips on the fallback change.** The notes say it can affect code that ignores a generic result, but give no frequency data or examples of real-world breakage.
- **How well `pubtime` is populated.** The notes don't say which registries supply it or how complete it is, which determines how useful cooldowns are.
- **Timelines for allocator support** in more collections and pointer types. The notes only say it is still to come.
- **How widespread build-dir breakage will be.** We only know it is possible, and that cargo#17287 collects solutions.
- **Behavior of the new Cargo lint on large workspaces.** The notes describe when it appears, not how noisy it is.

We haven't tested this release ourselves. Treat the above as a checklist drawn from the announcement, and verify against your own projects.