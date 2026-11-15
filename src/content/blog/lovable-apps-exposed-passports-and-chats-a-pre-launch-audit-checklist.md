---
title: "Lovable apps exposed passports and chats: a pre-launch audit checklist"
description: "Researchers found 24,664 Lovable sites serving Supabase data without login. Here is what that means for AI-built apps and how to audit yours before launch."
pubDate: "2026-11-15T04:43:08.045Z"
tags: ["security","supabase","lovable","ai-coding"]
cover: "/images/lovable-apps-exposed-passports-and-chats-a-pre-launch-audit-checklist.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Lovable apps expose passport details and more than 200K private messages"
    url: "https://www.crissyfield.de/research/lovable-en/"
---
If you shipped an app built with Lovable, or any AI app builder wired to Supabase, open it in a private browser window this week without logging in. Check what data loads. A new analysis found that thousands of such apps handed over database records to anonymous visitors, including passport details and private chat messages.

The [Crissy Field report](https://www.crissyfield.de/research/lovable-en/), produced with Handelsblatt, is a sample, not a census. But the patterns it describes are easy to check on your own project.

## Who should care

- **Anyone who has launched an app generated from plain-language prompts**, especially if it holds user accounts, tickets, payments, messages, or documents.
- **Freelancers and agencies** delivering these apps to clients. Lovable's terms put responsibility for applications and data handling on customers, according to the report, even though its marketing stresses that no technical knowledge is needed. That responsibility may end up with whoever built and handed over the app.
- **Teams prototyping with real data** because "it's just an internal tool."

## What changed

Crissy Field GmbH examined 159,041 Lovable projects found in Common Crawl data (December 2025 to September 2026) to see whether sensitive data was reachable without logging in. Of those, 34,545 used Supabase. The researchers say Lovable's own database features from late 2025 were not examined.

On 24,664 sites, Supabase records arrived on page load with no login. Further read-only requests using the same API key retrieved more. Email-containing records showed up in 10,560 tables across 7,403 sites (30%). Examples included over 1,000 identity document records at one service provider and more than 200,000 chat messages from a German forum.

## What to do this week

The report withheld its access methods, and we are not suggesting you reproduce an attack. These steps are our own checklist, built from the failure patterns the report describes.

1. **Look at your app as a stranger.** Log out, open a private window, and watch the network requests on page load. If responses from your database service contain user records, you have the problem the researchers found.
2. **Treat the client-side API key as public.** The report notes that extra requests with the same key returned more data than the page displayed. Assume anyone can copy that key from your app and query with it. The question is what the key is allowed to read.
3. **Inventory your tables.** List every table and mark which hold personal data: emails, names, birth dates, payment details, ticket codes, documents, messages. The 30% figure came from searching for emails, so start there.
4. **Check access rules on each table.** Every table with personal data should deny anonymous reads and limit logged-in users to their own rows. In our view, missing or too-permissive rules on tables are the most likely cause of this kind of exposure. The report does not state the exact misconfiguration, so confirm against your own setup.
5. **Check file storage separately.** Photo albums and documents were among the exposed items. Buckets need their own access rules, not just the database.
6. **Separate user accounts.** The report calls for review of user-account separation. Confirm that user A cannot read user B's rows by changing an ID, and that admin data is not reachable from ordinary accounts.
7. **Look at derived data.** One property management firm exposed AI-generated summaries of internal emails. Summaries, logs, and analytics tables are easy to forget.
8. **Get a human review before real data goes in.** The report recommends expert review of access permissions, interfaces, and account separation, repeated after major changes. It says automated checks are insufficient.
9. **Re-review after every big prompt-driven change.** Regenerating a feature can alter the data layer, so don't treat the audit as one-time. (That is our inference, but it follows the report's advice to repeat reviews.)

## Our take

The important finding is not that AI-generated apps can be insecure. It is the scale and the sameness. The report says recurring database integration patterns in Lovable apps make it easier for attackers to hunt for similar misconfigurations across many applications. When thousands of apps share one architecture, one mistake becomes a searchable target. A single bug in your hand-rolled app is a needle. The same bug across a platform is a list.

The 30% number deserves caution. The researchers themselves say it is not a confirmed leak rate: emails may be public or test data, and personal records without emails are missed. The sample is also not representative. Headlines will blur this. What is solid is the concrete examples: identity documents, ticket codes, payment information, and a case of 280,000 customer emails.

Our recommendation: stop treating "no technical knowledge needed" as a security claim. If your app stores anything you would not post publicly, budget for a security review the way you budget for hosting. We'd expect more scrutiny of app-builder output, and eventually platform-level defaults that deny access until a developer opts in, though that is speculation on our part, not something the report says.

## What we don't know yet

- **Whether anyone abused the exposed data.** The researchers could not tell. They list phishing, ticket fraud, and identity theft as potential harms.
- **The true size of the exposure.** Only portions of datasets were downloaded, so affected data may be larger than reported.
- **How Lovable's newer database features compare.** The report did not examine them.
- **How other builders and other backends fare.** The study focused on Supabase, which the researchers believe is the most widely used database service among Lovable projects. It does not tell us whether competing tools behave differently.
- **What Lovable will change.** Handelsblatt contacted the company with the findings and published on November 2, 2026. The Crissy Field report carries newer, updated figures. The notes we have do not describe any Lovable response.