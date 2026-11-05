import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.mjs';
import { slugify } from './lib.mjs';
import { discover } from './discover.mjs';
import { write } from './write.mjs';
import { verify } from './verify.mjs';
import { makeCover } from './image.mjs';

const root = path.resolve(import.meta.dirname, '..');
const seenFile = path.join(root, 'pipeline/seen.json');
const postsDir = path.join(root, 'src/content/blog');
const imgDir = path.join(root, 'public/images');

const seen = new Set(fs.existsSync(seenFile) ? JSON.parse(fs.readFileSync(seenFile, 'utf8')) : []);
const report = [`# Pipeline run ${new Date().toISOString()}`, ''];

const q = (s) => JSON.stringify(s); // JSON strings are valid YAML

function frontmatter(d, slug, cover, item) {
  const now = new Date().toISOString();
  return [
    '---',
    `title: ${q(d.title)}`,
    `description: ${q(d.description)}`,
    `pubDate: ${q(now)}`,
    `tags: ${JSON.stringify((d.tags || []).map((t) => String(t).toLowerCase()).slice(0, 4))}`,
    `cover: ${q(cover)}`,
    `coverAlt: ${q(d.coverAlt || 'Abstract cover graphic')}`,
    `sources:\n  - title: ${q(item.title)}\n    url: ${q(item.url)}`,
    '---',
    '',
  ].join('\n');
}

const items = await discover(seen, config.maxPostsPerRun + 2); // pick a few extra; some will fail the gate
let published = 0;

for (const item of items) {
  if (published >= config.maxPostsPerRun) break;
  seen.add(item.url); // never retry the same source
  try {
    const draft = await write(item);
    const check = await verify(item, draft);
    if (!check.approved) {
      report.push(`- REJECTED: ${item.title}`, `  - ${check.reasons.join(' | ')}`);
      continue;
    }
    const slug = slugify(draft.title);
    const file = path.join(postsDir, `${slug}.md`);
    if (fs.existsSync(file)) { report.push(`- SKIPPED (duplicate slug): ${slug}`); continue; }
    const cover = await makeCover(slug, imgDir);
    fs.mkdirSync(postsDir, { recursive: true });
    fs.writeFileSync(file, frontmatter(draft, slug, cover, item) + draft.body.trim() + '\n');
    published++;
    report.push(`- PUBLISHED: [${draft.title}](/blog/${slug}) (${check.words} words, scores ${check.scores.accuracy}/${check.scores.originality}/${check.scores.usefulness})`, `  - source: ${item.url}`);
  } catch (e) {
    report.push(`- ERROR: ${item.title}: ${e.message}`);
  }
}

if (!items.length) report.push('- No new candidates found.');
fs.writeFileSync(seenFile, JSON.stringify([...seen].slice(-2000), null, 2));
const text = report.join('\n');
console.log(text);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + '\n');
