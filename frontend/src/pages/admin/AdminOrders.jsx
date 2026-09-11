import { useEffect, useState } from "react";
import api from "../../api";
import Pagination from "../../components/Pagination.jsx";

const STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/orders", {
          params: { page: currentPage, limit: 10 },
        });
        if (!cancelled) {
          setOrders(res.data.orders || []);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.total_pages || 0);
        }
      } catch {
        if (!cancelled) {
          setOrders([]);
          setTotal(0);
          setTotalPages(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [currentPage]);

  async function handleStatusChange(orderId, status) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    await api.put(`/orders/${orderId}/status`, { status });
  }

  return (
    <div className="container page">
      <div className="page-head">
        <h1 className="page-title">Manage orders</h1>
        <span style={{ color: "var(--muted)", fontSize: 12, fontWeight: 700 }}>
          {loading ? "Updating…" : `Showing ${orders.length} of ${total} orders`}
        </span>
      </div>

      {loading ? (
        <p style={{ color: "var(--sage-dark)" }}>Loading…</p>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
        </div>
      ) : (
        <>
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
