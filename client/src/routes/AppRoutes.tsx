import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import ProtectedSuperAdminRoute from "./ProtectedSuperAdminRoute";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProductsPage from "../pages/ProductsPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import CategoriesPage from "../pages/CategoriesPage";

import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage";
import CustomerCartPage from "../pages/customer/CustomerCartPage";
import CustomerOrdersPage from "../pages/customer/CustomerOrdersPage";
import CustomerSavedPage from "../pages/customer/CustomerSavedPage";
import CustomerProfilePage from "../pages/customer/CustomerProfilePage";
import CustomerMessagesPage from "../pages/customer/CustomerMessagesPage";
import CustomerNotificationsPage from "../pages/customer/CustomerNotificationsPage";
import BecomeSellerPage from "../pages/customer/BecomeSellerPage";

import SellerDashboardPage from "../pages/SellerDashboardPage";
import SellerProductsPage from "../pages/seller/SellerProductsPage";
import SellerMessagesPage from "../pages/seller/SellerMessagesPage";
import SellerOrdersPage from "../pages/seller/SellerOrdersPage";
import AddProductPage from "../pages/seller/AddProductPage";
import EditProductPage from "../pages/seller/EditProductPage";
import BuyerChatPage from "../pages/BuyerChatPage";

import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import BrokerHubPage from "../pages/admin/BrokerHubPage";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
import AdminStoresPage from "../pages/admin/AdminStoresPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import AdminManagementPage from "../pages/admin/AdminManagementPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Marketplace (Public) */}
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/categories" element={<CategoriesPage />} />

      {/* Protected Routes (Customer & Seller) */}
      <Route element={<ProtectedRoute />}>
        {/* Customer */}
        <Route path="/customer" element={<CustomerDashboardPage />} />
        <Route path="/customer/cart" element={<CustomerCartPage />} />
        <Route path="/customer/orders" element={<CustomerOrdersPage />} />
        <Route path="/customer/saved" element={<CustomerSavedPage />} />
        <Route path="/customer/profile" element={<CustomerProfilePage />} />
        <Route path="/customer/messages" element={<CustomerMessagesPage />} />
        <Route path="/customer/notifications" element={<CustomerNotificationsPage />} />

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
        <Route path="/seller/messages" element={<SellerMessagesPage />} />
        <Route path="/seller/orders" element={<SellerOrdersPage />} />
        <Route path="/myproducts" element={<AddProductPage />} />

        {/* Messaging */}
        <Route path="/messages/chat/:productId" element={<BuyerChatPage />} />
      </Route>

      {/* Admin Portal (Admin & Super Admin) */}
      <Route element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/broker-hub" element={<BrokerHubPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/stores" element={<AdminStoresPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />

          {/* Super Admin Only */}
          <Route element={<ProtectedSuperAdminRoute />}>
            <Route path="/admin/admin-management" element={<AdminManagementPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;