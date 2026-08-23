import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(
  () => localStorage.getItem("common-goods-theme") || "light"
);

useEffect(() => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("common-goods-theme", theme);
}, [theme]);

function toggleTheme() {
  setTheme((current) => (current === "light" ? "dark" : "light"));
}

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate("/");
  }

  const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

  return (
    <header className={`navbar${scrolled ? " scrolled" : ""}`}>
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">CG</span>
          Common<span>Goods</span>
        </Link>

        <button className="nav-menu" aria-label="Toggle navigation" onClick={() => setOpen((v) => !v)}>
          {open ? "×" : "☰"}
        </button>

        <nav className={`nav-links${open ? " open" : ""}`}>
          <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>Shop</NavLink>

          {user && !isAdmin && (
            <NavLink to="/orders" className={linkClass} onClick={() => setOpen(false)}>Orders</NavLink>
          )}

          {isAdmin && (
            <>
              <NavLink to="/admin/dashboard" className={linkClass} onClick={() => setOpen(false)}>Dashboard</NavLink>
              <NavLink to="/admin/products" className={linkClass} onClick={() => setOpen(false)}>Products</NavLink>
              <NavLink to="/admin/orders" className={linkClass} onClick={() => setOpen(false)}>Orders</NavLink>
            </>
          )}

          {!isAdmin && (
            <Link to="/cart" className="nav-cart" onClick={() => setOpen(false)}>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              >
                <span aria-hidden="true">
                  {theme === "light" ? "☾" : "☀"}
                </span>
                <span>
                  {theme === "light" ? "Dark" : "Light"}
                </span>
              </button>
              Cart {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          )}

          {user ? (
            <div className="nav-user">
              <span className="avatar">{user.name?.charAt(0).toUpperCase()}</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{user.name?.split(" ")[0]}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}