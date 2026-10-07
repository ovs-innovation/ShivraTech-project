import { useEffect, useState } from "react";
import {
  findProductBySlug,
  formatPrice,
  normalizeApiProduct,
  parsePrice,
} from "../data/products";
import { apiGetProducts } from "../services/api";
import ShopContext from "./shop-context";

const CART_STORAGE_KEY = "shivratech-cart";
const ORDERS_STORAGE_KEY = "shivratech-orders";
const WISHLIST_STORAGE_KEY = "shivratech-wishlist";
// Bump this version whenever the cart schema changes to auto-clear stale data
const CART_VERSION = "v4";
const CART_VERSION_KEY = "shivratech-cart-version";

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------
const readStorage = (key, fallback = []) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveStorage = (key, value) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

// ---------------------------------------------------------------------------
// Price helpers
// ---------------------------------------------------------------------------

/** Coerces any price value (number | formatted string) → number */
const toNumericPrice = (raw) => {
  if (typeof raw === "number") return isNaN(raw) ? 0 : raw;
  if (!raw) return 0;
  return parsePrice(String(raw));
};

/** Migrates a raw cart array loaded from localStorage to the canonical format.
 *  Ensures every item has a numeric `price`.
 */
const migrateCart = (rawCart) => {
  if (!Array.isArray(rawCart)) return [];
  return rawCart
    .map((item) => {
      if (!item || !item.slug) return null;

      const rawPrice = item._numericPrice ?? item.price;
      const numericPrice = toNumericPrice(rawPrice);

      // If price is still 0 after parsing, try to recover from static catalog
      const catalogProduct = findProductBySlug(item.slug);
      const recoveredPrice =
        numericPrice === 0 && catalogProduct
          ? toNumericPrice(catalogProduct.price)
          : numericPrice;

      return {
        ...item,
        price: recoveredPrice,
        _numericPrice: recoveredPrice,
        quantity: item.quantity || 1,
      };
    })
    .filter(Boolean);
};

