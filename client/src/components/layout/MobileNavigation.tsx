import { Link } from "react-router-dom";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

function MobileNavigation({
  isOpen,
  onClose,
  isLoggedIn,
  onLogout,
}: MobileNavigationProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 bg-white md:hidden">
      <nav className="flex flex-col px-6 py-4">
        <Link
          to="/"
          onClick={onClose}
          className="border-b border-gray-100 py-3 text-sm font-medium text-gray-700 hover:text-brand-600"
        >
          Home
        </Link>

        <Link
          to="/products"
          onClick={onClose}
          className="border-b border-gray-100 py-3 text-sm font-medium text-gray-700 hover:text-brand-600"
        >
          Products
        </Link>

        <Link
          to="/seller"
          onClick={onClose}
          className="border-b border-gray-100 py-3 text-sm font-bold text-brand-600"
        >
          🏪 Seller Dashboard
        </Link>

        {isLoggedIn ? (
          <div className="mt-4 flex flex-col gap-2">
            <Link
              to="/seller/products/new"
              onClick={onClose}
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-center text-sm font-bold text-white shadow-sm hover:bg-brand-700"
            >
              + Add Product
            </Link>
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout?.();
              }}
              className="rounded-lg border border-gray-300 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            onClick={onClose}
            className="mt-4 rounded-lg bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700"
          >
            Login
          </Link>
        )}
      </nav>
    </div>
  );
}

export default MobileNavigation;
