import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";

const LABEL_FONT_PX = 12;
const LABEL_MAX_LINES = 2;
const LABEL_LINE_EM = 1.15;
const ROT_DEG = 35; // ラベルを右下へ -35°
const ROT_RAD = (ROT_DEG * Math.PI) / 180;
const LABEL_Y_OFFSET = 22; // ★ 追加: ラベルを下げる量(px)

export default function BarChartD3({
  recommended = [],
  slots = 10,
  barW = 44,
  barGap = 20,
}) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const [wrapW, setWrapW] = useState(0);

  // defs衝突防止の一意ID
  const idsRef = useRef(null);
  if (!idsRef.current) {
    const base = "bc" + Math.random().toString(36).slice(2, 8);
    idsRef.current = { gr: `${base}-gr`, gm: `${base}-gm`, sh: `${base}-sh` };
  }
  const { gr, gm, sh } = idsRef.current;

  // 親幅はリサイズ時のみ更新
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((es) =>
      setWrapW(Math.round(es[0].contentRect.width))
    );
    ro.observe(el);
    setWrapW(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);

  // 上位N件 + slot付与
  const data = useMemo(
    () =>
      (recommended || [])
        .slice(0, Math.max(1, Math.min(slots || 10, 50)))
        .map((d, i) => ({ ...d, slot: i })),
    [recommended, slots]
  );

  useEffect(() => {
    if (!wrapW) return;

    // ---- レイアウト ----
    const SLOTS = Math.max(1, Math.min(slots || 10, 50));

    // 斜めラベル用に底マージンを多めに（★ LABEL_Y_OFFSET を反映）
    const extraLabelH =
      20 +
      (LABEL_MAX_LINES - 1) * LABEL_FONT_PX * LABEL_LINE_EM +
      Math.round(barW * Math.sin(ROT_RAD));
    const m = {
      top: 20,
      right: 24,
      bottom: 120 + extraLabelH + LABEL_Y_OFFSET,
      left: 56,
    };

    const innerW = Math.max(360, wrapW - m.left - m.right);
    const innerH = 340;
    const width = innerW + m.left + m.right;
    const height = innerH + m.top + m.bottom;

    // 親幅フィット（オーバー時は自動縮小）
    const reqW = SLOTS * barW + (SLOTS - 1) * barGap;
    const scale = reqW > innerW ? innerW / reqW : 1;
    const BW = Math.max(12, Math.floor(barW * scale));
    const GP = Math.max(4, Math.floor(barGap * scale));
    const BAND = BW + GP;

    const xLeft = (i) => i * BAND;
    const xCenter = (i) => xLeft(i) + BW / 2;

    // SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // defs（初回のみ）
    let defs = svg.select("defs");
    if (defs.empty()) defs = svg.append("defs");
    if (defs.select(`#${gr}`).empty()) {
      const grad = (id, from, to) => {
        const g = defs
          .append("linearGradient")
          .attr("id", id)
          .attr("x1", "0")
          .attr("x2", "0")
          .attr("y1", "1")
          .attr("y2", "0");
        g.append("stop").attr("offset", "0%").attr("stop-color", from);
        g.append("stop").attr("offset", "100%").attr("stop-color", to);
      };
      grad(gr, "#ffb347", "#ff9a00"); // regular
      grad(gm, "#39b385", "#2d9f74"); // menthol
      defs
        .append("filter")
        .attr("id", sh)
        .append("feDropShadow")
        .attr("dx", 0)
        .attr("dy", 2)
        .attr("stdDeviation", 2)
        .attr("flood-opacity", 0.25);
    }

    // ルートg
    let g = svg.select("g.root");
    if (g.empty()) g = svg.append("g").attr("class", "root");
    g.attr("transform", `translate(${m.left},${m.top})`);

    // Yスケール & グリッド
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.score) || 1])
      .nice()
      .range([innerH, 0]);

    let gy = g.select("g.y-grid");
    if (gy.empty()) gy = g.append("g").attr("class", "y-grid");
    gy.call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickSize(-innerW)
        .tickFormat(() => "")
    );
    gy.select(".domain").remove();
    gy.selectAll("line").attr("stroke", "#000").attr("opacity", 0.08);

    // ---- ツールチップ（常にカーソルの下側）----
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
        .text("クリックして商品ページを開く");
    }

    const placeTip = (e) => {
      const pad = 14,
        margin = 8;
      const vw = window.innerWidth,
        vh = window.innerHeight;
      const node = tip.node();
      const w = node.offsetWidth || 0;
      const h = node.offsetHeight || 0;
      let x = e.clientX + pad; // 右
      let y = e.clientY + pad; // 下
      if (x + w > vw - margin) x = Math.max(margin, e.clientX - w - pad);
      y = Math.min(y, vh - h - margin);
      if (y < e.clientY + 6) y = e.clientY + 6;
      tip.style("left", `${x}px`).style("top", `${y}px`);
    };

    const showTip = (event, d) => {
      tip.style("opacity", 1);
      tip.select(".tip-title").text(d.name || "");
      const img = tip.select(".tip-img");
      if (d.image_url)
        img
          .attr("src", d.image_url)
          .attr("alt", d.name || "")
          .style("display", "block");
      else img.attr("src", "").style("display", "none");
      tip.select(".tip-desc").text(d.description || "説明データなし");
      const parts = [];
      if (d.price) parts.push(`価格: ${String(d.price)}`);
      if (Number.isFinite(d.tar)) parts.push(`タール: ${d.tar}mg`);
      if (Number.isFinite(d.nicotine)) parts.push(`ニコチン: ${d.nicotine}mg`);
      tip.select(".tip-sub").text(parts.join(" / "));
      const link = tip.select(".tip-link");
      if (d.product_url)
        link.attr("href", d.product_url).style("display", "inline");
      else link.style("display", "none");
      placeTip(event);
    };

    let ticking = false;
    const moveTip = (e) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        placeTip(e);
        ticking = false;
      });
    };
    const hideTip = () => tip.style("opacity", 0);

    // ---- 棒 ----
    g.selectAll("rect.bar")
      .data(data, (d) => d.slot)
      .join(
        (enter) => enter.append("rect").attr("class", "bar").attr("rx", 8),
        (update) => update,
        (exit) => exit.remove()
      )
      .attr("x", (d) => xLeft(d.slot))
      .attr("y", (d) => y(d.score))
      .attr("width", BW)
      .attr("height", (d) => innerH - y(d.score))
      .attr("fill", (d) => (d.menthol ? `url(#${gm})` : `url(#${gr})`))
      .attr("filter", `url(#${sh})`)
      .style("cursor", "pointer")
      .on("mouseenter.tip", showTip)
      .on("mousemove.tip", moveTip)
      .on("mouseleave.tip", hideTip)
      .on(
        "click",
        (_, d) =>
          d.product_url && window.open(d.product_url, "_blank", "noopener")
      );

    // スコア
    g.selectAll("text.score")
      .data(data, (d) => d.slot)
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("class", "score")
            .attr("text-anchor", "middle")
            .attr("font-size", 12)
            .attr("font-weight", 600)
            .attr("fill", "#333"),
        (update) => update,
        (exit) => exit.remove()
      )
      .attr("x", (d) => xCenter(d.slot))
      .attr("y", (d) => y(d.score) - 8)
      .text((d) => (+d.score || 0).toFixed(2));

    // ---- ラベル（斜め -35°・折り返し＋省略・右寄せ）----
    const labels = g
      .selectAll("text.xlabel")
      .data(data, (d) => d.slot)
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("class", "xlabel")
            .attr("text-anchor", "end") // 右寄せ（回転に合わせる）
            .attr("font-size", LABEL_FONT_PX)
            .attr("fill", "#444")
            .style("cursor", "pointer"),
        (update) => update,
        (exit) => exit.remove()
      )
      // ★ ここで下方向に LABEL_Y_OFFSET を加算
      .attr(
        "transform",
        (d) =>
          `translate(${xCenter(d.slot)}, ${
            innerH + 12 + LABEL_Y_OFFSET
          }) rotate(-${ROT_DEG})`
      )
      .on("mouseenter.tip", showTip)
      .on("mousemove.tip", moveTip)
      .on("mouseleave.tip", hideTip)
      .on(
        "click",
        (_, d) =>
          d.product_url && window.open(d.product_url, "_blank", "noopener")
      );

    // 1行あたりの最大長（回転時の水平重なりを避けるため cos を考慮）
    const maxLineLenPx = Math.min(
      160,
      Math.floor((BAND * 0.92) / Math.cos(ROT_RAD))
    );

    // 折り返し＋省略（「…」）
    function wrapAndClamp(selection, maxWidth) {
      selection.each(function (d) {
        const text = d3.select(this);
        const full = (d?.name ?? "").toString();
        const chars = Array.from(full);

        text.text(null);
        let line = "";
        let lineNo = 0;
        let tspan = text.append("tspan").attr("x", 0).attr("dy", "0em");

        for (let i = 0; i < chars.length; i++) {
          const next = line + chars[i];
          tspan.text(next);

          if (tspan.node().getComputedTextLength() > maxWidth) {
            if (lineNo >= LABEL_MAX_LINES - 1) {
              // 最終行はクランプして「…」
              let clipped = line || next;
              tspan.text(clipped + "…");
              while (
                tspan.node().getComputedTextLength() > maxWidth &&
                clipped.length > 0
              ) {
                clipped = clipped.slice(0, -1);
                tspan.text(clipped + "…");
              }
              return;
            }
            // 改行
            lineNo++;
            line = chars[i];
            tspan = text
              .append("tspan")
              .attr("x", 0)
              .attr("dy", `${LABEL_LINE_EM}em`)
              .text(line);
          } else {
            line = next;
          }
        }
      });
    }

    labels.each(function (d) {
      d3.select(this)
        .text(null)
        .append("tspan")
        .text(d.name || "");
    });
    labels.call(wrapAndClamp, maxLineLenPx);
  }, [data, wrapW, slots, barW, barGap]);

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      <svg ref={svgRef} />
    </div>
  );
}
