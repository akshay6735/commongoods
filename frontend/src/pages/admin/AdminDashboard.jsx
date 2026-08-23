import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import api from "../../api";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get("/admin/summary").then((res) => setSummary(res.data));
  }, []);

  if (!summary) {
    return (
      <div className="container page">
        <p style={{ color: "var(--sage-dark)" }}>Loading dashboard…</p>
      </div>
    );
  }

  const chartData = summary.top_products.map((p) => ({ name: p.name, sold: p.sold }));

  return (
    <div className="container page">
      <div className="page-head">
        <div><span className="eyebrow">Store operations</span><h1 className="page-title">Dashboard</h1></div>
      </div>
      <div className="admin-nav">
        <a className="active" href="/admin/dashboard">Overview</a>
        <a href="/admin/products">Products</a>
        <a href="/admin/orders">Orders</a>
      </div>

      <div className="metric-grid">
        <div className="metric-card" style={{ animationDelay: "0ms" }}>
          <div className="metric-label">Total revenue</div>
          <div className="metric-value">${summary.revenue.toFixed(2)}</div>
        </div>
        <div className="metric-card" style={{ animationDelay: "80ms" }}>
          <div className="metric-label">Orders placed</div>
          <div className="metric-value">{summary.order_count}</div>
        </div>
        <div className="metric-card" style={{ animationDelay: "160ms" }}>
          <div className="metric-label">Top seller</div>
          <div className="metric-value" style={{ fontSize: 20 }}>
            {summary.top_products[0]?.name || "—"}
          </div>
        </div>
      </div>

      <div className="chart-card">
        <h3>Top selling products</h3>
        {chartData.length === 0 ? (
          <p style={{ color: "var(--sage-dark)", fontSize: 13.5 }}>
            No sales yet — figures appear once the first order is placed.
          </p>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ left: -10 }}>
                <CartesianGrid stroke="#DAD3C2" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#5E7255" }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 11, fill: "#5E7255" }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "#F3EFE6" }}
                  contentStyle={{ border: "1px solid #DAD3C2", borderRadius: 4, fontSize: 13 }}
                />
                <Bar dataKey="sold" fill="#C98A2C" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
