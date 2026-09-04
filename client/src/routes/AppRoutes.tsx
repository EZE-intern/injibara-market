import { Route, Routes } from "react-router-dom";

// Public
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProductsPage from "../pages/ProductsPage";
import ProductDetailPage from "../pages/ProductDetailPage";

// Customer
import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage";
import CustomerNotificationsPage from "../pages/customer/CustomerNotificationsPage";
import CustomerMessagesPage from "../pages/customer/CustomerMessagesPage";
import CustomerProfilePage from "../pages/customer/CustomerProfilePage";
import CustomerCartPage from "../pages/customer/CustomerCartPage";
import CustomerOrdersPage from "../pages/customer/CustomerOrdersPage";
import CustomerSavedPage from "../pages/customer/CustomerSavedPage";

// Seller
import SellerDashboardPage from "../pages/SellerDashboardPage";
import SellerOrdersPage from "../pages/seller/SellerOrdersPage";

// Admin
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import BrokerHubPage from "../pages/admin/BrokerHubPage";
import FaydaKycPage from "../pages/admin/FaydaKycPage";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
import AdminStoresPage from "../pages/admin/AdminStoresPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import AdminManagementPage from "../pages/admin/AdminManagementPage";


// Protection
import ProtectedCustomerRoute from "./ProtectedCustomerRoute";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import ProtectedSuperAdminRoute from "./ProtectedSuperAdminRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* =========================
          PUBLIC
      ========================= */}

      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route path="/products" element={<ProductsPage />} />

      <Route
        path="/products/:id"
        element={<ProductDetailPage />}
      />

      {/* =========================
          CUSTOMER
      ========================= */}

      <Route element={<ProtectedCustomerRoute />}>
        <Route
          path="/customer"
          element={<CustomerDashboardPage />}
        />

        <Route
          path="/customer/notifications"
          element={<CustomerNotificationsPage />}
        />

        <Route
          path="/customer/messages"
          element={<CustomerMessagesPage />}
        />

        <Route
          path="/customer/profile"
          element={<CustomerProfilePage />}
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
      </Route>

      {/* =========================
          SELLER
      ========================= */}

      <Route
        path="/seller"
        element={<SellerDashboardPage />}
      />

      <Route
        path="/seller-dashboard"
        element={<SellerDashboardPage />}
      />

      <Route
        path="/seller/dashboard"
        element={<SellerDashboardPage />}
      />

      <Route
        path="/seller/orders"
        element={<SellerOrdersPage />}
      />

      {/* =========================
          ADMIN
      ========================= */}

      <Route
        path="/admin"
        element={<ProtectedAdminRoute />}
      >
        <Route element={<AdminLayout />}>
          <Route
            index
            element={<AdminDashboardPage />}
          />

          <Route
            path="broker-hub"
            element={<BrokerHubPage />}
          />

          <Route
            path="fayda-kyc"
            element={<FaydaKycPage />}
          />

          <Route
            path="products"
            element={<AdminProductsPage />}
          />

          <Route
            path="stores"
            element={<AdminStoresPage />}
          />

          <Route
            path="categories"
            element={<AdminCategoriesPage />}
          />

          <Route
            path="users"
            element={<AdminUsersPage />}
          />

          <Route
            path="settings"
            element={<AdminSettingsPage />}
          />

      

          {/* SUPER ADMIN ONLY */}
          <Route element={<ProtectedSuperAdminRoute />}>
            <Route
              path="admin-management"
              element={<AdminManagementPage />}
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;