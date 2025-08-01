import React from "react";

export default function BarChart({ recommended }) {
  const width = 800;
  const barHeight = 25;
  const barSpacing = 8;
  const labelWidth = 400; 

  const totalHeight = (barHeight + barSpacing) * recommended.length;

  return (
    <svg
      key={recommended.map(d => d.name).join("-")}
      width={width}
      height={totalHeight}
    >
      {recommended.map((d, i) => {
        const barWidth = d.score * (width - labelWidth - 100);
        return (
          <g
            key={d.brand + d.name}
            transform={`translate(0, ${i * (barHeight + barSpacing)})`}
          >
            <text
              x={labelWidth - 10}
              y={barHeight / 2}
              dy="0.35em"
              fontSize={11} 
              textAnchor="end"
            >
              {d.brand} {d.name}
            </text>

            <rect
              x={labelWidth}
              y={0}
              width={barWidth}
              height={barHeight}
              fill="orange"
              rx={4}
            />

            <text
              x={labelWidth + barWidth + 5}
              y={barHeight / 2}
              dy="0.35em"
              fontSize={11}
            >
              {d.score.toFixed(2)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
