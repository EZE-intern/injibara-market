import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUser, clearAuth } from "../../utils/authStorage";
import type { AuthUser } from "../../api/authApi";

function CustomerProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/customer"
          className="text-sm text-gray-500 hover:text-brand-600 transition"
        >
          &larr; Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          My Profile
        </h1>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm border border-gray-100 sm:p-8">
          <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
              {initials}
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 text-lg">
                {user?.full_name || "Valued User"}
              </h2>

              <span className="mt-1 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 capitalize">
                {user?.role || "Customer"}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Full Name
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {user?.full_name || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Email Address
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {user?.email || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Phone Number
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {user?.phone || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Location
              </p>
              <p className="mt-1 font-medium text-gray-900">
                Injibara, Awi Zone, Ethiopia
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
            <Link
              to="/seller"
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 shadow-sm"
            >
              Go to Seller Hub
            </Link>
            <Link
              to="/"
              className="rounded-xl border border-gray-300 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 transition hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Marketplace Home
            </Link>
            <button
              type="button"
              onClick={() => {
                clearAuth();
                window.location.href = "/login";
              }}
              className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-5 py-2.5 text-sm font-semibold transition hover:bg-red-100 cursor-pointer ml-auto"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CustomerProfilePage;