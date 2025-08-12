import React, { useMemo } from "react";
import KeywordSelector from "./KeywordSelector";
import Slider from "@mui/material/Slider";
import meta from "./cigarette_meta.json";

export default function InputForm({ filters, onChange }) {
  const val = (n, fb) => (Number.isFinite(Number(n)) ? Number(n) : fb);
  const set = (patch) => onChange({ ...filters, ...patch });
  const allKeywords = useMemo(() => {
    const count = new Map();
    for (const d of meta) {
      const tags = d.attributes || d.属性 || [];
      for (const t of tags) count.set(t, (count.get(t) || 0) + 1);
    }
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, []);

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ marginBottom: 10, width: 240 }}>
        <label>
          タール(mg): {val(filters.tarMin, 0)} ~ {val(filters.tarMax, 20)}
        </label>
        <Slider
          value={val(filters.tarMax, 20)}
          onChange={(_, v) => set({ tarMax: Number(v), tarMin: 0 })}
          valueLabelDisplay="auto"
          min={0}
          max={20}
          step={0.1}
        />
      </div>

      <div style={{ marginBottom: 20, width: 240 }}>
        <label>
          ニコチン(mg): {val(filters.nicMin, 0)} ~ {val(filters.nicMax, 1.5)}
        </label>
        <Slider
          value={val(filters.nicMax, 1.5)}
          onChange={(_, v) => set({ nicMax: Number(v), nicMin: 0 })}
          valueLabelDisplay="auto"
          min={0}
          max={1.5}
          step={0.01}
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
