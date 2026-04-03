import Categories from "../components/Categories";
import Features from "../components/Features";
import Hero from "../components/Hero";
import PageExplorer from "../components/PageExplorer";
import ProductsShowcase from "../components/ProductsShowcase";
import PromoCarousel from "../components/PromoCarousel";

const Home = () => {
  return (
    <>
      <Hero />
      <PageExplorer />
      <Features />
      <Categories />
      <PromoCarousel />
      <ProductsShowcase />
    </>
  );
};

export default Home;
