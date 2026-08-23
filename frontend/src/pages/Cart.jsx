import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Cart() {
  const { cartItems, updateQty, removeFromCart, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!cartItems.length) {
    return <main className="container page"><div className="empty-state"><div className="empty-icon">🛒</div><h3>Your cart is waiting</h3><p>Nothing here yet. Start with a few useful pieces.</p><Link to="/" className="btn btn-primary" style={{ marginTop: 18 }}>Explore the collection</Link></div></main>;
  }

  function checkout() {
    navigate(user ? "/checkout" : "/login", user ? undefined : { state: { from: { pathname: "/checkout" } } });
  }

  return (
    <main className="container page">
      <div className="page-head"><div><span className="eyebrow">Your selection</span><h1 className="page-title">Shopping cart</h1></div><Link to="/" className="btn btn-soft">← Continue shopping</Link></div>
      <div className="cart-layout">
        <div className="cart-list">
          {cartItems.map((item) => (
            <div className="cart-row" key={item.id}>
              <img src={item.image_url} alt={item.name} />
              <div className="cart-info">
                <h3>{item.name}</h3>
                <p>{item.category_name}</p>
                <strong>${Number(item.price).toFixed(2)} each</strong>
              </div>
              <div className="qty-stepper">
                <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                <span>{item.qty}</span>
                <button disabled={item.qty >= Number(item.stock)} onClick={() => updateQty(item.id, Math.min(Number(item.stock), item.qty + 1))}>+</button>
              </div>
              <button className="btn btn-ghost btn-sm remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}
        </div>
        <aside className="cart-summary">
          <h2 className="summary-title">Order summary</h2>
          <div className="summary-row"><span>Items</span><span>{cartItems.reduce((s, i) => s + i.qty, 0)}</span></div>
          <div className="summary-row"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
          <div className="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
          <div className="summary-total"><span>Total</span><span>${subtotal.toFixed(2)}</span></div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={checkout}>Continue to checkout →</button>
          {!user && <p style={{ color: "var(--muted)", fontSize: 11, textAlign: "center", marginBottom: 0 }}>You'll be asked to sign in before checkout.</p>}
        </aside>
      </div>
    </main>
  );
}