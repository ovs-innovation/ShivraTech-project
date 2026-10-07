import Categories from "../components/Categories";
import Features from "../components/Features";
import Hero from "../components/Hero";
import ProductsShowcase from "../components/ProductsShowcase";
import PromoCarousel from "../components/PromoCarousel";

const Home = () => {
  return (
    <div className="relative">
      <Hero />
      {/* Next section that smoothly appears after hero unpins */}
      <div
        id="home-content"
        className="relative z-30 bg-white rounded-t-[32px] sm:rounded-t-[44px] shadow-[0_-25px_60px_rgba(74,13,79,0.12)] border-t border-purple-100/80"
      >
        <Categories />
        <PromoCarousel />
        <ProductsShowcase />
        <Features />
      </div>
    </div>
  );
};

export default Home;
