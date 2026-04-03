import categoryCar from "../assets/categoryCar.jpg";
import categorySpeaker from "../assets/categorySpeaker.jpg";
import categoryWatch from "../assets/categoryWatch.jpg";

export const categories = [
  {
    slug: "audio",
    name: "Audio",
    desc: "Earbuds, speakers, and headphones for daily listening.",
    focus: "Music, calls, and home sound",
    bestFor: "Best for music lovers, streaming setups, and room audio upgrades.",
    img: categorySpeaker,
  },
  {
    slug: "mobile-accessories",
    name: "Mobile Accessories",
    desc: "Chargers, holders, power banks, and phone-ready add-ons.",
    focus: "Charging, power, and protection",
    bestFor: "Best for fast charging, travel kits, and everyday phone essentials.",
    img: categoryWatch,
  },
  {
    slug: "pc-accessories",
    name: "PC Accessories",
    desc: "Keyboards, mice, hubs, and desk essentials for work setups.",
    focus: "Desk setups and productivity",
    bestFor: "Best for workstations, creator desks, and gaming-ready accessories.",
    img: categorySpeaker,
  },
  {
    slug: "car-accessories",
    name: "Car Accessories",
    desc: "Mounts, chargers, and smart driving tools for every commute.",
    focus: "Navigation and in-car power",
    bestFor: "Best for daily commuters, road trips, and drive-ready gadget support.",
    img: categoryCar,
  },
  {
    slug: "lifestyle",
    name: "Lifestyle",
    desc: "Smartwear and everyday gadgets that fit into active routines.",
    focus: "Fitness, travel, and daily use",
    bestFor: "Best for wearable tech, smart utility, and stylish everyday gear.",
    img: categoryWatch,
  },
];
