---
title: "Cloudflare Spend Management: how to cap Workers and Durable Objects costs"
description: "Cloudflare's Spend Management beta can pause Workers and Durable Objects at a spending limit. Here is how it works, what it misses, and how to set it up."
pubDate: "2026-11-14T04:39:34.533Z"
tags: ["cloudflare","workers","billing","durable-objects"]
cover: "/images/cloudflare-spend-management-how-to-cap-workers-and-durable-objects.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Introducing Spend Management: Spending limits and alerts for Cloudflare"
    url: "https://blog.cloudflare.com/spend-management/"
---
If you run Workers or Durable Objects on a pay-as-you-go Cloudflare account, you can now set a hard spending cap that pauses the product instead of just emailing you after the damage is done. It is in beta, it covers only those two products for now, and enforcement is not instant. Even so, it closes a real gap for anyone running loops, queues, or autonomous agents that can generate traffic on their own.

The details are in Cloudflare's [announcement of Spend Management](https://blog.cloudflare.com/spend-management/). Here is what matters in practice.

## Who should care

- **Teams on PayGo plans running Workers or Durable Objects.** The feature is available to all PayGo customers.
- **Anyone shipping agents or event-driven code.** A retry storm or a misbehaving agent can burn through usage faster than a human reads email.
- **Side-project owners and small teams** without a finance process that watches billing daily.
- **Platform engineers** who want an auditable record of who changed a limit and when a cap fired.

If your workloads are on other Cloudflare products, this does not protect you yet. Cloudflare says more products are coming, but has not said which ones in the material we have.

## What changed

Previously, the safety net was alerting. Spend Management adds a blocking policy. Per product, you set a spend limit, a notification email, and one or more alert thresholds. Emails go out when spend hits a threshold or the limit. At the limit, the product is paused.

You can configure it in the dashboard under Billing > Spend limits, with the `cf` CLI, or through a REST API. Dashboard cost figures for the current billing cycle update within about 10 minutes. An audit log records limit changes and cap events.

## What to do this week

1. **Set a limit on every Workers and Durable Objects account you pay for.** Start with the dashboard at Billing > Spend limits. Pick a number you could absorb without drama, not your ideal budget.
2. **Add alert thresholds well below the limit.** The email at the limit arrives as the product is being paused. Earlier thresholds are your chance to intervene first. Send the notification email to a shared alias, not one person's inbox.
3. **Check your billing cycle date.** The cycle follows your paid subscription start date, not the calendar month or the deployment date. A limit that "resets monthly" resets on that date.
4. **Decide what a pause means for you.** Once a cap is enforced, new invocations are rejected. Only cost-incurring customer code is paused. Workers static assets are still served. Work out what your users would see if the dynamic part of your app returned errors, and whether callers retry aggressively when rejected.
5. **Rehearse recovery.** Service resumes if you raise the limit above current spend, disable or delete the policy, or wait for the next billing cycle. Write down who has permission to do the first two, and how quickly they can act.
6. **Automate if you manage many accounts.** Since there is a CLI and REST API, limits can be part of your provisioning scripts rather than a manual step. Check Cloudflare's docs for exact commands; we won't guess at syntax.
7. **If you route AI traffic through AI Gateway,** look at its separate per-user and per-model budgets for Workers AI and other providers. These apply only to requests that go through the gateway, so they complement the account-level cap rather than replace it.

## Our take

The important part is the design choice: enforcement is a local decision at runtime. According to Cloudflare, caps propagate asynchronously through Quicksilver and the runtime enforces them from local state, so the billing calculation stays out of the request path. In our view, that is the right tradeoff. A cap that added latency or a failure point to every request would be worse than the problem it solves. The cost is that enforcement lags behind spend.

That lag is the thing to take seriously. Usage is aggregated into roughly one-minute buckets, then roughly five-minute windows, then rated against subscription data and pricing rules. Cloudflare lists enforcement latency under a minute as a planned improvement, which implies it is longer today. We'd treat the limit as a strong brake, not a precise ceiling. Set it below the number that would truly hurt.

What is overhyped? The framing around 10 million developers and agent-era safety is broader than the current product. Two products is a narrow slice of a platform. If your bill is driven by something else, you have the same exposure as yesterday. Our recommendation: turn this on now for Workers and Durable Objects, but do not tell your finance team the platform is "capped" until your other products are covered. We'd expect Cloudflare's planned per-application and per-agent budgets to matter more than the account-level cap, because a single account-wide pause is a blunt instrument when one runaway agent can take down your healthy services too.

## What we don't know yet

- **Which products come next, and when.** The notes say "soon" and nothing more.
- **Exact enforcement delay today.** The target is under a minute, but the current figure is not stated, so we can't say how much overshoot to expect.
- **Pricing or limits on the feature itself.** Nothing in the material suggests a charge, but the beta status means terms could change.
- **Behavior for in-flight work.** We know new invocations are rejected. How long-running Durable Objects or work already started are handled is not described.
- **What happens to retries and queued work** from other systems when your Workers start rejecting requests. That depends on your architecture, and you should test it yourself.
- **Whether per-agent budgets** will work across products, as planned, with any granularity you can define yourself.