import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard.jsx";
import { useReveal } from "../hooks/useReveal.js";

function ProductGridSkeleton() {
  return (
    <div className="product-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton skeleton-media" />
          <div className="skeleton skeleton-line w-60" />
          <div className="skeleton skeleton-line w-80" />
          <div className="skeleton skeleton-line w-40" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heroRef, heroVisible] = useReveal();
  const [gridRef, gridVisible] = useReveal();

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      const params = {};
      if (activeCategory) params.category = activeCategory;
      if (search.trim()) params.search = search.trim();
      if (sort) params.sort = sort;

      try {
        const res = await api.get("/products", { params });
        if (!cancelled) setProducts(res.data);
      } catch {
        if (!cancelled) setError("We couldn't load the catalogue. Make sure the Flask server is running.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 220);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [activeCategory, search, sort]);
  const categoryLabels = {
  "Kitchen & Table": "Rasoi & Table",
  "Desk & Studio": "Kaam & Studio",
  "Lighting": "Roshni",
  "Outdoors": "Bahar & Travel",
};

  return (
    <>
      <section className="hero" ref={heroRef}>
        <div className={`container hero-grid reveal${heroVisible ? " in" : ""}`}>
          <div className="hero-copy">
            <span className="eyebrow">A considered everyday catalogue</span>
            <h1 className="hero-title">Good things.<br /><em>Simply chosen.</em></h1>
            <p className="hero-sub">
              Common Goods is a small collection of objects for the desk, table and outdoors —
              useful, tactile and designed to stay in your life.
            </p>
            <div className="hero-actions">
              <a href="#catalogue" className="btn btn-primary">Explore the collection ↓</a>
              <Link to="/cart" className="btn btn-soft">View cart</Link>
            </div>
            <div className="hero-meta">
              <div className="hero-stat"><strong>20+</strong><span>Curated goods</span></div>
              <div className="hero-stat"><strong>4</strong><span>Collections</span></div>
              <div className="hero-stat"><strong>100%</strong><span>Everyday useful</span></div>
            </div>
          </div>

          <div className="hero-showcase">
            <img className="showcase-image" src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=85" alt="Ceramic pour-over set" />
            <div className="showcase-card">
              <small>Featured object</small>
              <h3>Ceramic Pour-Over Set</h3>
              <span className="price">$46.00</span>
            </div>
          </div>
        </div>
      </section>

      <main className="container page" id="catalogue">
        <div className="section-head">
          <div>
            <span className="eyebrow">The collection</span>
            <h2>Shop the catalogue</h2>
            <p>Everyday objects, thoughtfully chosen for modern Indian living.</p>
          </div>
          <span style={{ color: "var(--muted)", fontSize: 12, fontWeight: 700 }}>
            {loading ? "Updating…" : `${products.length} pieces`}
          </span>
        </div>

        <div className="filters-shell">
          <div className="filters-top">
            <div className="search-wrap">
              <span>⌕</span>
              <input className="search-input" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="select-input" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
              <option value="">Featured</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="newest">Newest first</option>
            </select>
          </div>
          <div className="chips">
            <button className={`chip${!activeCategory ? " active" : ""}`} onClick={() => setActiveCategory(null)}>All pieces</button>
            {categories.map((c) => (
              <button key={c.id} className={`chip${activeCategory === c.name ? " active" : ""}`} onClick={() => setActiveCategory(c.name)}>
                {categoryLabels[c.name] || c.name}
              </button>
            ))}
          </div>
        </div>

        {error ? <div className="error-banner">{error}</div> : null}
        <div ref={gridRef}>
          {loading ? <ProductGridSkeleton /> : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⌕</div>
              <h3>No pieces found</h3>
              <p>Try a different search or clear the collection filter.</p>
              <button className="btn btn-soft" style={{ marginTop: 18 }} onClick={() => { setSearch(""); setActiveCategory(null); }}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className={`product-grid reveal${gridVisible ? " in" : ""}`}>
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </main>
    </>
  );
}