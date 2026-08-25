import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProductsPage from "../pages/ProductsPage";
import BecomeSellerPage from "../pages/customer/BecomeSellerPage";
import SellerDashboardPage from "../pages/SellerDashboardPage";
import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage";

function AppRoutes() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/products" element={<ProductsPage />} />

      {/* Seller */}
     <Route
         path="/customer/become-seller"
               element={<BecomeSellerPage />}
           />

      <Route
        path="/seller-dashboard"
        element={<SellerDashboardPage />}
      />
      <Route
  path="/customer"
  element={<CustomerDashboardPage />}
/>

    </Routes>
  );
}

export default AppRoutes;