import { XMLParser } from 'fast-xml-parser';
import { config } from './config.mjs';
import { ask, parseJson, fetchText, stripHtml } from './lib.mjs';

const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const arr = (x) => (Array.isArray(x) ? x : x ? [x] : []);
const text = (x) => (typeof x === 'string' ? x : x?.['#text'] ?? '');

async function fromFeed(url) {
  try {
    const doc = xml.parse(await fetchText(url));
    const items = arr(doc?.rss?.channel?.item);
    if (items.length) {
      return items.slice(0, 8).map((i) => ({ title: text(i.title), url: text(i.link), source: new URL(url).hostname }));
    }
    return arr(doc?.feed?.entry).slice(0, 8).map((e) => {
      const links = arr(e.link);
      const alt = links.find((l) => l['@_rel'] === 'alternate') || links[0];
      return { title: text(e.title), url: alt?.['@_href'] ?? '', source: new URL(url).hostname };
    });
  } catch (e) {
    console.warn(`feed failed: ${url} (${e.message})`);
    return [];
  }
}

async function fromHackerNews() {
  try {
    const ids = JSON.parse(await fetchText('https://hacker-news.firebaseio.com/v0/topstories.json')).slice(0, 40);
    const items = await Promise.all(
      ids.map((id) => fetchText(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(JSON.parse).catch(() => null)),
    );
    return items
      .filter((i) => i && i.url && i.score >= config.hnMinScore)
      .map((i) => ({ title: i.title, url: i.url, source: 'news.ycombinator.com' }));
  } catch (e) {
    console.warn(`HN failed: ${e.message}`);
    return [];
  }
}

export async function discover(seen, count) {
  const all = [...(await fromHackerNews()), ...(await Promise.all(config.feeds.map(fromFeed))).flat()];
  const candidates = all.filter((c) => c.title && c.url.startsWith('http') && !seen.has(c.url));
  if (!candidates.length) return [];

  const list = candidates.map((c, i) => `${i}. [${c.source}] ${c.title}`).join('\n');
  const out = await ask(
    'You are the editor of a developer-focused tech publication. Choose topics that give working developers durable value: new releases, meaningful changes, security issues with practical impact, useful research. Skip gossip, politics, funding news, clickbait, and anything that would need claims you cannot verify from the source. Prefer variety. Reply with JSON only.',
    `Pick up to ${count} items from this list. For each, give a distinct original angle (e.g. "what changed and what to do", "how it compares to the alternative", "the practical impact").\n\n${list}\n\nJSON: {"picks":[{"index":0,"angle":"..."}]}`,
    2000,
  );
  const picks = parseJson(out).picks ?? [];

  const result = [];
  for (const p of picks) {
    const c = candidates[p.index];
    if (!c) continue;
    try {
      const sourceText = stripHtml(await fetchText(c.url)).slice(0, 14000);
      if (sourceText.length < 1500) throw new Error('source too short');
      result.push({ ...c, angle: p.angle, sourceText });
    } catch (e) {
      console.warn(`skip ${c.url}: ${e.message}`);
    }
  }
  return result;
}
