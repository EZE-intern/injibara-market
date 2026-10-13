import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Home, User, Store, Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import ThemeToggle from "../common/ThemeToggle";

function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar: Responsive drawer on mobile, static on desktop */}
      <AdminSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Content wrapper: Full width on mobile (ml-0), offset on desktop (lg:ml-64) */}
      <div className="lg:ml-64 ml-0 flex min-h-screen flex-col transition-all duration-300">
        {/* Responsive top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 sm:px-6 lg:px-8 backdrop-blur">
          {/* Left: Mobile hamburger menu & Panel Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">
                Admin Control Panel
              </span>
              <span className="hidden sm:inline-block rounded-md bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700 dark:text-purple-300">
                Staff
              </span>
            </div>
          </div>

          {/* Right: Theme Toggle & Portal Links */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="flex items-center justify-center p-1 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <ThemeToggle />
            </div>

            {/* Desktop portal links */}
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 transition hover:bg-gray-50 dark:hover:bg-slate-800 shadow-xs"
              >
                <Home className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                <span>Marketplace</span>
              </Link>

              <Link
                to="/customer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 transition hover:bg-gray-50 dark:hover:bg-slate-800 shadow-xs"
              >
                <User className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                <span>Customer</span>
              </Link>

              <Link
                to="/seller"
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 transition hover:bg-purple-100 dark:hover:bg-purple-900/60 shadow-xs"
              >
                <Store className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>Seller View</span>
              </Link>
            </div>

            {/* Mobile compact portal icon buttons */}
            <div className="flex sm:hidden items-center gap-1.5">
              <Link
                to="/"
                title="Back to Marketplace"
                className="p-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                <Home className="h-4 w-4" />
              </Link>

              <Link
                to="/seller"
                title="Seller View"
                className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition"
              >
                <Store className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area: Responsive padding (p-4 on mobile, p-8 on desktop) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;