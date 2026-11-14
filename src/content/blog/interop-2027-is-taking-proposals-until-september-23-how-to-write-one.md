---
title: "Interop 2027 Is Taking Proposals Until September 23: How to Write One That Gets Considered"
description: "Interop 2027 is open for proposals until September 23. Here is what the project targets, what makes a submission credible, and how to prepare yours this week."
pubDate: "2026-11-14T04:40:48.073Z"
tags: ["interop","web-platform","browsers","css"]
cover: "/images/interop-2027-is-taking-proposals-until-september-23-how-to-write-one.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Submit your proposals for Interop 2027"
    url: "https://web.dev/blog/interop-2027-proposals?hl=en"
---
If a cross-browser inconsistency keeps costing you time, you have until September 23 to ask for it to be fixed. The Interop 2027 call for proposals is open, and the people who decide what goes into next year's project are asking developers what they want. A vague complaint won't get far. A proposal tied to a stable spec, existing tests and real developer demand has a better chance.

The details are in the [official announcement](https://web.dev/blog/interop-2027-proposals?hl=en). This article focuses on how to use the window well.

## Who should care

- **Front-end developers who keep writing fallbacks** for a feature that works in one or two browsers but not the rest.
- **Library and framework maintainers** who see the same compatibility bug reports repeatedly and can point to concrete evidence.
- **Team leads** who can spend an hour this week collecting the team's top pain points and turning them into a submission.
- **Anyone who has used State of CSS or similar surveys** and wants the results to translate into engineering work.

If you only want to influence the outcome and don't have a proposal of your own, you can still take part. Existing submissions can be liked and commented on.

## What changed

Interop 2027 started on September 3, 2026, with an open call for proposals. Anyone can suggest web platform features for next year's project. The window closes on September 23, and every submission is then assessed under a documented process.

The project targets features that have already been through standardization, with the aim of making them work consistently across browsers. It is not a place to lobby for brand-new ideas. It is a place to push already-specified features toward interoperability.

## What to do this week

The announcement describes what a strong proposal looks like. Use it as a checklist.

1. **Check the spec.** A strong proposal has a stable specification. If the spec is still in flux, your feature probably isn't ready.
2. **Check for objections.** There should be no unresolved objections from any browser vendor.
3. **Check implementation status.** Features accepted in past years were usually already implemented in at least one browser. That is a pattern, not a guarantee.
4. **Check the tests.** Success in Interop is measured by how many tests browsers pass. A feature with a stable implementation also needs a solid test suite, so sufficient coverage is essential.
5. **Look up your feature on webstatus.dev.** The announcement says the site can help you find features that meet the proposal requirements.
6. **Search the developer signals repository.** It may contain published use cases that strengthen your proposal. Add your own if the feature is missing or thin.
7. **Read the Proposal Guide.** It lists additional signals that can improve your chances. We haven't seen its full contents beyond what the announcement says, so read it before you write.
8. **Write it concretely.** Name the feature, say which browsers behave differently, and describe what breaks for users. Link the spec and the tests. These are our suggestions, not requirements from the notes.

Then spread the word. The announcement asks readers to share the call on social media and in developer communities. If a colleague has already submitted something you depend on, add a like or a comment instead of duplicating it.

## Our take

**What matters.** The most useful detail is how the selection signals are described. Many Interop 2026 features were chosen because they ranked high in developer surveys such as State of CSS. Others were among the top 20 in the developer signals repository. In our view, that means developer voice can influence the list, but only through channels that can be counted. A well-documented use case in the signals repository is likely worth more than an anecdote in a social post.

**What's unproven.** The announcement says Interop 2026 is progressing well, with all browsers closer to 100% than at this time last year. That is encouraging, but it is a pass-rate measure, and pass rates only reflect what the tests cover. A feature can score well and still have gaps in real-world sites. We'd treat the headline number as a signal of progress, not proof that the pain is gone. Because success is measured by test passes, a proposal for a feature with thin tests is a weak fit however painful it is in practice.

**Our recommendation.** Pick one pain point, not five, and make it easy to evaluate: stable spec, no vendor objections, at least one implementation, and tests. If your favorite feature fails one of those checks, spend your effort on the gap instead. Writing or improving tests for it may do more for next year's proposal than a submission this year. That is our inference from how the criteria are framed, not a stated policy.

## What we don't know yet

- **How many proposals will be accepted.** The notes don't say how large the final Interop 2027 list will be.
- **How the documented process weighs each signal.** We know the criteria and some of the signals, but not their relative importance.
- **When the final list will be announced.** The notes give the September 23 close date and say submissions are then assessed, but not when results arrive.
- **How strict the "implemented in at least one browser" pattern is.** The notes say accepted features were usually in this state, which leaves room for exceptions.
- **What the Proposal Guide adds.** It lists extra signals, but the announcement doesn't enumerate them here.

The deadline is close. If you have a feature in mind, start with webstatus.dev and the Proposal Guide, and submit before September 23.

*The announcement was written by Rachel Andrew, a technical writer.*