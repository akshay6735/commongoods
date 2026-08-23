import { useEffect, useState } from "react";
import api from "../../api";

const STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get("/orders").then((res) => setOrders(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleStatusChange(orderId, status) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    await api.put(`/orders/${orderId}/status`, { status });
  }

  return (
    <div className="container page">
      <div className="page-head">
        <h1 className="page-title">Manage orders</h1>
      </div>

      {loading ? (
        <p style={{ color: "var(--sage-dark)" }}>Loading…</p>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
        </div>
      ) : (
        <div className="table-wrap"><table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                  <div style={{ fontSize: 12, color: "var(--sage-dark)" }}>{o.customer_email}</div>
                </td>
                <td>{new Date(o.ordered_at).toLocaleDateString()}</td>
                <td>{o.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                <td>${Number(o.total_amount).toFixed(2)}</td>
                <td>
                  <select
                    className="select-input"
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </div>
  );
}
