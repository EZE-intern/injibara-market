import { Link, useNavigate } from 'react-router-dom';
import { getUser, isAuthenticated, clearAuth } from '../../utils/authStorage';

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
      navigate('/login');
    } else if (user?.role?.toLowerCase() === 'seller') {
      navigate('/seller-dashboard');
    } else {
      navigate('/customer/become-seller');
    }
  };

  const handleHomeClick = () => {
    onClose();
    if (authenticated) {
      if (user?.role?.toLowerCase() === 'seller') {
        navigate('/seller-dashboard');
      } else {
        navigate('/customer');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white md:hidden">
      <nav className="flex flex-col px-6 py-4 space-y-1">
        <button
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
          Categories
        </Link>

        <button
          onClick={handleSellClick}
          className="border-b border-gray-100 py-3 text-left text-sm font-medium text-gray-700 hover:text-brand-600 focus:outline-none"
        >
          Sell
        </button>

        <Link
          to={authenticated ? '/customer/notifications' : '/login'}
          onClick={onClose}
          className="border-b border-gray-100 py-3 text-sm font-medium text-gray-700 hover:text-brand-600"
        >
          Notification
        </Link>

        <Link
          to="/"
          onClick={onClose}
          className="border-b border-gray-100 py-3 text-sm font-medium text-gray-700 hover:text-brand-600"
        >
          Help
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
              My Profile ({user?.full_name || 'User'})
            </Link>
            <button
              onClick={() => {
                onClose();
                clearAuth();
                navigate('/login');
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
            className="mt-4 rounded-lg bg-brand-700 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-850"
          >
            Sign In / Register
          </Link>
        )}
      </nav>
    </div>
  );
}

export default CustomerMobileNavigation;
