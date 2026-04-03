import React from "react";
import { Link } from "react-router-dom";
import { categories } from "../data/catalog";

const Categories = () => {
  return (
    <section className="bg-white px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
          Popular categories
        </p>
        <h2 className="mb-10 text-3xl font-bold text-slate-900">
          Showcase and advertise
        </h2>

        <div className="flex w-full items-center justify-between gap-6 overflow-x-auto pb-3">
          {categories.map((item) => (
            <Link
              key={item.slug}
              to={`/categories#${item.slug}`}
              className="flex min-w-[200px] flex-col items-center gap-5 px-4 py-5 transition hover:-translate-y-1"
            >
              <div
                className="h-40 w-40 flex-shrink-0 overflow-hidden rounded-full shadow-lg"
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
                <p className="text-[15px] font-semibold text-slate-900">
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
