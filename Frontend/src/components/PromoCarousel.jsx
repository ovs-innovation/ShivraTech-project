import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { apiGetBanners, apiRecordBannerClick } from "../services/api";

const DEFAULT_SLIDES = [
  {
    _id: "default-1",
    title: "Flagship Audio Launch 2026",
    subtitle: "Experience spatial ANC sound tuning with up to 40h battery endurance",
    badge: "NEW LAUNCH",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=80",
    link: "/shop?category=audio",
    buttonText: "Shop Audio",
    bgColor: "#4A0D4F",
  },
  {
    _id: "default-2",
    title: "Ultra Performance Laptops & Monitors",
    subtitle: "Built for developers, creator setups, and high FPS esports gaming",
    badge: "TRENDING TECH",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80",
    link: "/shop?category=pc-accessories",
    buttonText: "Explore Gear",
    bgColor: "#1E1B4B",
  },
  {
    _id: "default-3",
    title: "Flash Tech Deals — Up to 50% Off",
    subtitle: "Verified vendor products with 100% Buyer Protection & fast doorstep delivery",
    badge: "HOT PROMO",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
    link: "/shop",
    buttonText: "Claim Deals",
    bgColor: "#2E1065",
  },
];

const PromoCarousel = () => {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    apiGetBanners("type=promo")
      .then((res) => {
        if (isCurrent && Array.isArray(res.data) && res.data.length > 0) {
          setSlides(res.data);
        }
      })
      .catch(() => {
        // Fallback to default slides gracefully
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  // Auto-advance slides every 5 seconds unless paused on hover
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const goTo = (targetIndex) => {
    setIndex((targetIndex + slides.length) % slides.length);
  };

  const currentSlide = slides[index] || slides[0];

  const handleBannerClick = () => {
    if (currentSlide?._id && !currentSlide._id.startsWith("default-")) {
      apiRecordBannerClick(currentSlide._id).catch(() => {});
    }
  };

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(74,13,79,0.14)] border border-purple-100/60"
          style={{ background: currentSlide.bgColor || "#4A0D4F" }}
        >
          {/* Background image with smooth gradient overlay */}
          <div
            key={currentSlide._id || index}
            className="relative min-h-[260px] sm:min-h-[320px] md:min-h-[380px] w-full bg-cover bg-center transition-all duration-700 animate-slide-fade"
            style={{ backgroundImage: `url(${currentSlide.image || currentSlide.img})` }}
          >
            {(currentSlide.title || currentSlide.subtitle) ? (
              <>
                <div
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{
                    background: `linear-gradient(100deg, ${currentSlide.bgColor || "#4A0D4F"}F0 0%, ${currentSlide.bgColor || "#4A0D4F"}B5 48%, rgba(74,13,79,0.3) 100%)`,
                  }}
                />

                <div className="relative z-10 flex h-full min-h-[260px] sm:min-h-[320px] md:min-h-[380px] flex-col justify-center px-6 py-10 sm:px-12 md:px-16 max-w-2xl text-white">
                  <div className="space-y-3 sm:space-y-4">
                    {currentSlide.badge && (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-[11px] sm:text-xs font-black tracking-widest uppercase backdrop-blur-md border border-white/25">
                        <Sparkles size={12} className="text-amber-300" />
                        <span>{currentSlide.badge}</span>
                      </div>
                    )}

                    {currentSlide.title && (
                      <h3 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight sm:leading-none text-white drop-shadow-sm">
                        {currentSlide.title}
                      </h3>
                    )}

                    {currentSlide.subtitle && (
                      <p className="text-xs sm:text-sm md:text-base text-white/90 max-w-xl leading-relaxed font-medium">
                        {currentSlide.subtitle}
                      </p>
                    )}

                    {currentSlide.buttonText && (
                      <div className="pt-2">
                        <Link
                          to={currentSlide.link || currentSlide.to || "/shop"}
                          onClick={handleBannerClick}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs sm:text-sm font-black shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                          style={{ color: currentSlide.bgColor || "#4A0D4F" }}
                        >
                          <span>{currentSlide.buttonText || currentSlide.cta || "Shop Now"}</span>
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <Link
                to={currentSlide.link || "/shop"}
                onClick={handleBannerClick}
                className="absolute inset-0 block w-full h-full"
                aria-label="View banner offer"
              />
            )}
          </div>

          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous banner"
                onClick={() => goTo(index - 1)}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow-md backdrop-blur-md transition hover:bg-white hover:scale-110 active:scale-90"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>

              <button
                type="button"
                aria-label="Next banner"
                onClick={() => goTo(index + 1)}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow-md backdrop-blur-md transition hover:bg-white hover:scale-110 active:scale-90"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>

              {/* Indicator Dots */}
              <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 z-20">
                {slides.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => goTo(dotIdx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      dotIdx === index ? "w-7 bg-white shadow-sm" : "w-2 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to banner slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideFade {
          from { opacity: 0.7; transform: scale(1.02); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-slide-fade {
          animation: slideFade 500ms ease-out both;
        }
      `}</style>
    </section>
  );
};

export default PromoCarousel;
