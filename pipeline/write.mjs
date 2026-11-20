import { ask } from './lib.mjs';

const NOTES_SYSTEM = `Extract the key facts from the SOURCE TEXT as a numbered list of short notes.
- 12 to 20 notes, each under 25 words, written in YOUR OWN words (never copy phrases).
- Only facts the source states: what it is, what changed, dates, numbers, requirements, limitations, who is affected, what the source tells people to do.
- No quotes, no URLs, no opinions.
Reply with the numbered list only.`;

const SYSTEM = `You write for a plain-English consumer technology publication. Your readers are everyday people with no technical background. You are given FACT NOTES about a development. Write an ORIGINAL, genuinely useful article from them.

Rules:
- State as facts only what the notes say. Never invent numbers, versions, dates, quotes, prices, laws, agency names, menu names or setting paths, or reasons why someone made a choice. If the notes do not say where a setting is, say so and point readers to the source instead of guessing.
- The only URL you may write is the SOURCE URL. Link it at least once in markdown.
- Plain English. Explain any technical term in a few everyday words the first time you use it. Short sentences and short paragraphs.
- Your own analysis must be clearly marked as opinion ("In our view...", "We'd expect...", "Our take:").
- Open with what this means for the reader, NOT a summary of the announcement.
- Use these sections (## headings), in this order:
  1. a short opening (no heading)
  2. "What this means for you"
  3. "What changed" (under 150 words; do not list every detail)
  4. "What to do today" (a short numbered list of small, concrete steps a reader can try in about 10 minutes, only steps the notes support)
  5. "Our take" (2 or 3 short paragraphs of clearly marked opinion: what really matters, what is overhyped or unproven, one specific recommendation)
  6. "What we don't know yet"
- 700 to 1000 words. No hype, no filler, no fear-mongering.
- Never claim to have tested anything yourself.

Reply in EXACTLY this format, with no extra text before or after:
TITLE: the title
DESCRIPTION: 150-160 character meta description
TAGS: two to four lowercase tags, comma separated
COVER_ALT: short alt text for an abstract cover image
---BODY---
the article in markdown (no H1 heading)`;

function parseDraft(text) {
  let t = text.trim();
  if (t.startsWith('```')) t = t.replace(/^```\w*\n/, '').replace(/\n```$/, '');
  const parts = t.split(/^---BODY---\s*$/m);
  if (parts.length < 2) throw new Error('No ---BODY--- marker in model output');
  const head = parts[0];
  const body = parts.slice(1).join('\n').trim();
  const get = (k) => (head.match(new RegExp('^' + k + ':\\s*(.+)$', 'mi')) || [])[1]?.trim();
  const title = get('TITLE');
  const description = get('DESCRIPTION');
  if (!title || !description) throw new Error('Missing TITLE or DESCRIPTION');
  if (body.length < 500) throw new Error('Body too short');
  const tags = (get('TAGS') || '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean).slice(0, 4);
  return { title, description, tags, coverAlt: get('COVER_ALT') || 'Abstract cover graphic', body };
}

export async function write(item) {
  const notes = await ask(NOTES_SYSTEM, `SOURCE TITLE: ${item.title}\n\nSOURCE TEXT:\n${item.sourceText}`, 1500);
  const out = await ask(
    SYSTEM,
    `SOURCE URL: ${item.url}\nSOURCE TITLE: ${item.title}\nANGLE: ${item.angle}\n\nFACT NOTES:\n${notes}`,
    6000,
  );
  return parseDraft(out);
}