// ---------------------------------------------------------------------------
// ShopProvider
// ---------------------------------------------------------------------------
export const ShopProvider = ({ children }) => {
  // Live products loaded from backend to enrich database items that aren't in static catalog
  const [liveCatalog, setLiveCatalog] = useState([]);

  useEffect(() => {
    let isCurrent = true;
    apiGetProducts("limit=1000")
      .then((res) => {
        if (isCurrent && res.data?.products) {
          setLiveCatalog(res.data.products.map(normalizeApiProduct));
        }
      })
      .catch(() => {});
    return () => {
      isCurrent = false;
    };
  }, []);

  const resolveProduct = (slug) => {
    return findProductBySlug(slug) || liveCatalog.find((p) => p.slug === slug);
  };

  const [cart, setCart] = useState(() => {
    const storedVersion = readStorage(CART_VERSION_KEY, null);
    if (storedVersion !== CART_VERSION) {
      saveStorage(CART_VERSION_KEY, CART_VERSION);
      const rawCart = readStorage(CART_STORAGE_KEY, []);
      const migrated = migrateCart(rawCart);
      saveStorage(CART_STORAGE_KEY, migrated);
      return migrated;
    }
    return migrateCart(readStorage(CART_STORAGE_KEY, []));
  });

  const [orders, setOrders] = useState(() => readStorage(ORDERS_STORAGE_KEY, []));
  const [wishlist, setWishlist] = useState(() => readStorage(WISHLIST_STORAGE_KEY, []));

  // Persist cart / orders / wishlist whenever they change
  useEffect(() => { saveStorage(CART_STORAGE_KEY, cart); }, [cart]);
  useEffect(() => { saveStorage(ORDERS_STORAGE_KEY, orders); }, [orders]);
  useEffect(() => { saveStorage(WISHLIST_STORAGE_KEY, wishlist); }, [wishlist]);

  // Auto-heal items in cart that may have had price 0 when liveCatalog becomes available
  useEffect(() => {
    if (liveCatalog.length === 0) return;
    setCart((currentCart) => {
      let changed = false;
      const updated = currentCart.map((item) => {
        const numPrice = toNumericPrice(item.price);
        if (numPrice <= 0) {
          const found = resolveProduct(item.slug);
          if (found && toNumericPrice(found.price) > 0) {
            changed = true;
            return {
              ...item,
              price: toNumericPrice(found.price),
              _numericPrice: toNumericPrice(found.price),
              mrp: toNumericPrice(found.mrp) || item.mrp || toNumericPrice(found.price),
              title: item.title && item.title !== "Tech Gadget" ? item.title : found.title,
              img: item.img || found.img || "",
              seller: item.seller || found.seller?._id || found.seller || null,
              sellerName: item.sellerName || found.sellerName || found.seller?.storeName || found.seller?.name || "",
              storeName: item.storeName || found.storeName || found.seller?.storeName || found.sellerName || "",
            };
          }
        }
        return item;
      });
      return changed ? updated : currentCart;
    });
  }, [liveCatalog]);

  // ---------------------------------------------------------------------------
  // Derived cart data
  // ---------------------------------------------------------------------------
  const cartItems = cart
    .map((item) => {
      const catalogProduct = resolveProduct(item.slug);

      const parsedPrice = toNumericPrice(item._numericPrice ?? item.price);

      // If stored price is 0 but catalog has a price, use catalog price
      const finalPrice =
        (parsedPrice === 0 || !parsedPrice) && catalogProduct
          ? toNumericPrice(catalogProduct.price)
          : parsedPrice;

      const base = catalogProduct ? { ...catalogProduct, ...item } : { ...item };

      if (!base.title && !base.slug) return null;

      const qty = item.quantity || 1;

      return {
        ...base,
        title: base.title || "Tech Gadget",
        price: formatPrice(finalPrice), // always formatted for display
        _numericPrice: finalPrice, // internal numeric value
        quantity: qty,
        lineTotal: finalPrice * qty,
        seller: item.seller || base.seller || null,
        sellerName: item.sellerName || base.sellerName || "",
        storeName: item.storeName || base.storeName || item.sellerName || base.sellerName || "",
      };
    })
    .filter(Boolean);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

  // ---------------------------------------------------------------------------
  // Cart mutations
  // ---------------------------------------------------------------------------
  const addToCart = (product, quantity = 1) => {
    if (!product) return;
    const slug = product.slug || (typeof product === "string" ? product : null);
    if (!slug) return;

    const catalogProduct = resolveProduct(slug);
    const merged = {
      ...(catalogProduct || {}),
      ...(typeof product === "object" ? product : {}),
    };

    // Extract best possible numeric price from all sources
    const incomingPrice = toNumericPrice(
      product.price ?? product._numericPrice ?? product.priceFormatted ?? merged.price ?? catalogProduct?.price
    );

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.slug === slug);

      if (existingItem) {
        return currentCart.map((item) =>
          item.slug === slug
            ? {
                ...item,
                price: incomingPrice > 0 ? incomingPrice : (toNumericPrice(item.price) || incomingPrice),
                _numericPrice: incomingPrice > 0 ? incomingPrice : (toNumericPrice(item.price) || incomingPrice),
                mrp: toNumericPrice(merged.mrp) || toNumericPrice(item.mrp) || 0,
                title: item.title && item.title !== "Tech Gadget" ? item.title : (merged.title || item.title),
                img: item.img || merged.img || (merged.images && merged.images[0]) || "",
                quantity: (item.quantity || 1) + quantity,
                seller: item.seller || merged.seller || product.seller || null,
                sellerName: item.sellerName || merged.sellerName || product.sellerName || "",
                storeName: item.storeName || merged.storeName || product.storeName || product.sellerName || "",
              }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          slug,
          _id: merged._id || merged.id || null,
          title: merged.title || "Tech Gadget",
          img: merged.img || (merged.images && merged.images[0]) || "",
          price: incomingPrice, // guaranteed numeric!
          _numericPrice: incomingPrice,
          mrp: toNumericPrice(merged.mrp) || 0,
          categoryName: merged.categoryName || "Gadget",
          categorySlug: merged.categorySlug || "",
          seller: merged.seller || product.seller || null,
          sellerName: merged.sellerName || product.sellerName || "",
          storeName: merged.storeName || product.storeName || product.sellerName || "",
          quantity,
        },
      ];
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

  const clearCart = () => { setCart([]); };

  // ---------------------------------------------------------------------------
  // Orders
  // ---------------------------------------------------------------------------
  const placeOrder = () => {
    if (cartItems.length === 0) return null;

    const newOrder = {
      id: `ST-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      status: "Order placed",
      total: cartSubtotal,
      totalLabel: formatPrice(cartSubtotal),
      items: cartItems.map((item) => ({
        slug: item.slug,
        title: item.title,
        img: item.img,
        price: item.price,         // formatted string for display in order history
        quantity: item.quantity,
        categoryName: item.categoryName,
      })),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    return newOrder;
  };

  // ---------------------------------------------------------------------------
  // Wishlist
  // ---------------------------------------------------------------------------
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
    const slug =
      typeof slugOrProduct === "string" ? slugOrProduct : slugOrProduct?.slug;
    if (!slug) return false;
    return wishlist.some((item) =>
      typeof item === "string" ? item === slug : item.slug === slug,
    );
  };

  const toggleWishlist = (product) => {
    if (!product) return false;
    const slug = typeof product === "string" ? product : product.slug;
    if (!slug) return false;

    let isAdded = false;
    setWishlist((prev) => {
      const exists = prev.some((item) =>
        typeof item === "string" ? item === slug : item.slug === slug,
      );
      if (exists) {
        isAdded = false;
        return prev.filter((item) =>
          typeof item === "string" ? item !== slug : item.slug !== slug,
        );
      }
      isAdded = true;
      const itemToSave =
        typeof product === "object"
          ? {
              slug: product.slug,
              title: product.title,
              img: product.img,
              price: toNumericPrice(product.price),
              mrp: toNumericPrice(product.mrp) || 0,
              categoryName: product.categoryName,
              categorySlug: product.categorySlug,
              spec: product.spec,
              rating: product.rating,
            }
          : { slug };
      return [...prev, itemToSave];
    });
    return isAdded;
  };

  const removeFromWishlist = (slug) => {
    setWishlist((prev) =>
      prev.filter((item) =>
        typeof item === "string" ? item !== slug : item.slug !== slug,
      ),
    );
  };

  const clearWishlist = () => { setWishlist([]); };

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------
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
