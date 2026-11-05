import Anthropic from '@anthropic-ai/sdk';
import { config } from './config.mjs';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

export async function ask(system, user, maxTokens = 4000) {
  const res = await client.messages.create({
    model: config.model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  });
  return res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
}

export function parseJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('No JSON found in model output');
  return JSON.parse(text.slice(start, end + 1));
}

export const slugify = (s) => {
  const full = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (full.length <= 70) return full;
  const cut = full.slice(0, 70);
  return cut.slice(0, cut.lastIndexOf('-')) || cut;
};

export function stripHtml(html) {
  return html
    .replace(/<(script|style|nav|footer|header|aside)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchText(url, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'TechDeskBot/1.0 (+research; respects robots)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}
