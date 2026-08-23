import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Home from "./pages/Home.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import ProductForm from "./pages/admin/ProductForm.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

export default function App() {
  return <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
      <Route path="/admin/products/add" element={<AdminRoute><ProductForm /></AdminRoute>} />
      <Route path="/admin/products/edit/:id" element={<AdminRoute><ProductForm /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="*" element={<div className="container page not-found"><div className="empty-icon">404</div><h1>Page not in the catalogue</h1><p>Let's get you back to something useful.</p><a href="/" className="btn btn-primary">Back to shop</a></div>} />
    </Routes>
    <footer className="site-footer"><div className="container"><span className="footer-brand">CommonGoods</span><span>Thoughtful objects · Full Stack E-Commerce · Task 12</span><span>© {new Date().getFullYear()}</span></div></footer>
  </>;
}