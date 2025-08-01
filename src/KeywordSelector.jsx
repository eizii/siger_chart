import React, { useState } from "react";

const KEYWORDS = [
  "まろやか",
  "甘い",
  "軽め",
  "ガツン",
  "強め",
  "香ばしい",
  "爽やか",
  "クリーミー",
  "ドライ",
  "コク深い"
];

export default function KeywordSelector({ selected, onChange }) {
  const [open, setOpen] = useState(false);

  const toggleKeyword = (kw) => {
    const newList = selected.includes(kw)
      ? selected.filter((k) => k !== kw)
      : [...selected, kw];
    onChange(newList);
  };

  return (
    <div style={{ position: "relative", width: "250px", marginTop: "8px" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          border: "1px solid gray",
          padding: "6px 10px",
          cursor: "pointer",
          backgroundColor: "#fff",
          borderRadius: "4px"
        }}
      >
        {selected.length > 0 ? selected.join("、") : "キーワードを選択"}
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            border: "1px solid gray",
            background: "white",
            maxHeight: "150px",
            overflowY: "auto",
            zIndex: 100,
            borderRadius: "4px",
            marginTop: "2px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          {KEYWORDS.map((kw) => (
            <label key={kw} style={{ display: "block", padding: "6px 10px" }}>
              <input
                type="checkbox"
                checked={selected.includes(kw)}
                onChange={() => toggleKeyword(kw)}
              />{" "}
              {kw}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
