---
title: "Claude Code Can Leak Your Account Email to Websites: What to Check"
description: "Claude Code may put your account email in User-Agent headers on web requests. Here is who is exposed, what the built-in mod does and misses, and what to do now."
pubDate: "2026-11-06T04:45:09.878Z"
tags: ["claude-code","privacy","security","developer-tools"]
cover: "/images/claude-code-can-leak-your-account-email-to-websites-what-to-check.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Claude Code sends your email address to websites"
    url: "https://github.com/anthropics/claude-code/issues/107757"
---
If you use Claude Code while signed in, your account email may end up in requests it makes to third-party websites. Anthropic's mitigation catches the common cases, but not all of them. Until the root-cause fix ships, update, keep the mitigation on, and review what Claude runs when it touches the network.

The report is [GitHub issue #107757](https://github.com/anthropics/claude-code/issues/107757). The reporter says their email was exposed to third-party sites during web searches, followed by dozens of scam emails a day. That is one user's account of cause and effect. Other commenters reported spam surges too, and one said their logs showed their email going to other domains on v2.1.318 without the plugin.

## Who should care

- **Anyone signed in to Claude Code with a real, personal, or work email** who lets it run web tools or shell commands that hit the network.
- **Teams on a corporate address.** A work email in a request header to an arbitrary site is a leak of employee identity, even if nobody is spamming you.
- **Anyone on an older build.** The stable release channel was still on 2.1.311 at the time of the discussion. The built-in mitigation needs 2.1.317 or later, so stable-channel users don't have it.
- **People who let Claude write and run its own scripts.** This is the gap the mitigation can't cover (more below).

## What changed

The mechanism, as described in the thread, is mundane. A Claude Code engineer said on Hacker News that the account email was added to the model's context because Claude hallucinated names in things like `@author` tags for signed-in users. When Claude later composed commands such as `curl` calls, it sometimes put that email in the User-Agent as a contact address for sites that ask for one.

A contributor said 2.1.317 and later include a built-in mod, `cc-plugin-privacy`, meant to block this. It is on by default and can be turned off via `/plugins`. The engineer said the email is being removed from the model's context in the next release, expected early the following week.

## What to do this week

1. **Check your version.** If you're on the stable channel at 2.1.311, you have no mitigation. Move to 2.1.317 or later, or wait for the release that removes the email from context.
2. **Confirm the mod is enabled.** Open `/plugins` and check that the privacy mod hasn't been disabled, by you or by shared config.
3. **Read confirmation prompts.** The engineer said the mod asks for confirmation before web tool calls or curl-style commands containing the email. Treat that prompt as a real checkpoint and look for your address in the headers.
4. **Be careful with self-written scripts.** The engineer admitted the mod cannot catch cases where Claude writes and runs its own script. If you approve scripts that make HTTP requests, search them for your email or a User-Agent string before running.
5. **Check your own traffic.** One commenter found the leak in their logs. If you have a proxy or network logging, search outbound requests for your account email. That is the only way to know what actually leaves your machine, and it's worth doing whether or not you trust the mod.
6. **Consider a throwaway or alias address** for tools you sign in to, if your account setup allows it. This is our suggestion, not something from the thread.
7. **Check your inbox for new spam patterns** if you've done a lot of web-enabled sessions on affected versions. That's weak evidence, but it's what the reporters are pointing to.

## Our take

**What matters:** The most important line in the thread isn't about the plugin. It's the commenter's question about why the model gets the user's email at all. A filter that inspects commands for an address is a patch on top of a design choice. Removing the email from context is the real fix, and it's good that it's coming. Until it ships, the leak is only mitigated.

**What's shaky:** "Deterministic" blocking is a strong word, and the thread undercuts it. A user on macOS arm64 reported that the mod didn't refuse a harmless echo command containing a User-Agent string and the account email, on both 2.1.317 and 2.1.318. The engineer's own admission about self-written scripts points the same way. In our view, a pattern-matching guard around tool calls will always have holes when the model can generate arbitrary code. We'd also treat the spam causation as unproven: one reporter's inbox isn't a controlled test, though the mechanism is plausible enough to take seriously.

**Recommendation:** Don't wait for the fix to audit. And we'd expect trust, more than the technical bug, to be the lasting damage. One commenter noted the issue was reportedly raised several times, including in a GitHub issue five months earlier, which sits badly with a "caught late" framing. The reporter wants the behavior removed entirely rather than made a toggle, and the planned context change matches that. If you're evaluating AI coding tools for a team, ask vendors exactly what identity data enters model context, and whether you can verify it.

## What we don't know yet

- **Which versions are affected.** The report was filed on macOS with 2.1.318, but the thread doesn't establish when the behavior began. The five-month-old issue a commenter mentioned suggests it may be older.
- **Whether other platforms behave differently.** The issue is labeled `platform:macos`. Nothing in the notes says whether Linux or Windows differ.
- **Why the echo test slipped through.** The macOS arm64 user's result conflicts with the claim of deterministic blocking, and the notes include no explanation or fix for it.
- **How many sites received emails.** Reports of spam and logs are anecdotal. There's no count of domains or requests.
- **Whether removing the email from context closes the leak.** That depends on the release landing as described and on no other path exposing the address. We haven't seen it, and we haven't tested any of this ourselves.
- **Whether the stable channel will get the fix quickly.** It was at 2.1.311 when the thread was active.