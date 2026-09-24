import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, isAuthenticated, clearAuth } from "../../utils/authStorage";
import { getSavedProducts } from "../../utils/savedStorage";
import { getUnreadCount } from "../../api/messageApi";
import ThemeToggle from "../common/ThemeToggle";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

function CustomerMobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const navigate = useNavigate();
  const user = getUser();
  const authenticated = isAuthenticated();

  const [savedCount, setSavedCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setSavedCount(getSavedProducts().length);
    const handleUpdate = () => setSavedCount(getSavedProducts().length);
    window.addEventListener('saved_products_updated', handleUpdate);
    return () => window.removeEventListener('saved_products_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const fetchUnread = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };
    fetchUnread();
  }, [authenticated]);

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

        {authenticated && (
          <>
            <Link
              to="/customer/saved"
              onClick={onClose}
              className="border-b border-gray-100 py-3 text-sm font-medium text-gray-700 hover:text-brand-600 flex items-center justify-between"
            >
              <span>Saved Items</span>
              {savedCount > 0 && (
                <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
                  {savedCount}
                </span>
              )}
            </Link>
            <Link
              to="/customer/messages"
              onClick={onClose}
              className="border-b border-gray-100 py-3 text-sm font-medium text-gray-700 hover:text-brand-600 flex items-center justify-between"
            >
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          </>
        )}

        <div className="py-2 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Appearance</span>
          <ThemeToggle showLabel={true} />
        </div>

        {authenticated ? (
          <div className="mt-4 flex flex-col gap-2">
            {(user?.role?.toLowerCase() === "admin" ||
              user?.role?.toLowerCase() === "super_admin") && (
              <Link
                to="/admin"
                onClick={onClose}
                className="rounded-lg bg-purple-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-purple-700"
              >
                Admin Panel
              </Link>
            )}
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
