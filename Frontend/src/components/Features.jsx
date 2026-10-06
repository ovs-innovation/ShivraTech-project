import React from "react";
import { RotateCcw, ShieldCheck, Truck, Wallet } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Truck,
    title: "Nationwide Delivery",
    desc: "Delivery in hours & express shipping across India.",
  },
  {
    icon: Wallet,
    title: "Money Back",
    desc: "100% Escrow protected refund within 7 days.",
  },
  {
    icon: ShieldCheck,
    title: "Authentic Product",
    desc: "100% Original from verified gadget stores.",
  },
  {
    icon: RotateCcw,
    title: "Easy Return",
    desc: "Easy doorstep return & replacement system.",
  },
];

const Features = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white py-8 sm:py-12 border-t border-purple-100/80 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {features.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group flex items-center gap-3 rounded-2xl border border-purple-100/90 bg-[#F4EBF5]/80 p-3 sm:p-4 transition-all duration-300 hover:bg-[#F2E5F3] hover:shadow-md"
              >
                {/* Circular Navy/Purple Icon Container (Matching Reference 3) */}
                <div className="flex h-9 w-9 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#26052B] text-white shadow-xs transition-transform duration-300 group-hover:scale-105 group-hover:bg-[#4A0D4F]">
                  <IconComponent size={17} strokeWidth={2.2} />
                </div>

                {/* Text Content */}
                <div className="space-y-0.5 min-w-0 flex-1">
                  <h3 className="text-xs sm:text-[13.5px] font-bold text-slate-900 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 leading-snug line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default Features;
