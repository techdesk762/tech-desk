---
title: "AI Coding Agents Made Code Faster to Write and Slower to Merge, Harvard Paper Finds"
description: "A Harvard working paper on 718 firms finds AI coding agents raised code output but not shipped work, while PR merge time grew 49%. What to change in review."
pubDate: "2026-11-18T04:49:35.836Z"
tags: ["ai-coding","code-review","engineering-management","productivity"]
cover: "/images/ai-coding-agents-made-code-faster-to-write-and-slower-to-merge.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Harvard researchers find AI coding agents shifted the bottleneck to code review"
    url: "https://complexdiscovery.com/harvard-researchers-find-ai-coding-agents-shifted-the-bottleneck-to-code-review/"
---
If your team adopted AI coding agents and your dashboards show more commits, don't read that as a win yet. A new Harvard working paper suggests the extra code mostly piles up in review, and that the work that reaches production barely moves. The practical fix is less about generating faster and more about making review cheaper per change.

The paper, by Ph.D. candidates Fiona Chen and James Stratton, is [summarized here](https://complexdiscovery.com/harvard-researchers-find-ai-coding-agents-shifted-the-bottleneck-to-code-review/). It is a working paper, not a peer-reviewed result, but the pattern it reports is specific enough to check against your own numbers.

## Who should care

- **Engineering managers and tech leads** who track output metrics such as commits, PRs or lines added, and who may be crediting AI for gains that never reach production.
- **Senior reviewers**, who by this account absorb the cost of everyone else's faster drafting.
- **Platform and DevEx teams** deciding whether to buy more AI review tooling.
- **Legal-tech buyers and compliance teams**, because the review-bottleneck logic may carry over to AI drafting in law, though the study did not test that.

## What changed

The study covered 718 firms and 725,938 workers after they adopted AI coding agents. Lines added per worker-month rose about 30 percent, commits 20 percent and pull requests 23 percent. But Jira issues deployed to production did not measurably rise (+0.12 on a 3.67 baseline, indistinguishable from zero).

Meanwhile, PR submission-to-merge time grew 49 percent, up 3.45 days from a 7.03-day baseline. Change requests rose about 12 percentage points from a 13 percent baseline, and review comments per PR rose 35 percent.

## What to do this week

**1. Measure the right end of the pipeline.** Pull your own submission-to-merge time, change-request rate and comments per PR for the period before and after agent adoption. Compare these with issues shipped to production, not lines or commits. If output metrics rose and shipped issues didn't, you match the paper's pattern.

**2. Keep PRs small, deliberately.** The authors found no change in average issue size and PRs did not grow. So the added load isn't coming from bigger PRs. It is coming from more PRs and more scrutiny of each. Don't assume agents will keep changes small on their own. Set a soft size limit and enforce it in CI.

**3. Put cheap gates before human eyes.** Tests, linters, type checks and required PR descriptions should fail fast so reviewers only see changes that already pass. Nothing in the paper tests this specific remedy, so treat it as a reasonable inference, not a finding.

**4. Tag AI-authored changes.** The study identified AI use through bot accounts and "Co-authored-by" tags. Adopting a consistent convention gives you data to see whether AI-assisted PRs draw more review comments than others. A trailer on the commit is enough:

```
Co-authored-by: <agent name> <agent email>
```

**5. Be skeptical of AI review as the cure.** Nearly 80 percent of firms used an AI review tool, yet AI wrote only 23.3 percent of review comments. Before paying for another one, check how much of your review load it actually absorbs.

**6. Check retention rules.** If you use AI authorship metadata, ask whether your retention schedules and legal holds should cover it.

## Our take

Our take: the headline finding is the gap between activity and finished work. Code volume went up, shipped issues did not, and merge times got worse. That is a useful correction to any productivity story built on lines of code. A separate NBER paper (revised September 2026) points the same direction, with a 240 percent rise in agent commits shrinking to 30 percent for actual releases.

What we'd treat as unproven is the causal story and its scale. The Harvard design compares adopters with later adopters, and the authors say timing was driven mainly by awareness and procurement delays. That is a sensible approach, but it is still observational. Data is proprietary, AI use on individual licenses went unrecorded, and the paper has small inconsistencies (17 versus 21 interviews). Jellyfish, the data vendor, has commercial ties to the research and promoted an earlier version claiming code quality was not suffering. The authors say Jellyfish only checked for proprietary disclosure, but readers should note the relationship.

Our recommendation: stop treating review as overhead and start budgeting it as the constraint. We'd expect teams that cap PR size, automate pre-review checks and measure time to merge to do better than teams that just add another AI reviewer. That is a prediction, not something this paper demonstrates.

## What we don't know yet

- **Whether it survives peer review.** The paper is a job-market working paper dated Aug. 4, 2026, with no sign of completed peer review. Its first version was dated Jan. 7.
- **Why review got slower.** More comments and more change requests could mean worse code, more cautious reviewers, or both. The notes don't separate these.
- **Employment effects.** The authors rule out overall employment declines above 2.9 percent, but the engineering-employment estimate is noisier and shows pre-trends that limit causal reading.
- **Whether it applies outside software.** The study covered software only. Harvey's motion-to-dismiss workflow and Cooley's redaction agent keep lawyers at a checkpoint, and neither reports review-stage measures or error rates. Federal Rule of Civil Procedure 11(b) makes attorney inquiry a legal duty for filed motions, so review may absorb some drafting savings. Buyers are advised to ask for downstream measures such as hours to approved work product, draft send-back rates and reviewer time per matter.
- **Your numbers.** Averages across 718 firms say little about any one team. Your own before-and-after data is the better test.