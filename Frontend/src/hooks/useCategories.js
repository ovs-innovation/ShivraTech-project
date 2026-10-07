import { useEffect, useState } from "react";
import categorySpeaker from "../assets/categorySpeaker.jpg";
import { categories as categoryDefaults } from "../data/catalog";
import { apiGetCategories } from "../services/api";

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    apiGetCategories()
      .then((response) => {
        if (!Array.isArray(response.data)) {
          throw new Error("The categories response is invalid.");
        }

        const loadedCategories = response.data.map((category) => {
          const defaults = categoryDefaults.find(
            (item) => item.slug === category.slug,
          );
          const description =
            category.desc || category.description || defaults?.desc || "";

          return {
            ...defaults,
            ...category,
            desc: description,
            img: category.image || defaults?.img || categorySpeaker,
            focus: defaults?.focus || description || "Browse this collection",
            bestFor:
              defaults?.bestFor ||
              description ||
              `Explore products in ${category.name}.`,
          };
        });

        if (isCurrent) {
          setCategories(loadedCategories);
          setError("");
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError.message || "Unable to load categories.");
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return { categories, loading, error };
};

export default useCategories;
