import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MobileNavigation from "./MobileNavigation";
import ThemeToggle from "../common/ThemeToggle";
import AdeyLogo from "../common/AdeyLogo";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("adey_market_token") || localStorage.getItem("token");
    setIsLoggedIn(Boolean(token));
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((currentState) => !currentState);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adey_market_token");
    localStorage.removeItem("adey_market_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <>
      <nav className="flex h-16 w-full items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-6 md:px-12">
        {/* Logo */}
        <AdeyLogo size="md" to="/" />

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-stone-700 dark:text-stone-300 transition-colors hover:text-amber-600 dark:hover:text-amber-400"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="text-sm font-medium text-stone-700 dark:text-stone-300 transition-colors hover:text-amber-600 dark:hover:text-amber-400"
          >
            Products
          </Link>
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <Link
                to="/seller/products/new"
                className="rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-stone-950 shadow-sm transition-colors"
              >
                + Add Product
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-stone-200 dark:border-stone-700 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 px-5 py-2.5 text-sm font-bold transition-colors"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label={
              isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="rounded-md p-2 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
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

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
    </>
  );
}

export default Navbar;
