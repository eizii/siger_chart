// Recommender.js
import meta from "./cigarette_meta.json";

const TAR_MAX = 20;
const NIC_MAX = 1.5;
const DENOM = Math.hypot(TAR_MAX, NIC_MAX);

// 連続値 vs タグの配合
const LAMBDA = 0.4; // 連続値60% + タグ40%

// 軽い正規化（空白/記号を削って小文字化）
const normTag = (s) =>
  String(s || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[（）()・･]/g, "")
    .toLowerCase();

// ジャカード「類似度」= |A∩B| / |A∪B|
function jaccardSim(setA, arrB) {
  // 両方空は 0（中立）：タグが何も選ばれていない/付いていないだけで加点しない
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
  const wantM = !!f.menthol;
  const wantR = !!f.regular;

  // ユーザー選択キーワード集合（正規化）
  const userKW = (f.keywords || []).map(normTag).filter(Boolean);
  const setUser = new Set(userKW);

  // メンソ/レギュラー絞り込み（両方OFFならフィルタなし）
  const base =
    !wantM && !wantR
      ? meta
      : meta.filter((d) => (wantM && d.menthol) || (wantR && !d.menthol));

  return base
    .map((d) => {
      // 連続値の類似度（近いほど1）
      const dx = Number(d.tar) - t;
      const dy = Number(d.nicotine) - n;
      const simCont = 1 - Math.min(1, Math.hypot(dx, dy) / DENOM);

      // タグ類似度（ジャカード）
      const itemKW = Array.isArray(d.attributes)
        ? d.attributes
        : Array.isArray(d["属性"])
        ? d["属性"]
        : [];
      const simTag = jaccardSim(setUser, itemKW);

      // ユーザーがタグ未選択ならタグ重み0（挙動が直感的）
      const lambda = setUser.size ? LAMBDA : 1;

      const score = lambda * simCont + (1 - lambda) * simTag;
      return { ...d, score, simCont, simTag };
    })
    .sort((a, b) => b.score - a.score);
}
