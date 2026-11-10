---
title: "USPS Publishes Official ZIP Code Boundaries: What to Migrate First"
description: "USPS now licenses official ZIP Code boundary polygons. Here is how they differ from ZCTAs and centroids, and which of your code should move first."
pubDate: "2026-11-10T04:40:00.499Z"
tags: ["usps","geospatial","geocoding","data"]
cover: "/images/usps-publishes-official-zip-code-boundaries-what-to-migrate-first.png"
coverAlt: "Abstract geometric cover graphic"
sources:
  - title: "USPS now offers official ZIP Code boundary polygons"
    url: "https://postalpro.usps.com/zcb"
---
If your code treats a ZIP Code as a polygon, you have probably been working from an approximation. USPS now offers a national ZIP Code boundary product built from its own delivery data, which means you can check those approximations against a source that is closer to the authority. The most useful first step is a diff against what you use now, not a full migration.

The product is called [USPS ZIP Code Boundaries](https://postalpro.usps.com/zcb) and is listed on the PostalPro site.

## Who should care

- **Teams doing point-in-polygon lookups.** If you assign addresses or coordinates to ZIPs by testing them against shapes from a third-party or Census-derived dataset, errors at the edges are yours to inherit.
- **Delivery-zone and logistics developers.** USPS says ZIP Codes approximate delivery location groupings and can support route optimization. If your service areas are built from ZIP shapes, the shapes matter.
- **Insurance and real estate engineers.** USPS names these sectors as users that organize and display demographic data by ZIP Code. Rating territories and market reports often hang on ZIP assignment.
- **Anyone shipping a map or analytics product that redistributes ZIP geometry.** The license tier decides what you may do, and that can matter more than the geometry.

If you only use ZIPs as text fields for validation or form input, this probably does not affect you.

## What changed

USPS built the polygons from its delivery address and location information, aiming for accurate boundaries. It says users can treat them as authoritative ground truth, either adding them as features or correcting existing ZIP datasets. Boundaries can shift as delivery distribution changes for new or altered delivery locations.

There are three license tiers: Internal, Enterprise (limited distribution to subsidiaries and partners), and Publication (limited publication of the data). Every tier includes four data updates per year, delivered quarterly.

## What to do this week

1. **Get the GeoJSON sample.** The resource list includes a sample data file and a GeoJSON sample file. Load the GeoJSON into whatever you already use for spatial work and look at it before talking to anyone about licensing.
2. **Read the technical guide.** It is listed alongside a briefing sheet. We have not seen its contents, so check for the coordinate reference system, the ID field, and how ZIPs without areas are handled.
3. **Inventory your ZIP geometry usage.** Grep for the places where ZIPs become shapes or points: point-in-polygon joins, centroid distance calculations, choropleth layers, service-area unions. Rank them by cost of being wrong. Billing, rating, and eligibility rules come first. Dashboards come last.
4. **Run a diff on a sample.** Take a few thousand real addresses or coordinates from your own data. Assign ZIPs using your current method and using the USPS sample, then compare. The mismatch rate in your own data is the number that justifies or kills a migration.
5. **Read the license agreement and order form** before you design anything. The tier you need depends on whether data stays inside your company, goes to partners, or is shown to the public.
6. **Plan for versioning.** Four updates per year plus boundaries that shift means your pipeline should store a vintage with every derived result. Something as simple as a `zip_boundary_version` column will do.

## Our take

Opinion follows. The important change is not better polygons in the abstract. It is that you now have a reference you can measure other datasets against. Teams that have argued about whether a ZCTA or a vendor shape is "close enough" can now test it. We'd expect the diff to be small in dense, stable areas and more interesting at the edges, but that is a guess until someone runs it.

What is overhyped: the idea that everything should migrate. Many uses of ZIP geometry are display-only, and a few misplaced boundary slivers will not matter in a demographic heat map. A quarterly-updated, licensed dataset also adds a procurement and operations burden that a free approximation does not. Treating the polygons as "ground truth" is USPS's framing. It is reasonable for a delivery-based definition, but whether it is the right truth for your use case is your call. If you do demographic analysis, your population data may be tied to a different geography, and swapping boundaries could break the join.

Our recommendation: migrate in this order. First, logic where a wrong ZIP has financial or legal consequences. Second, delivery-zone and routing features. Third, analytics. Leave display layers alone until you see a reason to change them. And whatever you do, keep your old dataset beside the new one for at least one quarterly cycle so you can see what actually moves.

## What we don't know yet

- **Price.** The notes mention three tiers and an order form, but not what any of them cost.
- **Accuracy.** USPS says it aims for accurate polygons. We have no published error rates or comparisons against ZCTAs or commercial datasets.
- **Coverage and format details.** The notes do not describe attribute fields, projection, file size, or how non-areal ZIPs (such as single-organization or PO Box ZIPs) are represented.
- **How much boundaries move.** USPS says they can shift as delivery distribution changes, but not how often or how far in practice.
- **Redistribution limits.** "Limited" distribution and publication are the words used for the upper tiers. What the limits are sits in the license agreement, which we have not summarized.
- **Delivery mechanics.** The resource list also includes an Electronic Product Fulfillment Web Access Request Form, so access seems to run through a request process. The notes don't say how fast it is.

We have not tested any of this ourselves. Treat the sample files as the starting point and verify before you commit.