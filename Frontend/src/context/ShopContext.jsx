import { useEffect, useState } from "react";
import {
  findProductBySlug,
  formatPrice,
  parsePrice,
} from "../data/products";
import ShopContext from "./shop-context";

const CART_STORAGE_KEY = "shivratech-cart";
const ORDERS_STORAGE_KEY = "shivratech-orders";

const readStorage = (key) => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : [];
  } catch {
    return [];
  }
};

const saveStorage = (key, value) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState(() => readStorage(CART_STORAGE_KEY));
  const [orders, setOrders] = useState(() => readStorage(ORDERS_STORAGE_KEY));

  useEffect(() => {
    saveStorage(CART_STORAGE_KEY, cart);
  }, [cart]);

  useEffect(() => {
    saveStorage(ORDERS_STORAGE_KEY, orders);
  }, [orders]);

  const cartItems = cart
    .map((item) => {
      const product = findProductBySlug(item.slug);

      if (!product) {
        return null;
      }

      return {
        ...product,
        quantity: item.quantity,
        lineTotal: parsePrice(product.price) * item.quantity,
      };
    })
    .filter(Boolean);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.lineTotal,
    0,
  );

  const addToCart = (product, quantity = 1) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.slug === product.slug);

      if (existingItem) {
        return currentCart.map((item) =>
          item.slug === product.slug
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...currentCart, { slug: product.slug, quantity }];
    });
  };

  const updateCartQuantity = (slug, nextQuantity) => {
    setCart((currentCart) => {
      if (nextQuantity <= 0) {
        return currentCart.filter((item) => item.slug !== slug);
      }

      return currentCart.map((item) =>
        item.slug === slug ? { ...item, quantity: nextQuantity } : item,
      );
    });
  };

  const removeFromCart = (slug) => {
    setCart((currentCart) => currentCart.filter((item) => item.slug !== slug));
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = () => {
    if (cartItems.length === 0) {
      return null;
    }

    const createdAt = new Date().toISOString();
    const newOrder = {
      id: `ST-${Date.now().toString().slice(-8)}`,
      createdAt,
      status: "Order placed",
      total: cartSubtotal,
      totalLabel: formatPrice(cartSubtotal),
      items: cartItems.map((item) => ({
        slug: item.slug,
        title: item.title,
        img: item.img,
        price: item.price,
        quantity: item.quantity,
        categoryName: item.categoryName,
      })),
    };

    setOrders((currentOrders) => [newOrder, ...currentOrders]);
    setCart([]);

    return newOrder;
  };

  return (
    <ShopContext.Provider
      value={{
        addToCart,
        cartCount,
        cartItems,
        cartSubtotal,
        clearCart,
        formatPrice,
        orders,
        placeOrder,
        removeFromCart,
        updateCartQuantity,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
