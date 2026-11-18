import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import About from "./pages/about/About";
import Cart from "./pages/cart/Cart";
import Checkout from "./pages/checkout/Checkout";
import Account from "./pages/account/Account";
import Seller from "./pages/seller/Seller";
import Admin from "./pages/admin/Admin";
import Policy from "./pages/policy/Policy";
import Category from "./pages/category/Category";
import FloatingActions from "./components/floatingActions/FloatingActions";

export default function App() {
  const { pathname, hash } = useLocation();
  const bare = pathname === "/login"; // the login page is full screen, with no navbar or footer

  // A new page starts at the top, unless the link points to a section
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app">
      {!bare && <Navbar />}

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller"
            element={
              <ProtectedRoute>
                <Seller />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/terms" element={<Policy page="terms" />} />
          <Route path="/privacy" element={<Policy page="privacy" />} />
          <Route path="/shipping" element={<Policy page="shipping" />} />
          <Route path="/refunds" element={<Policy page="refunds" />} />
          <Route path="/category/:category" element={<Category />} />
          <Route path="*" element={<p className="page-message">Page not found</p>} />
        </Routes>
      </main>

      {!bare && <Footer />}
      {!bare && <FloatingActions />}
    </div>
  );
}