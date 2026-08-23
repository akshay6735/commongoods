# Common Goods — E-Commerce Platform

Full-stack storefront + admin panel built for Task 12.
**Stack:** React (Vite) + Flask + MySQL, with React Context API for
global cart and auth state.

---

## 1. Setup

### Backend

```bash
cd backend
python -m venv venv
# Windows PowerShell:
.\\venv\\Scripts\\Activate.ps1
pip install -r requirements.txt

# Copy backend/.env.example to backend/.env and set your MySQL password.
# Never commit backend/.env.

python seed.py     # creates the database, tables, and demo data
python app.py       # runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
# Optional: copy frontend/.env.example to frontend/.env if you want to change the API URL.
npm run dev          # runs on http://localhost:5173
```

The frontend expects the API at `http://localhost:5000/api`
(see `src/api.js`) and the backend allows CORS from
`http://localhost:5173` with credentials, so the Flask session
cookie is sent on every request.

### Test accounts (created by `seed.py`)

| Role     | Email                 | Password    |
|----------|------------------------|-------------|
| Admin    | admin@storefront.dev   | admin123    |
| Customer | priya@example.com      | customer123 |

---

## 2. Frontend polish

Beyond the base spec, the storefront has:

- **Toast notifications** (`context/ToastContext.jsx`) — confirms add-to-cart
  and order placement without a page jump.
- **Skeleton loading states** for the product grid and order history,
  instead of a bare "Loading…" string.
- **Scroll-reveal animations** (`hooks/useReveal.js`, IntersectionObserver)
  on the hero and product grid — respects `prefers-reduced-motion`.
- **Shrinking sticky navbar** on scroll, and an animated cart badge.
- **Image zoom on hover** for product cards, with an animated "Added ✓"
  state on the add-to-cart button.
- **Admin dashboard** (`/admin/dashboard`) with live revenue, order count,
  and a Recharts bar chart of top-selling products, pulled from the bonus
  `GET /api/admin/summary` endpoint.

## 3. What's included

- Customer storefront: browse, filter by category, search, sort,
  product detail, cart, checkout, order history.
- Admin panel: product CRUD, order list, inline status updates.
- `CartContext` and `AuthContext` share state across the whole
  app without prop drilling.
- Stock is validated for every line item before an order is
  created, and only reduced after the whole order passes
  validation (see `POST /api/orders` in `backend/app.py`).
- `order_items.unit_price` freezes the price at purchase time, so
  order history stays accurate even if a product's price changes
  later.

---

## 4. Write-up

**What is React Context API and why is it better than prop
drilling for the cart?**

Context lets a provider component expose state and functions that
any descendant can read with a hook, instead of passing props down
through every layer in between. The cart needs to be read and
updated from the Navbar (item count), the Home/ProductDetail pages
(add to cart), and the Cart/Checkout pages (list, update, clear) —
none of which are direct parents/children of each other. Example
from this project:

```jsx
// context/CartContext.jsx
const CartContext = createContext();
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  // addToCart, updateQty, removeFromCart, clearCart ...
  return (
    <CartContext.Provider value={{ cartItems, addToCart, ... }}>
      {children}
    </CartContext.Provider>
  );
}
export const useCart = () => useContext(CartContext);
```

Any component then just calls `const { cartItems, addToCart } =
useCart()` — no intermediate component needs to know the cart
exists.

**Why does `order_items` store `unit_price` instead of reading the
current product price?**

An order is a record of what actually happened at checkout. If a
product's price changes afterwards (a sale, a price increase), an
old order must still show what the customer actually paid — that's
both a legal/accounting requirement and what a customer expects
when they look at past orders. Storing `unit_price` on the
`order_items` row freezes that value at the moment of purchase,
independent of whatever `products.price` becomes later.

**What happens if a customer tries to order 10 units of a product
that only has 3 in stock?**

The backend rejects the whole order with a `400` and a message
naming the product and the available quantity, before anything is
written to the database. Validation happens for every line item
first; nothing is inserted or decremented until every item passes.
From `backend/app.py`:

```python
for item in items:
    cur.execute(
        "SELECT id, name, price, stock FROM products WHERE id = %s FOR UPDATE",
        (item["product_id"],),
    )
    pid, pname, price, stock = cur.fetchone()
    requested = int(item["quantity"])
    if stock < requested:
        conn.rollback()
        return jsonify({
            "error": f"Not enough stock for '{pname}'. Only {stock} left, "
                      f"you requested {requested}."
        }), 400
```

Only once every item in the order has passed this check does the
code create the `orders` row, insert `order_items`, and decrement
`products.stock`.

**Difference between `ProtectedRoute` and `AdminRoute`?**

`ProtectedRoute` only checks whether *someone* is signed in — it
sends anonymous visitors to `/login` and lets any signed-in user
(customer or admin) through. `AdminRoute` additionally checks the
user's role and sends non-admins back to `/`, so only admin
accounts can reach `/admin/*` pages.

```jsx
// components/ProtectedRoute.jsx
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// components/AdminRoute.jsx
export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
```
