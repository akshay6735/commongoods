"""
E-Commerce Platform — Flask API
Task 12

Run:
    pip install flask flask-bcrypt flask-cors mysql-connector-python
    python seed.py      # creates tables + seed data
    python app.py       # starts server on :5000
"""

from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import timedelta
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-change-me")
# Local development runs on HTTP. Lax is reliable for localhost sessions.
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False
app.permanent_session_lifetime = timedelta(days=7)

bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "user": os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", ""),
    "database": os.environ.get("DB_NAME", "ecommerce"),
}


def get_db():
    return mysql.connector.connect(**DB_CONFIG)


def row_to_dict(cursor, row):
    cols = [d[0] for d in cursor.description]
    return dict(zip(cols, row))


# ---------------------------------------------------------------- helpers

def current_user():
    if "user_id" not in session:
        return None
    return {
        "id": session["user_id"],
        "name": session.get("name"),
        "email": session.get("email"),
        "role": session.get("role"),
    }


def login_required(fn):
    from functools import wraps

    @wraps(fn)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Login required"}), 401
        return fn(*args, **kwargs)

    return wrapper


def admin_required(fn):
    from functools import wraps

    @wraps(fn)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Login required"}), 401
        if session.get("role") != "admin":
            return jsonify({"error": "Admin access only"}), 403
        return fn(*args, **kwargs)

    return wrapper


