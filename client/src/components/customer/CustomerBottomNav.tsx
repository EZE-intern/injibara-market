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
  MessageSquare,
  Shield,
  X,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import toast from "react-hot-toast";
import { getUser, isAuthenticated, clearAuth } from "../../utils/authStorage";
import { getSavedProducts } from "../../utils/savedStorage";
import { useTheme } from "../../context/ThemeContext";
import useScrollDirection from "../../hooks/useScrollDirection";

export default function CustomerBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
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
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : "U";

  return (
    <>
      {/* ==============================================================
          FLOATING LIQUID GLASS DOCK (Telegram-inspired modern mobile bar)
          ============================================================== */}
      <nav
        className={`fixed bottom-3 inset-x-3 sm:inset-x-8 max-w-md mx-auto z-50 md:hidden transition-all duration-300 ease-out ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-24 opacity-0 pointer-events-none"
        }`}
        aria-label="Mobile Bottom Navigation"
      >
        <div className="relative rounded-[28px] bg-white/80 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.65)] ring-1 ring-black/5 dark:ring-white/5 overflow-visible">
          {/* Liquid glass top specular reflection sheen */}
          <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/25 to-transparent pointer-events-none rounded-t-[28px]" />

          <div className="flex h-16 items-center justify-around px-2 relative">
            {/* 1. Home Tab */}
            <Link
              to="/"
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 active:scale-90 ${
                isHome
                  ? "text-red-600 dark:text-red-500 font-bold"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div
                className={`flex items-center justify-center transition-all duration-200 ${
                  isHome
                    ? "bg-red-500/15 dark:bg-red-500/20 px-3.5 py-1 rounded-2xl shadow-xs"
                    : "px-3.5 py-1"
                }`}
              >
                <Home size={20} className={isHome ? "stroke-[2.5]" : "stroke-[1.8]"} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
            </Link>

            {/* 2. Explore Tab */}
            <Link
              to="/products"
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 active:scale-90 ${
                isExplore
                  ? "text-red-600 dark:text-red-500 font-bold"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div
                className={`flex items-center justify-center transition-all duration-200 ${
                  isExplore
                    ? "bg-red-500/15 dark:bg-red-500/20 px-3.5 py-1 rounded-2xl shadow-xs"
                    : "px-3.5 py-1"
                }`}
              >
                <Compass size={20} className={isExplore ? "stroke-[2.5]" : "stroke-[1.8]"} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Explore</span>
            </Link>

            {/* 3. Liquid Glass Floating Sell Gem Button */}
            <div className="flex flex-col items-center justify-center flex-1 relative -top-3.5">
              <button
                type="button"
                onClick={handleSellClick}
                aria-label="Sell Item"
                className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-red-500 hover:from-red-500 hover:to-rose-600 text-white shadow-[0_8px_22px_rgba(239,68,68,0.45)] ring-4 ring-white/90 dark:ring-slate-900/90 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                {/* Specular gloss refraction arc inside button */}
                <span className="absolute inset-x-2 top-0.5 h-3 rounded-t-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                <Plus
                  size={23}
                  strokeWidth={2.8}
                  className="relative z-10 transition-transform group-hover:rotate-90 duration-300"
                />
              </button>
              <span className="text-[10px] font-extrabold text-red-600 dark:text-red-400 mt-0.5 tracking-tight">
                Sell
              </span>
            </div>

            {/* 4. Saved Tab (Telegram style badge) */}
            <button
              type="button"
              onClick={handleSavedClick}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 active:scale-90 ${
                isSaved
                  ? "text-red-600 dark:text-red-500 font-bold"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className="relative">
                <div
                  className={`flex items-center justify-center transition-all duration-200 ${
                    isSaved
                      ? "bg-red-500/15 dark:bg-red-500/20 px-3.5 py-1 rounded-2xl shadow-xs"
                      : "px-3.5 py-1"
                  }`}
                >
                  <Bookmark size={20} className={isSaved ? "stroke-[2.5]" : "stroke-[1.8]"} />
                </div>
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-rose-600 px-1 text-[9px] font-black text-white shadow-xs ring-1 ring-white dark:ring-slate-900">
                    {savedCount > 99 ? "99+" : savedCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Saved</span>
            </button>

            {/* 5. Profile Tab (Telegram-style avatar pill) */}
            <button
              type="button"
              onClick={handleProfileClick}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 active:scale-90 ${
                isProfile
                  ? "text-red-600 dark:text-red-500 font-bold"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div
                className={`flex items-center justify-center transition-all duration-200 ${
                  isProfile
                    ? "bg-red-500/15 dark:bg-red-500/20 px-3.5 py-1 rounded-2xl shadow-xs"
                    : "px-3.5 py-1"
                }`}
              >
                {authenticated && user?.full_name ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-[10px] font-bold text-white shadow-xs ring-1 ring-white/60 dark:ring-slate-800">
                    {userInitial}
                  </div>
                ) : (
                  <User size={20} className={isProfile ? "stroke-[2.5]" : "stroke-[1.8]"} />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Profile</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ==============================================================
          TELEGRAM-STYLE LIQUID GLASS PROFILE / SETTINGS SHEET
          ============================================================== */}
      {isProfileSheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={() => setIsProfileSheetOpen(false)}
        >
          <div
            className="w-full rounded-t-[32px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-5 shadow-2xl border-t border-white/40 dark:border-white/10 transition-all max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Telegram Drag Handle */}
            <div className="mx-auto h-1 w-10 rounded-full bg-gray-300 dark:bg-slate-700 mb-4" />

            {/* Header: User Profile Card (Telegram Avatar Style) */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="relative flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 font-extrabold text-white text-xl shadow-md ring-2 ring-white/80 dark:ring-slate-800">
                  {userInitial}
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    {user?.full_name || "Injibara User"}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                    {user?.email || user?.phone || "Connected"}
                  </p>
                  <span className="inline-block mt-1 rounded-md bg-red-50 dark:bg-red-950/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    {user?.role || "CUSTOMER"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileSheetOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close sheet"
              >
                <X size={20} />
              </button>
            </div>

            {/* Grouped Telegram-Style Settings List */}
            <div className="mt-4 space-y-1.5">
              {/* Profile Details */}
              <Link
                to="/customer/profile"
                onClick={() => setIsProfileSheetOpen(false)}
                className="flex items-center justify-between rounded-2xl px-3.5 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/70 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/20 dark:text-sky-400">
                    <UserCheck size={19} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      My Profile Details
                    </span>
                    <p className="text-[11px] text-gray-400">Personal info, phone, bio</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Seller Dashboard */}
              <Link
                to="/seller"
                onClick={() => setIsProfileSheetOpen(false)}
                className="flex items-center justify-between rounded-2xl px-3.5 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/70 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <Store size={19} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Seller Dashboard
                    </span>
                    <p className="text-[11px] text-gray-400">Manage products, orders & shop</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Admin Panel (if authorized) */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsProfileSheetOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-3.5 py-3 bg-purple-500/5 hover:bg-purple-500/10 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 transition group border border-purple-500/15"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:bg-purple-500/25 dark:text-purple-300">
                      <Shield size={19} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                        Admin Control Panel
                      </span>
                      <p className="text-[11px] text-purple-600/70 dark:text-purple-400/70">
                        Overview, users, brokers & approvals
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-purple-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}

              {/* Saved Items */}
              <Link
                to="/customer/saved"
                onClick={() => setIsProfileSheetOpen(false)}
                className="flex items-center justify-between rounded-2xl px-3.5 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/70 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400">
                    <Bookmark size={19} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Saved Listings
                    </span>
                    <p className="text-[11px] text-gray-400">Products you bookmarked</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {savedCount > 0 && (
                    <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                      {savedCount}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              {/* My Orders */}
              <Link
                to="/customer/orders"
                onClick={() => setIsProfileSheetOpen(false)}
                className="flex items-center justify-between rounded-2xl px-3.5 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/70 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400">
                    <ShoppingBag size={19} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      My Orders
                    </span>
                    <p className="text-[11px] text-gray-400">Track purchase history</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Chat Messages */}
              <Link
                to="/customer/messages"
                onClick={() => setIsProfileSheetOpen(false)}
                className="flex items-center justify-between rounded-2xl px-3.5 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/70 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400">
                    <MessageSquare size={19} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Direct Messages
                    </span>
                    <p className="text-[11px] text-gray-400">Chat with sellers and buyers</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Dark / Light Mode Switch Row */}
              <div
                onClick={toggleTheme}
                className="flex items-center justify-between rounded-2xl px-3.5 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/70 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400">
                    {theme === "dark" ? <Moon size={19} /> : <Sun size={19} />}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Theme Appearance
                    </span>
                    <p className="text-[11px] text-gray-400">
                      {theme === "dark" ? "Night / Dark mode active" : "Day / Light mode active"}
                    </p>
                  </div>
                </div>
                <div className="rounded-full bg-gray-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {theme === "dark" ? "Dark" : "Light"}
                </div>
              </div>
            </div>

            {/* Telegram-style Sign Out Button */}
            <div className="mt-5 pt-3 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200/80 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/40 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100/90 dark:hover:bg-red-900/40 transition active:scale-98 cursor-pointer"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
