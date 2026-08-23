import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Checkout() {
  const { cartItems, subtotal, clearCart } = useCart();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  if (!cartItems.length) return <main className="container page"><div className="empty-state"><h3>Nothing to check out</h3><Link to="/" className="btn btn-primary" style={{marginTop:18}}>Back to shop</Link></div></main>;

  async function placeOrder(e) {
    e.preventDefault();
    if (!address.trim()) { setError("Please enter a complete delivery address."); return; }
    setError(""); setPlacing(true);
    try {
      await api.post("/orders", { items: cartItems.map((i) => ({ product_id: i.id, quantity: i.qty })), address: address.trim() });
      clearCart();
      notify("Order placed successfully", { type: "success" });
      navigate("/orders", { state: { justPlaced: true } });
    } catch (err) {
      const msg = err.response?.data?.error || "We couldn't place the order.";
      setError(msg); notify(msg, { type: "error", duration: 4200 });
    } finally { setPlacing(false); }
  }

  return (
    <main className="container page">
      <div className="page-head"><div><span className="eyebrow">Almost yours</span><h1 className="page-title">Checkout</h1></div></div>
      <div className="form-layout">
        <form className="form-card wide" onSubmit={placeOrder}>
          <h2 style={{fontSize:26,marginBottom:6}}>Delivery details</h2>
          <p style={{color:"var(--muted)",fontSize:13,marginTop:0,marginBottom:24}}>Tell us where your order should arrive.</p>
          {error && <div className="error-banner">{error}</div>}
          <div className="field">
            <label htmlFor="address">Full delivery address</label>
            <textarea id="address" rows={6} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House / flat, street, city, state, postal code" required />
          </div>
          <button className="btn btn-primary btn-block" disabled={placing}>{placing ? "Confirming order…" : `Place order · $${subtotal.toFixed(2)}`}</button>
        </form>
        <aside className="cart-summary">
          <h2 className="summary-title">Your order</h2>
          {cartItems.map((item) => <div className="order-item-line" key={item.id}><span>{item.name} × {item.qty}</span><strong>${(Number(item.price) * item.qty).toFixed(2)}</strong></div>)}
          <div className="summary-total"><span>Total</span><span>${subtotal.toFixed(2)}</span></div>
        </aside>
      </div>
    </main>
  );
}