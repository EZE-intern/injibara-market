import { Outlet, Link } from "react-router-dom";
import { Home, User, Store } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="ml-64 flex min-h-screen flex-col">
        {/* Top bar for easy navigation back to marketplace and customer/seller portals */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-8 backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-semibold text-slate-800">Admin Control Panel</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-slate-900 shadow-sm"
            >
              <Home className="h-3.5 w-3.5 text-gray-500" />
              <span>Back to Marketplace</span>
            </Link>

            <Link
              to="/customer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-slate-900 shadow-sm"
            >
              <User className="h-3.5 w-3.5 text-gray-500" />
              <span>Customer View</span>
            </Link>

            <Link
              to="/seller"
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3.5 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-100 shadow-sm"
            >
              <Store className="h-3.5 w-3.5 text-purple-600" />
              <span>Seller View</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;