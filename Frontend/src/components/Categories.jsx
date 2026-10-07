import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useCategories from "../hooks/useCategories";

const Categories = () => {
  const scrollRef = useRef(null);
  const { categories, error } = useCategories();

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white py-8 sm:py-12 border-b border-purple-100/60 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
        
        {/* Header with Title and View All */}
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Shop by Categories
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#4A0D4F] hover:text-[#B35FA3] transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>

            {/* Scroll buttons for desktop */}
            <div className="hidden md:flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                aria-label="Scroll left"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-purple-200/80 bg-white text-slate-600 shadow-sm transition hover:bg-purple-50 hover:text-[#4A0D4F]"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                aria-label="Scroll right"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-purple-200/80 bg-white text-slate-600 shadow-sm transition hover:bg-purple-50 hover:text-[#4A0D4F]"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Row (Matching Reference Image 1 with Stagger Animation on Scroll) */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto pb-2 pt-0.5 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {sortedCategories.map((item, idx) => (
            <motion.div
              key={item._id || item.slug}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.06 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="flex-shrink-0 snap-start"
            >
              <Link
                to={`/categories/${item.slug}`}
                className="group relative flex flex-col items-center w-28 xs:w-32 sm:w-40 md:w-44 rounded-2xl border border-slate-100 bg-[#F8F9FA] p-2.5 sm:p-4 transition-all duration-300 hover:border-purple-200 hover:bg-white hover:shadow-[0_12px_30px_rgba(74,13,79,0.1)] text-center"
              >
                {item.featured && (
                  <span className="absolute top-2 right-2 rounded-full bg-[#4A0D4F] text-[8px] font-black text-white px-2 py-0.5 shadow-xs z-10">
                    ★ FEATURED
                  </span>
                )}
                {/* Product Visual Container */}
                <div className="relative flex h-20 w-20 xs:h-22 xs:w-22 sm:h-28 sm:w-28 items-center justify-center rounded-xl bg-white p-1.5 sm:p-2 shadow-xs transition-transform duration-300 group-hover:scale-105">
                  {item.icon ? (
                    <span className="text-4xl" aria-hidden="true">{item.icon}</span>
                  ) : (
                    <img
                      src={item.img}
                      alt={item.name}
                      className="h-full w-full object-contain drop-shadow-xs"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Label */}
                <span className="mt-2 sm:mt-3 text-[11px] xs:text-xs sm:text-[13.5px] font-bold text-slate-800 group-hover:text-[#4A0D4F] transition-colors truncate w-full">
                  {item.name}
                </span>
              </Link>
            </motion.div>
          ))}

          {error && (
            <p className="py-4 text-xs font-semibold text-rose-600" role="status">
              {error}
            </p>
          )}

          {/* Rightmost Navigation Card with Arrow Circle (Matching Reference 1) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="flex-shrink-0 self-stretch snap-start"
          >
            <Link
              to="/shop"
              className="group flex flex-col items-center justify-center h-full w-20 sm:w-32 rounded-2xl border border-purple-100 bg-[#F4EBF5] p-2.5 sm:p-3.5 transition-all duration-300 hover:bg-[#EBD7ED]"
              aria-label="View all categories"
            >
              <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#26052B] text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#4A0D4F]">
                <ArrowRight size={16} strokeWidth={2.5} />
              </div>
            </Link>
          </motion.div>
        </div>

      </div>
    </motion.section>
  );
};

export default Categories;
