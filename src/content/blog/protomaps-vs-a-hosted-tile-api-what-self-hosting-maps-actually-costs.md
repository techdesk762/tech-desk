---
title: "Protomaps vs. a Hosted Tile API: What Self-Hosting Maps Actually Costs"
description: "Self-hosting map tiles with Protomaps and PMTiles can cost about $5 a month for the whole world. Here is how setup, cost and control compare to per-load APIs."
pubDate: "2026-11-16T05:19:46.721Z"
tags: ["maps","protomaps","self-hosting","cdn"]
cover: "/images/protomaps-vs-a-hosted-tile-api-what-self-hosting-maps-actually-costs.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "Protomaps: Self-hosting map tiles has gotten cheap and easy"
    url: "https://bruceroettgers.eu/blog/protomaps/"
---
If your map app bills per load, a traffic spike can become a bill. Protomaps offers a different model: put one file on object storage, put a CDN in front, and serve tiles with no tile server at all. According to [one developer's write-up](https://bruceroettgers.eu/blog/protomaps/), the full world map costs roughly $5 a month to store.

This article compares that approach with a hosted tile API, focusing on setup effort, the hosting model and the trade-offs for small teams.

## Who should care

- **Small teams and solo developers** running a map in a side project, a internal tool or a startup MVP, where a surprise invoice matters more than a slightly nicer dashboard.
- **Anyone building something that could go viral.** The author notes that commercial map APIs can get very costly for non-commercial projects that take off. Mapbox, for example, charges $5 per 1,000 loads after the free tier.
- **Teams with data-protection requirements.** The CDN the author picked, Bunny.net, is headquartered in the EU and by default drops the last octet of IP addresses.

If your map is a small embedded widget that gets a few hundred views a month, a hosted free tier is probably fine and you can stop reading.

## What changed

Nothing was released here. What changed is that the pieces got cheap and simple enough to make self-hosting realistic.

PMTiles is a single-file tile format served over HTTP Range requests. The client asks for byte ranges, so no tile server runs. Any CDN that caches Range requests for large files needs nothing beyond the file in storage. A daily build of the whole world is available for download, and the CLI can extract a bounding box or specific zoom levels into a smaller file.

## What to do this week

Here is the path the author describes, using Bunny.net. Other CDNs work if they support Range requests.

1. **Decide on the extent.** The full world map is 139GB. If your users only care about one region, use the CLI to extract a bounding box or limit zoom levels. A smaller file is cheaper to store and quicker to move around.
2. **Use an S3-compatible storage zone, not the HTTP API.** The author's upload through Bunny's HTTP API timed out after 15 minutes. Their recommendation is an S3-compatible storage zone with rclone.
3. **Stream the build straight into storage.** The `rclone copyurl` command does this without staging the file locally. Run it in tmux or on a temporary VPS so a dropped SSH session doesn't kill a 139GB transfer.
4. **Configure the pull zone carefully.** Two settings matter most: restrict allowed referrers so other sites can't embed your tiles, and enable "Optimize for large object delivery" so Range requests are cached.
5. **Deter full-file downloads.** The author suggests throttling to 10kB/s after 10MB in a single request. Request-rate limits and monthly bandwidth caps are optional extras.
6. **Wire up the front end.** Install the `pmtiles` npm package, then register its protocol and a style in MapLibre GL.

If you're on Cloudflare instead, the notes say an edge function can translate traditional x/y/z URL paths into Range requests. That is useful if you have existing clients that expect that URL scheme.

## Our take

The single-file model is the important part. It removes a whole category of operations work: no tile server to patch, scale or monitor, and no database behind it. Upload once, and the CDN does the rest. For a small team, that matters more than the per-gigabyte price.

The cost numbers are encouraging but should be read carefully. The author estimates that loading a Europe map and zooming into a city transfers about 5MB, costing roughly $0.00005, possibly 100x cheaper than Mapbox. That is a best-case, light-usage figure. The author also says real bandwidth varies, and heavy users may transfer tens of MB. Bunny charges for bandwidth while Mapbox charges a flat fee per visit, so the gap narrows for map-heavy sessions. Even so, a gap of an order of magnitude or so is still large, and we wouldn't expect the conclusion to flip.

Our recommendation: if you are starting a new map project today and don't need a vendor's geocoding, routing or satellite imagery, prototype on PMTiles with a regional extract first. Treat the referrer restrictions and throttling as part of the setup, not an afterthought, since they are what stand between you and someone else's traffic on your bill. Self-hosting isn't free of responsibility; you are trading a vendor's per-load fee for your own configuration risk.

## What we don't know yet

- **Real-world bandwidth.** The write-up gives one estimate for a European city zoom and a warning about heavy users, but no measured traffic from a production app.
- **How well the abuse controls hold up.** The referrer checks and throttling are described as deterrents. The notes don't say how determined scrapers fare against them.
- **Update cadence.** A daily build exists, but the notes don't cover how often a small team should refresh its file, or what re-uploading costs in time and bandwidth.
- **Feature parity.** The notes cover tiles and display via MapLibre GL. They say nothing about search, routing or other services that hosted APIs bundle, so you would need to source those separately.
- **Other CDNs.** Bunny is the worked example. We haven't seen equivalent numbers for other providers, and we haven't tested any of this ourselves.