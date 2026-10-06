import { useEffect, useState } from "react";
import {
  findProductBySlug,
  formatPrice,
  parsePrice,
} from "../data/products";
import ShopContext from "./shop-context";

const CART_STORAGE_KEY = "shivratech-cart";
const ORDERS_STORAGE_KEY = "shivratech-orders";
const WISHLIST_STORAGE_KEY = "shivratech-wishlist";

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
  const [wishlist, setWishlist] = useState(() => readStorage(WISHLIST_STORAGE_KEY));

  useEffect(() => {
    saveStorage(CART_STORAGE_KEY, cart);
  }, [cart]);

  useEffect(() => {
    saveStorage(ORDERS_STORAGE_KEY, orders);
  }, [orders]);

  useEffect(() => {
    saveStorage(WISHLIST_STORAGE_KEY, wishlist);
  }, [wishlist]);

  const cartItems = cart
    .map((item) => {
      const catalogProduct = findProductBySlug(item.slug);
      const product = catalogProduct ? { ...item, ...catalogProduct } : item;

      if (!product || (!product.title && !product.slug)) {
        return null;
      }

      const rawPrice = product.price ?? "Rs. 0";
      const parsedPrice =
        typeof rawPrice === "number"
          ? rawPrice
          : parsePrice(String(rawPrice));

      const formattedPrice =
        typeof rawPrice === "number"
          ? formatPrice(rawPrice)
          : String(rawPrice);

      const qty = item.quantity || 1;

      return {
        ...product,
        title: product.title || "Tech Gadget",
        price: formattedPrice,
        quantity: qty,
        lineTotal: parsedPrice * qty,
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
    if (!product) return;
    const slug = product.slug || (typeof product === "string" ? product : null);
    if (!slug) return;

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.slug === slug);

      if (existingItem) {
        return currentCart.map((item) =>
          item.slug === slug
            ? { ...item, quantity: (item.quantity || 1) + quantity }
            : item,
        );
      }

      const catalogProduct = findProductBySlug(slug);
      const merged = {
        ...(catalogProduct || {}),
        ...(typeof product === "object" ? product : {}),
      };

      const newItem = {
        slug,
        title: merged.title || "Tech Gadget",
        img: merged.img || "",
        price: merged.price || "Rs. 0",
        mrp: merged.mrp || "",
        categoryName: merged.categoryName || "Gadget",
        categorySlug: merged.categorySlug || "",
        quantity,
      };

      return [...currentCart, newItem];
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

  const wishlistItems = wishlist
    .map((item) => {
      const slug = typeof item === "string" ? item : item.slug;
      const catalogProduct = findProductBySlug(slug);
      if (!catalogProduct) {
        return typeof item === "object" && item !== null ? item : null;
      }
      return {
        ...catalogProduct,
        ...(typeof item === "object" && item !== null ? item : {}),
      };
    })
    .filter(Boolean);

  const wishlistCount = wishlist.length;

  const isInWishlist = (slugOrProduct) => {
    const slug = typeof slugOrProduct === "string" ? slugOrProduct : slugOrProduct?.slug;
    if (!slug) return false;
    return wishlist.some((item) =>
      typeof item === "string" ? item === slug : item.slug === slug
    );
  };

  const toggleWishlist = (product) => {
    if (!product) return false;
    const slug = typeof product === "string" ? product : product.slug;
    if (!slug) return false;

    let isAdded = false;
    setWishlist((currentWishlist) => {
      const exists = currentWishlist.some((item) =>
        typeof item === "string" ? item === slug : item.slug === slug
      );

      if (exists) {
        isAdded = false;
        return currentWishlist.filter((item) =>
          typeof item === "string" ? item !== slug : item.slug !== slug
        );
      } else {
        isAdded = true;
        const itemToSave =
          typeof product === "object"
            ? {
                slug: product.slug,
                title: product.title,
                img: product.img,
                price: product.price,
                mrp: product.mrp,
                categoryName: product.categoryName,
                categorySlug: product.categorySlug,
                spec: product.spec,
                rating: product.rating,
              }
            : { slug };
        return [...currentWishlist, itemToSave];
      }
    });
    return isAdded;
  };

  const removeFromWishlist = (slug) => {
    setWishlist((currentWishlist) =>
      currentWishlist.filter((item) =>
        typeof item === "string" ? item !== slug : item.slug !== slug
      )
    );
  };

  const clearWishlist = () => {
    setWishlist([]);
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
        wishlist,
        wishlistItems,
        wishlistCount,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
