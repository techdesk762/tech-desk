---
title: "How to See and Control Personal AI Agents on Your Site With Cloudflare's New Tools"
description: "Cloudflare now separates personal AI agents from generic bot traffic and adds per-agent access policies. Here is what site owners can check and set this week."
pubDate: "2026-11-05T06:40:15.190Z"
tags: ["cloudflare","ai agents","bot management","web security"]
cover: "/images/how-to-see-and-control-personal-ai-agents-on-your-site-with-cloudflare.png"
coverAlt: "Abstract illustration of small glowing nodes passing through a layered gateway toward a website"
sources:
  - title: "See the agents, set the terms: new visibility and control for personal agents"
    url: "https://blog.cloudflare.com/personal-agents-visibility-control/"
---
If you run a site behind Cloudflare, you can now check how much of your traffic comes from personal AI agents, and set rules for each agent separately. Until now, that traffic mostly looked like generic automated requests, which made it hard to tell whether it was helping or hurting you.

This article covers what the new views show, where the policy controls live, and what to check first. It is based on [Cloudflare's announcement](https://blog.cloudflare.com/personal-agents-visibility-control/).

## Who should care

Personal agents act on behalf of a human. Cloudflare's framing is that site owners currently see those requests as automated traffic and can't easily judge their value.

Three groups have the most to gain:

- **Publishers and ad-supported sites.** There is now a policy option that blocks agents only on pages with ads.
- **Security and fraud teams.** Login and sign-up events can show whether an agent was involved, and which one. This depends on Account Abuse Protection, which is in early access.
- **Anyone tuning bot rules.** If your current rules lump all automation together, agent traffic may be getting treated in ways you didn't intend.

## What changed

The release has two parts: visibility and control.

### Visibility in Security Analytics

Cloudflare says it maintains the world's largest verified bot directory. It is now using that directory to identify agents in traffic details.

In Security Analytics, the Bot Analysis chart gains a "Personal Assistants" category. It sits beside Verified Bot, Likely Human, Likely Automated, and Automated. Selecting it shows only personal agent traffic over time.

There is also a new Personal Assistants widget in Top statistics. It lists the agents visiting your site and the request count for each.

You can filter on a single agent, and the other widgets update to show:

- the paths it requested
- the status codes it was returned
- the networks it came from

That combination answers practical questions. Is an agent hitting pages you want it to see? Is it getting a lot of errors? Is it coming from networks you'd expect?

### Visibility at the account level

Account Abuse Protection is currently in early access. It ties agents to the users they represent.

- The population overview shows which agents are active across your users and how many accounts use each.
- Login and sign-up events indicate whether an agent made the request, and which one.
- You can filter accounts by AI assistant events or by count.
- Each user's account overview lists the agents acting for that account. Analysts can tell a first-time agent from one that has been in use a long time.

For response, Cloudflare says analysts can mitigate a suspicious account with a WAF rule on its Hashed User ID. That avoids blocking the agent for everyone else.

### Control through policies

Cloudflare introduced AI bot policies this summer. They separately control Search, Training, and Agent behaviors. The Agents policy now covers individual supported personal agents.

The setting is renamed "AI Crawler and Agent access policies" and is in Security Settings.

The flow works like this:

1. Set an overall Agents policy.
2. Choose per-agent behavior: Allow (do not block), Block on pages with ads, or Block.

Existing Search and Training policies are unchanged. So your current decisions about search crawlers and training crawlers should not shift because of this release.

The same choices appear when you add a new zone. Onboarding asks about ad monetization and tailors recommended policies to your answer.

## What to do this week

These steps are our suggestions, not Cloudflare's instructions.

**1. Look before you change anything.** Open Security Analytics and select "Personal Assistants" in the Bot Analysis chart. Note the time range you're viewing and how large this slice is compared with the others. If it is tiny, you may not need a detailed policy yet.

**2. Check the Top statistics widget.** See which agents show up and in what volume. Then filter on the biggest one and look at its paths, status codes, and networks. If it mostly fetches content pages, that's a different situation than one hammering a login or search endpoint.

**3. Reconcile with your existing bot rules.** If you have custom WAF or bot rules that match generic automated traffic, check whether agent requests are being caught by them. Compare what you see in the new category with what those rules block.

**4. Review the renamed policy page.** Find "AI Crawler and Agent access policies" in Security Settings. Confirm that your Search and Training settings are what you expect, since they should be unchanged. Then decide on an overall Agents policy.

**5. Decide per agent, using your business model.** In our view, the "Block on pages with ads" option is the one most ad-supported sites should consider first. It lets you keep agents away from monetized pages without a blanket ban. Whether that fits depends on how your revenue works, so treat it as a starting point.

**6. If you have early access to Account Abuse Protection,** review login and sign-up events for agent activity. Look at accounts with unusually high AI assistant event counts, and at first-time agents on older accounts. Use a Hashed User ID rule for individual cases rather than blocking an agent globally.

**7. Add new zones with care.** The onboarding questions on ad monetization shape the recommended policies. Read the recommendations before accepting them.

## What we don't know yet

The announcement leaves several practical questions open.

- **Which agents are supported.** The notes say the Agents policy covers "individual supported personal agents," but don't list them. Agents not in Cloudflare's directory presumably still appear as generic automation. We'd expect that gap to matter at first.
- **Plan availability.** We don't know which plans include the new analytics and policies, or whether the account-level views need extra products beyond Account Abuse Protection's early access.
- **Enforcement details.** How "Block on pages with ads" decides that a page has ads is not described in the notes. If you run unusual ad setups, test that behavior in a controlled way before relying on it.
- **Accuracy.** There are no published figures on how reliably agents are identified or how often they are misclassified.
- **Early access timing.** Account Abuse Protection has no stated general availability date.

Cloudflare also states its next goal: privacy-aware ways to carry user context through agents, assess reputation, and establish accountability. That suggests today's controls are a first step. In our view, site owners should expect the identification and policy model to keep changing, and should review these settings periodically rather than setting them once.

For now, the most useful thing is simple. Find out how much of your traffic is personal agents, see what they request, and then write rules based on that.
