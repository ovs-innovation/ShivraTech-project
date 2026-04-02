import React, { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import heroVideo from "../assets/hero.mp4";
import rightHero from "../assets/righthero.png";
import rightHero1 from "../assets/righthero1.png";
import rightHero2 from "../assets/righthero2.png";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";
const heroImages = [rightHero, rightHero1, rightHero2];

const liveAds = [
  { icon: "🎧", name: "SoundCore Pro X", meta: "Electronics · Agra · Running", views: "2.4k" },
  { icon: "⌚", name: "SmartBand Ultra X2", meta: "Wearables · Delhi NCR · Boosted", views: "5.1k" },
  { icon: "📷", name: "SnapCam Mini 4K", meta: "Cameras · Noida · Sponsored", views: "3.8k" },
];

const tickers = [
  "FREE first ad slot this week",
  "Wearables trending +38%",
  "500+ orders delivered today",
  "New: Sponsored listings now live",
  "Smart Audio demand up 22%",
  "Car Tech — low competition ad slots open",
  "4.9★ average seller rating",
];

const Hero = () => {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSlide((s) => (s + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Background video */}
      <video
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0.26, zIndex: 0 }}
      />

      {/* Overlays */}
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

      {/* Content */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-12 pb-20 pt-28 lg:grid-cols-[1fr_400px] lg:pt-32">
        {/* Left */}
        <div className="flex flex-col gap-7">
          <div
            className="flex w-fit items-center gap-2 rounded-full px-4 py-2 shadow-sm"
            style={{ borderColor: ACCENT, backgroundColor: "#f4e8f3" }}
          >
            <span className="text-xs font-bold uppercase tracking-[.12em]" style={{ color: PRIMARY }}>
              India's #1 Gadget Marketplace
            </span>
          </div>

          <h1 className="leading-[.95] tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            <span className="block text-[clamp(48px,6.5vw,84px)] text-slate-900">SELL YOUR</span>
            <span className="block text-[clamp(56px,7.5vw,98px)]" style={{ color: PRIMARY }}>GADGETS</span>
            <span className="block text-[clamp(48px,6.5vw,84px)] text-slate-900">
              REACH{" "}
              <span style={{ WebkitTextStroke: "2.2px #4A0D4F", color: "white" }}>MILLIONS</span>
            </span>
          </h1>

          <p className="max-w-[540px] text-[17px] leading-[1.7] text-slate-700">
            List your products. Run <span className="font-semibold text-slate-900">hyper-local ads</span>. Deliver
            within hours. ShivraTech connects your store with <span className="font-semibold text-slate-900">real buyers nearby</span> — same city, same day.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-[15px] font-black text-white transition hover:-translate-y-[3px] shadow-lg"
                style={{ background: "linear-gradient(135deg,#4A0D4F,#B35FA3)", boxShadow: "0 12px 28px rgba(74,13,79,0.35)" }}
              >
                Start Selling Free <ArrowRight size={17} />
              </button>
              <button
                className="inline-flex items-center gap-2.5 rounded-full border px-7 py-4 text-[15px] font-semibold transition"
                style={{ borderColor: ACCENT, color: PRIMARY }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f4e8f3")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Browse Products <ArrowUpRight size={17} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {["No setup fee", "Same-day delivery", "Buyer protection"].map((t, i) => (
                <React.Fragment key={t}>
                  <div className="flex items-center gap-2 text-[13px]">
                    <div
                      className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: "#f4e8f3" }}
                    >
                      <CheckCircle2 size={10} style={{ color: PRIMARY }} />
                    </div>
                    <span className="font-semibold text-slate-600">{t}</span>
                  </div>
                  {i < 2 && <div className="h-3.5 w-px" style={{ backgroundColor: "#f4e8f3" }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right feature block with rotating images (background unchanged) */}
        <div className="flex justify-center">
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl p-5 shadow-[0_20px_48px_rgba(74,13,79,0.22)]"
            style={{ background: `linear-gradient(150deg,${PRIMARY} 0%, ${ACCENT} 65%, ${PRIMARY} 100%)` }}
          >
            <div className="absolute inset-6 rounded-2xl border border-white/15" />
            <div className="relative z-10 h-[420px] w-full overflow-hidden">
              {heroImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="Featured product"
                  className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl transition-opacity duration-700"
                  style={{ opacity: slide === idx ? 1 : 0 }}
                />
              ))}
            </div>
            <div className="relative z-10 mt-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                  Featured drop
                </p>
                <p className="text-lg font-bold text-white">Endurance bundle</p>
                <p className="text-sm text-white/80">45W Fast · 7000mAh · 5G ready</p>
              </div>
              <button
                className="rounded-full px-5 py-2 text-sm font-semibold text-[#4A0D4F] bg-white shadow-md transition hover:-translate-y-0.5"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div
        className="relative z-10 overflow-hidden border-t py-3"
        style={{ borderColor: ACCENT, backgroundColor: "#f4e8f3" }}
      >
        <div className="flex w-max" style={{ animation: "heroTicker 28s linear infinite" }}>
          {[...tickers, ...tickers].map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2.5 whitespace-nowrap px-8 text-[12px] font-bold uppercase tracking-[.07em]"
              style={{ color: PRIMARY }}
            >
              {t}
              <span className="h-[5px] w-[5px] flex-shrink-0 rounded-full" style={{ backgroundColor: ACCENT }} />
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes heroTicker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
