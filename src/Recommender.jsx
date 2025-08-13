import meta from "./cigarette_meta.json";

const TAR_MAX = 20;
const NIC_MAX = 1.5;
const DENOM = Math.hypot(TAR_MAX, NIC_MAX);

const LAMBDA = 0.4;

let m = 0;
meta.forEach(({ price }) => {
  m = Math.max(m, extractAmountYen(price));
});
console.log(m);

const normTag = (s) =>
  String(s || "")
    .trim()
    .toLowerCase();
function extractAmountYen(str) {
  const match = str.match(/([\d０-９,]+)円/);
  if (!match) return null;

  // 全角数字を半角に
  const half = match[1].replace(/[０-９]/g, (d) =>
    String.fromCharCode(d.charCodeAt(0) - 0xfee0)
  );

  // カンマ除去して数値化
  return parseInt(half.replace(/,/g, ""), 10);
}
function jaccardSim(setA, arrB) {
  if (setA.size === 0 && (!arrB || arrB.length === 0)) return 0;

  const setB = new Set((arrB || []).map(normTag));
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter++;
  const union = setA.size + setB.size - inter;
  return union ? inter / union : 0;
}

export function recommendWithScore(f) {
  const t = Number(f.tarMax);
  const n = Number(f.nicMax);
  const wantM = f.menthol;
  const wantR = f.regular;

  const userKW = (f.keywords || []).map(normTag).filter(Boolean);
  const setUser = new Set(userKW);
  const base =
    !wantM && !wantR
      ? meta
      : meta.filter((d) => (wantM && d.menthol) || (wantR && !d.menthol));

  return base
    .filter(({ price }) => extractAmountYen(price) <= f.price)
    .map((d) => {
      const dx = Number(d.tar) - t;
      const dy = Number(d.nicotine) - n;
      const simCont = 1 - Math.min(1, Math.hypot(dx, dy) / DENOM);
      const itemKW = Array.isArray(d.attributes)
        ? d.attributes
        : Array.isArray(d["属性"])
        ? d["属性"]
        : [];
      const simTag = jaccardSim(setUser, itemKW);
      const lambda = setUser.size ? LAMBDA : 1;
      const score = lambda * simCont + (1 - lambda) * simTag;
      return { ...d, score, simCont, simTag };
    })
    .sort((a, b) => b.score - a.score);
}
