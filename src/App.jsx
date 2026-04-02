import Categories from "./components/Categories";
import Footer from "./components/Footer";
import Features from "./components/Features";
import FloatingContactButtons from "./components/FloatingContactButtons";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import PromoCarousel from "./components/PromoCarousel";
import ProductsShowcase from "./components/ProductsShowcase";

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <Hero />
      <Features />
      <Categories />
      <PromoCarousel />
      <ProductsShowcase />
      <FloatingContactButtons />
      <Footer />
    </div>
  );
}

export default App;
