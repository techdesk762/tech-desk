---
title: "DDoS Attacks Are Getting Smaller and Shorter: What to Revisit in Your Defenses"
description: "Cloudflare's Q3 2026 report shows short, small attacks surging while 1 Tbps+ floods fell. Here is which alerting, rate-limit and mitigation settings to recheck."
pubDate: "2026-11-05T11:38:17.960Z"
tags: ["ddos","security","rate-limiting","observability"]
cover: "/images/ddos-attacks-are-getting-smaller-and-shorter-what-to-revisit-in-your.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Cloudflare DDoS Threat Report 2026 Q3: More swarms, fewer giants"
    url: "https://blog.cloudflare.com/ddos-threat-report-2026-q3/"
---
If your DDoS planning is built around surviving one enormous flood, Cloudflare's latest data suggests you should also plan for a lot of small, short ones. Attacks that end in minutes and stay under 1 Gbps can slip past alert thresholds tuned for big events and finish before anyone is paged.

That is the practical reading of [Cloudflare's DDoS Threat Report for Q3 2026](https://blog.cloudflare.com/ddos-threat-report-2026-q3/). The headline numbers point toward swarms, not giants. Below is what the report says and which defaults we think are worth a second look.

## Who should care

- Teams that run their own origin infrastructure, especially anything exposed over UDP (DNS servers, game servers, VoIP, custom protocols).
- Platform and SRE teams who own alerting thresholds and on-call runbooks for traffic anomalies.
- Anyone relying on manual mitigation steps, such as "an engineer flips a switch when traffic spikes."
- Operators in the industries and regions that moved up the rankings (details below).

If you sit fully behind an always-on, automatic mitigation provider, the immediate risk is lower. Your alerting and visibility questions still apply.

## What changed

**Size and duration shifted.** Per the report, short attacks under 10 minutes and 1 Gbps rose 208%. Hyper-volumetric attacks above 1 Tbps fell nearly 69% from Q2. In raw counts, attacks above 1 Tbps dropped to 251 in Q3 from 805 in Q2.

At the network layer, 96% of attacks ended within 10 minutes and 98% stayed below 1 Gbps. Cloudflare says that pattern matches DDoS-for-hire booter services.

**Why the giants dropped.** Cloudflare links the fall in 1 Tbps+ attacks to early-2026 law enforcement takedowns of the Aisuru, KimWolf, JackSkid and Mossad botnets. It also warns that new IoT botnet variants, such as Dysphoria and Evooo1Bot, keep appearing. So the high-volume threat has not gone away.

**Scale of the background noise.** Cloudflare autonomously mitigated 18.2 million network-layer DDoS attacks and 14.4 trillion HTTP DDoS requests in Q3. That averages about 8,226 network-layer attacks per hour, or one every 0.44 seconds. Mitigated traffic totaled 272.6 PB at the network layer and 95.1 PB at the HTTP layer.

**Mirai is still big, and sometimes long.** Mirai-classified mitigation peaked in August at 57.23 PB, which was 46.5% of Q3 mitigated network-layer bytes. The longest Mirai attack of the quarter ran 49.7 hours, from August 19 to 21. Short attacks dominate by count, but long ones still happen.

**Vector mix moved.**

- CLDAP floods fell 99.5% quarter over quarter, to 0.05% of attacks, after a 580% surge earlier in the year.
- DNS amplification rose 215% to 3.43% of network-layer attacks.
- Other UDP floods grew from 14.06% to 31.31%.

**Targets shifted.** Media, Production & Publishing remained the most-attacked industry, but its share fell to about a quarter of its Q2 level. Internet infrastructure entered the top 10 at #6, with Consumer Services at #8 and Adult Entertainment at #9.

By location, the United States became the most-attacked, with China second and Indonesia third at 2.93% of attacks. Canada jumped from #16 to #6. Israel climbed seven places to #10 amid sustained mid-September attacks.

## What to do this week

The report does not prescribe configuration changes. The suggestions below are our own reading of the data.

**1. Check whether your alerts can see a 5-minute attack.** In our view, this is the biggest gap. If an alert needs 10 or 15 minutes of sustained elevated traffic before it fires, most attacks in this dataset would be over first. Look at evaluation windows, and look at whether you alert on request rate, error rate or latency instead of only bandwidth. Sub-1 Gbps attacks may never trip a bandwidth alarm sized for larger events.

**2. Audit anything that depends on a human responding.** With 96% of network-layer attacks ending within 10 minutes, a runbook that starts with "page the on-call" is likely to start after the event. We'd expect automatic mitigation, whether from a provider or your own tooling, to matter more than a fast human response for this class of attack. Humans are still needed for the long tail, such as the 49.7-hour Mirai attack.

**3. Revisit per-client and per-endpoint rate limits.** Many small attacks are a different problem from one huge one. Limits set only at the edge or only globally may not protect an expensive endpoint like login, search or checkout. Review whether your limits are scoped tightly enough to matter at modest request volumes.

**4. Review UDP exposure.** Other UDP floods went from 14.06% to 31.31% of attacks, and DNS amplification rose 215%. If you run UDP services, confirm which ports are actually reachable from the internet, and that you are not running an open resolver. Check that firewall rules drop UDP you do not need.

**5. Don't delete CLDAP protections just because the numbers fell.** CLDAP dropped to 0.05% of attacks, but the report notes it had surged 580% earlier in the year. In our view, vector popularity swings quickly, so keep the rule and just deprioritize it in your reviews.

**6. Keep long-attack capacity in the plan.** Mirai-type botnets accounted for 46.5% of mitigated network-layer bytes in Q3. Do not size your plan only for short bursts. Make sure your on-call has an escalation path for multi-day events.

**7. Check your industry and region exposure.** If you operate in internet infrastructure, consumer services, or adult entertainment, or serve users in Canada or Israel, the ranking changes may be relevant to your risk model. Rankings reflect shares of attacks, so use them as a prompt to review, not as a forecast.

**8. If you are a network operator, look at the threat feed.** Cloudflare says over 800 networks have signed up for its free DDoS Botnet Threat Feed for Service Providers. It is aimed at service providers, so it applies if you host or carry traffic for others.

## What we don't know yet

- **Baselines.** The notes we have do not spell out the comparison period for the 208% rise in short, small attacks. Check the full report before quoting it.
- **Causation.** Cloudflare says the drop in 1 Tbps+ attacks coincides with the botnet takedowns. Coincidence is not proof, and we can't say how much of the decline is due to enforcement versus attacker choices.
- **Durability.** New IoT botnet variants are emerging. Whether giant floods return next quarter is unknown.
- **Your own traffic.** This is network-wide data from one vendor. Your attack profile depends on your industry, protocols and visibility, so your own logs are the better guide.
- **Effects on non-Cloudflare setups.** The report describes what Cloudflare sees and mitigates. It does not tell you how other mitigation setups behave against the same traffic.

Cloudflare also says it offers free, unmetered DDoS protection across 330+ cities, backed by 500 Tbps of capacity, with automatic mitigation. That is a vendor claim, and we haven't tested it. Still, the report's trend, many short attacks that finish before humans react, is a reasonable argument for making sure some form of automation is in front of your services.