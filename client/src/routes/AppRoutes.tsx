import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProductsPage from "../pages/ProductsPage";
import ProductDetailPage from "../pages/ProductDetailPage";

import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage";
import CustomerCartPage from "../pages/customer/CustomerCartPage";
import CustomerOrdersPage from "../pages/customer/CustomerOrdersPage";
import CustomerSavedPage from "../pages/customer/CustomerSavedPage";
import CustomerProfilePage from "../pages/customer/CustomerProfilePage";
import BecomeSellerPage from "../pages/customer/BecomeSellerPage";

function AppRoutes() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      {/* Marketplace */}
      <Route path="/products" element={<ProductsPage />} />

      <Route
        path="/products/:id"
        element={<ProductDetailPage />}
      />

      {/* Customer */}
      <Route
        path="/customer"
        element={<CustomerDashboardPage />}
      />

      <Route
        path="/customer/cart"
        element={<CustomerCartPage />}
      />

      <Route
        path="/customer/orders"
        element={<CustomerOrdersPage />}
      />

      <Route
        path="/customer/saved"
        element={<CustomerSavedPage />}
      />

      <Route
        path="/customer/profile"
        element={<CustomerProfilePage />}
      />

      {/* Seller application */}
      <Route
        path="/customer/become-seller"
        element={<BecomeSellerPage />}
      />

    </Routes>
  );
}

export default AppRoutes;