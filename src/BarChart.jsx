import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function BarChartD3({ recommended }) {
  const svgRef = useRef();

  useEffect(() => {
    const width = 900;
    const barHeight = 24;
    const margin = { top: 20, right: 80, bottom: 20, left: 400 };
    const height = recommended.length * barHeight + margin.top + margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); 
    svg.attr("width", width).attr("height", height);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(recommended, d => d.score) || 1])
      .range([0, width - margin.left - margin.right]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll("rect")
      .data(recommended)
      .join("rect")
      .attr("y", (_, i) => i * barHeight)
      .attr("width", d => xScale(d.score))
      .attr("height", barHeight - 4)
      .attr("fill", "orange");

    g.selectAll("text.label")
      .data(recommended)
      .join("text")
      .attr("x", -10)
      .attr("y", (_, i) => i * barHeight + (barHeight - 4) / 2)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .attr("font-size", 11)
      .text(d => `${d.brand} ${d.name}`);

    g.selectAll("text.score")
      .data(recommended)
      .join("text")
      .attr("x", d => xScale(d.score) + 5)
      .attr("y", (_, i) => i * barHeight + (barHeight - 4) / 2)
      .attr("alignment-baseline", "middle")
      .attr("font-size", 11)
      .text(d => d.score.toFixed(2));
  }, [recommended]);

  return <svg ref={svgRef} />;
}
