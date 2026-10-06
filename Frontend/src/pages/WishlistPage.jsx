import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Package, ShoppingCart, Trash2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useShop } from "../context/useShop";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

export default function WishlistPage() {
  const { wishlistItems, wishlistCount, removeFromWishlist, clearWishlist, addToCart } = useShop();
  const navigate = useNavigate();
  const [addedItems, setAddedItems] = useState({});

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedItems((prev) => ({ ...prev, [product.slug]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.slug]: false }));
    }, 1500);
  };

  const handleAddAllToCart = () => {
    wishlistItems.forEach((item) => {
      addToCart(item);
    });
    navigate("/cart");
  };

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-12 md:py-16 min-h-[75vh]">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 mb-6">
          <Link to="/" className="hover:text-slate-900 transition">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-slate-900 transition">Shop</Link>
          <span>/</span>
          <span className="text-[#4A0D4F] font-bold">Liked Products</span>
        </div>

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-500 border border-rose-200">
                <Heart size={18} fill="currentColor" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Liked Products
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {wishlistCount === 0
                ? "No products saved yet"
                : `${wishlistCount} ${wishlistCount === 1 ? "gadget" : "gadgets"} saved in your collection`}
            </p>
          </div>

          {wishlistCount > 0 && (
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                type="button"
                onClick={clearWishlist}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 size={13} />
                <span>Clear All</span>
              </button>

              <button
                type="button"
                onClick={handleAddAllToCart}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:shadow-md hover:scale-[1.02] active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                }}
              >
                <ShoppingCart size={14} />
                <span>Move All to Cart</span>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {wishlistCount === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-50 text-purple-300 border border-purple-100">
              <Heart size={36} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              Your wishlist is currently empty
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-slate-500 leading-relaxed">
              Explore our smart audio, devices, laptops, and tech accessories. Tap the heart icon on any product to save it here for later.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:scale-[1.02] active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                }}
              >
                <span>Explore Gadgets Catalog</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {wishlistItems.map((product) => {
                const isAdded = addedItems[product.slug];
                const productLink = `/product/${product.slug || "item"}`;

                return (
                  <motion.div
                    key={product.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25 }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-purple-100/90 bg-white p-3 sm:p-4 shadow-xs transition hover:border-purple-200 hover:shadow-[0_14px_36px_rgba(74,13,79,0.09)]"
                  >
                    {/* Top Row: Category tag + Remove Heart button */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="truncate rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#4A0D4F]">
                        {product.categoryName || "Gadget"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.slug)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:scale-110 active:scale-90 transition"
                        title="Remove from wishlist"
                        aria-label="Remove item"
                      >
                        <Heart size={13} fill="currentColor" />
                      </button>
                    </div>

                    {/* Image Area */}
                    <Link
                      to={productLink}
                      className="relative flex h-36 sm:h-44 w-full items-center justify-center rounded-xl bg-[#FAF8FB] p-3 transition group-hover:bg-[#F6EFF7]"
                    >
                      {product.img ? (
                        <img
                          src={product.img}
                          alt={product.title}
                          className="h-full w-full object-contain transition group-hover:scale-105 duration-300 drop-shadow-xs"
                        />
                      ) : (
                        <Package size={36} className="text-purple-300" />
                      )}
                    </Link>

                    {/* Details */}
                    <div className="mt-3 flex-1 flex flex-col justify-between space-y-2">
                      <Link to={productLink} className="block">
                        <h3 className="line-clamp-2 text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-[#4A0D4F] transition leading-snug">
                          {product.title}
                        </h3>
                      </Link>

                      {/* Price & Action Row */}
                      <div className="pt-2 border-t border-purple-50 flex items-center justify-between gap-2">
                        <div>
                          <span className="block text-xs sm:text-sm font-black text-slate-900">
                            {product.price}
                          </span>
                          {product.mrp && (
                            <span className="block text-[10px] text-slate-400 line-through">
                              {product.mrp}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart button */}
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition shadow-xs active:scale-95 ${
                            isAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-[#4A0D4F] text-white hover:bg-[#380B3C]"
                          }`}
                          title="Add to cart"
                        >
                          {isAdded ? (
                            <>
                              <Check size={12} strokeWidth={3} />
                              <span className="hidden sm:inline">Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={12} />
                              <span className="hidden sm:inline">Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
