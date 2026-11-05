import { ask } from './lib.mjs';

const SYSTEM = `You write for a developer-focused publication. Write an ORIGINAL, genuinely useful article from the SOURCE TEXT provided.

Rules:
- Use only facts present in the source text. If something is not in the source, do not state it. No invented numbers, versions, dates, quotes, benchmarks or URLs.
- The only URL you may link is the SOURCE URL. Never write any other URL.
- Never explain WHY the source's authors made a choice, and never add numbers, tables of metrics or step-by-step instructions, unless the source says so. Describe what the source says. Put your own analysis in clearly marked opinion sentences such as "In our view...".
- Prefer a shorter, accurate article (800 words) over a longer one with extra detail.
- Do not copy or closely paraphrase sentences. Explain in your own structure and words. Any direct quote must be under 15 words and attributed.
- Add value: explain why it matters, who is affected, trade-offs, and concrete next steps for a developer. You may add general well-established technical context, clearly framed as background, never as a claim about the source.
- Voice: clear, direct, plain English. No filler, no hype.
- Length 800-1300 words. Use ## subheadings and short paragraphs. Use code blocks or a table only when they genuinely help.
- Link the SOURCE URL in the text at least once using markdown.
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
  const out = await ask(
    SYSTEM,
    `SOURCE URL: ${item.url}\nSOURCE TITLE: ${item.title}\nANGLE: ${item.angle}\n\nSOURCE TEXT:\n${item.sourceText}`,
    6000,
  );
  return parseDraft(out);
}
