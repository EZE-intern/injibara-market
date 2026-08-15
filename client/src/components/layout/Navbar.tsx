import { useState } from 'react';
import { Link } from 'react-router-dom';
import MobileNavigation from './MobileNavigation';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((currentState) => !currentState);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6 md:px-12">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-gray-900">
          Injibara Market
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600"
          >
            Products
          </Link>

          <Link
            to="/categories"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600"
          >
            Categories
          </Link>
        </div>

        {/* Desktop login */}
        <Link
          to="/login"
          className="hidden rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 md:block"
        >
          Login
        </Link>

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

      <MobileNavigation isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </>
  );
}

export default Navbar;
