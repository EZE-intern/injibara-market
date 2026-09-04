import { NavLink, useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../../utils/authStorage";

interface CustomerSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

function CustomerSidebar({
  mobileOpen = false,
  onClose,
}: CustomerSidebarProps) {
  const navigate = useNavigate();
  const user = getUser();

  const navigation = [
    {
      name: "Dashboard",
      path: "/customer",
    },
    {
      name: "Browse Products",
      path: "/products",
    },
    {
      name: "Cart",
      path: "/customer/cart",
    },
    {
      name: "My Orders",
      path: "/customer/orders",
    },
    {
      name: "Saved Products",
      path: "/customer/saved",
    },
    {
      name: "Profile",
      path: "/customer/profile",
    },
  ];

  const handleLogout = () => {
    clearAuth();
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
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          {/* Divider */}
          <div className="my-5 border-t border-gray-200" />

          {/* Admin Panel */}
          {(user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "super_admin") && (
            <NavLink
              to="/admin"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
            >
              Admin Dashboard
            </NavLink>
          )}

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
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default CustomerSidebar;