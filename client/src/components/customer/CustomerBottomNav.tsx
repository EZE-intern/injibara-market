import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Compass,
  Plus,
  Bookmark,
  User,
  LogOut,
  UserCheck,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { getUser, isAuthenticated, clearAuth } from "../../utils/authStorage";
import { getSavedProducts } from "../../utils/savedStorage";
import useScrollDirection from "../../hooks/useScrollDirection";

export default function CustomerBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isVisible = useScrollDirection({ threshold: 8 });
  const [savedCount, setSavedCount] = useState(0);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);

  const authenticated = isAuthenticated();
  const user = getUser();
  const pathname = location.pathname;

  // Track saved products count
  useEffect(() => {
    setSavedCount(getSavedProducts().length);
    const handleUpdate = () => {
      setSavedCount(getSavedProducts().length);
    };
    window.addEventListener("saved_products_updated", handleUpdate);
    return () => window.removeEventListener("saved_products_updated", handleUpdate);
  }, []);

  const handleSellClick = () => {
    if (!authenticated) {
      navigate("/login");
    } else {
      navigate("/seller/products/new");
    }
  };

  const handleProfileClick = () => {
    if (!authenticated) {
      navigate("/login");
    } else {
      setIsProfileSheetOpen(true);
    }
  };

  const handleSignOut = () => {
    clearAuth();
    setIsProfileSheetOpen(false);
    toast.success("Signed out successfully");
    navigate("/login");
  };

  const handleSavedClick = () => {
    if (!authenticated) {
      navigate("/login");
    } else {
      navigate("/customer/saved");
    }
  };

  const isHome = pathname === "/";
  const isExplore = pathname.startsWith("/products") || pathname.startsWith("/categories");
  const isSaved = pathname === "/customer/saved";
  const isProfile = pathname.startsWith("/customer/profile") || pathname === "/login";

  return (
    <>
      <nav
        className={`fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
        aria-label="Mobile Bottom Navigation"
      >
        <div className="flex h-16 items-center justify-around px-2 relative pb-[env(safe-area-inset-bottom)]">
          {/* 1. Home Tab */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isHome
                ? "text-red-600 dark:text-red-500 font-bold"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Home size={22} className={isHome ? "stroke-[2.5]" : "stroke-[1.8]"} />
            <span className="text-[11px] mt-1">Home</span>
          </Link>

          {/* 2. Explore Tab */}
          <Link
            to="/products"
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isExplore
                ? "text-red-600 dark:text-red-500 font-bold"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Compass size={22} className={isExplore ? "stroke-[2.5]" : "stroke-[1.8]"} />
            <span className="text-[11px] mt-1">Explore</span>
          </Link>

          {/* 3. Central Floating Sell Button */}
          <div className="flex flex-col items-center justify-center flex-1 relative -top-3">
            <button
              type="button"
              onClick={handleSellClick}
              aria-label="Sell Item"
              className="flex h-13 w-13 items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 border-4 border-white dark:border-slate-900 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
            <span className="text-[11px] font-bold text-red-600 dark:text-red-500 mt-0.5">
              Sell
            </span>
          </div>

          {/* 4. Saved Tab */}
          <button
            type="button"
            onClick={handleSavedClick}
            className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isSaved
                ? "text-red-600 dark:text-red-500 font-bold"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <div className="relative">
              <Bookmark size={22} className={isSaved ? "stroke-[2.5]" : "stroke-[1.8]"} />
              {savedCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white">
                  {savedCount > 99 ? "99+" : savedCount}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-1">Saved</span>
          </button>

          {/* 5. Profile Tab */}
          <button
            type="button"
            onClick={handleProfileClick}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isProfile
                ? "text-red-600 dark:text-red-500 font-bold"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <User size={22} className={isProfile ? "stroke-[2.5]" : "stroke-[1.8]"} />
            <span className="text-[11px] mt-1">Profile</span>
          </button>
        </div>
      </nav>

      {/* Mobile Profile Sheet with Sign Out */}
      {isProfileSheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsProfileSheetOpen(false)}
        >
          <div
            className="w-full rounded-t-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl transition-all max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/60 font-bold text-red-600 text-lg">
                  {user?.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {user?.full_name || "User"}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {user?.email || "Logged in"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileSheetOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Links */}
            <div className="mt-4 space-y-1.5">
              <Link
                to="/customer/profile"
                onClick={() => setIsProfileSheetOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                <UserCheck size={18} className="text-gray-400" />
                <span>My Profile Details</span>
              </Link>

              <Link
                to="/seller"
                onClick={() => setIsProfileSheetOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                <Store size={18} className="text-gray-400" />
                <span>Seller Dashboard</span>
              </Link>

              <Link
                to="/customer/saved"
                onClick={() => setIsProfileSheetOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                <Bookmark size={18} className="text-gray-400" />
                <span>Saved Items</span>
              </Link>

              <Link
                to="/customer/orders"
                onClick={() => setIsProfileSheetOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                <ShoppingBag size={18} className="text-gray-400" />
                <span>My Orders</span>
              </Link>
            </div>

            {/* Sign Out Button */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100 transition cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
