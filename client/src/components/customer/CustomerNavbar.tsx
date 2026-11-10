import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Heart, MessageSquare, Search, MapPin, ChevronDown } from "lucide-react";
import { getUser, isAuthenticated, clearAuth } from "../../utils/authStorage";
import { getUnreadCount } from "../../api/messageApi";
import { getSavedProducts } from "../../utils/savedStorage";
import ThemeToggle from "../common/ThemeToggle";
import AdeyLogo from "../common/AdeyLogo";
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
      ? "All Ethiopia"
      : AVAILABLE_LOCATIONS.find(
          (l) => l.value.toLowerCase() === activeLocation.toLowerCase()
        )?.label || activeLocation.charAt(0).toUpperCase() + activeLocation.slice(1);

  return (
    <>
      {/* ========================================================
          MOBILE VIEWPORT HEADER
      ========================================================= */}
      <header className="block md:hidden bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 sticky top-0 z-40">
        {/* Top Row: Logo + Bell & Chat Action Badges OR Sign In */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          {/* Adey Flower Logo */}
          <AdeyLogo size="sm" to="/" />

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {authenticated ? (
              /* Messages Chat Bubble with Count Badge */
              <Link
                to="/customer/messages"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                aria-label="Messages"
              >
                <MessageSquare size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-stone-950">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 px-3.5 py-1.5 text-xs font-bold shadow-xs transition"
              >
                Sign In
              </Link>
            )}

            <ThemeToggle />
          </div>
        </div>

        {/* Search Bar + Location Selector Row */}
        {!hideSearchOnMobile && (
          <div className="px-4 pb-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              {/* Search Pill Input */}
              <div className="flex flex-1 items-center gap-2 rounded-full border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 px-3.5 py-2 text-sm shadow-xs transition focus-within:border-amber-500 focus-within:bg-white dark:focus-within:bg-stone-800">
                <Search size={16} className="text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products across Ethiopia..."
                  className="w-full bg-transparent text-xs text-stone-900 dark:text-white placeholder-stone-400 outline-none"
                />
              </div>

              {/* Location Pill Selector */}
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 shadow-xs hover:border-amber-500 transition shrink-0 cursor-pointer"
              >
                <MapPin size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="truncate max-w-[85px]">{activeLocationLabel}</span>
                <ChevronDown size={14} className="text-stone-400 shrink-0" />
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
        <div className="w-full bg-stone-100/70 dark:bg-stone-900 border-b border-stone-200/70 dark:border-stone-800 py-1.5 px-6 text-xs text-stone-600 dark:text-stone-400 flex justify-between items-center lg:px-12">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-amber-600 dark:text-amber-400">🌼</span>
            <span>አደይ ገበያ • Where Ethiopia shops — መላው ኢትዮጵያ የሚገበይበት</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hover:text-amber-600 cursor-pointer font-medium">EN</span>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <span className="hover:text-amber-600 cursor-pointer font-medium">አማ</span>
          </div>
        </div>

        {/* Main Desktop Navbar */}
        <nav className="flex h-16 w-full items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-6 lg:px-12">
          {/* Logo */}
          <AdeyLogo size="md" to="/" />

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-6">
            <div className="flex items-center rounded-full border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-4 py-2 text-sm shadow-xs focus-within:border-amber-500 focus-within:bg-white dark:focus-within:bg-stone-800">
              <Search size={16} className="text-stone-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, crops, electronics, vehicles..."
                className="w-full bg-transparent text-xs text-stone-900 dark:text-white placeholder-stone-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="ml-2 flex items-center gap-1 text-xs font-semibold text-stone-600 dark:text-stone-300 border-l border-stone-200 dark:border-stone-700 pl-3 hover:text-amber-600"
              >
                <MapPin size={13} className="text-amber-600 dark:text-amber-400" />
                <span>{activeLocationLabel}</span>
              </button>
            </div>
          </form>

          {/* Desktop Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-stone-700 dark:text-stone-200 hover:text-amber-600 transition"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-sm font-medium text-stone-700 dark:text-stone-200 hover:text-amber-600 transition"
            >
              Browse
            </Link>
            <Link
              to={authenticated ? "/seller" : "/login"}
              className="text-sm font-medium text-stone-700 dark:text-stone-200 hover:text-amber-600 transition"
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
                className="relative text-stone-600 dark:text-stone-300 hover:text-amber-600 transition"
                aria-label="Messages"
              >
                <MessageSquare size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-stone-950">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Desktop Saved Products */}
            <Link
              to={authenticated ? "/customer/saved" : "/login"}
              className="relative text-stone-600 dark:text-stone-300 hover:text-amber-600 transition"
              aria-label="Saved products"
            >
              <Heart size={20} />
              {savedCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-stone-950">
                  {savedCount > 99 ? "99+" : savedCount}
                </span>
              )}
            </Link>

            {authenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/customer/profile"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15 text-sm font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 transition"
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
                  className="text-xs font-semibold text-stone-500 hover:text-amber-600 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 px-5 py-2 text-sm font-bold shadow-sm transition"
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
