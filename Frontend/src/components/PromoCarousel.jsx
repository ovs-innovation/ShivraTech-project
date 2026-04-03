import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    title: "OPPO K14 5G",
    subtitle: "The endurance powerhouse",
    cta: "Buy now",
    to: "/shop",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Studio Audio",
    subtitle: "Immersive sound for every room",
    cta: "Shop speakers",
    to: "/categories#audio",
    img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Wearables Wave",
    subtitle: "Track, train, and stay ahead",
    cta: "Explore lifestyle",
    to: "/categories#lifestyle",
    img: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Desk Essentials",
    subtitle: "Power your productivity setup",
    cta: "Build your desk",
    to: "/categories#pc-accessories",
    img: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Drive Smart",
    subtitle: "Charge, mount, and navigate",
    cta: "Upgrade car tech",
    to: "/categories#car-accessories",
    img: "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1600&q=80",
  },
];

const PromoCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current - 1 + slides.length) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const goTo = (targetIndex) => setIndex((targetIndex + slides.length) % slides.length);
  const slide = slides[index];

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div
          className="relative overflow-hidden rounded-3xl shadow-xl"
          style={{ background: "#4A0D4F" }}
        >
          <div
            key={index}
            className="h-[300px] w-full animate-slide-left bg-cover bg-center transition-all duration-500"
            style={{ backgroundImage: `url(${slide.img})` }}
          >
            <div className="flex h-full w-full items-center gap-8 bg-gradient-to-r from-[#4A0D4F]/85 via-[#B35FA3]/55 to-[#B35FA3]/25 px-8 md:px-12">
              <div className="max-w-xl space-y-3 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
                  Spotlight
                </p>
                <h3 className="text-3xl font-bold md:text-4xl">{slide.title}</h3>
                <p className="text-sm text-white/80 md:text-base">
                  {slide.subtitle}
                </p>
                <Link
                  to={slide.to}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold shadow-md transition hover:-translate-y-0.5"
                  style={{ color: "#4A0D4F" }}
                >
                  {slide.cta}
                  <span className="text-base">-&gt;</span>
                </Link>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(index - 1)}
            className="absolute left-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-[#4A0D4F] shadow hover:bg-white"
          >
            {"<"}
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(index + 1)}
            className="absolute right-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-[#4A0D4F] shadow hover:bg-white"
          >
            {">"}
          </button>

          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
            {slides.map((_, slideIndex) => (
              <button
                key={slideIndex}
                type="button"
                onClick={() => goTo(slideIndex)}
                className={`h-2.5 rounded-full transition ${
                  slideIndex === index ? "w-5 bg-white" : "w-2.5 bg-white/70"
                }`}
                aria-label={`Go to slide ${slideIndex + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(12%); opacity: 0.4; }
          to   { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-left {
          animation: slideLeft 400ms ease both;
        }
      `}</style>
    </section>
  );
};

export default PromoCarousel;
