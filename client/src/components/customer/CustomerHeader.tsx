import {
  Bell,
  ShoppingCart,
  Store,
  User as UserIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/authStorage";

const CustomerHeader = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleSell = () => {
    if (user?.role?.toLowerCase() === "seller") {
      navigate("/seller-dashboard");
    } else {
      navigate("/customer/become-seller");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <button
          onClick={() => navigate("/customer")}
          className="text-xl font-bold text-gray-900"
        >
          Injibara Market
        </button>

        {/* Main Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <button
            onClick={() => navigate("/customer")}
            className="text-sm font-medium text-gray-900"
          >
            Home
          </button>

          <button
            onClick={() => navigate("/customer/notifications")}
            className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            Notifications
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">

          {/* Sell */}
          <button
            onClick={handleSell}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Store size={17} />
            <span className="hidden sm:inline">Sell</span>
          </button>

          {/* Notifications */}
          <button
            onClick={() => navigate("/customer/notifications")}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate("/customer/cart")}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={20} />
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate("/customer/profile")}
            className="rounded-full bg-gray-100 p-2 text-gray-700 transition hover:bg-gray-200"
            aria-label="Profile"
          >
            <UserIcon size={20} />
          </button>

        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;