# ---------------------------------------------------------------- auth

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(force=True)
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, 'customer')",
            (name, email, hashed),
        )
        conn.commit()
        user_id = cur.lastrowid
    except Error as e:
        if e.errno == 1062:
            return jsonify({"error": "An account with this email already exists"}), 409
        return jsonify({"error": "Registration failed"}), 500
    finally:
        cur.close()
        conn.close()

    session.permanent = True
    session["user_id"] = user_id
    session["name"] = name
    session["email"] = email
    session["role"] = "customer"

    return jsonify({"id": user_id, "name": name, "email": email, "role": "customer"}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, password, role FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row or not bcrypt.check_password_hash(row[3], password):
        return jsonify({"error": "Invalid email or password"}), 401

    session.permanent = True
    session["user_id"] = row[0]
    session["name"] = row[1]
    session["email"] = row[2]
    session["role"] = row[4]

    return jsonify({"id": row[0], "name": row[1], "email": row[2], "role": row[4]})


@app.route("/api/logout", methods=["GET"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})


@app.route("/api/me", methods=["GET"])
def me():
    user = current_user()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    return jsonify(user)


# ---------------------------------------------------------------- products (public)

@app.route("/api/products", methods=["GET"])
def get_products():
    category = request.args.get("category")
    search = request.args.get("search")
    sort = request.args.get("sort")

    query = """
        SELECT p.id, p.name, p.description, p.price, p.stock,
               p.category_id, c.name AS category_name, p.image_url, p.created_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    """
    params = []

    if category:
        query += " AND c.name = %s"
        params.append(category)
    if search:
        query += " AND (p.name LIKE %s OR p.description LIKE %s)"
        like = f"%{search}%"
        params.extend([like, like])

    sort_map = {
        "price_asc": " ORDER BY p.price ASC",
        "price_desc": " ORDER BY p.price DESC",
        "newest": " ORDER BY p.created_at DESC",
    }
    query += sort_map.get(sort, " ORDER BY p.id ASC")

    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, params)
    rows = [row_to_dict(cur, r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return jsonify(rows)


@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT p.id, p.name, p.description, p.price, p.stock,
               p.category_id, c.name AS category_name, p.image_url, p.created_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = %s
        """,
        (product_id,),
    )
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return jsonify({"error": "Product not found"}), 404
    product = row_to_dict(cur, row)
    cur.close()
    conn.close()
    return jsonify(product)


@app.route("/api/categories", methods=["GET"])
def get_categories():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM categories ORDER BY name")
    rows = [row_to_dict(cur, r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return jsonify(rows)


# ---------------------------------------------------------------- products (admin)

@app.route("/api/products", methods=["POST"])
@admin_required
def create_product():
    data = request.get_json(force=True)
    required = ["name", "price", "stock", "category_id"]
    if any(k not in data or data[k] in (None, "") for k in required):
        return jsonify({"error": "name, price, stock and category_id are required"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO products (name, description, price, stock, category_id, image_url)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (
            data["name"],
            data.get("description", ""),
            data["price"],
            data["stock"],
            data["category_id"],
            data.get("image_url", ""),
        ),
    )
    conn.commit()
    new_id = cur.lastrowid
    cur.close()
    conn.close()
    return jsonify({"id": new_id, "message": "Product created"}), 201


@app.route("/api/products/<int:product_id>", methods=["PUT"])
@admin_required
def update_product(product_id):
    data = request.get_json(force=True)
    fields = ["name", "description", "price", "stock", "category_id", "image_url"]
    updates = {k: data[k] for k in fields if k in data}
    if not updates:
        return jsonify({"error": "No fields to update"}), 400

    set_clause = ", ".join(f"{k} = %s" for k in updates)
    values = list(updates.values()) + [product_id]

    conn = get_db()
    cur = conn.cursor()
    cur.execute(f"UPDATE products SET {set_clause} WHERE id = %s", values)
    conn.commit()
    affected = cur.rowcount
    cur.close()
    conn.close()

    if affected == 0:
        return jsonify({"error": "Product not found"}), 404
    return jsonify({"message": "Product updated"})


@app.route("/api/products/<int:product_id>", methods=["DELETE"])
@admin_required
def delete_product(product_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM products WHERE id = %s", (product_id,))
    conn.commit()
    affected = cur.rowcount
    cur.close()
    conn.close()

    if affected == 0:
        return jsonify({"error": "Product not found"}), 404
    return jsonify({"message": "Product deleted"})


# ---------------------------------------------------------------- orders (customer)

@app.route("/api/orders", methods=["POST"])
@login_required
def place_order():
    data = request.get_json(force=True)
    items = data.get("items") or []
    address = (data.get("address") or "").strip()

    if not items:
        return jsonify({"error": "Order must contain at least one item"}), 400
    if not address:
        return jsonify({"error": "Delivery address is required"}), 400

    conn = get_db()
    cur = conn.cursor()

    try:
        # --- validate stock for every item BEFORE touching anything ---
        product_rows = {}
        for item in items:
            cur.execute(
                "SELECT id, name, price, stock FROM products WHERE id = %s FOR UPDATE",
                (item["product_id"],),
            )
            row = cur.fetchone()
            if not row:
                conn.rollback()
                return jsonify({"error": f"Product {item['product_id']} not found"}), 400

            pid, pname, price, stock = row
            requested = int(item["quantity"])
            if requested < 1:
                conn.rollback()
                return jsonify({"error": f"Invalid quantity for {pname}"}), 400
            if stock < requested:
                conn.rollback()
                return jsonify({
                    "error": f"Not enough stock for '{pname}'. Only {stock} left, "
                              f"you requested {requested}."
                }), 400

            product_rows[pid] = {"name": pname, "price": price, "requested": requested}

        # --- everything validated: now create order, items, reduce stock ---
        total = sum(v["price"] * v["requested"] for v in product_rows.values())

        cur.execute(
            "INSERT INTO orders (user_id, total_amount, address, status) VALUES (%s, %s, %s, 'Pending')",
            (session["user_id"], total, address),
        )
        order_id = cur.lastrowid

        for pid, v in product_rows.items():
            cur.execute(
                """INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                   VALUES (%s, %s, %s, %s)""",
                (order_id, pid, v["requested"], v["price"]),
            )
            cur.execute(
                "UPDATE products SET stock = stock - %s WHERE id = %s",
                (v["requested"], pid),
            )

        conn.commit()
        return jsonify({"order_id": order_id, "total": float(total), "status": "Pending"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": "Failed to place order", "detail": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/api/orders/my", methods=["GET"])
@login_required
def my_orders():
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """SELECT id, total_amount, status, address, ordered_at
           FROM orders WHERE user_id = %s ORDER BY ordered_at DESC""",
        (session["user_id"],),
    )
    orders = [row_to_dict(cur, r) for r in cur.fetchall()]

    for order in orders:
        cur.execute(
            """SELECT oi.id, oi.product_id, p.name AS product_name,
                      oi.quantity, oi.unit_price
               FROM order_items oi
               JOIN products p ON oi.product_id = p.id
               WHERE oi.order_id = %s""",
            (order["id"],),
        )
        order["items"] = [row_to_dict(cur, r) for r in cur.fetchall()]

    cur.close()
    conn.close()
    return jsonify(orders)


# ---------------------------------------------------------------- orders (admin)

@app.route("/api/orders", methods=["GET"])
@admin_required
def all_orders():
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """SELECT o.id, o.total_amount, o.status, o.address, o.ordered_at,
                  u.name AS customer_name, u.email AS customer_email
           FROM orders o
           JOIN users u ON o.user_id = u.id
           ORDER BY o.ordered_at DESC"""
    )
    orders = [row_to_dict(cur, r) for r in cur.fetchall()]

    for order in orders:
        cur.execute(
            """SELECT oi.id, oi.product_id, p.name AS product_name,
                      oi.quantity, oi.unit_price
               FROM order_items oi
               JOIN products p ON oi.product_id = p.id
               WHERE oi.order_id = %s""",
            (order["id"],),
        )
        order["items"] = [row_to_dict(cur, r) for r in cur.fetchall()]

    cur.close()
    conn.close()
    return jsonify(orders)


@app.route("/api/orders/<int:order_id>/status", methods=["PUT"])
@admin_required
def update_order_status(order_id):
    data = request.get_json(force=True)
    status = data.get("status")
    valid = {"Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"}
    if status not in valid:
        return jsonify({"error": f"Status must be one of {sorted(valid)}"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE orders SET status = %s WHERE id = %s", (status, order_id))
    conn.commit()
    affected = cur.rowcount
    cur.close()
    conn.close()

    if affected == 0:
        return jsonify({"error": "Order not found"}), 404
    return jsonify({"message": "Status updated", "status": status})


# ---------------------------------------------------------------- admin summary (bonus)

@app.route("/api/admin/summary", methods=["GET"])
@admin_required
def admin_summary():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COALESCE(SUM(total_amount),0), COUNT(*) FROM orders WHERE status != 'Cancelled'")
    revenue, order_count = cur.fetchone()
    cur.execute(
        """SELECT p.name, SUM(oi.quantity) AS sold
           FROM order_items oi JOIN products p ON oi.product_id = p.id
           GROUP BY p.id ORDER BY sold DESC LIMIT 5"""
    )
    top = [row_to_dict(cur, r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return jsonify({"revenue": float(revenue), "order_count": order_count, "top_products": top})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
