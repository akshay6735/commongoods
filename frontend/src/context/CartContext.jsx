import { createContext, useContext, useState, useMemo } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]); // [{id, name, price, image_url, stock, qty}]

  function addToCart(product, quantity = 1) {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + quantity } : i
        );
      }
      return [...prev, { ...product, qty: quantity }];
    });
  }

  function updateQty(id, qty) {
    if (qty < 1) return;
    setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  }

  function removeFromCart(id) {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearCart() {
    setCartItems([]);
  }

  const itemCount = useMemo(() => cartItems.reduce((sum, i) => sum + i.qty, 0), [cartItems]);
  const subtotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.qty * Number(i.price), 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, updateQty, removeFromCart, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
