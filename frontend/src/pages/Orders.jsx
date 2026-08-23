import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import api from "../api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    api.get("/orders/my").then((res) => setOrders(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <main className="container page">
      <div className="page-head"><div><span className="eyebrow">Your account</span><h1 className="page-title">Order history</h1></div><Link to="/" className="btn btn-soft">Shop again</Link></div>
      {location.state?.justPlaced && <div className="success-banner">Your order is confirmed. We've added it to your order history.</div>}
      {loading ? <>{[1,2,3].map((i)=><div className="order-card" key={i}><div className="skeleton skeleton-line w-40" /><div className="skeleton skeleton-line w-80" /></div>)}</> :
       !orders.length ? <div className="empty-state"><div className="empty-icon">✓</div><h3>No orders yet</h3><p>Your completed purchases will appear here.</p><Link to="/" className="btn btn-primary" style={{marginTop:18}}>Start shopping</Link></div> :
       orders.map((order) => (
        <article className="order-card" key={order.id}>
          <div className="order-card-head">
            <div><div className="order-number">Order #{order.id}</div><div className="order-meta">{new Date(order.ordered_at).toLocaleString()} · {order.address}</div></div>
            <span className={`status-badge status-${order.status}`}>{order.status}</span>
          </div>
          {order.items.map((it)=><div className="order-item-line" key={it.id}><span>{it.product_name} × {it.quantity}</span><span>${(Number(it.unit_price)*it.quantity).toFixed(2)}</span></div>)}
          <div className="summary-total"><span>Total</span><span>${Number(order.total_amount).toFixed(2)}</span></div>
        </article>
       ))}
    </main>
  );
}