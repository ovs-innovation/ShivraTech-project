import { useSearchParams } from "react-router-dom";
import ProductsShowcase from "../components/ProductsShowcase";

const Shop = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";

  return (
    <ProductsShowcase
      key={searchQuery || "all-products"}
      shopOnly
      searchQuery={searchQuery}
    />
  );
};

export default Shop;
