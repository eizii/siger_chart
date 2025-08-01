import React, { useState } from "react";

export default function AnimatedLineChart({ selectedBrands, getColor, yAxisType, data }) {
  const width = 1000;
  const height = 600;
  const margin = 100;
  const x0 = margin;
  const y0 = height - margin;
  const innerWidth = width - 2 * margin;
  const innerHeight = height - 2 * margin;

  const [tooltip, setTooltip] = useState(null);

  const years = data.cigaretteSalesData.map((d) => d.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const maxSales = 40000;
  const rankDomain = 20;

  const computeLines = () => {
    return selectedBrands.map((brand, index) => {
      const points = data.cigaretteSalesData
        .map((yearData) => {
          const ranking = yearData.rankings.find((r) => r.brandName === brand);
          if (!ranking) return null;
          const x = x0 + ((yearData.year - minYear) / (maxYear - minYear)) * innerWidth;
          let y;
          if (yAxisType === "rank") {
            y = margin + ((ranking.rank - 1) / (rankDomain - 1)) * innerHeight;
          } else {
            y = y0 - (ranking.salesVolumeMillions / maxSales) * innerHeight;
          }
          return {
            x,
            y,
            year: yearData.year,
            value: yAxisType === "rank" ? ranking.rank : ranking.salesVolumeMillions,
          };
        })
        .filter(Boolean);
      return { brand, points, color: getColor(index) };
    });
  };

  const lines = computeLines();

  return (
    <div style={{ position: "relative" }}>
      <svg width={width} height={height} style={{ background: "#fff" }}>
        <line x1={x0} y1={y0} x2={width - margin} y2={y0} stroke="black" />
        <line x1={x0} y1={y0} x2={x0} y2={margin} stroke="black" />

        {data.cigaretteSalesData.map((d, i) => {
          const x = x0 + ((d.year - minYear) / (maxYear - minYear)) * innerWidth;
          return (
            <g key={`x-${i}`}>
              <line x1={x} y1={y0} x2={x} y2={y0 + 5} stroke="black" />
              <text x={x} y={y0 + 20} fontSize="10" textAnchor="middle">
                {d.year}
              </text>
            </g>
          );
        })}
        {yAxisType === "rank"
          ? Array.from({ length: rankDomain }, (_, i) => {
              const value = i + 1;
              let y = margin + ((value - 1) / (rankDomain - 1)) * innerHeight;
              y = Math.min(y, y0 - 1); 
              return (
                <g key={`y-rank-${i}`}>
                  <line x1={x0 - 5} y1={y} x2={x0} y2={y} stroke="black" />
                  <text x={x0 - 8} y={y + 3} fontSize="10" textAnchor="end">
                    {value}
                  </text>
                </g>
              );
            })
          : Array.from({ length: 10 }, (_, i) => {
              const value = Math.round((maxSales / 9) * i);
              const y = y0 - (value / maxSales) * innerHeight;
              return (
                <g key={`y-sales-${i}`}>
                  <line x1={x0 - 5} y1={y} x2={x0} y2={y} stroke="black" />
                  <text x={x0 - 8} y={y + 3} fontSize="10" textAnchor="end">
                    {value}
                  </text>
                </g>
              );
            })}

        <text x={width / 2} y={height - 20} textAnchor="middle">年</text>
        <text
          x={20}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90 20 ${height / 2})`}
        >
          {yAxisType === "rank" ? "順位" : "売上 (百万本)"}
        </text>

        {lines.map((line, i) => (
          <g key={i}>
            <polyline
              fill="none"
              stroke={line.color}
              strokeWidth="1.5"
              points={line.points.map((p) => `${p.x},${p.y}`).join(" ")}
            />
            {line.points.map((p, j) => (
              <circle
                key={j}
                cx={p.x}
                cy={p.y}
                r={3}
                fill={line.color}
                onMouseEnter={() =>
                  setTooltip({
                    x: p.x,
                    y: p.y,
                    brand: line.brand,
                    year: p.year,
                    value: p.value,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </g>
        ))}
      </svg>

      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 10,
            top: tooltip.y,
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            padding: "5px",
            borderRadius: "4px",
            fontSize: "12px",
            pointerEvents: "none",
          }}
        >
          <div><strong>{tooltip.brand}</strong></div>
          <div>{tooltip.year}年</div>
          <div>{yAxisType === "rank" ? `順位: ${tooltip.value}` : `売上: ${tooltip.value}M`}</div>
        </div>
      )}
    </div>
  );
}
