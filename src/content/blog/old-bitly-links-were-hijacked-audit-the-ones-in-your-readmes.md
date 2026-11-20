---
draft: true
title: "Old Bitly Links Were Hijacked. Audit the Ones in Your READMEs"
description: "Old bit.ly links in decade-old tweets were re-registered and redirected. Here's why short links in READMEs and install scripts are a supply-chain risk, plus an audit checklist."
pubDate: "2026-11-16T05:19:20.279Z"
tags: ["supply-chain","security","bitly","devops"]
cover: "/images/old-bitly-links-were-hijacked-audit-the-ones-in-your-readmes.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Old Bitly links are being hijacked"
    url: "https://ransomnews.com/burger-king-tweet-bitly-link-hijack-2026/"
---
If your README, docs, package metadata or install script points at a third-party short link, you are trusting whoever controls that short link today, not whoever created it. Last week's Bitly incident showed that those two parties can be different, years apart.

The reporting is about tweets, not code. But the mechanism applies directly to anything that embeds a short URL and gets read or executed long after it was written. Details are in [the original report](https://ransomnews.com/burger-king-tweet-bitly-link-hijack-2026/).

## Who should care

- Maintainers of open source projects with `bit.ly` links in READMEs, changelogs, issue templates or contributing guides.
- Anyone whose install docs say `curl <short link> | sh`, or whose scripts fetch a short URL at build time.
- Teams with package metadata (homepage, docs, funding or support fields) that contain shortened URLs.
- Platform and security teams that maintain internal wikis, runbooks or onboarding docs written years ago.

If none of your content has ever contained a Bitly link, you can skim. Most long-lived projects probably have at least one.

## What changed

On 15 November 2026, old Bitly links in decade-old tweets were re-registered by other people and pointed at unrelated pages. Burger King's account was not hacked. Its 2011 restaurant-locator link was re-registered and sent to a Wikipedia list of Nazi concentration camps. McDonald's 2011 link was redirected to Wikipedia's September 11 attacks article.

Bitly's help pages say link endings cannot be reused, yet creation dates show old endings were claimed years later. Bitly said it suspended accounts and is disabling affected links. It has not said how many links were taken or how.

## What to do this week

The key detail for developers: adding a plus sign to a bit.ly link shows its destination and creation date. If the creation date is later than the document that contains the link, the link was replaced. That gives you a cheap check.

1. **Inventory.** Search every repo, wiki and docs site for shortlinks. A starting point: `grep -rIn "bit\.ly/" .` Repeat for other shortener domains you use. Don't forget package manifests, scripts, CI configs, Dockerfiles and generated docs.
2. **Check each link's metadata.** Append `+` to the bit.ly URL and compare the creation date with the commit or publish date of the file. A later date means it was replaced. Treat it as hostile.
3. **Rank by blast radius.** Links that are fetched or executed (install scripts, CI, bootstrap commands) come first. Links people click in docs come second. Links in old blog posts come last.
4. **Replace, don't just verify.** A link that looks fine today can change tomorrow. Substitute the full destination URL, or a short domain you own and control.
5. **Pin what you download.** If a script fetches something via a redirect, point it at the canonical URL and verify a checksum or signature where the project provides one. This is our suggestion; the report does not cover it.
6. **Clean up published artifacts.** Old package releases can't be edited, so update the current README and metadata, and note the issue in release notes if a published version carried a suspicious link.
7. **Report and remove.** The report's recommended steps for brands are to audit old links, delete posts with replaced links, report them to Bitly, and use a short domain you own. Apply the same to project pages and social accounts.

## Our take

The most important lesson is the trust model. A short link is a pointer you don't own, hosted by a service whose rules can change. The Burger King and McDonald's cases were embarrassing. The same flaw pointed at a `curl | sh` line would be a compromise. In our view, shortlinks in executable paths were always a bad idea, and this incident removes the excuse.

The Trump-link research is the more telling part. Of 97 links checked, 40 are original, 49 were re-created but look plausible, 7 redirect elsewhere and 1 is blocked. Two others, created in January 2024 and January 2025, point to domains imitating crypto services. A link can be quietly replaced and still look fine. A "does it load?" test won't catch that, which is why the creation-date comparison matters.

What's overhyped: the viral screenshots. The loud cases are the ones where someone picked a provocative target. Our take is that the quiet, plausible replacements are the real supply-chain threat, because nobody notices them. We'd expect other shorteners with old, abandoned namespaces to get the same scrutiny, and we'd recommend that any project with a security policy add "no third-party shortlinks" to its contribution rules and enforce it with a CI grep.

## What we don't know yet

- How many links were taken, and by what method. Bitly hasn't said.
- Whether the fix is lasting. A similar bug was reported in February 2025, when memecoin promoters hijacked Bitly links in old Trump posts, and Bitly reportedly fixed it then. This is a recurrence.
- The full scope. CNN reported more affected old posts, from Bill Gates, Justin Trudeau, Mike Pence, the FBI, the Department of Defense and McDonald's Indonesia, but did not verify them itself.
- Whether the re-created links will be shut down. The 49 re-created Trump links still worked at the last check, 23:35 UTC, even though Bitly says it is disabling affected links.
- Whether any hijacked link has been used against software projects. The notes describe no such case.
