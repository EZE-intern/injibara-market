import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, Plus, Bookmark, User } from "lucide-react";
import { isAuthenticated } from "../../utils/authStorage";
import { getSavedProducts } from "../../utils/savedStorage";
import useScrollDirection from "../../hooks/useScrollDirection";

export default function CustomerBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isVisible = useScrollDirection({ threshold: 8 });
  const [savedCount, setSavedCount] = useState(0);

  const authenticated = isAuthenticated();
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
      navigate("/customer/profile");
    }
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
  );
}
