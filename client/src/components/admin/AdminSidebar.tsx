import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
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
  Home,
  User,
  X,
} from "lucide-react";
import { clearAuth, getUser } from "../../utils/authStorage";
import { getMyPermissions } from "../../api/permissionsApi";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const user = getUser();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<string[] | null>(null);

  useEffect(() => {
    getMyPermissions()
      .then((perms) => setPermissions(perms))
      .catch((err) => {
        console.error("Failed to load admin permissions", err);
        setPermissions([]);
      });
  }, []);

  const navigation = [
    {
      name: "Overview",
      path: "/admin",
      icon: LayoutDashboard,
      permission: "overview",
    },
    {
      name: "Broker Hub",
      path: "/admin/broker-hub",
      icon: Briefcase,
      permission: "broker_hub",
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: Package,
      permission: "products",
    },
    {
      name: "Stores",
      path: "/admin/stores",
      icon: Store,
      permission: "stores",
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: Layers,
      permission: "categories",
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
      permission: "users",
    },
    {
      name: "Admin Management",
      path: "/admin/admin-management",
      icon: UserCog,
      permission: "admin_management",
    },
  ];

  const visibleNavigation =
    permissions === null || permissions.length === 0
      ? navigation
      : navigation.filter((item) => permissions.includes(item.permission));

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container (Permanent on Desktop lg:, Drawer on Mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 lg:w-64 flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* =========================
            LOGO / HEADER
        ========================= */}
        <div className="flex h-16 sm:h-20 items-center justify-between border-b border-gray-100 dark:border-slate-800 px-5">
          <Link
            to="/"
            onClick={onClose}
            className="group block"
            title="Go to Injibara Market Homepage"
          >
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition tracking-tight">
              INJIBARA MARKET
            </h1>

            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Admin Panel
            </p>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =========================
            NAVIGATION
        ========================= */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
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
          <div className="my-3 border-t border-gray-100 dark:border-slate-800" />

          {/* =========================
              SETTINGS
          ========================= */}
          {(permissions === null ||
            permissions.length === 0 ||
            permissions.includes("settings")) && (
            <NavLink
              to="/admin/settings"
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                ].join(" ")
              }
            >
              <Settings className="h-5 w-5 shrink-0" />
              <span>Settings</span>
            </NavLink>
          )}

          {/* =========================
              EXIT ADMIN / SWITCH PORTALS
          ========================= */}
          <div className="my-3 border-t border-gray-100 dark:border-slate-800" />
          <div className="px-3 pb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Marketplace Portals
            </p>
          </div>

          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300"
          >
            <Home className="h-4.5 w-4.5 shrink-0 text-gray-400" />
            <span>Marketplace Home</span>
          </Link>

          <Link
            to="/customer"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300"
          >
            <User className="h-4.5 w-4.5 shrink-0 text-gray-400" />
            <span>Customer Dashboard</span>
          </Link>

          <Link
            to="/seller"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300"
          >
            <Store className="h-4.5 w-4.5 shrink-0 text-gray-400" />
            <span>Seller Dashboard</span>
          </Link>
        </nav>

        {/* =========================
            BOTTOM SECTION
        ========================= */}
        <div className="border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
          {/* LOG OUT */}
          <button
            type="button"
            onClick={() => {
              onClose?.();
              handleLogout();
            }}
            className="mb-2.5 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 transition hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span>Log Out</span>
          </button>

          {/* ADMIN USER */}
          <div className="rounded-xl bg-gray-50 dark:bg-slate-800/60 p-2.5">
            <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
              {user?.full_name ?? "Admin"}
            </p>

            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              {user?.role ?? "ADMIN"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;