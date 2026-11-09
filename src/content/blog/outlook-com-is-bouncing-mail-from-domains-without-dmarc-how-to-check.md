---
title: "Outlook.com Is Bouncing Mail From Domains Without DMARC: How to Check and Fix It"
description: "Outlook.com is reportedly rejecting some mail from domains with no DMARC record. Here's how to check your DNS, publish a p=none starter policy, and verify delivery."
pubDate: "2026-11-09T04:51:01.711Z"
tags: ["dmarc","email","dns","deliverability"]
cover: "/images/outlook-com-is-bouncing-mail-from-domains-without-dmarc-how-to-check.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Outlook.com Is Quietly Rejecting Email from Domains Without DMARC"
    url: "https://mailroute.net/blog/outlook-rejecting-email-without-dmarc"
---
If your domain has no DMARC record, check it today. Since November 5, 2026, Outlook.com has reportedly been rejecting some mail from such domains, even low-volume senders with working SPF and DKIM. The fix is one DNS TXT record, and it takes a few minutes.

The details come from a [MailRoute report](https://mailroute.net/blog/outlook-rejecting-email-without-dmarc). Microsoft has not confirmed the change, so treat the specifics as reported rather than documented.

## Who should care

Anyone who sends email from their own domain to people on Microsoft's consumer mail services. Affected recipient addresses include outlook.com, hotmail.com, live.com, and msn.com.

That covers small businesses, SaaS apps sending transactional mail, newsletters, and side projects. Many of the bounced domains reportedly already had working SPF and often DKIM. The missing piece was DMARC.

The failure is also easy to miss. Only some messages from an affected domain bounce, so a resend may succeed. That looks like a flaky mailbox, not a policy problem. If support tickets say "your emails aren't reaching my Hotmail address," this is a likely cause.

## What changed

Since November 5, 2026, Outlook.com has been rejecting some mail from domains that lack a DMARC record. The bounce reads `550 5.7.1`, says the message lacks SPF/DKIM/DMARC authentication records, and is often followed by an AS-prefixed code. On day one, the same rejection arrived without the bracketed code.

This differs from Microsoft's published rule. Since May 2025, domains sending over 5,000 messages a day must pass all three checks or get a `5.7.515` error. The new rejection reaches small senders. It also doesn't list individual SPF, DKIM, and DMARC results, so the bounce tells you less than the bulk-sender error does.

## What to do this week

**1. Check whether you have a DMARC record.** Run a DNS TXT lookup on the `_dmarc` subdomain of your domain. For example:

```
dig +short TXT _dmarc.example.com
```

No output means no DMARC record exists.

**2. Publish a starter policy.** Add a TXT record named `_dmarc` with this value:

```
v=DMARC1; p=none
```

The `p=none` policy requests reports but asks receivers to take no action on failures. Other providers' handling of your mail should stay unchanged.

**3. Make sure DMARC can actually pass.** DMARC passes only if SPF or DKIM passes and aligns with the domain in the From address. Having SPF and DKIM somewhere is not enough. They must be tied to your domain.

- If you relay through MailRoute, SPF and DKIM already pass. Publish the `mr01`, `mr02`, and `mr03` CNAME records. For you, adding the DMARC record is the complete fix.
- If you use another provider, confirm it passes SPF or DKIM for your own domain. Microsoft 365's default onmicrosoft.com signature doesn't count.

**4. Confirm delivery.** Send test messages to an outlook.com, hotmail.com, live.com, and msn.com address. Because bounces are intermittent, send more than one and check your mail logs for `550 5.7.1`. A single success proves little.

**5. Search your logs for past bounces.** Look for `5.7.1` rejections from the last few days to see which sending sources were affected.

## Our take

Our take: the useful lesson is that "we have SPF and DKIM" has stopped being a safe answer. Bulk-sender rules were something small senders could ignore. A rejection that reaches low-volume domains removes that excuse, and `p=none` is about the cheapest compliance step in email.

We'd be cautious about the framing, though. This is one vendor's report of behavior Microsoft hasn't acknowledged. The rule could be tuned, rolled back, or formalized. Publishing the record costs almost nothing and is useful whatever Microsoft does, so there's no reason to wait for clarity.

Prediction: the report's author expects other providers to follow, making DMARC at `p=none` the baseline, with `p=reject` as a later step. We agree on direction. A `p=none` record only gets you past the gate. It doesn't stop anyone spoofing your domain. Once you've read some reports and confirmed all legitimate sources align, plan to tighten the policy rather than leaving it at `none` indefinitely.

## What we don't know yet

- Whether Microsoft will confirm, document, or change this behavior. As of November 6 there was no postmaster notice, blog post, or service-health entry.
- What triggers rejection for a given message. Only some mail from an affected domain bounces, and the notes don't say why.
- Whether `p=none` will always satisfy the check, or whether Microsoft will later demand a stricter policy.
- What the AS-prefixed code means, and why it was absent on day one.
- Whether other mailbox providers will follow. That is an expectation, not an announcement.