import React, { useState } from "react";

export default function KeywordSelector({
  keywords = [],
  selected = [],
  onChange,
}) {
  const [open, setOpen] = useState(false);

  const toggle = (kw) => {
    const next = selected.includes(kw)
      ? selected.filter((k) => k !== kw)
      : [...selected, kw];
    onChange(next);
  };

  return (
    <div style={{ position: "relative", width: 250, marginTop: 8 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          border: "1px solid gray",
          padding: "6px 10px",
          cursor: "pointer",
          background: "#fff",
          borderRadius: 4,
        }}
      >
        {selected.length ? selected.join("、") : "キーワードを選択"}
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            border: "1px solid gray",
            background: "#fff",
            maxHeight: 150,
            overflowY: "auto",
            zIndex: 100,
            borderRadius: 4,
            marginTop: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,.1)",
          }}
        >
          {keywords.map((kw) => (
            <label key={kw} style={{ display: "block", padding: "6px 10px" }}>
              <input
                type="checkbox"
                checked={selected.includes(kw)}
                onChange={() => toggle(kw)}
              />{" "}
              {kw}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
