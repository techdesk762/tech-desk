---
title: "Hill-Climbing Agent Quality with Agents CLI Evals: A Practical Guide"
description: "How to run an eval loop with Agents CLI: set up the scaffold, compare runs, catch regressions nightly, and avoid fooling yourself with small datasets and summary means."
pubDate: "2026-11-05T11:38:52.059Z"
tags: ["agents","evaluation","google","llm"]
cover: "/images/hill-climbing-agent-quality-with-agents-cli-evals-a-practical-guide.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Hill-Climbing Agent Quality with Agents CLI Evaluation"
    url: "https://developers.googleblog.com/hill-climbing-agent-quality-with-agents-cli-evaluation/"
---
If you ship an agent, a prompt tweak or model swap that passes lint, type checks, and unit tests can still wreck its behavior. Google's [Agents CLI evaluation walkthrough](https://developers.googleblog.com/hill-climbing-agent-quality-with-agents-cli-evaluation/) (dated Oct. 28, 2026) shows an eval loop that catches this: write cases, run, grade, inspect failures, change the agent, rerun, then keep or revert.

The most useful part is the worked failure. Every conventional check stayed green while the quality score dropped. Below is what the post demonstrates, how to reproduce the setup, and where we think you should be careful.

## Who should care

- Teams running agents on LangChain, ADK, or another framework who have no regression signal beyond "it seemed fine in a demo."
- Anyone planning a model upgrade or a vendor model change and wanting a before/after comparison.
- Developers using coding agents to modify their agents, who need evidence that changes actually helped.

The eval commands are described as framework-agnostic, so you don't need to be on a specific stack to use them.

## What changed

Agents CLI now has an eval namespace with five commands: `generate`, `grade`, `compare`, `analyze`, and `optimize`.

**The setup.** The walkthrough uses the LangChain template that ships with Agents CLI v1.8.0. It's created with a single create command targeting Cloud Run, followed by an install step. The scaffold includes three things: a sample dataset, a YAML eval config, and a custom LLM-as-judge metric file.

The judge metric scores each response from 1 to 5 on accuracy, relevance, and clarity. The judge model in the post is gemini-3.8-flash.

**The dataset.** The default dataset holds one trivial case. The authors expand it to four: a greeting, two weather questions (San Francisco and Rome, going by the case names), and one off-topic question.

**The baseline.** Across four valid cases and zero errors, the mean score was 4.0 with a standard deviation of 1.41. That spread matters later.

**The simulated regression.** The authors swap the system prompt for a chef persona. The code compiles, runs, and passes lint, unit tests, and type checks. The eval mean fell to 2.75, a 1.25-point drop, and the standard deviation narrowed to 0.96.

**Finding the cause.** `eval compare` takes two result files and outputs a JSON diff showing changed keys and per-case score differences. The breakdown:

| Case | Before | After |
|---|---|---|
| greeting | 5 | 4 |
| sf_weather | 4 | 2 |
| off_topic | 5 | 3 |
| rome_weather | 2 | 2 |

The chef persona caused the agent to skip the weather tool and invent conditions. The mean told you something was wrong; the per-case diff told you what.

**A model swap, same drop.** Replacing gemini-3.8-flash with gemini-2.5-flash also moved the mean from 4.0 to 2.75. But nearly all of that loss came from the off_topic case, which fell from 5 to 1. Identical means, very different failures. The authors warn that model swaps interact with prompts, and that the judge model must stay fixed across any comparison.

**Nightly checks.** Agents CLI has no built-in scheduler. The post suggests a cron job or Cloud Scheduler running `generate` and `grade` nightly against a larger regression dataset, to catch drift and silent vendor model updates. For alerting, a Python script compares the new mean with a baseline and exits non-zero if the drop exceeds a threshold (default 0.05), which triggers scheduler alerts. In the demo, the script failed on the 4.0→2.75 drop with a 0.1 threshold and passed when comparing identical files.

**Automated optimization.** `eval optimize` runs automated prompt hill-climbing using the GEPA framework, for ADK projects. The LangChain extension is not currently supported. Optimization changes only the prompt, not tools, structure, or model. The authors note it may overfit to the metric's wording, so a human must review candidates before promotion.

## What to do this week

1. **Scaffold and run the baseline.** Create the template, install, and run `generate` then `grade` on the sample data before touching anything. Save the full result file, not just the score.
2. **Write cases from real failures.** The post's four cases are a demo. Replace them with inputs from your own traffic or bug reports, including at least one off-topic or out-of-scope case, since that's where the model swap hurt most.
3. **Pin the judge.** Set the judge model in the config and don't change it between runs you intend to compare.
4. **Keep dataset and config separate.** That's one of the post's recommendations, and it lets you vary one thing at a time.
5. **Use `compare` on every change.** Look at per-case diffs, not just the mean. In the post, the aggregate hid which behavior broke.
6. **Add a nightly job.** Wire `generate` and `grade` to a scheduler and put a threshold script in front of it. Pick a threshold that fits your score variance; the demo's 0.05 default would be noisy against a standard deviation near 1.
7. **Treat `optimize` as a suggestion engine.** If you're on ADK, review candidate prompts by hand before promoting any.

The post's other practices: keep datasets small and fast, and distrust summary means.

## What we don't know yet

The post leaves several things open, and some of what follows is our opinion.

**How well this scales.** Four cases is enough for a demo, not for a decision. The post doesn't report run time or cost on a larger dataset, or how stable scores are across repeated runs of the same agent. In our view, you should run your baseline a few times to see how much the score moves on its own before trusting any small delta.

**Overfitting to your test set.** The post flags overfitting to metric wording in `optimize`, but we'd expect the same risk in manual loops. If you keep editing prompts until a fixed set of cases improves, you're tuning to those cases. A sensible precaution, which is our suggestion and not from the post, is to hold back some cases you never look at while iterating, and check them before shipping.

**Judge reliability.** An LLM judge is itself a model. The post fixes it for comparisons, but doesn't tell us how well its 1–5 scores track human judgment on your domain. Spot-check graded outputs yourself.

**Whether the loop changes behavior.** The post cites a controlled study in which coding agents using agents-cli ran four times as many evals, yet changed the agent after an eval about as often as agents without it. We read that as a caution: running evals is not the same as acting on them. We don't know the study's details beyond that summary.

**LangChain optimization.** `eval optimize` doesn't currently support the LangChain extension, and the post gives no timeline. If you're on LangChain, you can use the other four commands, but prompt tuning stays manual for now.

The core lesson holds regardless of tooling: a change that compiles and passes tests can still make your agent worse, and only a measured comparison against a fixed baseline will tell you.