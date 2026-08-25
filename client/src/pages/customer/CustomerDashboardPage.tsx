import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import CustomerSidebar from "../../components/customer/CustomerSidebar";

interface StoredUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

function CustomerDashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    /*
     * authApi returns the user after login.
     *
     * We expect the login page to store the authenticated user
     * in localStorage under "user".
     */
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser: StoredUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to read stored user:", error);
      }
    }
  }, []);

  const fullName = user?.full_name || "Customer";

  const firstName = fullName.split(" ")[0];

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Sidebar */}
      <CustomerSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="min-w-0 flex-1">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            ☰
          </button>

          <div className="ml-auto flex items-center gap-4">
            {/* Notifications */}
            <button
              type="button"
              className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            >
              🔔
            </button>

            {/* User information */}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {fullName}
              </p>

              <p className="text-xs capitalize text-gray-500">
                {user?.role || "Customer"}
              </p>
            </div>

            {/* Avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
              {initials || "U"}
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Welcome back, {firstName} 👋
            </h1>

            <p className="mt-2 text-gray-600">
              Find products from sellers around Injibara and the Awi area.
            </p>
          </div>

          {/* Account information */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                {initials || "U"}
              </div>

              {/* User details */}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-gray-900">
                  {fullName}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {user?.email || "Email unavailable"}
                </p>

                <p className="mt-1 text-sm capitalize text-gray-500">
                  Account type: {user?.role || "customer"}
                </p>
              </div>

              {/* Profile */}
              <Link
                to="/customer/profile"
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                View Profile
              </Link>
            </div>
          </section>

          {/* Dashboard statistics */}
          <section className="mt-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Orders */}
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Orders
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  —
                </p>

                
              </div>

              {/* Pending */}
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Pending Orders
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  —
                </p>

                
              </div>

              {/* Saved */}
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Saved Products
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  —
                </p>

                
              </div>

              {/* Cart */}
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Cart Items
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  —
                </p>

                
              </div>
            </div>
          </section>

          {/* Become seller */}
          {user?.role === "customer" && (
            <div className="mt-8 overflow-hidden rounded-2xl bg-brand-600 p-6 text-white sm:p-8">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-medium text-white/80">
                    Have products to sell?
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Become a seller on Injibara Market
                  </h2>

                  <p className="mt-2 max-w-xl text-sm text-white/80">
                    Reach customers around Injibara and the Awi area by
                    listing your products on our marketplace.
                  </p>
                </div>

                <Link
                  to="/customer/become-seller"
                  className="shrink-0 rounded-lg bg-white px-5 py-3 text-center text-sm font-semibold text-brand-700 transition hover:bg-gray-100"
                >
                  Become a Seller
                </Link>
              </div>
            </div>
          )}

          {/* Recent orders */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Orders
              </h2>

              <Link
                to="/customer/orders"
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                View all
              </Link>
            </div>

            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <div className="text-4xl">📦</div>

              <h3 className="mt-3 font-semibold text-gray-900">
                No order information available yet
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                Your order history will appear here once the orders API is
                connected.
              </p>

              <Link
                to="/products"
                className="mt-5 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Browse Products
              </Link>
            </div>
          </section>

          {/* Quick actions */}
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Quick Actions
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Products */}
              <Link
                to="/products"
                className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-2xl">🛍</div>

                <h3 className="mt-3 font-semibold text-gray-900">
                  Browse Products
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Find something you need.
                </p>
              </Link>

              {/* Cart */}
              <Link
                to="/customer/cart"
                className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-2xl">🛒</div>

                <h3 className="mt-3 font-semibold text-gray-900">
                  View Cart
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Review your selected products.
                </p>
              </Link>

              {/* Orders */}
              <Link
                to="/customer/orders"
                className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-2xl">📦</div>

                <h3 className="mt-3 font-semibold text-gray-900">
                  Track Orders
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Check your order status.
                </p>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default CustomerDashboardPage;