import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUser } from "../../utils/authStorage";
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

          <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
            <Link
              to="/seller"
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Go to Seller Hub
            </Link>
            <Link
              to="/"
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Marketplace Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CustomerProfilePage;