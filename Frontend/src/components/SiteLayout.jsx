import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import FloatingContactButtons from "./FloatingContactButtons";
import Footer from "./Footer";
import Navbar from "./Navbar";

const ScrollManager = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);

      window.requestAnimationFrame(() => {
        const element = document.getElementById(id);

        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        window.scrollTo({ top: 0, left: 0 });
      });

      return;
    }

    window.scrollTo({ top: 0, left: 0 });
  }, [location.hash, location.pathname]);

  return null;
};

const SiteLayout = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <ScrollManager />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FloatingContactButtons />
    </div>
  );
};

export default SiteLayout;
