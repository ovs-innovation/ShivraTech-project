import React from "react";
import { Link } from "react-router-dom";
import { categories } from "../data/catalog";

const Categories = () => {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
          Popular categories
        </p>
        <h2 className="mb-8 text-2xl font-bold text-slate-900 sm:mb-10 sm:text-3xl">
          Showcase and advertise
        </h2>

        <div className="flex w-full snap-x snap-mandatory items-center justify-between gap-4 overflow-x-auto pb-3 sm:gap-6">
          {categories.map((item) => (
            <Link
              key={item.slug}
              to={`/categories#${item.slug}`}
              className="flex min-w-[160px] snap-center flex-col items-center gap-4 px-3 py-4 transition hover:-translate-y-1 sm:min-w-[200px] sm:gap-5 sm:px-4 sm:py-5"
            >
              <div
                className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-full shadow-lg sm:h-40 sm:w-40"
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
              <div className="space-y-1 text-center">
                <p className="text-sm font-semibold text-slate-900 sm:text-[15px]">
                  {item.name}
                </p>
                <p className="max-w-[170px] text-xs leading-5 text-slate-500">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
