import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Bell } from "lucide-react";
import { getUser, isAuthenticated, clearAuth } from "../../utils/authStorage";
import { getUnreadCount } from "../../api/messageApi";
import { getSavedProducts } from "../../utils/savedStorage";
import CustomerMobileNavigation from "./CustomerMobileNavigation";
import ThemeToggle from "../common/ThemeToggle";

function isAdminRole(role?: string | null) {
  const normalized = role?.toLowerCase();
  return normalized === "admin" || normalized === "super_admin";
}

function CustomerNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = getUser();
  const authenticated = isAuthenticated();
  const isAdmin = isAdminRole(user?.role);

  const [unreadCount, setUnreadCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  // Fetch unread messages count
  useEffect(() => {
    if (!authenticated) return;
    const fetchUnread = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [authenticated]);

  // Track saved products count
  useEffect(() => {
    setSavedCount(getSavedProducts().length);
    const handleUpdate = () => {
      setSavedCount(getSavedProducts().length);
    };
    window.addEventListener('saved_products_updated', handleUpdate);
    return () => window.removeEventListener('saved_products_updated', handleUpdate);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((currentState) => !currentState);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSellClick = () => {
    if (!authenticated) {
      navigate("/login");
    } else {
      navigate("/seller");
    }
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <>
      {/* Top Bar */}
      <div className="w-full bg-gray-50 border-b border-gray-100 py-1.5 px-6 text-xs text-gray-500 flex justify-between items-center md:px-12 lg:px-16">
        <div>እንጅባራ ገበያ - Buy and sell from people around Injibara</div>
        <div className="flex items-center gap-3">
          <span className="hover:text-brand-600 cursor-pointer font-medium">EN</span>
          <span className="text-gray-300">|</span>
          <span className="hover:text-brand-600 cursor-pointer font-medium">አማ</span>
        </div>
      </div>

      <nav className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6 md:px-12 lg:px-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-base select-none shadow-sm">
              አ
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs font-bold text-brand-700 tracking-wider">እንጅባራ ገበያ</div>
              <div className="text-sm font-black text-gray-900 tracking-tight">INJIBARA MARKET</div>
            </div>
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <button
            type="button"
            onClick={handleHomeClick}
            className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600 cursor-pointer"
          >
            Home
          </button>

          <Link
            to="/products"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600"
          >
            Browse
          </Link>

          <button
            type="button"
            onClick={handleSellClick}
            className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600 cursor-pointer"
          >
            Sell
          </button>

          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-semibold text-purple-700 transition-colors hover:text-purple-800"
            >
              Admin
            </Link>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />

          {/* Notification Bell */}
          {authenticated && (
            <Link
              to="/customer/messages"
              className="relative text-gray-600 transition-colors hover:text-brand-600"
              aria-label="Messages"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Saved Products */}
          <Link
            to={authenticated ? "/customer/saved" : "/login"}
            className="relative text-gray-600 transition-colors hover:text-brand-600"
            aria-label="Saved products"
          >
            <Heart size={20} />
            {authenticated && savedCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {savedCount > 99 ? '99+' : savedCount}
              </span>
            )}
          </Link>

          {authenticated ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                to="/customer/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                aria-label="Profile"
              >
                {user?.full_name?.charAt(0).toUpperCase() || "U"}
              </Link>
              <button
                type="button"
                onClick={() => {
                  clearAuth();
                  navigate("/login");
                }}
                className="text-xs font-semibold text-gray-500 hover:text-brand-600 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 shadow-sm"
            >
              Sign In / Register
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <CustomerMobileNavigation isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </>
  );
}

export default CustomerNavbar;
