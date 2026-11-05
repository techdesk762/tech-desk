import { ask, parseJson } from './lib.mjs';
import { config } from './config.mjs';

const SYSTEM = `You are a fair but careful fact-checker. Compare the DRAFT to the SOURCE TEXT.

Flag as unsupported ONLY statements of fact about the source or the product/event it describes (versions, numbers, dates, named features, names, quotes, URLs) that the source does not support or that contradict it.

Do NOT flag:
- the author's opinions, recommendations, advice or comparisons framed as the author's view
- plain-language explanations of what the source says
- accurate, well-known general background that is clearly framed as background
- links to the SOURCE URL given below

Flag any other URL that does not appear in the source text. Flag verbatim_copying true only if a run of 12+ words is copied from the source.
Score 1-10: accuracy (factual claims supported), originality (own structure and insight, not a rewrite), usefulness (a developer learns something actionable).
Reply with JSON only:
{"unsupported_claims":["..."],"verbatim_copying":false,"accuracy":0,"originality":0,"usefulness":0,"notes":"one sentence"}`;

export async function verify(item, draft) {
  const prompt = `SOURCE URL: ${item.url}\n\nSOURCE TEXT:\n${item.sourceText}\n\nDRAFT TITLE: ${draft.title}\n\nDRAFT:\n${draft.body}`;
  let r;
  for (let i = 0; i < 2; i++) {
    try {
      r = parseJson(await ask(SYSTEM, prompt, 2500));
      break;
    } catch (e) {
      if (i === 1) throw e;
    }
  }
  const g = config.gate;
  const words = draft.body.split(/\s+/).length;
  const reasons = [];
  if ((r.unsupported_claims?.length ?? 0) > 1) reasons.push(`unsupported claims: ${r.unsupported_claims.join('; ')}`);
  if (r.verbatim_copying) reasons.push('verbatim copying');
  if (r.accuracy < g.accuracy) reasons.push(`accuracy ${r.accuracy}`);
  if (r.originality < g.originality) reasons.push(`originality ${r.originality}`);
  if (r.usefulness < g.usefulness) reasons.push(`usefulness ${r.usefulness}`);
  if (words < config.minWords) reasons.push(`too short (${words} words)`);
  if (!draft.body.includes('http')) reasons.push('no source link in body');
  return { approved: reasons.length === 0, reasons, scores: r, words };
}
