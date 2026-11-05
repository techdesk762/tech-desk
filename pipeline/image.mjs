import sharp from 'sharp';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Original abstract cover art generated from the slug: you own it outright, no licensing concerns.
const PALETTES = [
  ['#0b4fd6', '#7fb0ff', '#121a22', '#edf0f3'],
  ['#0f766e', '#6ee7d4', '#0b1f1e', '#ecf6f4'],
  ['#9a3412', '#fdba74', '#1c1210', '#f6f0ec'],
  ['#6d28d9', '#c4b5fd', '#16102a', '#f1eef8'],
  ['#be123c', '#fda4af', '#1f0f14', '#f8eef0'],
];

export async function makeCover(slug, outDir) {
  const h = crypto.createHash('sha256').update(slug).digest();
  const [a, b, dark, light] = PALETTES[h[0] % PALETTES.length];
  const W = 1200, H = 630, cols = 12, rows = 6, cell = 100, gap = 4;
  let rects = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = h[(r * cols + c) % h.length];
      const fill = v % 7 === 0 ? a : v % 5 === 0 ? b : v % 3 === 0 ? dark : light;
      const x = c * cell + 0, y = r * cell + 15;
      const rad = v % 4 === 0 ? 50 : v % 4 === 1 ? 0 : 12;
      rects += `<rect x="${x + gap}" y="${y + gap}" width="${cell - gap * 2}" height="${cell - gap * 2}" rx="${rad}" fill="${fill}"/>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${light}"/>${rects}</svg>`;
  fs.mkdirSync(outDir, { recursive: true });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(outDir, `${slug}.png`));
  return `/images/${slug}.png`;
}
