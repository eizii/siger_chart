import React from "react";

// ドロップダウンに表示するキーワード
const keywordOptions = [
  "スモーキー",
  "まろやか",
  "甘い",
  "軽め",
  "ガツン",
  "強め",
  "香ばしい",
  "クール",
  "華やか",
  "渋い"
];

export default function InputForm({ filters, onChange }) {
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    onChange({
      ...filters,
      [name]: type === "checkbox" ? checked : parseFloat(value)
    });
  }

  function handleKeywordChange(e) {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    onChange({ ...filters, keywords: selected });
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <label>
          タール: {filters.tarMin} - {filters.tarMax}
          <br />
          最小
          <input
            type="range"
            name="tarMin"
            min="0"
            max="20"
            step="1"
            value={filters.tarMin}
            onChange={handleChange}
          />
          最大
          <input
            type="range"
            name="tarMax"
            min="0"
            max="20"
            step="1"
            value={filters.tarMax}
            onChange={handleChange}
          />
        </label>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>
          ニコチン: {filters.nicMin} - {filters.nicMax}
          <br />
          最小
          <input
            type="range"
            name="nicMin"
            min="0"
            max="2"
            step="0.1"
            value={filters.nicMin}
            onChange={handleChange}
          />
          最大
          <input
            type="range"
            name="nicMax"
            min="0"
            max="2"
            step="0.1"
            value={filters.nicMax}
            onChange={handleChange}
          />
        </label>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>
          <input
            type="checkbox"
            name="mentholOnly"
            checked={filters.mentholOnly}
            onChange={handleChange}
          />
          メンソールのみ
        </label>
      </div>

      <div>
        <label>
          属性キーワード（複数選択）:
          <br />
          <select
            multiple
            size="5"
            value={filters.keywords}
            onChange={handleKeywordChange}
            style={{ width: "200px", height: "100px" }}
          >
            {keywordOptions.map((kw) => (
              <option key={kw} value={kw}>
                {kw}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
