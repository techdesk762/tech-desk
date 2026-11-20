export const config = {
  model: process.env.MODEL || 'claude-sonnet-5-5',
  maxPostsPerRun: Number(process.env.MAX_POSTS || 2),
  minWords: 700,
  gate: { accuracy: 8, originality: 7, usefulness: 7 },
  maxAgeDays: 14,
  feeds: [
    'https://consumer.ftc.gov/consumer-alerts/feed',
    'https://www.cisa.gov/cybersecurity-advisories/all.xml',
    'https://krebsonsecurity.com/feed/',
    'https://www.eff.org/rss/updates.xml',
    'https://security.googleblog.com/feeds/posts/default',
    'https://blog.google/rss/',
    'https://www.apple.com/newsroom/rss-feed.rss',
    'https://blog.mozilla.org/en/feed/',
    'https://blogs.microsoft.com/feed/',
  ],
};
