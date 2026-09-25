import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Bell, MessageSquare, Search, MapPin, ChevronDown } from "lucide-react";
import { getUser, isAuthenticated, clearAuth } from "../../utils/authStorage";
import { getUnreadCount } from "../../api/messageApi";
import { getSavedProducts } from "../../utils/savedStorage";
import ThemeToggle from "../common/ThemeToggle";
import InjibaraLogo from "../common/InjibaraLogo";
import LocationSelectorModal, { AVAILABLE_LOCATIONS } from "./LocationSelectorModal";

function isAdminRole(role?: string | null) {
  const normalized = role?.toLowerCase();
  return normalized === "admin" || normalized === "super_admin";
}

interface CustomerNavbarProps {
  onLocationChange?: (newLoc: string) => void;
  selectedLocation?: string;
  hideSearchOnMobile?: boolean;
}

export default function CustomerNavbar({
  onLocationChange,
  selectedLocation: propLocation,
  hideSearchOnMobile = false,
}: CustomerNavbarProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = getUser();
  const authenticated = isAuthenticated();
  const isAdmin = isAdminRole(user?.role);

  const [unreadCount, setUnreadCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Active location: controlled by prop, URL, or default empty (all locations)
  const urlLocation = searchParams.get("location") || "";
  const [activeLocation, setActiveLocation] = useState(
    propLocation !== undefined ? propLocation : urlLocation || ""
  );

  useEffect(() => {
    if (propLocation !== undefined) {
      setActiveLocation(propLocation);
    } else if (urlLocation) {
      setActiveLocation(urlLocation);
    } else {
      setActiveLocation("");
    }
  }, [propLocation, urlLocation]);

  // Fetch unread messages count
  useEffect(() => {
    if (!authenticated) return;
    const fetchUnread = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to fetch unread count", err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [authenticated]);

  // Track saved products count
  useEffect(() => {
    setSavedCount(getSavedProducts().length);
    const handleUpdate = () => {
      setSavedCount(getSavedProducts().length);
    };
    window.addEventListener("saved_products_updated", handleUpdate);
    return () => window.removeEventListener("saved_products_updated", handleUpdate);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    if (activeLocation && activeLocation.toLowerCase() !== "all") {
      params.set("location", activeLocation.toLowerCase());
    }
    const qs = params.toString();
    navigate(qs ? `/products?${qs}` : "/products");
  };

  const handleSelectLocation = (locValue: string) => {
    setActiveLocation(locValue);
    if (onLocationChange) {
      onLocationChange(locValue);
    } else {
      const params = new URLSearchParams(searchParams);
      if (locValue && locValue.toLowerCase() !== "all") {
        params.set("location", locValue.toLowerCase());
      } else {
        params.delete("location");
      }
      const qs = params.toString();
      navigate(qs ? `/products?${qs}` : "/products");
    }
  };

  const activeLocationLabel =
    !activeLocation || activeLocation.toLowerCase() === "all"
      ? "All"
      : AVAILABLE_LOCATIONS.find(
          (l) => l.value.toLowerCase() === activeLocation.toLowerCase()
        )?.label || activeLocation.charAt(0).toUpperCase() + activeLocation.slice(1);

  return (
    <>
      {/* ========================================================
          MOBILE VIEWPORT HEADER (Matching mock.ux.png 1:1)
      ========================================================= */}
      <header className="block md:hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-40">
        {/* Top Row: Logo + Bell & Chat Action Badges OR Sign In */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          {/* Logo with traditional Ethiopian emblem */}
          <InjibaraLogo size="sm" to="/" />

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {authenticated ? (
              <>
                {/* Notification Bell */}
                <Link
                  to="/customer/notifications"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {/* Red Indicator Dot */}
                  <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-slate-900" />
                </Link>

                {/* Messages Chat Bubble with Count Badge */}
                <Link
                  to="/customer/messages"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                  aria-label="Messages"
                >
                  <MessageSquare size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-red-600 hover:bg-red-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition"
              >
                Sign In
              </Link>
            )}

            <ThemeToggle />
          </div>
        </div>

        {/* Search Bar + Location Selector Row (Optional on mobile) */}
        {!hideSearchOnMobile && (
          <div className="px-4 pb-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              {/* Search Pill Input */}
              <div className="flex flex-1 items-center gap-2 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 px-3.5 py-2 text-sm shadow-xs transition focus-within:border-red-600 focus-within:bg-white dark:focus-within:bg-slate-800">
                <Search size={16} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, services..."
                  className="w-full bg-transparent text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                />
              </div>

              {/* Location Pill Selector */}
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200 shadow-xs hover:border-red-600 transition shrink-0 cursor-pointer"
              >
                <MapPin size={14} className="text-red-600 dark:text-red-500 shrink-0" />
                <span className="truncate max-w-[85px]">{activeLocationLabel}</span>
                <ChevronDown size={14} className="text-gray-400 shrink-0" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ========================================================
          DESKTOP VIEWPORT NAVBAR (md: and above)
      ========================================================= */}
      <div className="hidden md:block">
        {/* Top Info Bar */}
        <div className="w-full bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 py-1.5 px-6 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center lg:px-12">
          <div>እንጅባራ ገበያ - Buy and sell from people around Injibara</div>
          <div className="flex items-center gap-3">
            <span className="hover:text-red-600 cursor-pointer font-medium">EN</span>
            <span className="text-gray-300">|</span>
            <span className="hover:text-red-600 cursor-pointer font-medium">አማ</span>
          </div>
        </div>

        {/* Main Desktop Navbar */}
        <nav className="flex h-16 w-full items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 lg:px-12">
          {/* Logo */}
          <InjibaraLogo size="md" to="/" />

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-6">
            <div className="flex items-center rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-4 py-2 text-sm shadow-xs focus-within:border-red-600 focus-within:bg-white dark:focus-within:bg-slate-800">
              <Search size={16} className="text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, services, vehicles..."
                className="w-full bg-transparent text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="ml-2 flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 border-l border-gray-200 dark:border-slate-700 pl-3 hover:text-red-600"
              >
                <MapPin size={13} className="text-red-600" />
                <span>{activeLocationLabel}</span>
              </button>
            </div>
          </form>

          {/* Desktop Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 transition"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 transition"
            >
              Browse
            </Link>
            <Link
              to={authenticated ? "/seller" : "/login"}
              className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 transition"
            >
              Sell
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-semibold text-purple-700 dark:text-purple-400 hover:text-purple-800 transition"
              >
                Admin
              </Link>
            )}

            <ThemeToggle />

            {/* Desktop Messages Bell */}
            {authenticated && (
              <Link
                to="/customer/messages"
                className="relative text-gray-600 dark:text-gray-300 hover:text-red-600 transition"
                aria-label="Messages"
              >
                <MessageSquare size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Desktop Saved Products */}
            <Link
              to={authenticated ? "/customer/saved" : "/login"}
              className="relative text-gray-600 dark:text-gray-300 hover:text-red-600 transition"
              aria-label="Saved products"
            >
              <Heart size={20} />
              {savedCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {savedCount > 99 ? "99+" : savedCount}
                </span>
              )}
            </Link>

            {authenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/customer/profile"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/60 text-sm font-bold text-red-600 hover:bg-red-100 transition"
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
                  className="text-xs font-semibold text-gray-500 hover:text-red-600 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 shadow-sm transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        selectedLocation={activeLocation}
        onSelect={handleSelectLocation}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
}
