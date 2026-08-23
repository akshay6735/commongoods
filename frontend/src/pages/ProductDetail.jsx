import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { notify } = useToast();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    setProduct(null);
    api.get(`/products/${id}`).then((res) => setProduct(res.data)).catch(() => setError("Product not found."));
  }, [id]);

  if (error) return <div className="container page"><div className="error-banner">{error}</div><Link className="btn btn-primary" to="/">Back to shop</Link></div>;
  if (!product) return <div className="container page"><div className="skeleton" style={{ height: 520, borderRadius: 24 }} /></div>;

  const stock = Number(product.stock);
  const out = stock <= 0;

  function add() {
    addToCart(product, qty);
    notify(`${product.name} × ${qty} added to cart`, { type: "success" });
  }

  return (
    <main className="container page">
      <Link to="/" className="btn btn-ghost" style={{ paddingLeft: 0, marginBottom: 22 }}>← Back to collection</Link>
      <div className="detail-grid">
        <div className="detail-media"><img src={product.image_url} alt={product.name} /></div>
        <div className="detail-copy">
          <span className="product-cat">{product.category_name}</span>
          <h1 className="detail-title">{product.name}</h1>
          <div className="detail-price">${Number(product.price).toFixed(2)}</div>
          <p className="detail-desc">{product.description}</p>

          {out ? (
            <div className="error-banner">This piece is currently out of stock.</div>
          ) : (
            <>
              <div className="detail-stock"><span className="dot" /> {stock < 5 ? `Only ${stock} left — order soon` : "In stock and ready to ship"}</div>
              <div className="detail-actions">
                <div className="qty-stepper" aria-label="Quantity">
                  <button onClick={() => setQty((v) => Math.max(1, v - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((v) => Math.min(stock, v + 1))}>+</button>
                </div>
                <button className="btn btn-primary" onClick={add}>Add to cart · ${(Number(product.price) * qty).toFixed(2)}</button>
                <button className="btn btn-soft" onClick={() => { add(); navigate("/cart"); }}>Buy now</button>
              </div>
            </>
          )}
          <div className="detail-note">Secure session-based checkout · Stock is validated again by the backend before an order is created.</div>
        </div>
      </div>
    </main>
  );
}