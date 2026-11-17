---
title: "Your Script Vendor Is Your Attack Surface: Lessons From the Optimizely Compromise"
description: "Malicious JavaScript reached 178 organisations via Optimizely. Here is how to audit your third-party scripts and limit damage with CSP, SRI and isolation."
pubDate: "2026-11-17T04:46:47.997Z"
tags: ["security","javascript","csp","supply-chain"]
cover: "/images/your-script-vendor-is-your-attack-surface-lessons-from-the-optimizely.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Optimizely compromised, served malware on Zoom, GitLab"
    url: "https://blog.report-uri.com/worlds-largest-brands-infected-with-malware-via-optimizely/"
---
If your site or internal tools load a script from a vendor's CDN, that vendor's account security is now part of your security. A compromise of Optimizely Web, as [reported by Report URI](https://blog.report-uri.com/worlds-largest-brands-infected-with-malware-via-optimizely/), showed how little your own code matters when the script that runs on your pages is edited elsewhere.

The practical lesson is not "drop Optimizely." It is that most teams cannot say which external scripts run on their pages, and a few common CSP settings quietly cancel out the protection they think they have.

## Who should care

- **Optimizely customers.** You need to check your own Project JavaScript and account access now.
- **Anyone running a tag manager, A/B testing tool, analytics or chat widget.** These are the same trust model: a third party can change code that executes in your origin.
- **Teams with a CSP that includes `'strict-dynamic'` or `'unsafe-eval'`.** The data below suggests these are exactly the settings that let the attack through.
- **Security and platform engineers** responsible for internal tools, which often load vendor scripts with no CSP at all.

## What changed

On 16 November 2026, malicious JavaScript reached visitors of 178 organisations, including Zoom, BBC, CNN, GitLab and HSBC. The attacker inserted code into customers' Project JavaScript field in Optimizely Web. The rest of each snippet was untouched, and it was still served from Optimizely's trusted CDN domain.

The payload swapped crypto wallet addresses, skimmed card details, stole cookies and screenshots, and delivered exploit kits to older iOS devices. How the attacker got write access to so many unrelated projects is unknown. The CDN served what it was given, so this was not cache poisoning.

## What to do this week

**1. Inventory your external scripts.** List every third-party origin your pages load, including internal dashboards and admin tools. Include scripts that load other scripts. A CSP in report-only mode will surface these quickly.

**2. If you use Optimizely, inspect everything.** The report advises reviewing all Project JavaScript and experiment code, checking account access and tokens, and rotating credentials. It also says to treat cards and non-HttpOnly cookie secrets from 16 November as exposed.

**3. Audit your CSP for the two weak spots.** In the researchers' crawl of 256 affected organisations' hosts, 68 had no CSP. Fifty allowed the full attack, 17 only blocked data theft, and 24 (15%) blocked the payload. Protection came from a restrictive `script-src`. Check whether yours includes:

```
script-src ... 'strict-dynamic' 'unsafe-eval'
```

The report notes that Optimizely's documentation tells customers to allow `'unsafe-eval'`, and HSBC's setup let the attack through. One loader variant ran a full inline payload via `eval` when the vendor domain was blocked, so allowing eval gave the attacker a fallback.

**4. Set HttpOnly on session cookies.** The stolen cookies were those lacking HttpOnly. This is a cheap fix.

**5. Keep payment fields in hosted iframes.** The card skimmer needed card number, expiry and CVV from the page. Cards entered in hosted payment iframes such as Stripe were out of its reach.

**6. Tell users about iOS.** Patched versions are iOS 18.7.3+ and 26.3+. iOS 13–17 got Coruna and iOS 18.x got DarkSword; iOS 26 was only fingerprinted.

## Our take

**What matters most.** SRI is the tool people reach for first, and in our view it would not have helped here. The attacker edited content that the vendor legitimately serves from a customer's own snippet, so any hash you pinned would simply break the snippet, or you would never have pinned it, because these scripts are designed to change without a deploy. SRI fits static, versioned libraries. For dynamic vendor scripts, a strict CSP and reducing what the script can reach are the realistic controls.

**What is overhyped or unproven.** The headline numbers are striking, but the financial haul reported was small: roughly $7,040 in attacker wallets as of 19:25 UTC. That is not the right measure of harm. Cards, cookies and screenshots were collected, and the exploit kits matter more than the crypto. We would also be cautious about the 178 figure. The researchers checked 1,611 snippets and found 188 infected, and say the real total is probably higher.

**Recommendation.** Treat the 15% that blocked the payload as the real finding. Our take: spend this week removing `'unsafe-eval'` and `'strict-dynamic'` where you can, or at minimum get a CSP in report-only mode on any page handling payments or logins. If a vendor requires eval, make them justify it in writing, and consider isolating that vendor's script. Loading it on marketing pages only, or in a sandboxed iframe away from checkout and account pages, limits what it can touch. We'd expect more teams to find that experimentation tools do not belong on payment pages at all.

## What we don't know yet

- **How access was gained.** The report says it is unknown how the attacker got write access to many unrelated customer projects.
- **The true scope.** The 188 infected snippets are a sample, not a census.
- **Vendor response.** Optimizely had not responded to outreach at the time of publication, so there is no official account of cause, affected customers or remediation.
- **Cleanup completeness.** By 21:52 UTC only one of 188 infected snippets (TalkTalk) still carried the malicious code, down from 169 at 20:56. The mass clean-up ran roughly 20:40 to 21:10. We don't know whether any projects were missed or reinfected.
- **Victim impact.** Nobody has published how many visitors had cards or cookies taken, or how many iOS devices were compromised.

For the timeline, payload details and per-sector breakdown, read the [original write-up](https://blog.report-uri.com/worlds-largest-brands-infected-with-malware-via-optimizely/).