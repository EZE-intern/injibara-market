import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import ProtectedAdminRoute from "./ProtectedAdminRoute";

// Eagerly loaded for instantaneous homepage first paint
import HomePage from "../pages/HomePage";

// ── Lazy-Loaded Routes (Code Splitting) ──────────────────────────────────────
// Drastically slashes the initial JS bundle from ~600 KB to ~130 KB, ensuring
// first-time visitors don't download admin/seller code until navigating there.
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const AuthCallbackPage = lazy(() => import("../pages/AuthCallbackPage"));
const ProductsPage = lazy(() => import("../pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage"));
const CategoriesPage = lazy(() => import("../pages/CategoriesPage"));

// Customer Portal
const CustomerDashboardPage = lazy(() => import("../pages/customer/CustomerDashboardPage"));
const CustomerCartPage = lazy(() => import("../pages/customer/CustomerCartPage"));
const CustomerOrdersPage = lazy(() => import("../pages/customer/CustomerOrdersPage"));
const CustomerSavedPage = lazy(() => import("../pages/customer/CustomerSavedPage"));
const CustomerProfilePage = lazy(() => import("../pages/customer/CustomerProfilePage"));
const CustomerMessagesPage = lazy(() => import("../pages/customer/CustomerMessagesPage"));
const CustomerNotificationsPage = lazy(() => import("../pages/customer/CustomerNotificationsPage"));
const BecomeSellerPage = lazy(() => import("../pages/customer/BecomeSellerPage"));

// Seller Portal
const SellerDashboardPage = lazy(() => import("../pages/SellerDashboardPage"));
const SellerProductsPage = lazy(() => import("../pages/seller/SellerProductsPage"));
const SellerMessagesPage = lazy(() => import("../pages/seller/SellerMessagesPage"));
const SellerOrdersPage = lazy(() => import("../pages/seller/SellerOrdersPage"));
const AddProductPage = lazy(() => import("../pages/seller/AddProductPage"));
const EditProductPage = lazy(() => import("../pages/seller/EditProductPage"));
const BuyerChatPage = lazy(() => import("../pages/BuyerChatPage"));

// Admin Portal
const AdminLayout = lazy(() => import("../components/admin/AdminLayout"));
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));
const BrokerHubPage = lazy(() => import("../pages/admin/BrokerHubPage"));
const AdminProductsPage = lazy(() => import("../pages/admin/AdminProductsPage"));
const AdminStoresPage = lazy(() => import("../pages/admin/AdminStoresPage"));
const AdminCategoriesPage = lazy(() => import("../pages/admin/AdminCategoriesPage"));
const AdminUsersPage = lazy(() => import("../pages/admin/AdminUsersPage"));
const AdminSettingsPage = lazy(() => import("../pages/admin/AdminSettingsPage"));
const AdminManagementPage = lazy(() => import("../pages/admin/AdminManagementPage"));

function RouteLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="h-7 w-7 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
    </div>
  );
}

export default function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  // Safeguard: If WorkOS or an OAuth provider redirects to root or any path with ?code= or ?error=,
  // automatically forward to /auth/callback so authentication completes smoothly.
  useEffect(() => {
    if (
      location.pathname !== "/auth/callback" &&
      (location.search.includes("code=") || location.search.includes("error="))
    ) {
      navigate(`/auth/callback${location.search}`, { replace: true });
    }
  }, [location, navigate]);

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

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
            <Route path="/admin/admin-management" element={<AdminManagementPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}