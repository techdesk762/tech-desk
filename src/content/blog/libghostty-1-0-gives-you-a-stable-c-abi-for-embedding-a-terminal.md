---
title: "Libghostty 1.0 Gives You a Stable C ABI for Embedding a Terminal"
description: "Libghostty-vt 1.0 promises a stable C ABI for terminal emulation. Here is what that means if you embed terminals, which platforms are covered, and when to switch."
pubDate: "2026-11-07T04:38:15.492Z"
tags: ["libghostty","terminal","c","abi"]
cover: "/images/libghostty-1-0-gives-you-a-stable-c-abi-for-embedding-a-terminal.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Libghostty 1.0"
    url: "https://mitchellh.com/writing/libghostty-1-0"
---
If you maintain an app with an embedded terminal, libghostty-vt 1.0 gives you a stable C ABI to build against, plus a stated policy for how it can change. That matters more than any single feature. The usual risk of adopting a young terminal library is that the next release breaks your bindings. This release is meant to take that risk away.

The details are in the [Libghostty 1.0 announcement](https://mitchellh.com/writing/libghostty-1-0). This piece focuses on what the stability promise covers and how to decide whether to move.

## Who should care

- **Editor and IDE authors** who currently depend on libvterm or a hand-rolled VT parser. Neovim has an approved pull request to swap libvterm for libghostty-vt, and JetBrains IDEs' terminal now runs on libghostty, with a reported 12.5 million-plus active users.
- **Developer tool and infrastructure teams** that render terminal output in a UI or on a server. Turborepo, devenv, and OrbStack are listed as adopters.
- **Binding authors and non-C language users.** Community bindings exist for Rust, Go, JavaScript, Swift, Python, .NET, Elixir, Dart, Java, and more.
- **Distribution packagers**, who get some unusually packaging-friendly release artifacts (below).
- **Web and mobile developers**, since WebAssembly, iOS, and Android are all targets.

## What changed

Libghostty-vt is a portable C library for terminal emulation, extracted from Ghostty's core. With 1.0, the library and its C ABI are declared stable under an enforced policy, and it follows semantic versioning. It has its own release cycle, separate from the Ghostty app, and is MIT licensed with no copyleft code in its dependency tree.

The stability mechanics are the real story. Objects are opaque handles. Values go through enum-keyed getters and setters, so new capabilities don't need new symbols. Newer headers linked against older libraries return an unsupported result instead of crashing. ELF symbols are versioned, so mismatched libraries fail to load.

## What to do this week

1. **Check your platform against the tested list.** CI covers Linux (glibc and musl), macOS 13+, iOS 13+, FreeBSD, Windows x86_64, Android, and freestanding wasm32. Bare-metal riscv32 and thumb, WASI, Windows arm64, illumos, and 32-bit x86 are built but untested. If you ship on one of those, budget your own testing.
2. **Decide on SIMD and libc.** The default build links libc because the SIMD paths and the default malloc allocator use it. Disabling SIMD makes it freestanding. Embedded or wasm targets should look at this first.
3. **Write your integration around the getter/setter pattern.** Because values are enum-keyed, handle the "unsupported" result explicitly. That is how a newer header against an older library will tell you a feature is missing. Treat it as a capability check, not an error to ignore.
4. **Pick your artifact.** macOS and iOS get an XCFramework, Windows gets a DLL usable from MSVC, and Android builds support the 16 KB page sizes that Android 15+ requires. For WebAssembly there are speed and size variants. The small one is under a megabyte, and feature flags can compile out subsystems, roughly halving the module.
5. **If you package software for a distribution,** use the signed source tarball and the dependencies tarball together. That combination lets you build entirely offline, and packaging is documented in a bundled file.
6. **Run a load test with your own workload.** The author reports running 10,000 active terminals on a 4-core, 8 GB server. The library creates no threads and uses a customizable allocator, so you control scheduling and memory. Verify the numbers against your own rendering and I/O path.

## Our take

**What is important.** In our view, the ABI policy is the most valuable part of this release. CI checks ABI changes with libabigail on Linux and golden type manifests on macOS and WebAssembly. That is stronger than most "we promise not to break you" statements, because breakage is caught mechanically. Combined with the opaque-handle design, it suggests the authors expect long-lived dynamic linking, which is exactly what distributions need.

The dependency story is also practical. The bundled pieces are simdutf, Google Highway, a compact Unicode table, and Wuffs for Kitty graphics images, with no C++ standard library required. For anyone who has fought with a C++ runtime on an odd target, that is a real convenience.

**What is unproven.** The adopter list is impressive, but some of it is still prospective. Neovim's change is approved but waiting on a tagged release so distributions can package it separately, and the KDE work on a Konsole replacement is experimental. The JetBrains user figure is a count of users with the terminal available, not evidence about edge cases in your app. Also, "stable" is a promise about the interface, not proof that every terminal protocol behaves the way your users expect. The roadmap says future work is about stability plus adding as many protocols as possible, with options to enable or disable them. Those options will matter.

**Our recommendation.** If you are on libvterm today and your platform is in the tested list, prototype a swap now, behind a build flag, and decide after you've run your real workloads. If you are starting a new embedded terminal, we'd expect libghostty-vt to be the default candidate for any project that needs wasm, mobile, and desktop from one codebase. If you are on an untested platform, wait for others to report results or be ready to own the CI yourself.

## What we don't know yet

- How the stability policy will be exercised in practice: what counts as a breaking change in edge cases, and how long the 1.x line will last.
- When Neovim's tagged-release requirement will be met, and how distributions will package libghostty-vt separately.
- Whether the untested platforms (Windows arm64, 32-bit x86, WASI, and the bare-metal targets) will move into CI.
- Which terminal protocols are next, and which will be on or off by default.
- How the 10,000-terminal result changes with different workloads, since the notes give only the hardware and the count.
- How maintained and consistent the community bindings are. A curated list tracks over a hundred projects, but quality will vary, and the C ABI is the only part covered by the stability policy.