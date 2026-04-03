import categoryCar from "../assets/categoryCar.jpg";
import categorySpeaker from "../assets/categorySpeaker.jpg";
import categoryWatch from "../assets/categoryWatch.jpg";

export const categories = [
  {
    slug: "audio",
    name: "Audio",
    desc: "Earbuds, speakers, and headphones for daily listening.",
    img: categorySpeaker,
  },
  {
    slug: "mobile-accessories",
    name: "Mobile Accessories",
    desc: "Chargers, holders, power banks, and phone-ready add-ons.",
    img: categoryWatch,
  },
  {
    slug: "pc-accessories",
    name: "PC Accessories",
    desc: "Keyboards, mice, hubs, and desk essentials for work setups.",
    img: categorySpeaker,
  },
  {
    slug: "car-accessories",
    name: "Car Accessories",
    desc: "Mounts, chargers, and smart driving tools for every commute.",
    img: categoryCar,
  },
  {
    slug: "lifestyle",
    name: "Lifestyle",
    desc: "Smartwear and everyday gadgets that fit into active routines.",
    img: categoryWatch,
  },
];
