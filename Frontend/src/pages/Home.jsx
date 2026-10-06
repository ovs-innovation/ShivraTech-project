import Categories from "../components/Categories";
import Features from "../components/Features";
import Hero from "../components/Hero";
import ProductsShowcase from "../components/ProductsShowcase";

const Home = () => {
  return (
    <div className="relative">
      <Hero />
      {/* Spacer that allows the starting 3D headphone animation to play gracefully before content glides over */}
      <div className="h-[35vh] sm:h-[45vh] lg:h-[50vh] pointer-events-none" />
      {/* Next section that smoothly comes up over the hero and hides it */}
      <div
        id="home-content"
        className="relative z-30 bg-white rounded-t-[32px] sm:rounded-t-[44px] shadow-[0_-25px_60px_rgba(74,13,79,0.12)] border-t border-purple-100/80"
      >
        <Categories />
        <ProductsShowcase />
        <Features />
      </div>
    </div>
  );
};

export default Home;
