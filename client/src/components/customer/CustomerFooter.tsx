import { Link } from "react-router-dom";
import AdeyLogo from "../common/AdeyLogo";

function CustomerFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-600 dark:text-stone-400 py-6 sm:py-8 pb-24 sm:pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Row: Logo on left, Nav links on right */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AdeyLogo size="sm" to="/" />
            <span className="hidden md:inline-block text-xs text-stone-400 dark:text-stone-500 border-l border-stone-200 dark:border-stone-800 pl-3">
              Where Ethiopia shops • አደይ ገበያ
            </span>
          </div>

          {/* Inline Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
            <Link
              to="/products"
              className="hover:text-amber-600 dark:hover:text-amber-400 transition"
            >
              Browse
            </Link>
            <Link
              to="/categories"
              className="hover:text-amber-600 dark:hover:text-amber-400 transition"
            >
              Categories
            </Link>
            <Link
              to="/seller"
              className="hover:text-amber-600 dark:hover:text-amber-400 transition"
            >
              Seller Hub
            </Link>
            <Link
              to="/customer/saved"
              className="hover:text-amber-600 dark:hover:text-amber-400 transition"
            >
              Saved Items
            </Link>
            <Link
              to="/customer/messages"
              className="hover:text-amber-600 dark:hover:text-amber-400 transition"
            >
              Messages
            </Link>
          </nav>
        </div>

        {/* Bottom Sub-Row: Copyright & Location */}
        <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-400 dark:text-stone-500">
          <p>&copy; {currentYear} Adey Market (አደይ ገበያ). All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span>Serving all regions across Ethiopia • መላው ኢትዮጵያ</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default CustomerFooter;
