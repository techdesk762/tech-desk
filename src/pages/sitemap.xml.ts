import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const abs = (p: string) => new URL(p, site).href;
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const pages = ['/', '/about', '/contact', '/privacy', '/terms'].map((p) => ({ loc: abs(p), lastmod: '' }));
  const items = posts.map((p) => ({
    loc: abs(`/blog/${p.id}`),
    lastmod: (p.data.updated ?? p.data.pubDate).toISOString(),
  }));

  const body = [...pages, ...items]
    .map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
