import { BrowserRouter, Route, Routes } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import { AuthProvider } from "./context/AuthContext";
import { ShopProvider } from "./context/ShopContext";
import About from "./pages/About";
import CartPage from "./pages/CartPage";
import CategoriesPage from "./pages/CategoriesPage";
import ContactForm from "./pages/ContactForm";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import OrdersPage from "./pages/OrdersPage";
import ProductDetails from "./pages/ProductDetails";
import Shop from "./pages/Shop";
import SupportPage from "./pages/SupportPage";
import VendorDashboard from "./pages/VendorDashboard";
import WishlistPage from "./pages/WishlistPage";

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/categories" element={<Shop />} />
              <Route path="/categories/:categorySlug" element={<Shop />} />
              <Route path="/product/:productSlug" element={<ProductDetails />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/vendor/dashboard" element={<VendorDashboard />} />
              <Route path="/contact" element={<ContactForm />} />
              <Route path="/login" element={<Login />} />
              <Route path="/support/:topic" element={<SupportPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;
