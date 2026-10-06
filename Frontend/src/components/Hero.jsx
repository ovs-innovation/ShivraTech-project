import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Globe,
  Quote,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import heroRobot from "../assets/heroRobot.png";
import floatingEarbudsCard from "../assets/floatingEarbudsCard.jpg";

gsap.registerPlugin(ScrollTrigger);

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

const channelIcons = [
  { icon: Globe, label: "Verified Network" },
  { icon: ShieldCheck, label: "Buyer Protection" },
  { icon: Zap, label: "Express Delivery" },
  { icon: Sparkles, label: "Rare Tech Drops" },
];

const Hero = () => {
  const [robotLoaded, setRobotLoaded] = useState(true);
  const heroRef = useRef(null);
  const headphoneStageRef = useRef(null);
  const headphoneBoxRef = useRef(null);
  const shadowRef = useRef(null);
  const badgeRef = useRef(null);
  const headlineRef = useRef(null);
  const ctaRef = useRef(null);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);
  const highlightsRef = useRef(null);
  const tickerRef = useRef(null);

  // Mouse Parallax Refs (Desktop only)
  const mouseHeadphoneRef = useRef(null);
  const mouseHeadlineRef = useRef(null);
  const mouseLeftCardRef = useRef(null);
  const mouseRightCardRef = useRef(null);

  // ── Desktop Subtle Mouse Parallax Effect (3–6px movement, disabled on mobile) ──
  useEffect(() => {
    if (window.matchMedia("(max-width: 1023px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hero = heroRef.current;
    if (!hero) return;

    // GSAP quickTo setters for 60fps buttery smooth performance
    const setHeadphoneX = gsap.quickTo(mouseHeadphoneRef.current, "x", {
      duration: 0.6,
      ease: "power2.out",
    });
    const setHeadphoneY = gsap.quickTo(mouseHeadphoneRef.current, "y", {
      duration: 0.6,
      ease: "power2.out",
    });
    const setHeadphoneRotY = gsap.quickTo(mouseHeadphoneRef.current, "rotateY", {
      duration: 0.6,
      ease: "power2.out",
    });
    const setHeadphoneRotX = gsap.quickTo(mouseHeadphoneRef.current, "rotateX", {
      duration: 0.6,
      ease: "power2.out",
    });

    const setHeadlineX = gsap.quickTo(mouseHeadlineRef.current, "x", {
      duration: 0.7,
      ease: "power2.out",
    });
    const setHeadlineY = gsap.quickTo(mouseHeadlineRef.current, "y", {
      duration: 0.7,
      ease: "power2.out",
    });

    const setLeftX = gsap.quickTo(mouseLeftCardRef.current, "x", {
      duration: 0.5,
      ease: "power2.out",
    });
    const setLeftY = gsap.quickTo(mouseLeftCardRef.current, "y", {
      duration: 0.5,
      ease: "power2.out",
    });

    const setRightX = gsap.quickTo(mouseRightCardRef.current, "x", {
      duration: 0.5,
      ease: "power2.out",
    });
    const setRightY = gsap.quickTo(mouseRightCardRef.current, "y", {
      duration: 0.5,
      ease: "power2.out",
    });

    const onMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1

      // Headphone: 3–6px movement with subtle 3D tilt
      setHeadphoneX(normX * 5);
      setHeadphoneY(normY * 5);
      setHeadphoneRotY(normX * 2);
      setHeadphoneRotX(-normY * 2);

      // Headline: 1–3px movement
      setHeadlineX(normX * 2);
      setHeadlineY(normY * 1.5);

      // Floating cards: 5–8px movement
      setLeftX(normX * -6);
      setLeftY(normY * -5);
      setRightX(normX * -7);
      setRightY(normY * -6);
    };

    const onMouseLeave = () => {
      setHeadphoneX(0);
      setHeadphoneY(0);
      setHeadphoneRotY(0);
      setHeadphoneRotX(0);
      setHeadlineX(0);
      setHeadlineY(0);
      setLeftX(0);
      setLeftY(0);
      setRightX(0);
      setRightY(0);
    };

    hero.addEventListener("mousemove", onMouseMove);
    hero.addEventListener("mouseleave", onMouseLeave);

    return () => {
      hero.removeEventListener("mousemove", onMouseMove);
      hero.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // ── Cinematic Scroll Sequence ──
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 1024px)",
        isTablet: "(min-width: 640px) and (max-width: 1023px)",
        isMobile: "(max-width: 639px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isDesktop, isTablet, isMobile, reduceMotion } = context.conditions;

        if (reduceMotion) {
          // Accessibility: respect reduced motion preferences
          return;
        }

        const pinDistance = isDesktop ? "+=150%" : isTablet ? "+=125%" : "+=85%";

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: pinDistance,
            pin: true,
            pinSpacing: false, // Next section smoothly reveals underneath / covers hero
            scrub: 1.2,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const idleEl = document.querySelector(".headphone-idle-float");
              if (idleEl) {
                if (self.progress > 0.02) {
                  idleEl.style.animationPlayState = "paused";
                } else {
                  idleEl.style.animationPlayState = "running";
                }
              }
            },
          },
        });

        // 1. Background Headline: moves horizontally slightly, scales backward, reduces opacity gradually
        tl.to(
          headlineRef.current,
          {
            x: isMobile ? -16 : -32,
            y: -24,
            scale: 0.92,
            opacity: 0.08,
            ease: "power2.out",
            duration: 0.45,
          },
          0
        );

        // 2. Editorial badge & top feature icons move upward slightly, fade gradually
        tl.to(
          badgeRef.current,
          {
            y: -22,
            opacity: 0,
            ease: "power2.out",
            duration: 0.28,
          },
          0
        );

        // 3. CTA ("Shop Now"): slightly scale down, move upward, fade toward end
        tl.to(
          ctaRef.current,
          {
            scale: 0.88,
            y: -24,
            opacity: 0,
            ease: "power2.out",
            duration: 0.32,
          },
          0
        );

        // 4. Floating Left Product Card: moves slightly left + upward, fades to 0
        if (leftCardRef.current) {
          tl.to(
            leftCardRef.current,
            {
              x: -85,
              y: -25,
              opacity: 0,
              rotate: -6,
              ease: "power2.out",
              duration: 0.35,
            },
            0
          );
        }

        // 5. Floating Right Information Card: moves slightly right + upward, fades to 0
        if (rightCardRef.current) {
          tl.to(
            rightCardRef.current,
            {
              x: 85,
              y: -25,
              opacity: 0,
              rotate: 6,
              ease: "power2.out",
              duration: 0.35,
            },
            0
          );
        }

        // 6. Bottom trust highlights & ticker strip
        if (highlightsRef.current) {
          tl.to(
            highlightsRef.current,
            {
              opacity: 0,
              y: 20,
              ease: "power2.out",
              duration: 0.25,
            },
            0
          );
        }

        if (tickerRef.current) {
          tl.to(
            tickerRef.current,
            {
              opacity: 0,
              y: 20,
              ease: "power2.out",
              duration: 0.25,
            },
            0
          );
        }

        // 7. Ambient atmospheric glows: subtle parallax depth
        tl.to(
          ".ambient-glow-layer",
          {
            y: 20,
            opacity: 0.25,
            ease: "none",
            duration: 1,
          },
          0
        );

        // 8. Ground shadow: softens and blurs as headphone elevates
        if (shadowRef.current) {
          tl.to(
            shadowRef.current,
            {
              scaleX: 1.45,
              scaleY: 0.6,
              opacity: 0.08,
              y: 24,
              ease: "power1.out",
              duration: 0.55,
            },
            0
          );
          tl.to(
            shadowRef.current,
            {
              opacity: 0,
              ease: "power1.out",
              duration: 0.3,
            },
            0.6
          );
        }

        // 9. MAIN HEADPHONE 3D SCROLL MOTION SEQUENCE:
        if (isDesktop) {
          // Progress 0.0 -> 0.35: (Middle: scale 1.3, subtle circular 3D rotation, moves slightly upward)
          tl.to(
            headphoneBoxRef.current,
            {
              scale: 1.3,
              rotateZ: 8,
              rotateY: 8,
              rotateX: -3,
              y: -18,
              opacity: 1,
              ease: "power1.inOut",
              duration: 0.35,
            },
            0
          );

          // Progress 0.35 -> 0.65: (Later: scale 1.6, circular dimensional rotation)
          tl.to(
            headphoneBoxRef.current,
            {
              scale: 1.6,
              rotateZ: 14,
              rotateY: 12,
              rotateX: -5,
              y: -30,
              opacity: 1,
              ease: "power1.inOut",
              duration: 0.3,
            },
            0.35
          );

          // Progress 0.65 -> 0.90: (End: scale 1.95 - moving toward the camera/screen)
          tl.to(
            headphoneBoxRef.current,
            {
              scale: 1.98,
              rotateZ: 18,
              rotateY: 14,
              rotateX: -6,
              y: -40,
              opacity: 1,
              ease: "power1.out",
              duration: 0.25,
            },
            0.65
          );

          // Progress 0.85 -> 1.0: (Next section smoothly reveals underneath: clean dissolve as product completes zoom)
          tl.to(
            headphoneBoxRef.current,
            {
              opacity: 0,
              scale: 2.15,
              ease: "power2.inOut",
              duration: 0.15,
            },
            0.85
          );
        } else if (isTablet) {
          // Tablet
          tl.to(
            headphoneBoxRef.current,
            {
              scale: 1.25,
              rotateZ: 5,
              rotateY: 6,
              rotateX: -2,
              y: -14,
              opacity: 1,
              ease: "power1.inOut",
              duration: 0.45,
            },
            0
          );
          tl.to(
            headphoneBoxRef.current,
            {
              scale: 1.55,
              rotateZ: 10,
              rotateY: 8,
              rotateX: -3,
              y: -24,
              opacity: 1,
              ease: "power1.out",
              duration: 0.4,
            },
            0.45
          );
          tl.to(
            headphoneBoxRef.current,
            {
              opacity: 0,
              scale: 1.68,
              ease: "power2.inOut",
              duration: 0.15,
            },
            0.85
          );
        } else {
          // Mobile (simple scale + fade + slight rotation, no heavy 3D)
          tl.to(
            headphoneBoxRef.current,
            {
              scale: 1.35,
              rotateZ: 6,
              rotateY: 0,
              rotateX: 0,
              y: -16,
              opacity: 1,
              ease: "power1.inOut",
              duration: 0.75,
            },
            0
          );
          tl.to(
            headphoneBoxRef.current,
            {
              opacity: 0,
              scale: 1.45,
              ease: "power2.inOut",
              duration: 0.25,
            },
            0.75
          );
        }
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[calc(100svh-68px)] sm:min-h-[calc(100svh-78px)] flex-col justify-between overflow-hidden bg-[#FBF8FC] text-slate-900 selection:bg-[#B35FA3] selection:text-white"
    >
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
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-3 sm:px-6 lg:px-8 pt-1.5 sm:pt-2">
        {/* Top Editorial Badge */}
        <div
          ref={badgeRef}
          className="flex justify-center pt-0.5 pb-1 will-change-transform"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-purple-200/80 bg-white/95 px-3 sm:px-4 py-1 shadow-[0_2px_10px_rgba(74,13,79,0.05)] backdrop-blur-md">
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#B35FA3] animate-pulse" />
            <span
              className="text-[9px] xs:text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[.14em] sm:tracking-[.18em]"
              style={{ color: PRIMARY }}
            >
              India&apos;s #1 Gadget & Rare Tech Marketplace
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HERO STAGE: BALANCED HEADLINE + HEADPHONE + VISIBLE BOTTOM BUTTON         */}
        {/* ========================================================================= */}
        <div className="relative mx-auto flex w-full max-w-5xl flex-1 items-center justify-center min-h-[360px] xs:min-h-[400px] sm:min-h-[480px] md:min-h-[520px] lg:min-h-[560px] my-auto">
          {/* LAYER 1: HEADPHONE (3D PERSPECTIVE SCROLL REVEAL STAGE) */}
          <div
            ref={headphoneStageRef}
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            style={{ perspective: "1200px" }}
          >
            {/* Soft ground ambient shadow */}
            <div
              ref={shadowRef}
              className="absolute -bottom-2 sm:-bottom-5 h-6 sm:h-14 w-36 xs:w-52 sm:w-80 rounded-full bg-[#4A0D4F]/25 blur-lg sm:blur-2xl pointer-events-none"
              style={{
                transform: "scaleY(0.5)",
                willChange: "transform, opacity",
              }}
            />

            {/* GSAP Controlled 3D Transform Box (Scroll Driven) */}
            <div
              ref={headphoneBoxRef}
              className="relative flex items-center justify-center pointer-events-none"
              style={{
                transformOrigin: "center center",
                transformStyle: "preserve-3d",
                willChange: "transform, opacity",
              }}
            >
              {/* Desktop Subtle Mouse-Follow Parallax Wrapper (3-6px movement) */}
              <div
                ref={mouseHeadphoneRef}
                className="relative flex items-center justify-center"
                style={{
                  transformOrigin: "center center",
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
              >
                <div className="headphone-idle-float flex items-center justify-center">
                  {robotLoaded && (
                    <img
                      src={heroRobot}
                      alt="Shivra AI Robot"
                      onLoad={() => ScrollTrigger.refresh()}
                      onError={() => setRobotLoaded(false)}
                      className="h-[270px] xs:h-[310px] sm:h-[410px] md:h-[490px] lg:h-[550px] xl:h-[600px] w-auto max-w-full object-contain drop-shadow-[0_24px_50px_rgba(74,13,79,0.25)] select-none pointer-events-auto"
                      style={{ backfaceVisibility: "hidden" }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* LAYER 2: OVERSIZED HEADING (FADES & MOVES HORIZONTALLY / BACKWARD ON SCROLL) */}
          <div
            ref={headlineRef}
            className="pointer-events-none absolute inset-x-0 top-[18%] xs:top-[20%] sm:top-[26%] md:top-[28%] -translate-y-1/2 z-10 mx-auto max-w-4xl select-none text-center px-2 will-change-transform"
          >
            {/* Desktop Subtle Mouse-Follow Parallax Wrapper (1-3px movement) */}
            <div ref={mouseHeadlineRef} className="will-change-transform">
              <h1
                className="flex flex-col items-center justify-center font-black uppercase tracking-tight leading-[0.88] sm:leading-[0.84]"
                style={{
                  fontFamily: "'Bebas Neue', 'Plus Jakarta Sans', sans-serif",
                }}
              >
                {/* Top Headline Line */}
                <span className="block text-[clamp(28px,7.5vw,96px)] text-[#26052B] tracking-[0.02em] drop-shadow-[0_2px_8px_rgba(255,255,255,0.9)]">
                  AESTHETIC GADGETS
                </span>

                {/* Bottom Headline Line (Solid Rich Purple with Drop Shadow) */}
                <span className="block text-[clamp(24px,6.8vw,86px)] text-[#4A0D4F] tracking-[0.04em] drop-shadow-[0_2px_8px_rgba(255,255,255,0.9)]">
                  UNBOUND
                </span>
              </h1>
            </div>
          </div>

          {/* LAYER 3: SHOP NOW BUTTON (CLEARLY VISIBLE ON SCREEN UNDER HEADPHONES) */}
          <div
            ref={ctaRef}
            className="absolute z-30 flex items-center justify-center bottom-1 xs:bottom-2 sm:bottom-4 md:bottom-6 will-change-transform"
          >
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

          {/* LAYER 4: FLOATING LEFT PREVIEW CARD (DESKTOP ONLY WITH SCROLL REACTION) */}
          <div
            ref={leftCardRef}
            className="hidden lg:block absolute left-1 xl:left-4 bottom-4 xl:bottom-8 z-25 will-change-transform"
          >
            {/* Desktop Subtle Mouse-Follow Parallax Wrapper (5-8px movement) */}
            <div ref={mouseLeftCardRef} className="will-change-transform">
              <div className="left-card-float">
                <Link
                  to="/shop"
                  className="group block w-44 xl:w-48 overflow-hidden rounded-[22px] border border-purple-200/80 bg-white/90 p-3 shadow-[0_16px_40px_rgba(74,13,79,0.1)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(74,13,79,0.18)]"
                >
                  <div className="relative h-28 xl:h-32 w-full overflow-hidden rounded-2xl bg-purple-50">
                    <img
                      src={floatingEarbudsCard}
                      alt="Aura Pods Pro Drop"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                      Aura Pods ANC
                    </p>
                    <p className="text-[10px] font-medium text-slate-500">
                      Pro Audio Series
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* LAYER 5: FLOATING RIGHT SUPPORTING ELEMENTS (DESKTOP ONLY WITH SCROLL REACTION) */}
          <div
            ref={rightCardRef}
            className="hidden lg:flex absolute right-1 xl:right-4 top-2 xl:top-4 z-25 flex-col items-end gap-3.5 max-w-[210px] xl:max-w-[240px] will-change-transform"
          >
            {/* Desktop Subtle Mouse-Follow Parallax Wrapper (5-8px movement) */}
            <div ref={mouseRightCardRef} className="will-change-transform flex flex-col items-end gap-3.5">
              <div className="right-card-float flex flex-col items-end gap-3.5">
                {/* Circular Channel Icons */}
                <div className="flex items-center gap-1.5 rounded-full border border-purple-200/70 bg-white/85 p-1.5 shadow-[0_8px_24px_rgba(74,13,79,0.06)] backdrop-blur-xl">
                  {channelIcons.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={idx}
                        title={item.label}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50/80 text-[#4A0D4F] transition-all duration-200 hover:scale-110 hover:bg-[#4A0D4F] hover:text-white cursor-pointer"
                      >
                        <IconComponent size={14} strokeWidth={2.2} />
                      </div>
                    );
                  })}
                </div>

                {/* Editorial Quote Block */}
                <div className="rounded-[22px] border border-purple-200/80 bg-white/90 p-3.5 xl:p-4 text-left shadow-[0_14px_36px_rgba(74,13,79,0.08)] backdrop-blur-xl transition hover:border-purple-300">
                  <Quote
                    size={16}
                    className="text-[#B35FA3] mb-1.5 rotate-180 opacity-80"
                  />
                  <p className="text-[11.5px] xl:text-[12.5px] font-medium leading-[1.6] text-slate-700">
                    Perfect blend of cutting-edge technology and verified seller
                    craftsmanship across India.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM SECTION: COMPACT CLEAN SINGLE-ROW TRUST BADGES ON MOBILE           */}
        {/* ========================================================================= */}
        <div
          ref={highlightsRef}
          className="pt-1 pb-2 sm:pb-3 text-center max-w-2xl mx-auto will-change-transform"
        >
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
        ref={tickerRef}
        className="relative z-20 overflow-hidden border-y py-2 sm:py-2.5 will-change-transform"
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
        /* Subtle breathing idle float when at rest */
        @keyframes headphoneIdleFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(0.6deg);
          }
        }

        .headphone-idle-float {
          animation: headphoneIdleFloat 7s ease-in-out infinite;
          will-change: transform;
        }

        /* Subtle floating for left preview card */
        @keyframes leftCardFloat {
          0%, 100% {
            transform: translateY(0px) rotate(-1deg);
          }
          50% {
            transform: translateY(-8px) rotate(0.5deg);
          }
        }

        .left-card-float {
          animation: leftCardFloat 7s ease-in-out infinite;
        }

        /* Subtle floating for right quote card */
        @keyframes rightCardFloat {
          0%, 100% {
            transform: translateY(0px) rotate(1deg);
          }
          50% {
            transform: translateY(-7px) rotate(-0.5deg);
          }
        }

        .right-card-float {
          animation: rightCardFloat 8s ease-in-out infinite;
        }

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
