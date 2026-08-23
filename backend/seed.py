import mysql.connector
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

bcrypt = Bcrypt()

DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_USER = os.environ.get("DB_USER", "root")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
DB_NAME = os.environ.get("DB_NAME", "ecommerce")

SCHEMA = """
CREATE DATABASE IF NOT EXISTS {db};
USE {db};

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(100) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    role         ENUM('admin','customer') DEFAULT 'customer',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE products (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    description    TEXT,
    price          DECIMAL(10,2) NOT NULL,
    stock          INT NOT NULL DEFAULT 0,
    category_id    INT,
    image_url      VARCHAR(255),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status       ENUM('Pending','Confirmed','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
    address      TEXT NOT NULL,
    ordered_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT NOT NULL,
    unit_price  DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
""".format(db=DB_NAME)

CATEGORIES = ["Desk & Studio", "Kitchen & Table", "Outdoors", "Lighting"]

PRODUCTS = [
    # (name, description, price, stock, category, image)

    (
        "Handmade Kalamkari Journal",
        "A6 dot-grid journal with a cotton cover inspired by Indian craft.",
        799.00,
        40,
        "Desk & Studio",
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600",
    ),

    (
        "Brass Diya Desk Lamp",
        "Adjustable brass lamp with a warm, handcrafted Indian character.",
        4499.00,
        12,
        "Lighting",
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600",
    ),

    (
        "Sheesham Pen Tray",
        "Solid Indian sheesham wood tray for pens and everyday desk tools.",
        1299.00,
        25,
        "Desk & Studio",
        "https://images.unsplash.com/photo-1517971071642-34a2d3ecc9cd?w=600",
    ),

    (
        "Kulhad Pour-Over Set",
        "Hand-glazed ceramic dripper and matching cup inspired by Indian pottery.",
        2199.00,
        18,
        "Kitchen & Table",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600",
    ),

    (
        "Handloom Table Runner",
        "Stonewashed cotton table runner with a subtle Indian handloom feel.",
        999.00,
        30,
        "Kitchen & Table",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
    ),

    (
        "Cast Iron Tawa",
        "Pre-seasoned cast iron cookware made for everyday Indian kitchens.",
        1799.00,
        22,
        "Kitchen & Table",
        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600",
    ),

    (
        "Canvas Travel Backpack",
        "Durable waxed canvas backpack with leather detailing for everyday travel.",
        5499.00,
        9,
        "Outdoors",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    ),

    (
        "Enamel Chai Mug",
        "Classic enamel mug made for chai, coffee and outdoor mornings.",
        699.00,
        60,
        "Outdoors",
        "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600",
    ),

    (
        "Handwoven Wool Shawl",
        "Warm heavyweight wool blanket inspired by traditional Indian weaving.",
        3999.00,
        15,
        "Outdoors",
        "https://images.unsplash.com/photo-1601233749202-95d04d5b3c00?w=600",
    ),

    (
        "Desk Planner 2026",
        "Minimal standing planner designed for work, study and everyday planning.",
        599.00,
        50,
        "Desk & Studio",
        "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600",
    ),

    (
        "Bamboo Jali Pendant Light",
        "Handwoven pendant light inspired by traditional Indian jali patterns.",
        3299.00,
        10,
        "Lighting",
        "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600",
    ),

    (
        "Glass Chai Carafe",
        "Borosilicate glass carafe designed for chai, infused drinks and everyday use.",
        1199.00,
        35,
        "Kitchen & Table",
        "https://images.unsplash.com/photo-1517254797898-04edd251b984?w=600",
    ),

    (
        "Tan Leather Desk Mat",
        "Full-grain leather desk mat that develops character with everyday use.",
        2999.00,
        20,
        "Desk & Studio",
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600",
    ),

    (
        "Foldable Bazaar Stool",
        "Compact canvas and steel stool inspired by practical Indian market furniture.",
        1899.00,
        24,
        "Outdoors",
        "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600",
    ),

    (
        "Blue Pottery Dinner Set",
        "Four-piece ceramic dinner set with a handcrafted Indian pottery aesthetic.",
        2499.00,
        14,
        "Kitchen & Table",
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600",
    ),

    (
        "Brass Task Lamp",
        "Compact clip-on lamp with a warm brass finish for desks and shelves.",
        1599.00,
        28,
        "Lighting",
        "https://images.unsplash.com/photo-1543198126-cbdba51c68a6?w=600",
    ),

    (
        "Terracotta Coaster Set",
        "Set of six natural terracotta coasters inspired by Indian pottery.",
        499.00,
        45,
        "Kitchen & Table",
        "https://images.unsplash.com/photo-1519996409144-56c88c9aa612?w=600",
    ),

    (
        "Canvas Tool Roll",
        "Waxed canvas roll for small tools, stationery and everyday essentials.",
        999.00,
        32,
        "Outdoors",
        "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=600",
    ),

    (
        "Sheesham Bookend Pair",
        "Solid sheesham wood bookends with subtle brass detailing.",
        1799.00,
        3,
        "Desk & Studio",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
    ),

    (
        "Amber Terracotta Vase",
        "Handcrafted-style decorative vase for flowers and everyday spaces.",
        899.00,
        0,
        "Lighting",
        "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600",
    ),
]

ACCOUNTS = [
    ("Store Admin", "admin@storefront.dev", "admin123", "admin"),
    ("Priya Nair", "priya@example.com", "customer123", "customer"),
]


def main():
    conn = mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD)
    cur = conn.cursor()
    for statement in SCHEMA.split(";"):
        if statement.strip():
            cur.execute(statement)
    conn.commit()
    cur.close()
    conn.close()

    conn = mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME)
    cur = conn.cursor()

    cat_ids = {}
    for name in CATEGORIES:
        cur.execute("INSERT INTO categories (name) VALUES (%s)", (name,))
        cat_ids[name] = cur.lastrowid

    for name, desc, price, stock, cat, image in PRODUCTS:
        cur.execute(
            """INSERT INTO products (name, description, price, stock, category_id, image_url)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (name, desc, price, stock, cat_ids[cat], image),
        )

    for name, email, pw, role in ACCOUNTS:
        hashed = bcrypt.generate_password_hash(pw).decode("utf-8")
        cur.execute(
            "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
            (name, email, hashed, role),
        )

    conn.commit()
    cur.close()
    conn.close()

    print(f"Seeded {len(CATEGORIES)} categories, {len(PRODUCTS)} products, {len(ACCOUNTS)} accounts.")
    print("Admin login:    admin@storefront.dev / admin123")
    print("Customer login: priya@example.com / customer123")


if __name__ == "__main__":
    main()
