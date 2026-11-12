---
title: "Atuin Threads Syncs Your Coding-Agent Sessions Across Machines. Check What It Captures First."
description: "Atuin 18.24 adds Threads: encrypted, searchable sync of Claude Code, Codex and other agent sessions across machines. Here is how to try it and what to weigh."
pubDate: "2026-11-12T07:49:37.913Z"
tags: ["atuin","ai-agents","developer-tools","privacy"]
cover: "/images/atuin-threads-syncs-your-coding-agent-sessions-across-machines-check.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Atuin Threads: All your agent sessions on every machine"
    url: "https://blog.atuin.sh/threads-agent-sessions/"
---
If you run coding agents on more than one machine, your session history is probably scattered across a dev server, a laptop, and whatever else you SSH into. Atuin 18.24 adds a feature called Threads that pulls those sessions into one searchable, synced history, and lets you pick one up on a different machine, or even in a different agent. It is opt-in, so nothing changes until you turn it on. Whether you should turn it on depends on what your sessions contain.

The details are in the [Atuin announcement](https://blog.atuin.sh/threads-agent-sessions/). Below is what matters for day-to-day use.

## Who should care

- **Multi-machine agent users.** If you start work on a remote box and want to finish on a laptop, this targets your problem directly.
- **People who use more than one agent.** Threads lets you fork a session into a different agent harness. The announcement's example is starting in Claude Code on a dev server and finishing in Codex on a laptop.
- **Existing Atuin users.** The sync machinery is already there, so adoption cost is low.
- **Teams, eventually.** Opt-in session sharing is under development, but it is not here yet.

If you use a single agent on a single machine and rarely revisit old sessions, this is less compelling today.

## What changed

Atuin already syncs shell history with end-to-end encryption. Its sync engine can handle anything modelled as an append-only log, which describes most AI sessions. Threads applies that engine to agent sessions.

Currently supported agents are Claude Code, Codex, Pi, Omp, and OpenCode, with more planned. Running `atuin resume` opens a terminal interface for browsing and resuming sessions. There is also an MCP server (`atuin mcp`) so agents can search and reference earlier sessions themselves.

Storage is your choice: the hosted sync server, a self-hosted server, or local only.

## What to do this week

1. **Update Atuin to 18.24 or later.** Threads requires it. The announcement says to install or update with the setup script; use whatever method you installed with.
2. **Decide where data lives before enabling capture.** Options are hosted, self-hosted, or local only. If you are unsure, local only is the conservative start.
3. **Opt in to session capture.** It is off by default.
4. **Run `atuin resume`** and see what shows up. Check that sessions from the agents you actually use appear.
5. **Try the MCP integration.** The notes say `atuin mcp install` can set it up automatically for claude, codex, pi, or opencode.

```
atuin resume
atuin mcp install
```

6. **Test one real handoff.** Start a small task on one machine, then resume or fork it on another. A throwaway task tells you more than reading docs.

## Our take

**What is important.** The interesting part is not the sync, it is the retained context. The announcement argues that sessions keep abandoned, never-merged work and the reasoning behind it, so a later agent can learn what you wanted without a long spec. Git history rarely keeps that. The examples fit: a triage agent traced a missing-permission failure on avatar uploads, caused by a rotated object store key, back to an earlier investigation. In our view, giving agents searchable access to prior sessions through MCP is a bigger deal than cross-machine resume.

**What is unproven.** Those examples are the author's own, and we have not tested any of this. Whether agents reliably find the right old session, and whether that context helps more than it distracts, is an open question. Also, "resume anywhere" across different harnesses sounds smooth, but each agent has its own conventions, and a forked session is a translation. We'd expect rough edges there.

**Recommendation.** Treat session history like you treat shell history, but more cautiously. Agent sessions can include file contents, command output, and anything you pasted in. End-to-end encryption means the Atuin team cannot read synced sessions, which is a real protection. It does not stop your own machines from holding everything, or an agent from surfacing an old secret into a new session via MCP. We'd start with local or self-hosted storage on work machines and move to hosted only after you've looked at what gets captured.

One more note: the author says over half the commands on their machines are now written by agents rather than by them. If that is true for you too, a history that ignores agents is missing most of the story, and Threads is a sensible response.

## What we don't know yet

- **Exactly what gets captured.** The notes don't say whether tool output, file contents, or environment details are included, or whether you can redact anything.
- **Fidelity of cross-agent forks.** How much of a session survives a move between harnesses is not described.
- **Team sharing.** It is under development. The idea of handing off threads like Git branches is stated, but there is no design, timeline, or access model in what we have.
- **Scale.** We don't know how search and sync behave with large session histories.
- **Which agents come next.** "More planned" is all we have.

Until those are answered, a small, deliberate trial on one or two machines is a reasonable way to find out whether Threads earns a place in your setup.