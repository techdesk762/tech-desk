import { ask } from './lib.mjs';

const NOTES_SYSTEM = `Extract the key facts from the SOURCE TEXT as a numbered list of short notes.
- 12 to 20 notes, each under 25 words, written in YOUR OWN words (never copy phrases).
- Only facts the source states: what it is, what changed, versions, dates, numbers, requirements, limitations, who is affected.
- No quotes, no URLs, no opinions.
Reply with the numbered list only.`;

const SYSTEM = `You write for a developer-focused publication. You are given FACT NOTES about a new development. Write an ORIGINAL, genuinely useful article from them. Readers should learn something they would not get from just reading the announcement.

Rules:
- State as facts only what the notes say. Never invent numbers, versions, dates, quotes, benchmarks, function names, or reasons why someone made a choice.
- The only URL you may write is the SOURCE URL. Link it at least once in markdown.
- Your own analysis must be clearly marked as opinion ("In our view...", "We'd expect...", "Our take:").
- Open with the practical consequence for developers, NOT a summary of the announcement.
- Do not walk through the announcement point by point. Pick the 2 or 3 things that matter most and explain why.
- Use these sections (## headings), in this order:
  1. a short opening (no heading)
  2. "Who should care"
  3. "What changed" (keep it under 150 words; do not list every feature)
  4. "What to do this week" (concrete, specific steps; include one short code snippet or command only if the notes support it)
  5. "Our take" (2 or 3 short paragraphs of clearly marked opinion: what is genuinely important, what is overhyped or unproven, and one specific prediction or recommendation. Be direct, not wishy-washy.)
  6. "What we don't know yet"
- 700 to 1000 words. Short paragraphs. Plain English, no hype, no filler.
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
