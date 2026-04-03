import { ArrowRight, Star } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useShop } from "../context/useShop";
import { allProducts, findProductBySlug } from "../data/products";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const ProductDetails = () => {
  const { productSlug = "" } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useShop();
  const product = findProductBySlug(productSlug);

  if (!product) {
    return (
      <section className="px-6 py-16">
        <div
          className="mx-auto max-w-3xl rounded-[30px] border px-8 py-12 text-center"
          style={{ borderColor: "#eadbe6", backgroundColor: "#fff" }}
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: PRIMARY }}
          >
            Product not found
          </p>
          <h1 className="mt-4 text-3xl font-black text-slate-900">
            That product does not exist.
          </h1>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/shop"
              className="rounded-full px-5 py-3 text-sm font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
              }}
            >
              Back to shop
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const relatedProducts = allProducts
    .filter(
      (item) =>
        item.categorySlug === product.categorySlug && item.slug !== product.slug,
    )
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate("/cart");
  };

  return (
    <section className="px-6 py-10 md:py-14">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-900">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-slate-900">
            Shop
          </Link>
          <span>/</span>
          <Link to={`/categories#${product.categorySlug}`} className="hover:text-slate-900">
            {product.categoryName}
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div
            className="rounded-[32px] border p-8"
            style={{
              borderColor: "#eadbe6",
              background:
                "linear-gradient(180deg, rgba(251,246,250,1) 0%, rgba(255,255,255,1) 100%)",
            }}
          >
            <img
              src={product.img}
              alt={product.title}
              className="mx-auto h-[420px] w-full object-contain"
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <Link
                to={`/categories#${product.categorySlug}`}
                className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
                style={{ backgroundColor: "#f4e8f3", color: PRIMARY }}
              >
                {product.categoryName}
              </Link>
              <h1 className="text-4xl font-black leading-tight text-slate-900">
                {product.title}
              </h1>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, starIdx) => (
                  <Star
                    key={starIdx}
                    size={17}
                    fill={starIdx < product.rating ? "#f59e0b" : "transparent"}
                    color={starIdx < product.rating ? "#f59e0b" : "#d1d5db"}
                  />
                ))}
                <span className="text-sm font-semibold text-slate-600">
                  {product.reviews} reviews
                </span>
              </div>
            </div>

            <div
              className="rounded-[24px] border p-6"
              style={{ borderColor: "#eadbe6", backgroundColor: "#fff" }}
            >
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl font-black text-slate-900">
                  {product.price}
                </span>
                <span className="text-lg font-semibold text-emerald-600">
                  {product.off}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  MRP {product.mrp}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {product.shortDescription}
              </p>
              <div
                className="mt-5 rounded-[18px] px-4 py-3 text-sm font-semibold"
                style={{ backgroundColor: "#fbf6fa", color: PRIMARY }}
              >
                {product.promo}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {product.highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[18px] border px-4 py-3 text-sm font-semibold text-slate-700"
                  style={{ borderColor: "#eadbe6", backgroundColor: "#fff" }}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleBuyNow}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                }}
              >
                Buy now
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="rounded-full border px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
                style={{ borderColor: ACCENT, color: PRIMARY }}
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div
            className="rounded-[28px] border p-6"
            style={{ borderColor: "#eadbe6", backgroundColor: "#fff" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: PRIMARY }}
            >
              Product details
            </p>
            <div className="mt-5 space-y-4">
              {product.specs.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 border-b pb-4 text-sm"
                  style={{ borderColor: "#f0e7ef" }}
                >
                  <span className="font-semibold text-slate-500">{label}</span>
                  <span className="text-right font-semibold text-slate-900">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-[28px] border p-6"
            style={{ borderColor: "#eadbe6", backgroundColor: "#fff" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: PRIMARY }}
            >
              Similar products
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {relatedProducts.map((item) => (
                <Link
                  key={item.slug}
                  to={`/product/${item.slug}`}
                  className="rounded-[22px] border p-4 transition hover:-translate-y-1"
                  style={{ borderColor: "#eadbe6" }}
                >
                  <div
                    className="rounded-[18px]"
                    style={{ backgroundColor: "#fbf6fa" }}
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      className="h-40 w-full object-contain p-4"
                    />
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    {item.categoryName}
                  </p>
                  <h2 className="mt-2 text-base font-bold leading-6 text-slate-900 line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm font-semibold" style={{ color: PRIMARY }}>
                    {item.price}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
