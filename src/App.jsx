import React, { useState, useMemo } from "react";
import InputForm from "./InputForm";
import BarChartD3 from "./BarChart";
import { recommendWithScore } from "./Recommender";
import Header from "./Header";
import "./App.css";
import Legend from "./Legend";

export default function App() {
  const [filters, setFilters] = useState({
    tarMin: 0,
    tarMax: 20,
    nicMin: 0,
    nicMax: 1.5,
    menthol: true,
    regular: true,
    keywords: [],
  });

  const results = useMemo(() => recommendWithScore(filters), [filters]);
  const top10 = results.slice(0, 10);

  return (
    <div className="app" style={{ margin: 0 }}>
      <Header />
      <div>
        <Legend />
      </div>

      <div className="layout">
        <aside className="card controls">
          <InputForm filters={filters} onChange={setFilters} />
        </aside>

        <main className="card chartCard">
          <h2 className="title">
            おすすめ銘柄 <span className="badge">上位10件</span>
          </h2>
          {top10.length === 0 ? (
            <p>該当する銘柄が見つかりませんでした。</p>
          ) : (
            <BarChartD3 recommended={top10} />
          )}
        </main>
      </div>
    </div>
  );
}
