---
title: "A2UI 1.0 Is Stable: What Agent Front-End Teams Should Check Before Adopting"
description: "A2UI 1.0 gives agents a stable way to return native UI instead of text. Here is who should care, what changed, and how to evaluate it this week."
pubDate: "2026-11-12T04:46:32.355Z"
tags: ["a2ui","agents","generative-ui","mcp"]
cover: "/images/a2ui-1-0-is-stable-what-agent-front-end-teams-should-check-before.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "A2UI 1.0: Build delightful, fast, reliable, agentic experiences"
    url: "https://developers.googleblog.com/a2ui-10-build-delightful-fast-reliable-agentic-experiences/"
---
If your agent front end currently renders long blocks of text, or if you hand-roll JSON-to-UI glue for each client, A2UI 1.0 is worth an afternoon of evaluation. The protocol is now stable, and the stability matters most for one reason: you can build against it without expecting the schema to move under you.

Google announced the release on November 11, 2026. It is an open protocol that lets an agent reply with interactive screens, such as a confirmation form or a chart, rather than prose. The full announcement is on the [Google Developers Blog](https://developers.googleblog.com/a2ui-10-build-delightful-fast-reliable-agentic-experiences/).

## Who should care

**Teams shipping agents across more than one surface.** If the same agent has to work in a web app, a mobile app, and a chat assistant, a shared description of the UI is attractive. Renderers exist for React, Angular, Lit, Flutter, SwiftUI, and Jetpack Compose.

**Teams with a design system to protect.** The agent describes what to show, and your app draws it with its own native components. The agent can only place and configure components you have registered. That is a real constraint on what a model can put on screen.

**Teams handling sensitive data.** Data binding happens on the server, so sensitive values never reach the model.

**Anyone building for Claude or Gemini.** The web and Flutter renderers work inside MCP Apps, so screens can appear in assistants such as Claude and Gemini.

If you only need a chatbot that returns text, you can skip this for now.

## What changed

The headline is the move to a first stable release. Three additions in 1.0 stand out: bidirectional function calls, accessibility support, and extensions for additional metadata. The TypeScript and Dart agent SDKs are new, joining Python.

In Python, A2UI Macros add programmatic component expansion and data binding, and swappable inference formats are meant to reduce latency. The UI also streams in as the agent works.

One caveat: the Jetpack Compose renderer is at v0.9.1, with v1.0 listed as coming soon.

## What to do this week

1. **Read the docs and quickstart at a2ui.org.** Get the shortest path to a rendered screen before forming opinions.
2. **Check your renderer.** Web, Flutter, and iOS are covered by open-source renderers. If you are on Android with Compose, plan around v0.9.1 until 1.0 ships.
3. **Pick one flow.** Choose an interaction where text is clearly worse than a UI: a confirmation step, a set of options, a small chart. Build only that.
4. **Inventory your components.** Because agents can only use registered components, list the handful you would expose. Starting small is a feature here, not a limitation.
5. **Decide where data binding lives.** Work out which values should be bound server-side so the model never sees them.
6. **Test accessibility early.** 1.0 adds accessibility support. Verify it against your own components rather than assuming it.
7. **If you are on 0.9, open the evolution guide.** It is the documented upgrade path.
8. **If you target Gemini, note the version.** Gemini supports A2UI 0.9.1 today, and Gemini Enterprise is mid-upgrade to 1.0. Test against what the platform actually runs.

## Our take

**What is important.** The registered-component model is the interesting part. Most generative UI worries come down to a model producing something off-brand, broken, or unsafe. Restricting the agent to a vocabulary you control, and keeping sensitive values out of the model's context, is a sound answer. In our view, that design matters more than the stable label.

**What is unproven.** The notes list adopters, including Atlassian's work in Jira, Alation's metric cards and charts, and Gemini Notebook's slide-deck flows. Those show the protocol is in use, but they are vendor-reported and we have no data on latency, failure rates, or maintenance cost. Also, the same screen rendering in Claude and in your own app is a strong claim. We would want to see it with your components, not a demo.

**Our prediction.** We'd expect early wins in structured, low-risk interactions like approvals, follow-up questions, and option pickers, not in open-ended generated dashboards. Our recommendation: pilot one flow, and don't rewrite your whole agent front end until the Compose renderer reaches 1.0 and the Gemini platforms finish upgrading.

## What we don't know yet

- **Performance.** The notes mention streaming and lower latency from swappable inference formats, but give no figures.
- **Migration effort.** We don't know how much work the 0.9 to 1.0 upgrade involves beyond the existence of an evolution guide.
- **Timelines.** "Coming soon" for Compose v1.0 and "in progress" for Gemini Enterprise have no dates attached. ByteDance's Lynx renderer, released in June 2026, supports 0.9 and is adapting to 1.0, also without a date.
- **Cross-client consistency.** How closely rendering matches across hosts such as Claude, Gemini, and your own app is not quantified.
- **Governance.** The notes call it an open protocol but say nothing about how it will evolve or who decides.