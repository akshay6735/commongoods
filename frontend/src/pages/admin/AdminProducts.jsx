import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get("/products").then((res) => setProducts(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await api.delete(`/products/${id}`);
    load();
  }

  return (
    <div className="container page">
      <div className="admin-toolbar">
        <h1 className="page-title">Manage products</h1>
        <Link to="/admin/products/add" className="btn btn-primary">
          + Add new product
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "var(--sage-dark)" }}>Loading…</p>
      ) : (
        <div className="table-wrap"><table className="data-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td><img src={p.image_url} alt={p.name} className="thumb-sm" /></td>
                <td>{p.name}</td>
                <td>{p.category_name}</td>
                <td>${Number(p.price).toFixed(2)}</td>
                <td>
                  {p.stock}
                  {p.stock < 5 && <span className="low-flag">LOW</span>}
                </td>
                <td>
                  <div className="row-actions">
                    <Link to={`/admin/products/edit/${p.id}`} className="btn btn-outline btn-sm">
                      Edit
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </div>
  );
}
