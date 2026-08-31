import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { getUser, isAuthenticated, clearAuth } from '../../utils/authStorage';
import CustomerMobileNavigation from './CustomerMobileNavigation';

function CustomerNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = getUser();
  const authenticated = isAuthenticated();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((currentState) => !currentState);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSellClick = () => {
    if (!authenticated) {
      navigate('/login');
    } else if (user?.role?.toLowerCase() === 'seller') {
      navigate('/seller-dashboard');
    } else {
      navigate('/customer/become-seller');
    }
  };

  const handleHomeClick = () => {
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
          {/* Logo pattern icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-600 text-white font-bold text-lg select-none">
            አ
          </div>
          <button
            onClick={handleHomeClick}
            className="text-left leading-tight cursor-pointer focus:outline-none"
          >
            <div className="text-xs font-bold text-brand-700 tracking-wider font-ethiopic">እንጅባራ ገበያ</div>
            <div className="text-sm font-black text-gray-900 tracking-wide">INJIBARA MARKET</div>
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <button
            onClick={handleHomeClick}
            className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600 cursor-pointer"
          >
            Home
          </button>

          <Link
            to="/products"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600"
          >
            Categories
          </Link>

          <button
            onClick={handleSellClick}
            className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600 cursor-pointer"
          >
            Sell
          </button>

          <Link
            to={authenticated ? '/customer/notifications' : '/login'}
            className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600"
          >
            Notification
          </Link>

          <Link
            to="/"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600"
          >
            Help
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-5 md:flex">
          <Link
            to={authenticated ? '/customer/saved' : '/login'}
            className="text-gray-600 transition-colors hover:text-brand-600"
            aria-label="Saved products"
          >
            <Heart size={20} />
          </Link>

          <Link
            to={authenticated ? '/customer/cart' : '/login'}
            className="text-gray-600 transition-colors hover:text-brand-600"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
          </Link>

          {authenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/customer/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                aria-label="Profile"
              >
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Link>
              <button
                onClick={() => {
                  clearAuth();
                  navigate('/login');
                }}
                className="text-xs font-semibold text-gray-500 hover:text-brand-600 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-850"
            >
              Sign In / Register
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      <CustomerMobileNavigation isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </>
  );
}

export default CustomerNavbar;
