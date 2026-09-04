import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUnreadCount } from "../../api/messageApi";
import { getUser } from "../../utils/authStorage";

function CustomerNavbar() {
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  const user = getUser();

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Failed to load unread notifications:", error);
      }
    };

    loadUnreadCount();
  }, []);

  const handleSell = () => {
    navigate("/seller-dashboard");
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/customer"
          className="text-xl font-bold text-purple-700"
        >
          Injibara Market
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-6 md:flex">

          {/* Home */}
          <Link
            to="/customer"
            className="text-sm font-medium text-gray-700 transition hover:text-purple-600"
          >
            Home
          </Link>

          {/* Marketplace */}
          <Link
            to="/marketplace"
            className="text-sm font-medium text-gray-700 transition hover:text-purple-600"
          >
            Marketplace
          </Link>

          {/* Notification */}
          <Link
            to="/customer/notifications"
            className="relative text-sm font-medium text-gray-700 transition hover:text-purple-600"
          >
            Notification

            {unreadCount > 0 && (
              <span className="absolute -right-4 -top-2 min-w-[18px] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Orders */}
          <Link
            to="/customer/orders"
            className="text-sm font-medium text-gray-700 transition hover:text-purple-600"
          >
            Orders
          </Link>

          {/* Saved */}
          <Link
            to="/customer/saved"
            className="text-sm font-medium text-gray-700 transition hover:text-purple-600"
          >
            Saved
          </Link>

          {/* Profile */}
          <Link
            to="/customer/profile"
            className="text-sm font-medium text-gray-700 transition hover:text-purple-600"
          >
            Profile
          </Link>

          {/* Cart */}
          <Link
            to="/customer/cart"
            className="text-sm font-medium text-gray-700 transition hover:text-purple-600"
          >
            Cart
          </Link>

          {/* Sell */}
          <button
            type="button"
            onClick={handleSell}
            className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            Sell
          </button>
        </div>

        {/* Mobile Sell button */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={handleSell}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Sell
          </button>
        </div>
      </div>
    </nav>
  );
}

export default CustomerNavbar;