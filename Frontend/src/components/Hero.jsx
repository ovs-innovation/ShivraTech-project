import { useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Globe,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import heroRobot from "../assets/heroRobot.png";
import robotVacuum from "../assets/robotVacuum.png";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const sellerHighlights = [
  "No setup fee",
  "Same-day delivery",
  "100% Buyer protection",
];

const tickers = [
  "FREE first ad slot this week",
  "Smart Audio demand up 38%",
  "500+ orders delivered today",
  "New: Sponsored listings now live",
  "Wearables & ANC Tech trending +24%",
  "Car Tech ad slots open",
  "4.9-star average seller rating",
];

const Hero = () => {
  const [robotLoaded, setRobotLoaded] = useState(true);

  return (
    <section className="relative flex min-h-[calc(100svh-68px)] sm:min-h-[calc(100svh-78px)] flex-col justify-between overflow-hidden bg-[#FBF8FC] text-slate-900 selection:bg-[#B35FA3] selection:text-white">
      {/* Ambient Atmospheric Glows */}
      <div className="ambient-glow-layer pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute -left-16 top-4 h-[320px] w-[320px] sm:h-[450px] sm:w-[450px] rounded-full opacity-55 blur-[90px] sm:blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(179,95,163,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute right-0 top-0 h-[360px] w-[360px] sm:h-[500px] sm:w-[500px] rounded-full opacity-50 blur-[100px] sm:blur-[130px]"
          style={{
            background:
              "radial-gradient(circle, rgba(74,13,79,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[450px] w-[450px] sm:h-[600px] sm:w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-[110px] sm:blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, rgba(179,95,163,0.14) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Main Hero Content Area (Cleanly structured for all screen sizes) */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4">
        {/* Top Editorial Badge */}
        <div className="flex justify-center pt-0.5 pb-2">
          {/* <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-purple-200/80 bg-white/95 px-3 sm:px-4 py-1.5 shadow-[0_2px_10px_rgba(74,13,79,0.05)] backdrop-blur-md">
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#B35FA3]" />
            <span
              className="text-[9px] xs:text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[.14em] sm:tracking-[.18em]"
              style={{ color: PRIMARY }}
            >
              India&apos;s #1 Gadget & Rare Tech Marketplace
            </span>
          </div> */}
        </div>

        {/* ========================================================================= */}
        {/* HERO STAGE: BALANCED HEADLINE + ROBOT + VISIBLE BOTTOM BUTTON             */}
        {/* ========================================================================= */}
        <div className="relative mx-auto flex w-full max-w-5xl flex-1 items-center justify-center min-h-[360px] xs:min-h-[400px] sm:min-h-[480px] md:min-h-[520px] lg:min-h-[560px] my-auto">
          {/* LAYER 1: ROBOT CENTER STAGE */}
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="relative flex items-center justify-center translate-y-[20px] sm:translate-y-[28px] lg:translate-y-[34px]">
              {/* Soft ground ambient shadow */}
              <div
                className="absolute -bottom-1 sm:-bottom-3 h-5 sm:h-10 w-32 xs:w-44 sm:w-64 rounded-full bg-[#4A0D4F]/20 blur-md sm:blur-xl pointer-events-none"
                style={{
                  transform: "scaleY(0.5)",
                }}
              />

              {robotLoaded && (
                <img
                  src={heroRobot}
                  alt="Shivra AI Robot"
                  onError={() => setRobotLoaded(false)}
                  className="h-[250px] xs:h-[290px] sm:h-[370px] md:h-[440px] lg:h-[500px] xl:h-[540px] w-auto max-w-full object-contain drop-shadow-[0_20px_40px_rgba(74,13,79,0.22)] select-none pointer-events-auto"
                />
              )}
            </div>
          </div>

          {/* LAYER 2: OVERSIZED HEADING (CLEAR TWO-LINE HIERARCHY WITH PROPER GAP) */}
          <div className="hero-title pointer-events-none absolute inset-x-0 top-[20%] xs:top-[22%] sm:top-[24%] md:top-[25%] -translate-y-1/2 z-10 mx-auto w-full max-w-7xl select-none text-center px-3 sm:px-6">
            <div
              className="flex flex-col items-center justify-center font-black uppercase tracking-tight w-full"
              style={{
                fontFamily: "'Bebas Neue', 'Plus Jakarta Sans', sans-serif",
              }}
            >
              {/* Line 1: Clean continuous heading across the background */}
              <div className="hero-title-main text-[clamp(38px,8.2vw,140px)] leading-[0.9] tracking-[0.03em] drop-shadow-[0_2px_14px_rgba(255,255,255,0.95)] whitespace-nowrap">
                <span className="text-[#26052B]">AESTHETIC </span>
                <span className="text-[#4A0D4F]">GADGETS</span>
              </div>

              {/* Line 2: UNBOUND with generous responsive margin-top and wide tracking */}
              <div className="hero-title-sub text-[clamp(28px,6vw,98px)] text-[#5F1265] leading-[0.6] tracking-[0.26em] xs:tracking-[0.32em] sm:tracking-[0.40em] md:tracking-[0.46em] font-black uppercase drop-shadow-[0_2px_12px_rgba(255,255,255,0.95)] mt-[20px] sm:mt-[32px] lg:mt-[44px]">
                UNBOUND
              </div>
            </div>
          </div>

          {/* LAYER 3: SHOP NOW BUTTON */}
          <div className="absolute inset-x-0 bottom-0 sm:bottom-2 md:bottom-3 z-30 flex items-center justify-center pointer-events-auto">
            <Link
              to="/shop"
              className="group flex items-center gap-2 sm:gap-3 rounded-full bg-white/95 px-5 sm:px-7 py-2 sm:py-2.5 text-[12.5px] sm:text-[14px] font-extrabold text-slate-900 shadow-[0_8px_24px_rgba(74,13,79,0.18)] border border-purple-200/90 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-purple-300 hover:shadow-[0_14px_36px_rgba(74,13,79,0.26)] active:scale-95"
            >
              <span>Shop Now</span>
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#4A0D4F] text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-[#B35FA3]">
                <ArrowUpRight size={13} strokeWidth={2.5} />
              </span>
            </Link>
          </div>

          {/* LAYER 4: FLOATING LEFT PREVIEW CARD (DESKTOP) */}
          <div className="hidden lg:block absolute left-1 xl:left-4 bottom-4 xl:bottom-8 z-25">
            <div>
              <Link
                to="/shop"
                className="group block w-44 xl:w-48 overflow-hidden rounded-[22px] border border-purple-200/80 bg-white/90 p-3 shadow-[0_16px_40px_rgba(74,13,79,0.1)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(74,13,79,0.18)]"
              >
                <div className="relative h-28 xl:h-32 w-full overflow-hidden rounded-2xl bg-[#f0f3f6] flex items-center justify-center p-2">
                  <img
                    src={robotVacuum}
                    alt="Smart Robot Vacuum Drop"
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-[#4A0D4F] shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#4A0D4F] group-hover:text-white">
                    <ArrowUpRight size={13} strokeWidth={2.5} />
                  </div>
                </div>

                <div className="mt-2 px-0.5">
                  <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-[#B35FA3]">
                    Featured Drop
                  </span>
                  <p className="mt-0.5 text-xs font-bold text-slate-900">
                    Smart Robot Vacuum
                  </p>
                  <p className="text-[10px] font-medium text-slate-500">
                    AI Home Series
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM SECTION: COMPACT CLEAN SINGLE-ROW TRUST BADGES ON MOBILE           */}
        {/* ========================================================================= */}
        <div className="pt-2 pb-2 sm:pb-3 text-center max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-1.5 xs:gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-6 px-1">
            {sellerHighlights.map((item) => (
              <div
                key={item}
                className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-none bg-purple-100/50 sm:bg-transparent py-1 px-1.5 sm:p-0 text-[9px] xs:text-[10px] sm:text-xs"
              >
                <div className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-[#4A0D4F] text-white sm:bg-purple-100 sm:text-[#4A0D4F] flex-shrink-0">
                  <CheckCircle2 size={9} strokeWidth={2.8} />
                </div>
                <span className="font-bold text-slate-800 leading-tight text-center truncate sm:whitespace-nowrap">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Market Highlights Ticker Strip */}
      <div
        className="relative z-20 overflow-hidden border-y py-2 sm:py-2.5"
        style={{ borderColor: `${ACCENT}30`, backgroundColor: "#F3E8F5" }}
      >
        <div
          className="flex w-max"
          style={{ animation: "heroTicker 30s linear infinite" }}
        >
          {[...tickers, ...tickers].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-2.5 sm:gap-3 whitespace-nowrap px-4 sm:px-6 text-[10px] sm:text-xs font-extrabold uppercase tracking-[.09em]"
              style={{ color: PRIMARY }}
            >
              {item}
              <span
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: ACCENT }}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Custom Keyframe Animations */}
      <style>{`
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
