import { ask, parseJson } from './lib.mjs';
import { config } from './config.mjs';

const SYSTEM = `You are a strict fact-checker and quality editor. Compare the DRAFT to the SOURCE TEXT.

- List every specific claim in the draft about the source (versions, numbers, dates, features, names, quotes) that the source text does NOT support. General background knowledge that is accurate and clearly framed as background is allowed.
- Flag verbatim_copying true if any run of 12+ words is copied from the source.
- Score 1-10: accuracy (claims supported), originality (own structure and insight, not a rewrite), usefulness (a developer learns something actionable).
Reply with JSON only:
{"unsupported_claims":["..."],"verbatim_copying":false,"accuracy":0,"originality":0,"usefulness":0,"notes":"one sentence"}`;

export async function verify(item, draft) {
  const out = await ask(
    SYSTEM,
    `SOURCE TEXT:\n${item.sourceText}\n\nDRAFT TITLE: ${draft.title}\n\nDRAFT:\n${draft.body}`,
    1500,
  );
  const r = parseJson(out);
  const g = config.gate;
  const words = draft.body.split(/\s+/).length;
  const reasons = [];
  if (r.unsupported_claims?.length) reasons.push(`unsupported claims: ${r.unsupported_claims.join('; ')}`);
  if (r.verbatim_copying) reasons.push('verbatim copying');
  if (r.accuracy < g.accuracy) reasons.push(`accuracy ${r.accuracy}`);
  if (r.originality < g.originality) reasons.push(`originality ${r.originality}`);
  if (r.usefulness < g.usefulness) reasons.push(`usefulness ${r.usefulness}`);
  if (words < config.minWords) reasons.push(`too short (${words} words)`);
  if (!draft.body.includes('http')) reasons.push('no source link in body');
  return { approved: reasons.length === 0, reasons, scores: r, words };
}
