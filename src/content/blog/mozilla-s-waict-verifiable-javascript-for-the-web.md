---
title: "Mozilla's WAICT: Verifiable JavaScript for the Web"
description: "Mozilla's WAICT prototype aims to let sites bind client-side code to a publicly logged manifest. Here is what it means for developers and what to evaluate first."
pubDate: "2026-11-05T06:36:13.317Z"
tags: ["javascript","web security","firefox","supply chain"]
cover: "/images/mozilla-s-waict-verifiable-javascript-for-the-web.png"
coverAlt: "Abstract blocks of code linked to a glowing ledger, suggesting verified and publicly logged web code"
sources:
  - title: "Trustworthy JavaScript for the Open Web"
    url: "https://hacks.mozilla.org/2026/05/trustworthy-javascript-for-the-open-web/"
---
Web apps normally run whatever code the server sends. For most sites that is fine. For apps that promise end-to-end encryption, it is a real weakness. Mozilla's Firefox Security Team recently published [Trustworthy JavaScript for the Open Web](https://hacks.mozilla.org/2026/05/trustworthy-javascript-for-the-open-web/), which describes an early effort to change that. It is called Web Application Integrity, Consistency and Transparency, or WAICT.

This article summarizes what Mozilla says, adds some general background, and outlines what a developer should consider before treating this as something to plan around.

## The problem WAICT targets

Mozilla's example is a browser-based messaging app in the style of Signal or WhatsApp. The app's promise is that messages and cryptographic keys stay protected, even from the server. But in a browser, the JavaScript that does the encrypting arrives from that same server.

That creates a gap. A malicious or compromised server could send modified code to some users and not others. The post says this could undermine those users' security "with little risk of detection". The point of end-to-end encryption is that a misbehaving server cannot compromise users. Under the traditional web model, the server can still do exactly that by changing the code.

## Two properties: integrity and transparency

Mozilla frames the goal as two properties:

- **Integrity:** the code the user runs matches what the developer committed to in a manifest.
- **Transparency:** those manifests are publicly logged, so anyone can audit them.

WAICT is meant to bring both to the web platform. A site cryptographically binds its client-side code to a manifest and commits that manifest to a publicly auditable log. Sites that need the stronger guarantee opt in to enforcement.

If an opted-in site serves code that was never publicly logged, the browser rejects it. In Mozilla's words, attacks that used to be invisible become observable and attributable. The code on a user's machine should then be consistent with the public code that security researchers can inspect.

## Why logging matters as well as hashing

Integrity alone is not enough. If a server can hand out a different manifest to each user, every user can be "verified" against a different version of the app. The transparency half closes that hole: one public record that everyone can check means a targeted, per-user modification leaves evidence.

As general background, this follows the same logic as Certificate Transparency for TLS certificates, where public logs make mis-issuance detectable. The Mozilla post does not make that comparison, and we are not claiming WAICT works the same way internally. It is a useful mental model for why a public log is part of the design.

Background on existing tools also helps. Subresource Integrity lets a page pin the hash of a script or stylesheet it loads. Content Security Policy restricts where code can come from. Neither one lets an outside party confirm that every user got the same code. Both are also controlled by the server delivering the page, which is the party you are trying not to trust. WAICT is aimed at that gap.

## Where it stands today

The post is clear that this is early:

- A prototype sits behind a pref in Firefox Nightly.
- A demo site, linked from the post, includes an end-to-end encrypted video calling app secured by WAICT.
- Mozilla calls the implementation "a work in progress, not a finished solution".
- The specifications are being developed in the open, and Mozilla invites early feedback.
- Mozilla is working with Cloudflare, the Freedom of the Press Foundation and Meta on a deployment model that is practical, secure and simple. There is also a joint talk from Real World Cryptography 2026.

There is no stable release, no shipping timeline and no cross-browser commitment in the post. Nothing here is something you can rely on in production today.

## Who this affects

**Most developers can ignore it for now.** If your site is a content site, a typical SaaS dashboard or a storefront, the opt-in model means nothing changes for you. Mozilla describes WAICT as being for sites that need a stronger trust model.

**Teams shipping security-critical client-side code should pay attention.** Think encrypted messaging, apps that handle keys in the browser, or tools where users and journalists need to trust the code. These apps currently ask users to trust the server on every page load. WAICT is an attempt to replace that blind trust with something checkable.

**Security researchers and auditors** would gain a public record to inspect, rather than having to guess which version a given user received.

## What to evaluate before relying on it

The post is a short announcement, so it leaves many practical questions open. These are the ones we would ask. They are our questions, not claims about how WAICT behaves.

1. **Do you need it?** If your threat model includes a compromised or coerced server, this is relevant. If not, existing controls like SRI and CSP may be enough.
2. **How much of your code is covered?** The point is to bind your client-side code to a manifest. Check how many scripts you load, including third-party ones, and who controls them. A manifest only helps if it describes what actually runs.
3. **What does your build and release flow look like?** Committing a manifest to a public log implies a step in your deployment process. Reproducible, deterministic builds would likely make that easier. Think about how your pipeline would handle it.
4. **What happens on failure?** The browser rejects unlogged code from opted-in sites. In our view, teams should work out in advance how a bad deploy or a log problem would affect availability, because strict enforcement turns mistakes into outages.
5. **Browser support.** The prototype is Firefox Nightly only. A feature that protects only some users is a partial guarantee, so watch whether other browsers join the standardization effort.
6. **Who watches the log?** Transparency only works if someone audits it. Consider whether researchers or your own team would monitor your entries.

## Concrete next steps

- Read the Mozilla post and the specification work as it appears, and send feedback early if your use case is a good fit. Mozilla explicitly asks for it.
- If you have a Nightly install, you can try the demo and the prototype on a scratch profile to see the intended user experience. The post describes it as a validation tool, not a deployment target.
- Inventory your client-side code and third-party dependencies now. That is useful whether or not WAICT ships.
- Do not describe your app as protected by WAICT, or change your security claims, until there is a stable, specified and widely supported version.

## Our view

The idea is sensible and addresses a real, long-standing weakness of browser-delivered cryptographic apps. Making integrity and transparency part of the platform is more credible than asking each app to build its own workaround. But the details that decide whether developers can adopt it, such as manifest format, logging infrastructure, failure handling and cross-browser buy-in, are not in this post. Treat WAICT as something to follow and give feedback on, not something to build on yet.
