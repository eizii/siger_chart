import React from "react";
import KeywordSelector from "./KeywordSelector";

const allKeywords = [
  "まろやか", "甘い", "軽め", "ガツン", "強め", "香り重視", "ドライ", "後味さっぱり"
];

export default function InputForm({ filters, onChange }) {
  const handleChange = (field, value) => {
    // 範囲の整合性を保つ
    if (field === "tarMin" && value > filters.tarMax) value = filters.tarMax;
    if (field === "tarMax" && value < filters.tarMin) value = filters.tarMin;
    if (field === "nicMin" && value > filters.nicMax) value = filters.nicMax;
    if (field === "nicMax" && value < filters.nicMin) value = filters.nicMin;

    onChange({ ...filters, [field]: value });
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <label>タール (mg): {filters.tarMin}〜{filters.tarMax}</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={filters.tarMin}
            onChange={(e) => handleChange("tarMin", parseFloat(e.target.value))}
          />
          <input
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={filters.tarMax}
            onChange={(e) => handleChange("tarMax", parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>ニコチン (mg): {filters.nicMin}〜{filters.nicMax}</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.01"
            value={filters.nicMin}
            onChange={(e) => handleChange("nicMin", parseFloat(e.target.value))}
          />
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.01"
            value={filters.nicMax}
            onChange={(e) => handleChange("nicMax", parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>
          <input
            type="checkbox"
            checked={filters.mentholOnly}
            onChange={(e) => handleChange("mentholOnly", e.target.checked)}
          />
          メンソールのみ
        </label>
      </div>

      <div>
        <label>属性キーワード（複数選択）:</label>
        <KeywordSelector
          keywords={allKeywords}
          selected={filters.keywords}
          onChange={(newKeywords) => handleChange("keywords", newKeywords)}
        />
      </div>
    </div>
  );
}
