import cigaretteMeta from "./cigarette_meta.json";

export function recommendWithScore(filters) {
  return cigaretteMeta
    .filter(c => c.current)
    .filter(c =>
      c.tar >= filters.tarMin &&
      c.tar <= filters.tarMax &&
      c.nicotine >= filters.nicMin &&
      c.nicotine <= filters.nicMax &&
      (!filters.mentholOnly || c.menthol) &&
      (filters.keywords.length === 0 || filters.keywords.every(kw => (c.属性 || []).includes(kw)))
    )
    .map(c => ({
      ...c,
      score: computeScore(c, filters)
    }))
    .sort((a, b) => b.score - a.score);
}

function computeScore(cig, filters) {
  let score = 1.0;

  const tarRange = filters.tarMax - filters.tarMin;
  const nicRange = filters.nicMax - filters.nicMin;

  const tarCenter = filters.tarMin + tarRange / 2;
  const nicCenter = filters.nicMin + nicRange / 2;

  const tarDiff = Math.abs(cig.tar - filters.tarMax);
  const nicDiff = Math.abs(cig.nicotine - filters.nicMax);

  score *= 1 - (tarDiff / tarRange);
  score *= 1 - (nicDiff / nicRange);

  if (filters.mentholOnly && cig.menthol) {
    score *= 1.1;
  }

  const matchCount = filters.keywords.filter(kw => (cig.属性 || []).includes(kw)).length;
  score *= 1 + 0.1 * matchCount;

  return score;
}
