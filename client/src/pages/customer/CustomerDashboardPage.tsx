import { Link } from "react-router-dom";
import { useState } from "react";
import CustomerSidebar from "../../components/customer/CustomerSidebar";

function CustomerDashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">

      <CustomerSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="min-w-0 flex-1">

        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            ☰
          </button>

          <div className="ml-auto flex items-center gap-4">

            <button
              type="button"
              className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            >
              🔔
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-gray-900">
                Eyob
              </p>

              <p className="text-xs text-gray-500">
                Customer
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
              E
            </div>

          </div>
        </header>

        {/* Main */}
        <main className="p-4 sm:p-6 lg:p-8">

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Welcome back, Eyob 👋
            </h1>

            <p className="mt-2 text-gray-600">
              Find products from sellers around Injibara and the Awi area.
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Total Orders
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                4
              </p>

              <p className="mt-2 text-xs text-green-600">
                1 active order
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Pending Orders
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                1
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Being processed
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Saved Products
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                7
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Your wishlist
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Cart Items
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                2
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Ready to checkout
              </p>
            </div>

          </div>

          {/* Seller CTA */}
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

          {/* Recent Orders */}
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

            <div className="overflow-hidden rounded-xl bg-white shadow-sm">

              <div className="divide-y divide-gray-200">

                <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="font-semibold text-gray-900">
                      #ORD-001
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Samsung Galaxy A15
                    </p>
                  </div>

                  <div className="text-left sm:text-right">

                    <p className="font-semibold text-gray-900">
                      18,500 ETB
                    </p>

                    <span className="mt-1 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      Delivered
                    </span>

                  </div>

                </div>

                <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="font-semibold text-gray-900">
                      #ORD-002
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Nike Air Max
                    </p>
                  </div>

                  <div className="text-left sm:text-right">

                    <p className="font-semibold text-gray-900">
                      4,500 ETB
                    </p>

                    <span className="mt-1 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                      Processing
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* Quick actions */}
          <section className="mt-8">

            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Quick Actions
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">

              <Link
                to="/products"
                className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>

                <h3 className="mt-3 font-semibold text-gray-900">
                  Browse Products
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Find something you need.
                </p>
              </Link>

              <Link
                to="/customer/cart"
                className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>

                <h3 className="mt-3 font-semibold text-gray-900">
                  View Cart
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Review your selected products.
                </p>
              </Link>

              <Link
                to="/customer/orders"
                className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>

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