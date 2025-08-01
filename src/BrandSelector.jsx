import React from "react";

export default function BrandSelector({ brands, selectedBrands, toggleBrand }) {
  return (
    <div
      style={{
        width: "200px",
        height: "600px",
        overflowY: "scroll",
        borderRight: "1px solid #ccc",
        flexShrink: 0,
        paddingRight: "8px",
      }}
    >
      {brands.map((brand) => (
        <div key={brand}>
          <input
            type="checkbox"
            checked={selectedBrands.includes(brand)}
            onChange={() => toggleBrand(brand)}
          />
          <label>{brand}</label>
        </div>
      ))}
    </div>
  );
}
