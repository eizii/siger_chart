import React, { useMemo } from "react";
import KeywordSelector from "./KeywordSelector";
import Slider from "@mui/material/Slider";
import meta from "./cigarette_meta.json";

export default function InputForm({ filters, onChange }) {
  // InputForm.jsx の先頭付近に追加（マスタ）
  const MASTER_TAGS = [
    "甘い",
    "スモーキー",
    "コク深い",
    "まろやか",
    "香りが良い",
    "強い吸いごたえ",
    "キック強",
    "スムース",
    "辛口",
    "軽い",
    "メンソール弱",
    "メンソール中",
    "メンソール強",
    "ミント",
    "シトラス",
    "アイス",
    "カプセル有",
    "カプセル無",
    "カプセル:ミント",
    "カプセル:シトラス",
    "カプセル:その他",
    "アメリカンブレンド",
    "バージニアブレンド",
    "オリエンタル",
    "無添加",
    "オーガニック",
    "KS",
    "100s",
    "スリム",
    "スーパー・スリム",
    "14本入",
    "20本入",
    "ボックス",
    "ソフト",
    "チャコールフィルター",
    "リセスドフィルター",
    "低煙紙",
    "シリーズ:メビウス",
    "シリーズ:セブンスター",
    "シリーズ:キャメル",
    "シリーズ:ウィンストン",
    "シリーズ:アメリカンスピリット",
    "シリーズ:マールボロ",
    "シリーズ:ケント",
    "シリーズ:ラーク",
    "シリーズ:ラッキーストライク",
    "シリーズ:ピース",
    "シリーズ:ハイライト",
    "シリーズ:ホープ",
    "シリーズ:キャスター",
    "シリーズ:キャビン",
    "低価格帯",
    "中価格帯",
    "高価格帯",
    "初心者向け",
    "上級者向け",
    "ロングサイズ",
  ];

  // （前に送った並び順ヘルパーのままでOKですが、対象者グループを追加）
  const GROUPS = [
    "価格帯",
    "本数",
    "パック形状",
    "サイズ",
    "メンソール",
    "カプセル",
    "ブレンド",
    "フィルター",
    "シリーズ",
    "対象者",
    "その他",
  ];
  const WITHIN = {
    価格帯: ["低価格帯", "中価格帯", "高価格帯"],
    本数: ["20本入", "14本入"],
    パック形状: ["ボックス", "ソフト"],
    サイズ: ["KS", "100s", "スリム", "スーパー・スリム", "ロングサイズ"],
    メンソール: [
      "メンソール弱",
      "メンソール中",
      "メンソール強",
      "ミント",
      "シトラス",
      "アイス",
    ],
    カプセル: [
      "カプセル有",
      "カプセル無",
      "カプセル:ミント",
      "カプセル:シトラス",
      "カプセル:その他",
    ],
    ブレンド: [
      "オーガニック",
      "無添加",
      "アメリカンブレンド",
      "バージニアブレンド",
      "オリエンタル",
    ],
    フィルター: ["チャコールフィルター", "リセスドフィルター", "低煙紙"],
    対象者: ["初心者向け", "上級者向け"],
  };
  const SERIES_ORDER = [
    "シリーズ:メビウス",
    "シリーズ:セブンスター",
    "シリーズ:キャメル",
    "シリーズ:ウィンストン",
    "シリーズ:アメリカンスピリット",
    "シリーズ:マールボロ",
    "シリーズ:ケント",
    "シリーズ:ラーク",
    "シリーズ:ラッキーストライク",
    "シリーズ:ピース",
    "シリーズ:ハイライト",
    "シリーズ:ホープ",
    "シリーズ:キャスター",
    "シリーズ:キャビン",
  ];
  const groupName = (tag) => {
    if (tag.startsWith("シリーズ:")) return "シリーズ";
    if (/^カプセル/.test(tag) || tag.startsWith("カプセル:")) return "カプセル";
    if (/(メンソール|アイス|ミント|シトラス)/.test(tag)) return "メンソール";
    if (/(^KS$|^100s$|^スリム$|^スーパー・スリム$|^ロングサイズ$)/.test(tag))
      return "サイズ";
    if (/本入$/.test(tag)) return "本数";
    if (tag === "ボックス" || tag === "ソフト") return "パック形状";
    if (/価格帯$/.test(tag)) return "価格帯";
    if (
      [
        "オーガニック",
        "無添加",
        "アメリカンブレンド",
        "バージニアブレンド",
        "オリエンタル",
      ].includes(tag)
    )
      return "ブレンド";
    if (/(フィルター|紙$)/.test(tag)) return "フィルター";
    if (["初心者向け", "上級者向け"].includes(tag)) return "対象者";
    return "その他";
  };
  const groupOrder = (g) => {
    const i = GROUPS.indexOf(g);
    return i === -1 ? GROUPS.length : i;
  };
  const withinOrder = (g, tag) => {
    if (g === "シリーズ") {
      const i = SERIES_ORDER.indexOf(tag);
      return i === -1 ? Number.POSITIVE_INFINITY : i;
    }
    const arr = WITHIN[g];
    if (!arr) return Number.POSITIVE_INFINITY;
    const i = arr.indexOf(tag);
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };

  const val = (n, fb) => (Number.isFinite(Number(n)) ? Number(n) : fb);
  const set = (patch) => onChange({ ...filters, ...patch });
  // 既存の allKeywords の useMemo を差し替え（マスタ ∪ JSON の和集合 → 並び替え）
  const allKeywords = useMemo(() => {
    // JSON出現タグ
    const present = new Set();
    for (const d of meta) {
      for (const t of d.attributes || d.属性 || []) present.add(t);
    }
    // 和集合
    const list = Array.from(new Set([...MASTER_TAGS, ...present]));

    // カテゴリ → カテゴリ内 → 五十音で安定ソート
    return list.sort((a, b) => {
      const ga = groupName(a),
        gb = groupName(b);
      if (ga !== gb) return groupOrder(ga) - groupOrder(gb);
      const ia = withinOrder(ga, a),
        ib = withinOrder(gb, b);
      if (ia !== ib) return ia - ib;
      return a.localeCompare(b, "ja");
    });
  }, []);

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ marginBottom: 10, width: 240 }}>
        <label>タール(mg):{val(filters.tarMax, 20)}</label>
        <Slider
          value={val(filters.tarMax, 20)}
          onChange={(_, v) => set({ tarMax: Number(v), tarMin: 0 })}
          valueLabelDisplay="auto"
          min={0}
          track={false}
          max={20}
          step={1}
          marks
        />
      </div>

      <div style={{ marginBottom: 20, width: 240 }}>
        <label>ニコチン(mg): {val(filters.nicMax, 1.5)}</label>
        <Slider
          value={val(filters.nicMax, 1.5)}
          onChange={(_, v) => set({ nicMax: Number(v), nicMin: 0 })}
          valueLabelDisplay="auto"
          min={0}
          marks
          max={1.5}
          step={0.1}
          track={false}
        />
      </div>
      <div style={{ marginBottom: 10, width: 240 }}>
        <label>値段:0~{val(filters.price, 10000)}円</label>
        <Slider
          value={val(filters.price, 10000)}
          onChange={(_, v) => set({ price: Number(v) })}
          valueLabelDisplay="auto"
          min={0}
          max={1500}
          step={10}
        />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label>
          <input
            type="checkbox"
            checked={!!filters.menthol}
            onChange={(e) => set({ menthol: e.target.checked })}
          />
          メンソール
        </label>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>
          <input
            type="checkbox"
            checked={!!filters.regular}
            onChange={(e) => set({ regular: e.target.checked })}
          />
          レギュラー
        </label>
      </div>

      <div>
        <label>属性キーワード(複数選択):</label>
        <KeywordSelector
          keywords={allKeywords}
          selected={filters.keywords || []}
          onChange={(ks) => set({ keywords: ks })}
        />
      </div>
    </div>
  );
}
