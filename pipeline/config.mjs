export const config = {
  model: process.env.MODEL || 'claude-sonnet-5-5',
  maxPostsPerRun: Number(process.env.MAX_POSTS || 2), // keep this low: slow, steady publishing
  minWords: 700,
  gate: { accuracy: 8, originality: 7, usefulness: 7 },
  hnMinScore: 100,
  feeds: [
    'https://github.blog/feed/',
    'https://blog.cloudflare.com/rss/',
    'https://hacks.mozilla.org/feed/',
    'https://web.dev/feed.xml',
    'https://kubernetes.io/feed.xml',
    'https://developers.googleblog.com/feeds/posts/default',
  ],
};
