import { Link } from "react-router-dom";
import InjibaraLogo from "../common/InjibaraLogo";

function CustomerFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-gray-600 dark:text-gray-400 py-6 sm:py-8 pb-24 sm:pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Row: Logo on left, Nav links on right */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <InjibaraLogo size="sm" to="/" />
            <span className="hidden md:inline-block text-xs text-gray-400 dark:text-gray-500 border-l border-gray-200 dark:border-slate-800 pl-3">
              Trusted local marketplace in Injibara & Awi Zone
            </span>
          </div>

          {/* Inline Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <Link
              to="/products"
              className="hover:text-red-600 dark:hover:text-red-400 transition"
            >
              Browse
            </Link>
            <Link
              to="/categories"
              className="hover:text-red-600 dark:hover:text-red-400 transition"
            >
              Categories
            </Link>
            <Link
              to="/seller"
              className="hover:text-red-600 dark:hover:text-red-400 transition"
            >
              Seller Hub
            </Link>
            <Link
              to="/customer/saved"
              className="hover:text-red-600 dark:hover:text-red-400 transition"
            >
              Saved Items
            </Link>
            <Link
              to="/customer/messages"
              className="hover:text-red-600 dark:hover:text-red-400 transition"
            >
              Messages
            </Link>
          </nav>
        </div>

        {/* Bottom Sub-Row: Copyright & Location */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-400 dark:text-gray-500">
          <p>&copy; {currentYear} Injibara Market. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Injibara & Awi Zone, Ethiopia</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default CustomerFooter;
