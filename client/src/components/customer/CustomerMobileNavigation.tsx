import { Link, useNavigate } from "react-router-dom";
import { getUser, isAuthenticated, clearAuth } from "../../utils/authStorage";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

function CustomerMobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const navigate = useNavigate();
  const user = getUser();
  const authenticated = isAuthenticated();

  if (!isOpen) {
    return null;
  }

  const handleSellClick = () => {
    onClose();
    if (!authenticated) {
      navigate("/login");
    } else {
      navigate("/seller");
    }
  };

  const handleHomeClick = () => {
    onClose();
    navigate("/");
  };

  return (
    <div className="border-b border-gray-200 bg-white md:hidden">
      <nav className="flex flex-col px-6 py-4 space-y-1">
        <button
          type="button"
          onClick={handleHomeClick}
          className="border-b border-gray-100 py-3 text-left text-sm font-medium text-gray-700 hover:text-brand-600 focus:outline-none"
        >
          Home
        </button>

        <Link
          to="/products"
          onClick={onClose}
          className="border-b border-gray-100 py-3 text-sm font-medium text-gray-700 hover:text-brand-600"
        >
          Browse Products
        </Link>

        <button
          type="button"
          onClick={handleSellClick}
          className="border-b border-gray-100 py-3 text-left text-sm font-medium text-gray-700 hover:text-brand-600 focus:outline-none"
        >
          Sell
        </button>

        <Link
          to="/customer/orders"
          onClick={onClose}
          className="border-b border-gray-100 py-3 text-sm font-medium text-gray-700 hover:text-brand-600"
        >
          My Orders
        </Link>

        {authenticated && (
          <>
            <Link
              to="/customer/saved"
              onClick={onClose}
              className="border-b border-gray-100 py-3 text-sm font-medium text-gray-700 hover:text-brand-600"
            >
              Saved Items
            </Link>
            <Link
              to="/customer/cart"
              onClick={onClose}
              className="border-b border-gray-100 py-3 text-sm font-medium text-gray-700 hover:text-brand-600"
            >
              Cart
            </Link>
          </>
        )}

        {authenticated ? (
          <div className="mt-4 flex flex-col gap-2">
            <Link
              to="/customer/profile"
              onClick={onClose}
              className="rounded-lg bg-gray-100 py-2.5 text-center text-sm font-semibold text-gray-800 hover:bg-gray-200"
            >
              My Profile ({user?.full_name || "User"})
            </Link>
            <button
              type="button"
              onClick={() => {
                onClose();
                clearAuth();
                navigate("/login");
              }}
              className="rounded-lg border border-red-200 py-2.5 text-center text-sm font-semibold text-red-600 hover:bg-red-50 focus:outline-none"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            onClick={onClose}
            className="mt-4 rounded-lg bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700"
          >
            Sign In / Register
          </Link>
        )}
      </nav>
    </div>
  );
}

export default CustomerMobileNavigation;
