import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/productApi";

export default function SellerDashboardPage() {
  const [productCount, setProductCount] = useState<number>(0);
  const [userName, setUserName] = useState<string>("Seller");

  useEffect(() => {
    // Read user from localStorage if available
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.full_name) setUserName(parsed.full_name);
      } catch (e) {
        console.error("Failed to parse user session:", e);
      }
    }

    // Fetch product count
    const fetchStats = async () => {
      try {
        const products = await getProducts();
        setProductCount(products.length);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                🏪 Injibara Market Seller Hub
              </p>
              <h1 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Welcome back, {userName}!
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your store listings, review buyer requests, and track your marketplace performance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/products"
                className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:border-gray-400"
              >
                🛍️ Browse as Buyer
              </Link>
              <Link
                to="/seller/products/new"
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
              >
                ➕ Add New Product
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Stats */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total Products
              </p>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                Active
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-gray-900">
              {productCount}
            </p>
            <p className="mt-1 text-xs text-gray-500">Listed across Injibara</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Inspection Ready
              </p>
              <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                Verified
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-gray-900">6-Sided</p>
            <p className="mt-1 text-xs text-gray-500">Multi-angle photo support</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Storage
              </p>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Cloudinary
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-gray-900">CDN Fast</p>
            <p className="mt-1 text-xs text-gray-500">Optimized media hosting</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Database
              </p>
              <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                TiDB Live
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-gray-900">Online</p>
            <p className="mt-1 text-xs text-gray-500">Synchronized realtime</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Seller management quick links */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900">
              Quick Management Shortcuts
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Jump directly to store operations.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                to="/seller/products"
                className="group flex flex-col rounded-xl border border-gray-200 p-5 transition hover:border-brand-300 hover:bg-brand-50/10 hover:shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl text-brand-700 group-hover:bg-brand-100">
                  📦
                </div>
                <h3 className="mt-3 font-bold text-gray-900 group-hover:text-brand-700">
                  የእኔ ምርቶች (My Products)
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  View, inspect angles, or delete your existing listings.
                </p>
              </Link>

              <Link
                to="/seller/products/new"
                className="group flex flex-col rounded-xl border border-gray-200 p-5 transition hover:border-brand-300 hover:bg-brand-50/10 hover:shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl text-green-700 group-hover:bg-green-100">
                  ➕
                </div>
                <h3 className="mt-3 font-bold text-gray-900 group-hover:text-green-800">
                  ምርት መመዝገቢያ (Add Product)
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Register a new item with 6-sided inspection photos.
                </p>
              </Link>

              <Link
                to="/products"
                className="group flex flex-col rounded-xl border border-gray-200 p-5 transition hover:border-brand-300 hover:bg-brand-50/10 hover:shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-700 group-hover:bg-blue-100">
                  🛒
                </div>
                <h3 className="mt-3 font-bold text-gray-900 group-hover:text-blue-800">
                  ገበያ (Marketplace)
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  See how your products appear to buyers across Injibara.
                </p>
              </Link>

              <Link
                to="/customer/profile"
                className="group flex flex-col rounded-xl border border-gray-200 p-5 transition hover:border-brand-300 hover:bg-brand-50/10 hover:shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl text-purple-700 group-hover:bg-purple-100">
                  ⚙️
                </div>
                <h3 className="mt-3 font-bold text-gray-900 group-hover:text-purple-800">
                  መለያ (Account Profile)
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Manage store contact numbers and account credentials.
                </p>
              </Link>
            </div>
          </div>

          {/* Seller Status Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Seller Account Status
              </h2>
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200 text-green-800 font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-900">Active Merchant</p>
                    <p className="text-xs text-green-700">Verified Injibara seller</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-gray-100 pt-4 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="font-semibold text-gray-800">Injibara, Awi Zone</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Multi-Angle Photos</span>
                  <span className="font-semibold text-green-700">Enabled (6 sides)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cloud Storage</span>
                  <span className="font-semibold text-gray-800">Active</span>
                </div>
              </div>
            </div>

            <Link
              to="/seller/products/new"
              className="mt-6 block rounded-xl bg-brand-600 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
            >
              List Another Item 🚀
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}