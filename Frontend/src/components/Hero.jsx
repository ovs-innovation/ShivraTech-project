import { Fragment, useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import heroVideo from "../assets/hero.mp4";
import rightHero from "../assets/rightHero.png";
import rightHero1 from "../assets/rightHero1.png";
import rightHero2 from "../assets/rightHero2.png";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const heroSlides = [
  {
    src: rightHero,
    alt: "Featured ShivraTech audio and mobile accessories bundle",
  },
  {
    src: rightHero1,
    alt: "Featured ShivraTech gadget showcase",
  },
  {
    src: rightHero2,
    alt: "Featured ShivraTech electronics collection",
  },
];

const sellerHighlights = [
  "No setup fee",
  "Same-day delivery",
  "Buyer protection",
];

const tickers = [
  "FREE first ad slot this week",
  "Wearables trending +38%",
  "500+ orders delivered today",
  "New: Sponsored listings now live",
  "Smart Audio demand up 22%",
  "Car Tech low-competition ad slots open",
  "4.9-star average seller rating",
];

const getNextAvailableSlide = (currentIndex, failedSlides) => {
  for (let step = 1; step <= heroSlides.length; step += 1) {
    const nextIndex = (currentIndex + step) % heroSlides.length;

    if (!failedSlides[nextIndex]) {
      return nextIndex;
    }
  }

  return -1;
};

const Hero = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [failedSlides, setFailedSlides] = useState({});

  const availableSlideCount = heroSlides.filter(
    (_, index) => !failedSlides[index],
  ).length;

  useEffect(() => {
    if (availableSlideCount <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((currentSlide) => {
        const nextSlide = getNextAvailableSlide(currentSlide, failedSlides);
        return nextSlide === -1 ? currentSlide : nextSlide;
      });
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [availableSlideCount, failedSlides]);

  const handleSlideError = (index) => {
    setFailedSlides((current) => {
      if (current[index]) {
        return current;
      }

      const nextFailedSlides = { ...current, [index]: true };

      if (index === activeSlide) {
        window.setTimeout(() => {
          const nextSlide = getNextAvailableSlide(index, nextFailedSlides);

          if (nextSlide !== -1 && nextSlide !== index) {
            setActiveSlide(nextSlide);
          }
        }, 0);
      }

      return nextFailedSlides;
    });
  };

  const hasVisibleSlides = availableSlideCount > 0;

  return (
    <section
      className="relative flex min-h-[calc(100svh-68px)] flex-col overflow-hidden bg-white"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <video
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0.26, zIndex: 0 }}
      />

      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(135deg, rgba(74,13,79,0.20) 0%, rgba(255,255,255,0.32) 45%, rgba(255,255,255,0.08) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(74,13,79,0.12) 0%, rgba(255,255,255,0.16) 55%, rgba(255,255,255,0.08) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 pb-14 pt-16 sm:px-6 sm:pb-16 sm:pt-20 md:px-8 lg:grid-cols-[1fr_400px] lg:gap-10 lg:px-12 lg:pb-20 lg:pt-24">
        <div className="flex flex-col gap-7">
          <div
            className="flex w-fit items-center gap-2 rounded-full px-4 py-2 shadow-sm"
            style={{ borderColor: ACCENT, backgroundColor: "#f4e8f3" }}
          >
            <span
              className="text-xs font-bold uppercase tracking-[.12em]"
              style={{ color: PRIMARY }}
            >
              India&apos;s #1 Gadget Marketplace
            </span>
          </div>

          <h1
            className="leading-[.95] tracking-wide"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <span className="block text-[clamp(48px,6.5vw,84px)] text-slate-900">
              SELL YOUR
            </span>
            <span
              className="block text-[clamp(56px,7.5vw,98px)]"
              style={{ color: PRIMARY }}
            >
              GADGETS
            </span>
            <span className="block text-[clamp(48px,6.5vw,84px)] text-slate-900">
              REACH{" "}
              <span
                style={{ WebkitTextStroke: "2.2px #4A0D4F", color: "white" }}
              >
                MILLIONS
              </span>
            </span>
          </h1>

          <p className="max-w-[540px] text-[15px] leading-[1.7] text-slate-700 sm:text-[17px]">
            List your products. Run{" "}
            <span className="font-semibold text-slate-900">hyper-local ads</span>
            . Deliver within hours. ShivraTech connects your store with{" "}
            <span className="font-semibold text-slate-900">
              real buyers nearby
            </span>{" "}
            and routes them into a cleaner marketplace flow.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-full px-8 py-4 text-[15px] font-black text-white shadow-lg transition hover:-translate-y-[3px] sm:w-auto"
                style={{
                  background: "linear-gradient(135deg,#4A0D4F,#B35FA3)",
                  boxShadow: "0 12px 28px rgba(74,13,79,0.35)",
                }}
              >
                Start selling free
                <ArrowRight size={17} />
              </Link>
              <Link
                to="/shop"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border px-7 py-4 text-[15px] font-semibold transition hover:bg-[#f4e8f3] sm:w-auto"
                style={{ borderColor: ACCENT, color: PRIMARY }}
              >
                Browse products
                <ArrowUpRight size={17} />
              </Link>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              {sellerHighlights.map((item, index) => (
                <Fragment key={item}>
                  <div className="flex items-center gap-2 text-[13px]">
                    <div
                      className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: "#f4e8f3" }}
                    >
                      <CheckCircle2 size={10} style={{ color: PRIMARY }} />
                    </div>
                    <span className="font-semibold text-slate-600">{item}</span>
                  </div>
                  {index < sellerHighlights.length - 1 ? (
                    <div
                      className="hidden h-3.5 w-px sm:block"
                      style={{ backgroundColor: "#f4e8f3" }}
                    />
                  ) : null}
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-3xl p-4 shadow-[0_20px_48px_rgba(74,13,79,0.22)] sm:max-w-md sm:p-5 lg:max-w-lg"
            style={{
              background: `linear-gradient(150deg, ${PRIMARY} 0%, ${ACCENT} 65%, ${PRIMARY} 100%)`,
            }}
          >
            <div className="absolute inset-6 rounded-2xl border border-white/15" />
            <div className="relative z-10 h-[280px] w-full overflow-hidden sm:h-[340px] lg:h-[420px]">
              {heroSlides.map(({ src, alt }, index) =>
                failedSlides[index] ? null : (
                  <img
                    key={src}
                    src={src}
                    alt={alt}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    onError={() => handleSlideError(index)}
                    className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl transition-all duration-700"
                    style={{
                      opacity: activeSlide === index ? 1 : 0,
                      transform:
                        activeSlide === index ? "scale(1)" : "scale(0.98)",
                    }}
                  />
                ),
              )}

              {!hasVisibleSlides ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 text-center backdrop-blur-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                      Featured preview
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      Product visuals are loading.
                    </p>
                    <p className="mt-2 text-sm text-white/80">
                      Please check back in a moment.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="relative z-10 mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                  Featured drop
                </p>
                <p className="text-lg font-bold text-white">Endurance bundle</p>
                <p className="text-sm text-white/80">
                  45W Fast - 7000mAh - 5G ready
                </p>
              </div>
              <Link
                to="/shop"
                className="w-full rounded-full bg-white px-5 py-2 text-center text-sm font-semibold text-[#4A0D4F] shadow-md transition hover:-translate-y-0.5 sm:w-auto"
              >
                Buy now
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative z-10 overflow-hidden border-t py-3"
        style={{ borderColor: ACCENT, backgroundColor: "#f4e8f3" }}
      >
        <div
          className="flex w-max"
          style={{ animation: "heroTicker 28s linear infinite" }}
        >
          {[...tickers, ...tickers].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-2.5 whitespace-nowrap px-5 text-[11px] font-bold uppercase tracking-[.07em] sm:px-8 sm:text-[12px]"
              style={{ color: PRIMARY }}
            >
              {item}
              <span
                className="h-[5px] w-[5px] flex-shrink-0 rounded-full"
                style={{ backgroundColor: ACCENT }}
              />
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        @keyframes heroTicker {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
