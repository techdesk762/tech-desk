import sharp from 'sharp';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ask } from './lib.mjs';

const usedFile = path.join(import.meta.dirname, 'unsplash-used.json');

// ---------- Fallback: original abstract cover (no licensing concerns) ----------
const PALETTES = [
  ['#0b4fd6', '#7fb0ff', '#121a22', '#edf0f3'],
  ['#0f766e', '#6ee7d4', '#0b1f1e', '#ecf6f4'],
  ['#9a3412', '#fdba74', '#1c1210', '#f6f0ec'],
  ['#6d28d9', '#c4b5fd', '#16102a', '#f1eef8'],
  ['#be123c', '#fda4af', '#1f0f14', '#f8eef0'],
];

async function generatedCover(slug, outDir) {
  const h = crypto.createHash('sha256').update(slug).digest();
  const [a, b, dark, light] = PALETTES[h[0] % PALETTES.length];
  const W = 1200, H = 630, cols = 12, rows = 6, cell = 100, gap = 4;
  let rects = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = h[(r * cols + c) % h.length];
      const fill = v % 7 === 0 ? a : v % 5 === 0 ? b : v % 3 === 0 ? dark : light;
      const x = c * cell, y = r * cell + 15;
      const rad = v % 4 === 0 ? 50 : v % 4 === 1 ? 0 : 12;
      rects += `<rect x="${x + gap}" y="${y + gap}" width="${cell - gap * 2}" height="${cell - gap * 2}" rx="${rad}" fill="${fill}"/>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${light}"/>${rects}</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(outDir, `${slug}.png`));
  return { src: `/images/${slug}.png`, credit: null, alt: 'Abstract geometric cover graphic' };
}

// ---------- Real photo from Unsplash (hotlinked per Unsplash API rules, credit shown on the post) ----------
const UTM = 'utm_source=tech_desk&utm_medium=referral';

async function unsplashCover(slug, title) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;
  const headers = { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' };

  const raw = await ask(
    'You choose stock-photo search terms. Reply with 2 to 4 plain English words only, no punctuation, no quotes. Describe one concrete, visual subject that fits the article topic, such as: laptop code screen, server room, circuit board, network cables, smartphone apps, browser window, data center, cloud servers, keyboard desk. Avoid people, brands, logos and text.',
    `Article title: ${title}`,
    40,
  );
  const query = raw.trim().split('\n')[0].replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 60);
  if (!query) return null;

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high&per_page=20`,
    { headers },
  );
  if (!res.ok) throw new Error(`Unsplash API ${res.status}`);
  const results = (await res.json()).results ?? [];

  const used = new Set(fs.existsSync(usedFile) ? JSON.parse(fs.readFileSync(usedFile, 'utf8')) : []);
  const photo = results.find((p) => !used.has(p.id) && p.urls?.raw && p.links?.download_location);
  if (!photo) return null;

  // Required by Unsplash: tell them the photo is being used.
  const dl = await fetch(photo.links.download_location, { headers });
  if (!dl.ok) throw new Error(`Unsplash download ping ${dl.status}`);

  used.add(photo.id);
  fs.writeFileSync(usedFile, JSON.stringify([...used].slice(-3000)));

  const sep = photo.urls.raw.includes('?') ? '&' : '?';
  return {
    src: `${photo.urls.raw}${sep}w=1200&h=630&fit=crop&q=80&fm=jpg`, // keeps ixid, hotlinked from images.unsplash.com
    credit: {
      name: photo.user?.name || 'Unsplash photographer',
      url: `${photo.user?.links?.html || 'https://unsplash.com'}?${UTM}`,
      site: 'Unsplash',
      siteUrl: `https://unsplash.com/?${UTM}`,
    },
    alt: (photo.alt_description && photo.alt_description.trim()) || `Stock photo: ${query}`,
  };
}

export async function makeCover(slug, title, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  try {
    const photo = await unsplashCover(slug, title);
    if (photo) return photo;
  } catch (e) {
    console.warn(`Unsplash failed, using generated cover: ${e.message}`);
  }
  return generatedCover(slug, outDir);
}
