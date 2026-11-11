---
title: "Six Git CVEs: Patch CI Runners and Repo-Processing Services First"
description: "Git 2.56.1 and backports fix six vulnerabilities, including code execution on recursive clone. Here's who is exposed and how to patch machines, CI and servers."
pubDate: "2026-11-11T04:45:32.571Z"
tags: ["git","security","ci","devops"]
cover: "/images/six-git-cves-patch-ci-runners-and-repo-processing-services-first.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Git security vulnerabilities announced"
    url: "https://github.blog/open-source/git/git-security-vulnerabilities-announced-7/"
---
If you run anything that clones, merges or processes repositories you don't control, update Git this week. That means CI runners, build farms, code-review bots and self-hosted Git services more than it means your laptop. The Git project's [security release](https://github.blog/open-source/git/git-security-vulnerabilities-announced-7/) fixes six vulnerabilities, and one of them allows code execution during a recursive clone.

The patched versions are 2.56.1, plus backports to 2.55.1, 2.54.1, 2.53.1, 2.52.1, 2.51.3 and 2.50.2.

## Who should care

**Anyone who clones untrusted repositories with submodules.** CVE-2026-111760 is the headline. An integer truncation lets an extremely long path slip past checks. That lets a submodule's `.git` become a symlink pointing at malicious hooks, which then run on a recursive clone.

**Operators of automation that handles other people's repositories.** The notes specifically say to update Git on automation and services that process repositories on behalf of users. Think CI systems building pull requests from forks, mirroring tools, and code-analysis services.

**Teams that run Git hosting.** CVE-2026-114467 involves a message with more than two GPG signatures overflowing a fixed stack array. The notes say this includes hosting services merging tags, so a server-side path is exposed, not just client machines.

**Anyone who ships software bundling Git.** The guidance explicitly says to update applications that bundle Git. Updating the system package won't fix an IDE, desktop client or container image carrying its own copy.

**Lower exposure:** developers who only clone and merge from servers and contributors they trust. They still need to patch, but they are not the urgent case.

## What changed

Six CVEs, three flavors of problem:

- **Code execution on clone:** CVE-2026-111760 (above).
- **Unintended file writes and reads:** CVE-2026-113408 lets a malicious server advertise an unborn HEAD symref with path-traversal components under protocol v2, writing outside the reference directory. CVE-2026-114466 covers fast-import options that could read, create or append files from untrusted streams.
- **Memory corruption:** CVE-2026-114467 (GPG signatures), CVE-2026-114469 (a small compressed binary patch expanding past the roughly 1 GiB limit), and CVE-2026-105437 (size overflow in large merges, such as many conflicts with a large conflict-marker-size).

The release also adds overflow checks to index entry allocations as extra hardening.

## What to do this week

**1. Find every Git you run.** Check `git --version` on workstations, CI runner images, build containers and servers. Then look for bundled copies: desktop clients, IDEs, and any tool that vendors Git.

**2. Prioritize by exposure.** Our suggested order: runners and services that process external repositories, then self-hosted Git servers, then developer machines.

**3. Upgrade to the right release.** Move to 2.56.1, or to the patched release in your series: 2.55.1, 2.54.1, 2.53.1, 2.52.1, 2.51.3 or 2.50.2. If your distribution backports fixes under its own version numbers, check its security advisory rather than relying on the version string alone.

**4. Rebuild CI images.** Pinned runner images and Docker base layers keep old Git until you rebuild them. Per the notes, GitHub says Actions and Codespaces will also get patched Git. Self-hosted runners and your own images are your job.

**5. Audit fast-import usage.** The unsafe features `rewrite-submodules-from`, `rewrite-submodules-to` and `export-pack-edges` are now rejected from input streams unless `--allow-unsafe-features` is set. If a migration script or converter breaks after the upgrade, that is probably why. Only add the flag when the stream generator is trusted:

```
git fast-import --allow-unsafe-features
```

**6. GitHub Enterprise Server admins:** upgrade to 3.19.15, 3.20.11, 3.21.9 or 3.22.4, depending on your series. GitHub has already deployed fixes on github.com, Enterprise Cloud, and Enterprise Cloud with data residency. Releases of GitHub Desktop and the GitHub Copilot app with patched Git are being coordinated.

**If you can't patch yet:** clone only from trusted servers, avoid recursive clones of untrusted repositories, and avoid merging untrusted content or processing untrusted patches and streams.

## Our take

The important item is the clone-time code execution, and the CI angle matters more than the CVE count. Developers have long been wary of running code from a repository they just cloned. A flaw that triggers during `clone --recursive` undermines that habit, because the usual "I'll inspect it before running anything" step comes too late. Automated systems that clone on demand have no human in that loop at all.

Don't over-read the memory-corruption entries. The notes describe risks of corruption, denial of service or crashes, not demonstrated exploitation. Several need unusual inputs, like a huge conflict-marker-size or a crafted binary patch. For most teams, those are patch-on-schedule issues, with the exception of services that merge or apply content from strangers.

Our recommendation: treat this as a runner-image and bundled-Git problem first. We'd expect many organizations to patch developer laptops promptly through package managers and still leave stale Git inside long-lived container images and vendored tools for months. Put a check in CI that fails builds when Git is older than your patched baseline.

## What we don't know yet

- **Exploitation status.** The notes don't say whether any of these are being exploited, or whether public proof-of-concept code exists.
- **Severity scores.** No CVSS ratings are given, so we can't rank the six formally.
- **Which older versions are affected.** The notes list fixed releases, not the earliest vulnerable version for each flaw. Treat anything below your series' patched release as affected.
- **Timing of downstream releases.** GitHub Desktop, the Copilot app, Codespaces and Actions are described as coordinated or forthcoming, without dates.
- **Distribution packaging.** We have no information on how Linux distributions or other package managers are shipping these fixes.