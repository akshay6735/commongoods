import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";

const empty = { name: "", description: "", price: "", stock: "", category_id: "", image_url: "" };

export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (editing) {
      api.get(`/products/${id}`).then((res) => {
        const p = res.data;
        setForm({
          name: p.name,
          description: p.description || "",
          price: p.price,
          stock: p.stock,
          category_id: p.category_id || "",
          image_url: p.image_url || "",
        });
      });
    }
  }, [id, editing]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), category_id: Number(form.category_id) };
      if (editing) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.error || "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container page">
      <div className="page-head">
        <div><span className="eyebrow">Catalogue management</span><h1 className="page-title">{editing ? "Edit product" : "Add new product"}</h1></div>
      </div>

      <form className="form-card wide" onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}

        <div className="field">
          <label htmlFor="name">Product name</label>
          <input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="price">Price ($)</label>
            <input id="price" type="number" step="0.01" min="0" required value={form.price} onChange={(e) => update("price", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="stock">Stock</label>
            <input id="stock" type="number" min="0" required value={form.stock} onChange={(e) => update("stock", e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" required value={form.category_id} onChange={(e) => update("category_id", e.target.value)}>
            <option value="" disabled>Choose a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="image">Image URL</label>
          <input id="image" value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="https://…" />
        </div>

        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : editing ? "Save changes" : "Create product"}
        </button>
      </form>
    </div>
  );
}
