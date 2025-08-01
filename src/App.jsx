import React, { useState } from "react";
import InputForm from "./InputForm";
import BarChart from "./BarChart";
import { recommendWithScore } from "./Recommender";
import cigaretteMeta from "./cigarette_meta.json";

export default function App() {
  const [filters, setFilters] = useState({
    tarMin: 0,
    tarMax: 20,
    nicMin: 0,
    nicMax: 1.5,
    mentholOnly: false,
    keywords: []
  });

  const recommended = recommendWithScore(filters);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>ヤニレコ</h1>
      <InputForm filters={filters} onChange={setFilters} />
      <h2>おすすめ銘柄（スコア順）</h2>
      {recommended.length === 0 ? (
        <p>該当する銘柄が見つかりませんでした。</p>
      ) : (
        <BarChart recommended={recommended} />
      )}
    </div>
  );
}