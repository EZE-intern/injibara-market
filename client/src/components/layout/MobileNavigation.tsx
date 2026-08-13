import { Link } from "react-router-dom";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileNavigation({
  isOpen,
  onClose,
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
          className="border-b border-gray-100 py-4 text-sm font-medium text-gray-700 hover:text-brand-600"
        >
          Home
        </Link>

        <Link
          to="/products"
          onClick={onClose}
          className="border-b border-gray-100 py-4 text-sm font-medium text-gray-700 hover:text-brand-600"
        >
          Products
        </Link>

        <Link
          to="/categories"
          onClick={onClose}
          className="border-b border-gray-100 py-4 text-sm font-medium text-gray-700 hover:text-brand-600"
        >
          Categories
        </Link>

        <Link
          to="/login"
          onClick={onClose}
          className="mt-4 rounded-lg bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700"
        >
          Login
        </Link>
      </nav>
    </div>
  );
}

export default MobileNavigation;