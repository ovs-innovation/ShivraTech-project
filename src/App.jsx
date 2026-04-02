import Categories from "./components/Categories";
import Features from "./components/Features";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import PromoCarousel from "./components/PromoCarousel";

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <Hero />
      <Features />
      <Categories />
      <PromoCarousel />

      <footer className="border-t bg-white px-6 py-6 text-center text-sm text-slate-600" style={{ borderColor: "#B35FA3" }}>
        © 2026 ShivraTech. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
