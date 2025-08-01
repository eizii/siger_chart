import React from "react";

export default function YAxisSelector({ yAxisType, setYAxisType }) {
  return (
    <div style={{ margin: "10px" }}>
      <label>Y軸: </label>
      <select value={yAxisType} onChange={(e) => setYAxisType(e.target.value)}>
        <option value="rank">順位</option>
        <option value="sales">売上</option>
      </select>
    </div>
  );
}
