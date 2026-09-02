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

import SellerDashboardPage from "../pages/SellerDashboardPage";
import SellerProductsPage from "../pages/seller/SellerProductsPage";
import AddProductPage from "../pages/seller/AddProductPage";
import EditProductPage from "../pages/seller/EditProductPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Marketplace */}
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />

      {/* Customer */}
      <Route path="/customer" element={<CustomerDashboardPage />} />
      <Route path="/customer/cart" element={<CustomerCartPage />} />
      <Route path="/customer/orders" element={<CustomerOrdersPage />} />
      <Route path="/customer/saved" element={<CustomerSavedPage />} />
      <Route path="/customer/profile" element={<CustomerProfilePage />} />

      {/* Seller Application */}
      <Route path="/customer/become-seller" element={<BecomeSellerPage />} />
      <Route path="/become-seller" element={<BecomeSellerPage />} />

      {/* Seller Hub */}
      <Route path="/seller" element={<SellerDashboardPage />} />
      <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
      <Route path="/seller/products" element={<SellerProductsPage />} />
      <Route path="/seller/products/new" element={<AddProductPage />} />
      <Route path="/seller/products/:id/edit" element={<EditProductPage />} />
      <Route path="/seller/add-product" element={<AddProductPage />} />
      <Route path="/myproducts" element={<AddProductPage />} />
    </Routes>
  );
}

export default AppRoutes;