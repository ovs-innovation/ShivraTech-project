import React from "react";
import categoryCar from "../assets/categoryCar.jpg";
import categorySpeaker from "../assets/categorySpeaker.jpg";
import categoryWatch from "../assets/categoryWatch.jpg";

const categories = [
  { name: "Audio", img: categorySpeaker },
  { name: "Mobile Accessories", img: categoryWatch },
  { name: "PC Accessories", img: categorySpeaker },
  { name: "Car Accessories", img: categoryCar },
  { name: "Lifestyle", img: categoryWatch },
];

const Categories = () => {
  return (
    <section className="bg-white px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 mb-2">
          Popular categories
        </p>
        <h2 className="text-3xl font-bold text-slate-900 mb-10">
          Showcase & advertise
        </h2>

        <div className="flex w-full items-center justify-between gap-6 overflow-x-auto pb-3">
          {categories.map((item) => (
            <div
              key={item.name}
              className="flex min-w-[200px] flex-col items-center gap-5 px-4 py-5 cursor-pointer transition hover:-translate-y-1"
            >
              <div
                className="h-40 w-40 flex-shrink-0 rounded-full overflow-hidden shadow-lg"
                style={{
                  border: "2px solid #B35FA3",
                  boxShadow: "0 12px 24px rgba(74,13,79,0.18)",
                }}
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
              </div>
              <p className="text-[15px] font-semibold text-slate-900 text-center">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
