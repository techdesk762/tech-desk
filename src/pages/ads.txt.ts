import type { APIRoute } from 'astro';
import { site } from '../site.config.js';

export const GET: APIRoute = () => {
  const pub = site.adsenseClient.replace(/^ca-/, '');
  const body = pub
    ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
    : '# Set adsenseClient in src/site.config.js to generate this file.\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
