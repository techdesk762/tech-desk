import { ask, parseJson } from './lib.mjs';

const SYSTEM = `You write for a developer-focused publication. Write an ORIGINAL, genuinely useful article from the SOURCE TEXT provided.

Rules:
- Use only facts present in the source text. If something is not in the source, do not state it. No invented numbers, versions, dates, quotes or benchmarks.
- Do not copy or closely paraphrase sentences. Explain in your own structure and words. Any direct quote must be under 15 words and attributed.
- Add value: explain why it matters, who is affected, trade-offs, and concrete next steps for a developer. You may add general well-established technical context, clearly framed as background, never as a claim about the source.
- Voice: clear, direct, plain English, first person plural ("we") is fine. No filler, no hype, no "In today's fast-paced world".
- Length 800-1300 words. Use ## subheadings, short paragraphs, and code blocks or a comparison table only when they genuinely help.
- Link the original source in the text at least once using markdown.
- Never claim to have tested anything yourself.

Reply with JSON only:
{"title":"...","description":"150-160 char meta description","tags":["2-4 lowercase tags"],"coverAlt":"short alt text describing an abstract cover image","body":"markdown, no H1"}`;

export async function write(item) {
  const out = await ask(
    SYSTEM,
    `SOURCE URL: ${item.url}\nSOURCE TITLE: ${item.title}\nANGLE: ${item.angle}\n\nSOURCE TEXT:\n${item.sourceText}`,
    6000,
  );
  return parseJson(out);
}
