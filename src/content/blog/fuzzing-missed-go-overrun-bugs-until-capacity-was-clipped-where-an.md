---
title: "Fuzzing Missed Go Overrun Bugs Until Capacity Was Clipped. Where an LLM and Z3 Fit"
description: "A Google experiment pairing Gemini and Z3 caught Go bounds bugs the fuzzer missed. One cheap fuzz tweak closed most of the gap. Here is when to use each."
pubDate: "2026-11-13T04:47:04.645Z"
tags: ["go","fuzzing","testing","llm"]
cover: "/images/fuzzing-missed-go-overrun-bugs-until-capacity-was-clipped-where-an.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Catch Go bugs that fuzzing misses with Gemini and a constraint solver"
    url: "https://developers.googleblog.com/catch-go-bugs-that-fuzzing-misses-with-gemini-and-a-constraint-solver/"
---
If your Go fuzz tests aren't finding slice-bounds panics, check how your fuzz target hands the input to your code. One line, `data = data[:len(data):len(data)]`, was enough in Google's experiment to turn a fuzzer that missed two bugs into one that found both in every run. That is the cheapest takeaway from [the write-up](https://developers.googleblog.com/catch-go-bugs-that-fuzzing-misses-with-gemini-and-a-constraint-solver/), and it matters more than the LLM-plus-solver pipeline that headlines it.

The pipeline is still interesting, though, for the narrower set of bugs that survive both the compiler and a quick fuzz.

## Who should care

- Go developers who write parsers, binary decoders, or any code that slices byte buffers by computed offsets.
- Teams that already run `go test -fuzz` and want to know what it might be quietly missing.
- Anyone building LLM-assisted code analysis who wants an example where the model's output is checked by something other than the model.

If your Go code is mostly HTTP handlers and database calls, this is lower priority. The concurrency caveat below applies to you in particular.

## What changed

The author built skill-lint, a Go CLI that checks SKILL.md files and applies LLM-generated line edits across Google's 175 agent skills. To audit it, they compile target functions for RISC-V and give Gemini 4 Argon both the Go source and the disassembly. Argon looks for bounds-check traps the optimizer couldn't remove, then writes a Z3 script modeling the path to each one. If Z3 returns sat, the concrete bytes are replayed with `go test`, so every reported crash is a real panic. The method caught all three planted bugs and found three latent bugs in skill-lint.

## What to do this week

1. **Audit your fuzz targets for capacity.** In a 10-second probe of 386,741 fuzz calls, only 0.07% of inputs had cap equal to len. About 89% were views into a shared ~100 MB buffer. Code that slices past `len` but within `cap` won't panic on those inputs. Reslice at the top of each target:

```go
data = data[:len(data):len(data)]
```

2. **Rerun your existing fuzz targets** with that line and see whether anything new surfaces. With it, the fuzzer found both planted overrun bugs in all runs, with median times of 0.28 s and 0.17 s.

3. **Fuzz pure helpers directly**, not whole CLIs. Slice-manipulating functions that take bytes or indices and return results are the best targets.

4. **Review edit-application code for overlaps.** The real bug in skill-lint was in `ApplyReplacementChunks`: sorting edits by `StartLine` doesn't prevent overlaps. Overlapping edits can cause a slice-bounds panic or silently overwrite earlier edits. The fix is to reject overlaps after the sort. If you apply batches of edits from any source, an LLM included, check yours.

5. **Look for accounting errors.** The other two bugs were line numbers checked before deletions shrank the slice, and a flat 100-byte reserve that overshot the 2 MB prompt budget for long paths. Neither is exotic. Both are "I computed a number against a state that has since changed."

6. **If you try the solver approach,** extract helpers with their own entry guards. Without them, Z3 invents inputs that violate preconditions. With guards, the first sat result in all six buggy functions was a real panic.

## Our take

The most important finding is about the fuzzer, not the solver. The unseeded Go 1.27.3 fuzzer missed two planted overrun bugs across one 3-second and three 60-second runs. That wasn't because fuzzing is weak at this class of bug. The harness input had spare capacity, so out-of-range slices silently succeeded. The third planted bug, a signed int8 length error, panics regardless of capacity, and the fuzzer always found it. We'd expect many real fuzz suites to share this blind spot, and fixing it costs one line.

The solver pipeline is more promising than proven. The design is sound in one respect: the LLM proposes, and `go test` disposes, so a reported crash is reproducible. But the other direction is weak. An unsat result only means "maybe correct," because an LLM-written model isn't a sound proof system. The test set is also small: three planted bugs in test parsers, six real bugs in skill-lint. Its cost is another limit. Translation takes about a minute per function, while Z3 itself finishes in milliseconds. The checks also used fresh 64-byte slices where cap equals len, which is the same trick that fixes the fuzzer. That suggests part of the win comes from a better setup rather than from solving.

Our recommendation: clip capacity in your fuzz targets first, then run fuzzing for a while. Reach for the LLM-and-solver approach only for the few functions where a panic trap survives both the compiler and that fuzz run. That matches the source's own advice, and we think it's right. Don't treat "unsat" as a clean bill of health.

## What we don't know yet

- **How it scales.** A whole CLI is too large for the solver: the 28 MB binary has 32,321 symbols. Only pure functions and slice helpers were extracted and checked. How much manual extraction real codebases need is unclear.
- **False negatives.** Because unsat is only "maybe correct," we don't know how many bugs the pipeline misses when the LLM's model is subtly wrong.
- **Generality.** The planted-bug set is three parsers. Whether the hit rate holds on larger, messier code is untested in the notes we have.
- **Availability.** We have no details on how reusable the pipeline is outside the author's setup, or on Gemini 4 Argon access and pricing.
- **Concurrency.** Solver models can't see data races or deadlocks. Concurrent code still needs the race detector and similar tools, and nothing here changes that.