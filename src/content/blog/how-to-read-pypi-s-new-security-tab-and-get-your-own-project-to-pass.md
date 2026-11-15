---
title: "How to Read PyPI's New Security Tab, and Get Your Own Project to Pass"
description: "PyPI's redesigned project pages add provenance states, warnings and per-file attestations. Here's how to vet dependencies with them and prep your own releases."
pubDate: "2026-11-15T04:42:33.841Z"
tags: ["pypi","supply-chain-security","python","trusted-publishing"]
cover: "/images/how-to-read-pypi-s-new-security-tab-and-get-your-own-project-to-pass.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "PyPI's redesigned project pages with clearer security signals are now live"
    url: "https://blog.pypi.org/posts/2026-11-06-ui-updates-complete/"
---
Before you add or upgrade a Python dependency, PyPI now gives you a place to check where its files came from. The redesigned project pages put provenance state, per-file attestations, and several new warnings in view, so a quick look can replace guesswork. If you publish packages, the same pages now show whether your releases can be verified.

PyPI announced the finished redesign in [its blog post](https://blog.pypi.org/posts/2026-11-06-ui-updates-complete/), following planned UI updates announced in July.

## Who should care

- **Anyone who installs from PyPI.** That includes app developers, data scientists, and platform teams who approve new dependencies.
- **Maintainers.** Your project page is now a public report on whether your releases can be traced to a source. Missing provenance is visible.
- **Security and platform engineers** who write dependency-review checklists. There are new signals to put in them, and a new documentation guide to point people at.

## What changed

The headline is a new security tab on each project page. It shows a release's provenance state and per-file attestations. Digital attestations, introduced in 2024, are verifiable records of where a release file came from.

Warnings now appear at the top of the page, next to the yanked, archived, and pre-release banners. A quarantine banner overrides everything else. The sidebar shows provenance state, and the files tab gained search, filtering, and per-file provenance. The release history tab lists file count, provenance state, and status for each release. PyPI also added a package security guide to its documentation.

## What to do this week

**If you consume packages:**

1. Open the security tab for your most critical dependencies. Learn the states. *Full provenance* means every file in the release has an attestation, either PyPI Publish, SLSA Build Provenance, or both.
2. Know what the attestations claim. PyPI Publish confirms a Trusted Publisher published the file. SLSA attestations link to the source commit, the build platform, and the build instructions.
3. Treat *no provenance* as "unverified," not "malicious." PyPI says it only means the origin can't be cryptographically verified. Many legitimate packages will land here.
4. Learn the four warnings: incomplete, inconsistent, change of provenance, and loss of provenance. They flag unusual metadata that could signal an account or pipeline compromise. A change or loss of provenance on a package you already depend on deserves a closer look before you upgrade.
5. On the files tab, look for the orange icon marking late files. These were uploaded more than 14 days after the initial release. It only applies to releases before July 2026, when PyPI began rejecting such uploads, so don't read it as a signal on newer releases.
6. Add "check the security tab" to your dependency-review checklist, and read the new package security guide. It covers source code assessment, provenance checks, integrity verification, common attacks, and reporting.

**If you maintain packages:**

1. Open your own project's security tab and see what a stranger sees.
2. If it says no provenance, adopt Trusted Publishing with a publisher that generates attestations. That is PyPI's explicit recommendation.
3. Check that every file in a release is attested. Full provenance requires every file, so a partial setup could show up as incomplete.
4. Keep your publishing pipeline consistent. A change in how releases are published is exactly the kind of thing the warnings flag. If you must change it, expect a warning and be ready to explain it in your changelog or README.

The notes don't specify configuration steps, so follow PyPI's Trusted Publishing documentation for the details.

## Our take

**What's important.** The useful part is that the signals now sit where people already look. Attestations have existed since 2024, but PyPI's notes say many users were unfamiliar with them and the old interface explained them poorly. A feature nobody can interpret doesn't protect anyone. Putting the states and warnings at the top of the page, with the design guided by the OpenSSF Attestations Style Guide, is a real improvement.

**What's overhyped or unproven.** Provenance tells you where a file was built and published, not whether the code is safe. A malicious maintainer can publish a perfectly attested release. In our view, the risk is that "full provenance" gets read as a safety badge. The "no provenance" label is also likely to be noisy for a while, because adoption by maintainers decides how useful it is. We'd also say the change and loss warnings are the most valuable signals, since they catch deviations from a package's own history, but we haven't seen how often they fire in practice.

**Recommendation.** Maintainers should enable attested Trusted Publishing now, before downstream teams begin treating missing provenance as a reason to block. We'd expect security-conscious organizations to start asking for provenance on new dependencies, and eventually to alert on change or loss of provenance in dependencies they already use. Start with an internal rule that unverified packages need a human sign-off, not a ban.

## What we don't know yet

- **Adoption.** The notes give no figures on how many projects or releases currently have attestations, so we can't say how often you'll see *no provenance*.
- **Warning accuracy.** There is no information on false-positive rates for the four warnings.
- **Programmatic access.** The notes describe the web interface only. Whether the same data is available for automated checks in CI isn't covered here.
- **Enforcement.** Nothing suggests PyPI will require provenance. Only the policy rejecting late file uploads, which began in July 2026, is mentioned.
- **Case study details.** The OpenSSF funded the project and published a case study of the design patterns and warnings. We haven't covered its contents beyond that.