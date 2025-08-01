import React from "react";

export default function Legend({ brands, getColor }) {
  return (
    <div style={{
      width: "200px",
      height: "600px",
      overflowY: "scroll",
      borderLeft: "1px solid #ccc",
      paddingLeft: "10px"
    }}>
      {brands.map((brand, i) => (
        <div key={brand} style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
          <div style={{
            width: "12px",
            height: "12px",
            backgroundColor: getColor(i),
            marginRight: "8px"
          }}></div>
          <span style={{ fontSize: "11px", wordBreak: "break-word" }}>{brand}</span>
        </div>
      ))}
    </div>
  );
}
