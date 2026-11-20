import { XMLParser } from 'fast-xml-parser';
import { config } from './config.mjs';
import { ask, parseJson, fetchText, stripHtml } from './lib.mjs';

const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const arr = (x) => (Array.isArray(x) ? x : x ? [x] : []);
const text = (x) => (typeof x === 'string' ? x : x?.['#text'] ?? '');
const maxAgeMs = config.maxAgeDays * 24 * 3600 * 1000;

function isRecent(raw) {
  const t = Date.parse(raw);
  return Number.isNaN(t) || Date.now() - t <= maxAgeMs;
}

async function fromFeed(url) {
  try {
    const doc = xml.parse(await fetchText(url));
    const items = arr(doc?.rss?.channel?.item);
    if (items.length) {
      return items
        .filter((i) => isRecent(text(i.pubDate) || text(i['dc:date'])))
        .slice(0, 8)
        .map((i) => ({ title: text(i.title), url: text(i.link), source: new URL(url).hostname }));
    }
    return arr(doc?.feed?.entry)
      .filter((e) => isRecent(text(e.published) || text(e.updated)))
      .slice(0, 8)
      .map((e) => {
        const links = arr(e.link);
        const alt = links.find((l) => l['@_rel'] === 'alternate') || links[0];
        return { title: text(e.title), url: alt?.['@_href'] ?? '', source: new URL(url).hostname };
      });
  } catch (e) {
    console.warn(`feed failed: ${url} (${e.message})`);
    return [];
  }
}

const SYSTEM = `You are the editor of a plain-English consumer technology publication for everyday readers (not programmers).
Choose topics that give ordinary people something useful to do or know: scams and fraud alerts, security and privacy changes, important changes to popular phones, computers, apps and services, practical AI tools for daily life, and consumer-rights issues involving technology.
Strongly prefer topics where a reader (and our editor) can check or try something on their own phone, computer or account in under 10 minutes, such as a setting to find, a feature to switch on or off, or a warning sign to look for.
Skip: developer-only topics (APIs, libraries, compilers, protocols), politics and opinion, gossip, funding and stock news, clickbait, and any claim that a named company was breached or at fault unless the source is that company or a government agency.
Prefer official sources. Prefer variety. Reply with JSON only.`;

export async function discover(seen, count) {
  const all = (await Promise.all(config.feeds.map(fromFeed))).flat();
  const candidates = all.filter((c) => c.title && c.url.startsWith('http') && !seen.has(c.url));
  if (!candidates.length) return [];

  const list = candidates.map((c, i) => `${i}. [${c.source}] ${c.title}`).join('\n');
  const out = await ask(
    SYSTEM,
    `Pick up to ${count} items from this list. For each, give a distinct original angle for everyday readers (for example "what changed and what to do today", "how to spot it", "where to find this setting").\n\n${list}\n\nJSON: {"picks":[{"index":0,"angle":"..."}]}`,
    2000,
  );
  const picks = parseJson(out).picks ?? [];

  const result = [];
  for (const p of picks) {
    const c = candidates[p.index];
    if (!c) continue;
    try {
      const sourceText = stripHtml(await fetchText(c.url)).slice(0, 30000);
      if (sourceText.length < 1500) throw new Error('source too short');
      result.push({ ...c, angle: p.angle, sourceText });
    } catch (e) {
      console.warn(`skip ${c.url}: ${e.message}`);
    }
  }
  return result;
}
