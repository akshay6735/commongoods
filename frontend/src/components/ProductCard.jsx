import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { notify } = useToast();
  const [added, setAdded] = useState(false);
  const outOfStock = Number(product.stock) <= 0;
  const lowStock = !outOfStock && Number(product.stock) < 5;

  function handleAdd(e) {
    e.preventDefault();
    addToCart(product, 1);
    notify(`${product.name} added to cart`, { type: "success" });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1100);
  }

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-media">
        {outOfStock && <span className="product-badge out">Sold out</span>}
        {lowStock && <span className="product-badge low">Only {product.stock} left</span>}
        <img src={product.image_url} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-body">
        <span className="product-cat">{product.category_name}</span>
        <Link to={`/products/${product.id}`} className="product-name">{product.name}</Link>
        <p className="product-description">{product.description}</p>
        <div className="product-foot">
          <span className="price">${Number(product.price).toFixed(2)}</span>
          <button className="btn btn-primary btn-sm btn-add" disabled={outOfStock} onClick={handleAdd}>
            {outOfStock ? "Unavailable" : added ? <span className="added-check">✓ Added</span> : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}