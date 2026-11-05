# Tech Desk: automated developer blog

Astro static site + a daily pipeline that discovers, writes, fact-checks, illustrates and publishes posts with no human step.

## Setup (10 minutes)
1. Edit `src/site.config.js`: name, real domain, contact email.
2. Push to a new GitHub repo.
3. Repo Settings > Secrets > Actions: add `ANTHROPIC_API_KEY`.
4. Connect the repo to Cloudflare Pages or Vercel (build: `npm run build`, output: `dist`). Attach your custom domain.
5. Actions tab > "Daily publish" > Run workflow. Each push triggers a rebuild.

Local test: `npm install && ANTHROPIC_API_KEY=... npm run pipeline && npm run dev`

## Safety valves
- Every post passes an independent fact-check (`pipeline/verify.mjs`); failures are dropped and listed in the run summary.
- Each run's published/rejected list appears in the GitHub Actions run summary. Turn on Actions failure/notification emails to be alerted.
- Remove a bad post: delete its file in `src/content/blog/` or set `draft: true`.
- Pace: `MAX_POSTS` (default 2/run, one run/day). Don't raise it sharply.

## Before applying to AdSense
- Let ~25+ posts accumulate (about two weeks), then skim them and delete weak ones.
- Use your own domain; confirm About, Contact, Privacy and Terms render.
- Add `adsenseClient` in `src/site.config.js` when you apply (also generates `/ads.txt`).
- Consider adding a cookie-consent banner if you serve EU/UK visitors.
