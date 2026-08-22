import { NavLink, useNavigate } from "react-router-dom";

interface CustomerSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

function CustomerSidebar({
  mobileOpen = false,
  onClose,
}: CustomerSidebarProps) {
  const navigate = useNavigate();

  const navigation = [
    {
      name: "Dashboard",
      path: "/customer",
      icon: "⌂",
    },
    {
      name: "Browse Products",
      path: "/products",
      icon: "🛍",
    },
    {
      name: "Cart",
      path: "/customer/cart",
      icon: "🛒",
    },
    {
      name: "My Orders",
      path: "/customer/orders",
      icon: "📦",
    },
    {
      name: "Saved Products",
      path: "/customer/saved",
      icon: "♡",
    },
    {
      name: "Profile",
      path: "/customer/profile",
      icon: "👤",
    },
  ];

  const handleLogout = () => {
    // Authentication will be connected here later.
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <NavLink
            to="/customer"
            className="text-xl font-bold text-gray-900"
            onClick={onClose}
          >
            Injibara Market
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/customer"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <span className="w-6 text-center text-lg">
                {item.icon}
              </span>

              {item.name}
            </NavLink>
          ))}

          {/* Divider */}
          <div className="my-5 border-t border-gray-200" />

          {/* Become Seller */}
          <NavLink
            to="/customer/become-seller"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "border-brand-200 bg-brand-50 text-brand-700"
                  : "border-gray-200 text-gray-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              }`
            }
          >
            <span className="w-6 text-center text-lg">
              🏪
            </span>

            Become a Seller
          </NavLink>
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-200 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <span className="w-6 text-center">
              🚪
            </span>

            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default CustomerSidebar;