---
title: "Web Serial Arrives in Firefox 151: Detect, Fall Back, Know the Gaps"
description: "Firefox 151 on desktop now supports Web Serial. Here's what it enables, how to feature-detect it with a graceful fallback, and what gaps remain for your project."
pubDate: "2026-11-05T06:31:22.601Z"
tags: ["web serial","firefox","device apis","javascript"]
cover: "/images/web-serial-arrives-in-firefox-151-detect-fall-back-know-the-gaps.png"
coverAlt: "Abstract illustration of a browser window connected by a cable to a small circuit board"
sources:
  - title: "Announcing Web Serial Support in Firefox"
    url: "https://hacks.mozilla.org/2026/05/web-serial-support-in-firefox/"
---
Mozilla [announced Web Serial support](https://hacks.mozilla.org/2026/05/web-serial-support-in-firefox/) for Firefox on May 21, 2026. It starts in Firefox 151 for desktop. If you build tools for microcontrollers, 3D printers, meters or other serial hardware, this changes what you can assume about your users' browsers. It does not remove the need for a fallback.

## What Web Serial does

Web Serial lets a web page read from and write to serial devices using JavaScript. Modern computers rarely have physical serial ports. But devices connected over USB, or paired over Bluetooth, can present themselves to the operating system as serial ports, and the API talks to those.

The practical result is that a site can talk to hardware or deliver firmware without a native app or installer. Mozilla's post points to several real examples:

- **Adafruit** delivers CircuitPython firmware over Web Serial. Once it's installed, a Python program on the device can exchange simple text with a web page. Mozilla recommends the Adafruit Web Serial Tool for Firefox, and not the "OPEN INSTALLER" method on the CircuitPython site.
- **Power measurement.** Mozilla's Florian Quèze built a page that reads data from USB power meters and can export it to the Firefox Profiler. The post names the AVHzY C3 USB as the meter used, and says the Joy-IT TC66C and YZXStudio USB ZY1280 were also tested successfully.
- **Home automation.** The ESPHome project offers Home Assistant-compatible firmware for ESP32 and similar devices that can be installed and configured over Web Serial.
- **Page Playground**, a project from Mozilla engineer Alex Franchuk that combines electronics with web editing.

The post lists Espressif ESP boards, Raspberry Pi Picos, 3D printers and LEGO devices among compatible hardware.

## Permissions and privacy

Sites can't see serial ports until the user allows it. Access is granted per site and per port. A site must call `navigator.serial.requestPort()`, which opens a chooser where the user picks a port or denies access. The site never receives a list of connected devices. Mozilla says that means there's no useful fingerprinting information beyond the port the user selects.

Firefox adds a layer on top. It uses add-on gating, which it introduced for Web MIDI. The first time a site asks for port access, a more detailed explanation appears before the port selection prompt. Expect a slightly longer first-run flow in Firefox than you may have seen elsewhere, and word your onboarding copy accordingly.

For managed environments, Web Serial is disabled by default under Firefox Enterprise Policies. Administrators can allow or disallow it with the `DefaultSerialGuardSetting` policy. If your tool is used in schools, labs or companies, "it doesn't work in Firefox" may be an IT setting and not a bug.

## Feature-detect, don't sniff

Don't branch on the user agent string. Test for the API:

```js
const hasWebSerial = 'serial' in navigator;
```

As general background (not from Mozilla's post), the check is cheap and works in every browser. Run it when your UI loads and decide which flow to show. Don't wait until someone clicks "Connect."

Detection only tells you the API exists. It doesn't tell you the user will succeed. Treat the real connection attempt as fallible too:

```js
async function connect() {
  if (!('serial' in navigator)) {
    showFallback();
    return;
  }
  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    // read/write via port.readable and port.writable
  } catch (err) {
    // User dismissed the chooser, policy blocked it,
    // or the port is busy or unavailable.
    showConnectError(err);
  }
}
```

Two things to note. `requestPort()` must be called from a user gesture such as a click, so don't call it on page load. And a dismissed prompt will reject the promise, so handle that as a normal outcome and don't log it as a crash. The baud rate here is a placeholder. Use whatever your device expects.

## Designing the fallback

What `showFallback()` does depends on your product. A few reasonable options:

1. **Point to a native tool.** If you already ship a CLI or desktop flasher, link to it with clear instructions.
2. **Name a supported browser.** Say which browsers your tool works in and explain why. Check MDN's compatibility data before you write that list, because browser support changes.
3. **Offer an offline path.** For firmware tools, let users download the file and flash it with a method you document. For data tools, offer a paste-in or file-import mode so people can still view data captured elsewhere.
4. **Keep the rest of the page useful.** Docs, previews, simulators and saved data shouldn't be hidden behind a feature check.

Separate your protocol logic from your transport. If the code that parses a power meter's packets or sends a bootloader command doesn't know it's talking to a Web Serial stream, you can swap in another transport later, or test against recorded data. That's good practice regardless of browser support.

## Cross-browser gaps that remain

Firefox's arrival narrows the gap for projects that were Chromium-only, but several things are still open.

**Desktop only.** Mozilla's announcement says Firefox 151 for Desktop. The post doesn't announce support elsewhere, so don't assume mobile Firefox will work.

**Not yet a standard.** Web Serial still lives in the Web Incubator Community Group (WICG). Mozilla says it's optimistic about standardization and is pursuing it in the WHATWG through a new Workstream proposal. That's an intention, not a finished spec. Behavior at the edges could still shift, so avoid depending on undocumented quirks.

**Other browsers.** The post doesn't survey other engines. As background, Web Serial has been associated with Chromium-based browsers, and you shouldn't assume Safari support. Check the MDN compatibility table for the current picture before promising anything to users.

**Different permission UX.** Firefox's add-on gating prompt appears before the port chooser on first request. Your instructions, screenshots and support docs written around the Chromium flow may not match what Firefox users see.

**Policy defaults.** Enterprise-managed Firefox installs have Web Serial off unless an administrator enables it. Give users an error message that mentions this possibility.

**Hardware and tool quirks.** Mozilla tested against real Adafruit workflows, and its own example sites were tested on specific devices. That's a good sign, but it doesn't guarantee that every board, driver and tool behaves identically. The Adafruit installer advice is a reminder that one tool may work well in Firefox while another path doesn't.

## What to do next

- Add a `'serial' in navigator` check and a visible fallback to any tool that currently says "Chrome only."
- Test your connect, read, write and disconnect paths in Firefox 151 or later with real hardware, including the cancel and denied cases.
- Update your docs to cover the extra first-time prompt.
- If you ship to managed environments, document the `DefaultSerialGuardSetting` policy for administrators.
- If something breaks, Mozilla asks for feedback on Mozilla Connect, and technical issues can go through support.mozilla.org or a bug report.

The headline is simple: more of your users can now use hardware tools in the browser they already have. The work for you is to detect capability honestly and keep an alternative path ready.
