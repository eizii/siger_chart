import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function BarChartD3({ recommended }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const titleOf = (d) => d.name;

    const SLOTS = 10;
    const BAR_W = 44;
    const GAP = 20;
    const BAND = BAR_W + GAP;
    const NEED_W = SLOTS * BAR_W + (SLOTS - 1) * GAP;

    const container = svgRef.current?.parentElement;
    const cw = container ? container.clientWidth : 640;

    const m = { top: 20, right: 24, bottom: 110, left: 56 };
    const innerW = Math.max(NEED_W, cw - m.left - m.right);
    const innerH = 340;
    const width = innerW + m.left + m.right;
    const height = innerH + m.top + m.bottom;

    const xLeft = (i) => i * BAND;
    const xCenter = (i) => xLeft(i) + BAR_W / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const defs = svg.append("defs");
    const grad = (id, from, to) =>
      defs
        .append("linearGradient")
        .attr("id", id)
        .attr("x1", "0")
        .attr("x2", "0")
        .attr("y1", "1")
        .attr("y2", "0")
        .call((g) =>
          g.append("stop").attr("offset", "0%").attr("stop-color", from)
        )
        .call((g) =>
          g.append("stop").attr("offset", "100%").attr("stop-color", to)
        );
    grad("grad-regular", "#ffb347", "#ff9a00");
    grad("grad-menthol", "#39b385", "#2d9f74");
    defs
      .append("filter")
      .attr("id", "shadow")
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 2)
      .attr("stdDeviation", 2)
      .attr("flood-opacity", 0.25);

    const g = svg
      .append("g")
      .attr("transform", `translate(${m.left},${m.top})`);

    const data = (recommended || [])
      .slice(0, SLOTS)
      .map((d, i) => ({ ...d, slot: i }));

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.score) || 1])
      .nice()
      .range([innerH, 0]);

    g.append("g")
      .attr("class", "y-grid")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-NEED_W)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#000")
      .attr("opacity", 0.08);
    g.select(".y-grid .domain").remove();

    let tip = d3.select("body").select(".yc-tooltip");
    if (tip.empty()) {
      tip = d3
        .select("body")
        .append("div")
        .attr("class", "yc-tooltip")
        .style("position", "fixed")
        .style("pointer-events", "none")
        .style("z-index", "9999")
        .style("max-width", "360px")
        .style("background", "rgba(0,0,0,0.85)")
        .style("color", "#fff")
        .style("padding", "10px 12px")
        .style("border-radius", "10px")
        .style("font-size", "12px")
        .style("line-height", "1.5")
        .style("box-shadow", "0 4px 14px rgba(0,0,0,.25)")
        .style("opacity", 0);

      const wrap = tip.append("div");
      wrap
        .append("div")
        .attr("class", "tip-title")
        .style("font-weight", 700)
        .style("margin-bottom", "6px");
      wrap
        .append("img")
        .attr("class", "tip-img")
        .style("display", "none")
        .style("max-width", "160px")
        .style("height", "auto")
        .style("border-radius", "8px")
        .style("margin", "0 0 8px");
      wrap.append("div").attr("class", "tip-desc");
      wrap
        .append("div")
        .attr("class", "tip-sub")
        .style("opacity", 0.9)
        .style("margin-top", "8px");
      wrap
        .append("a")
        .attr("class", "tip-link")
        .style("display", "none")
        .attr("target", "_blank")
        .attr("rel", "noopener")
        .style("color", "#9cf")
        .style("textDecoration", "underline")
        .style("margin-top", "8px")
        .text("商品ページを開く");
    }

    const placeTip = (e) => {
      const pad = 14;
      const margin = 8;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const node = tip.node();
      const w = node.offsetWidth || 0;
      const h = node.offsetHeight || 0;

      let x = e.clientX + pad;
      let y = e.clientY + pad;

      if (x + w > vw - margin) {
        x = Math.max(margin, e.clientX - w - pad);
      }

      const maxY = vh - h - margin;
      y = Math.min(y, maxY);

      const minBelow = e.clientY + 6;
      if (y < minBelow) y = minBelow;

      tip.style("left", `${x}px`).style("top", `${y}px`);
    };

    const showTip = (event, d) => {
      tip.style("opacity", 1);
      tip.select(".tip-title").text(d.name);

      const img = tip.select(".tip-img");
      if (d.image_url)
        img
          .attr("src", d.image_url)
          .attr("alt", d.name)
          .style("display", "block");
      else img.attr("src", "").style("display", "none");

      tip.select(".tip-desc").text(d.description || "説明データなし");

      const parts = [];
      if (Number.isFinite(d.tar)) parts.push(`タール: ${d.tar}mg`);
      if (Number.isFinite(d.nicotine)) parts.push(`ニコチン: ${d.nicotine}mg`);
      tip.select(".tip-sub").text(parts.join(" / "));

      const link = tip.select(".tip-link");
      if (d.product_url)
        link.attr("href", d.product_url).style("display", "inline");
      else link.style("display", "none");

      placeTip(event);
    };

    const moveTip = (event) => placeTip(event);
    const hideTip = () => tip.style("opacity", 0);

    g.selectAll("rect.bar")
      .data(data, (d) => d.slot)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => xLeft(d.slot))
      .attr("y", (d) => y(d.score))
      .attr("width", BAR_W)
      .attr("height", (d) => innerH - y(d.score))
      .attr("rx", 8)
      .attr("fill", (d) =>
        d.menthol ? "url(#grad-menthol)" : "url(#grad-regular)"
      )
      .attr("filter", "url(#shadow)")
      .style("cursor", "pointer")
      .on("mouseenter", showTip)
      .on("mousemove", moveTip)
      .on("mouseleave", hideTip)
      .on(
        "click",
        (_, d) =>
          d.product_url && window.open(d.product_url, "_blank", "noopener")
      );

    g.selectAll("text.score")
      .data(data, (d) => d.slot)
      .join("text")
      .attr("class", "score")
      .attr("x", (d) => xCenter(d.slot))
      .attr("y", (d) => y(d.score) - 8)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("font-weight", 600)
      .attr("fill", "#333")
      .text((d) => (+d.score || 0).toFixed(2));

    g.selectAll("text.xlabel")
      .data(data, (d) => d.slot)
      .join("text")
      .attr("class", "xlabel")
      .attr(
        "transform",
        (d) => `translate(${xCenter(d.slot)}, ${innerH + 12}) rotate(-35)`
      )
      .attr("text-anchor", "end")
      .attr("font-size", 12)
      .attr("fill", "#444")
      .style("cursor", "pointer")
      .text((d) => titleOf(d))
      .on("mouseenter", showTip)
      .on("mousemove", moveTip)
      .on("mouseleave", hideTip)
      .on(
        "click",
        (_, d) =>
          d.product_url && window.open(d.product_url, "_blank", "noopener")
      );
  }, [recommended]);

  return <svg ref={svgRef} />;
}
