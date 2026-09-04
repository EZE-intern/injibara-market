import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Package,
  Store,
  Layers,
  Users,
  UserCog,
  Settings,
  LogOut,
} from "lucide-react";
import { clearAuth, getUser } from "../../utils/authStorage";

function AdminSidebar() {
  const user = getUser();
  const navigate = useNavigate();

  const navigation = [
    {
      name: "Overview",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Broker Hub",
      path: "/admin/broker-hub",
      icon: Briefcase,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: Package,
    },
    {
      name: "Stores",
      path: "/admin/stores",
      icon: Store,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: Layers,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
  ];

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      {/* =========================
          LOGO / HEADER
      ========================= */}
      <div className="flex h-20 items-center border-b border-gray-100 px-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            INJIBARA MARKET
          </h1>

          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-purple-600">
            Admin Panel
          </p>
        </div>
      </div>

      {/* =========================
          NAVIGATION
      ========================= */}
      <nav className="space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-slate-900",
                ].join(" ")
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {/* =========================
            SEPARATOR
        ========================= */}
        <div className="my-5 border-t border-gray-100" />

        {/* =========================
            SUPER ADMIN ONLY
        ========================= */}
        {user?.role?.toUpperCase() === "SUPER_ADMIN" && (
          <NavLink
            to="/admin/admin-management"
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-slate-900",
              ].join(" ")
            }
          >
            <UserCog className="h-5 w-5 shrink-0" />
            <span>Admin Management</span>
          </NavLink>
        )}

        {/* =========================
            SETTINGS
        ========================= */}
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            [
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
              isActive
                ? "bg-purple-50 text-purple-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-slate-900",
            ].join(" ")
          }
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* =========================
          BOTTOM SECTION
      ========================= */}
      <div className="absolute bottom-0 left-0 w-full border-t border-gray-100 bg-white p-4">
        {/* LOG OUT */}
        <button
          type="button"
          onClick={handleLogout}
          className="mb-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Log Out</span>
        </button>

        {/* ADMIN USER */}
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="truncate text-sm font-semibold text-slate-900">
            {user?.full_name ?? "Admin"}
          </p>

          <p className="mt-1 text-xs uppercase text-gray-400">
            {user?.role ?? "ADMIN"}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;