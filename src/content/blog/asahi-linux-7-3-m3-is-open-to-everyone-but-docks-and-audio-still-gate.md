---
title: "Asahi Linux 7.3: M3 Is Open to Everyone, But Docks and Audio Still Gate Daily Use"
description: "Asahi's Linux 7.3 progress report opens M3 to all users and lands big upstream work. Here is what that means for a daily dev setup and dual-booting."
pubDate: "2026-11-08T04:41:09.569Z"
tags: ["asahi linux","apple silicon","linux kernel","fedora"]
cover: "/images/asahi-linux-7-3-m3-is-open-to-everyone-but-docks-and-audio-still-gate.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Asahi Linux Progress Linux 7.3"
    url: "https://asahilinux.org/2026/11/progress-report-7-3/"
---
If you have an M3 Mac and have been waiting to try Asahi Linux, the installer no longer hides M3 support behind the EXPERT flag. But the newest [Asahi progress report for Linux 7.3](https://asahilinux.org/2026/11/progress-report-7-3/) also makes clear that docks, audio upstreaming and some app compatibility are still the parts that decide whether this is your daily machine.

Most of the report is about upstreaming and reverse engineering. The parts that change your week are narrower: M3 availability, Thunderbolt limits, the 4 KiB page-size problem, and a licence change.

## Who should care

- **M3 owners** who held off because of the installer gate.
- **M1 and M2 users** who rely on a dock or external monitors and want to know if Thunderbolt is fixed. It is not, fully.
- **Anyone running x86 or 4 KiB-page-sensitive software**, such as games or certain binaries, through muvm.
- **Fedora users**, since Fedora Asahi Remix for Fedora 45 shipped on 3 November, the same day as upstream Fedora. The notes call that a first.
- **Maintainers who reuse Asahi code.** The projects are moving from MIT to GPL version 2 or later.
- **M4 and M5 owners**, who should keep expectations low. More on that below.

## What changed

M3 support is now generally available without the EXPERT flag, because early adopters reported almost no problems. M3 also gained DCP support, which enables sleep and a usable area around the notch. The report said m1n1 and kernel updates were expected within days.

Upstream work moved too. The macaudio audio driver was submitted for review (about 3100 lines including Devicetree changes). The AVD video driver reached the mailing list after three months downstream, roughly 13000 lines with Devicetree. Thunderbolt patches went upstream first, but only cover USB3, XDomain and Thunderbolt Networking.

## What to do this week

1. **On an M3:** update the installer and your m1n1 and kernel packages once the promised updates land, and check that sleep behaves. Back up before touching partitions, as you would for any dual-boot.
2. **On M1/M2 with a dock:** check whether your dock depends on PCIe or DisplayPort tunnelling. Per the notes, those remain unsupported, and most docks need them. Test with a simple USB-C setup first.
3. **If you use games or 4 KiB-page software:** expect muvm to be the route. The notes put its cost at roughly 20% performance, with no Wayland, slow I/O and poor input device handling. Decide whether that is tolerable for your workload.
4. **If you're on Fedora:** the Fedora 45 remix is current as of 3 November, so a fresh install gets you a release in step with upstream.
5. **If you reuse Asahi code:** read the licence change before copying anything. Repositories are moving from MIT to GPLv2-or-later, and the team cites code copied without attribution or rewritten with LLM help.

## Our take

The M3 change is the real news for developers. Dropping the EXPERT flag is a statement that the team trusts the install path, and the DCP work that brings sleep and notch handling is what makes a laptop feel like a laptop. A machine that can't sleep is not a dev machine.

The Thunderbolt story is more cautionary. Upstream-first is a healthy shift, and the report notes the same approach for TI USB-PD and SPMI changes. But Apple's controller is a Cortex-M3 running RTKit with its own router, which breaks assumptions built around Intel hardware. Without PCIe and DisplayPort tunnelling, many people with a desk dock will find this unfinished. We would not call it daily-driver ready if your desk depends on one.

The M4 and M5 material is impressive reverse engineering, not usability. The Devicetrees only boot to a TTY, and the m1n1 work (three EL1 VMs, Secure Kernel and Exclaves) is groundwork. Likewise, a triangle on the M3 GPU is a milestone, but the report itself says Mesa integration needs significant effort. Our recommendation: dual-boot on M1, M2 or M3 if your work is CLI, editors, containers and web; hold off if you need a dock, polished audio-upstream behaviour or heavy graphics on M3.

On Google's P3S patchset, we'd expect Asahi to hold its position. The notes say it avoids muvm's overhead and ran Wolfenstein: The New Order at 144+ FPS on an M2 Max. But it is hard-coded for 16 KiB hosts running 4 KiB processes and needs a userspace shim. Not shipping until Google's upstream intentions are clear is sensible. Our prediction: muvm stays the supported path for the foreseeable future.

## What we don't know yet

- When the macaudio and AVD drivers will be merged. They have been submitted for review, which is not acceptance.
- Whether and when PCIe and DisplayPort tunnelling will arrive for Thunderbolt docks.
- Whether Google will upstream P3S, and in what form.
- How long M3 GPU work will take to reach usable Mesa support.
- Any timeline for M4 or M5 beyond boot-to-TTY Devicetrees and virtualisation tooling.
- How the GPL relicensing will play out for downstream users of the MIT-licensed code.

The notes mention a faster Triforce microphone beamformer (almost twice as fast, using less CPU time), which is a nice bonus, but it won't change whether you can use the machine daily.