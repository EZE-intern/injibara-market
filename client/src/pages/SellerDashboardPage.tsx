import { Link } from "react-router-dom";

function SellerDashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <p className="text-sm font-medium text-brand-600">
                Seller Dashboard
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                Welcome, Seller
              </h1>

              <p className="mt-2 text-gray-600">
                Manage your products, orders and sales.
              </p>
            </div>

            <Link
              to="/products"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Browse Marketplace
            </Link>

          </div>

        </div>
      </section>

      {/* Dashboard */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Products
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              0
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Active Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              0
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Completed Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              0
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Sales
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              0 ETB
            </p>
          </div>

        </div>

        {/* Main dashboard */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* Seller actions */}
          <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Seller Management
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage your marketplace activities.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              {/* Products */}
              <Link
                to="/seller/products"
                className="rounded-xl border border-gray-200 p-5 transition hover:border-brand-300 hover:bg-gray-50"
              >
                <div className="text-2xl">
                  📦
                </div>

                <h3 className="mt-3 font-semibold text-gray-900">
                  My Products
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  View and manage your listed products.
                </p>
              </Link>

              {/* Add Product */}
              <Link
                to="/seller/products/new"
                className="rounded-xl border border-gray-200 p-5 transition hover:border-brand-300 hover:bg-gray-50"
              >
                <div className="text-2xl">
                  ➕
                </div>

                <h3 className="mt-3 font-semibold text-gray-900">
                  Add Product
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  List a new product on Injibara Market.
                </p>
              </Link>

              {/* Orders */}
              <Link
                to="/seller/orders"
                className="rounded-xl border border-gray-200 p-5 transition hover:border-brand-300 hover:bg-gray-50"
              >
                <div className="text-2xl">
                  🛒
                </div>

                <h3 className="mt-3 font-semibold text-gray-900">
                  Orders
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  View and manage customer orders.
                </p>
              </Link>

              {/* Sales */}
              <Link
                to="/seller/sales"
                className="rounded-xl border border-gray-200 p-5 transition hover:border-brand-300 hover:bg-gray-50"
              >
                <div className="text-2xl">
                  📊
                </div>

                <h3 className="mt-3 font-semibold text-gray-900">
                  Sales
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Track your sales and earnings.
                </p>
              </Link>

            </div>

          </div>

          {/* Seller status */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-gray-900">
              Seller Status
            </h2>

            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700">
                  ✓
                </div>

                <div>
                  <p className="font-semibold text-green-800">
                    Approved
                  </p>

                  <p className="text-sm text-green-700">
                    Your seller account is active.
                  </p>
                </div>
              </div>

            </div>

            <div className="mt-6">

              <h3 className="text-sm font-semibold text-gray-900">
                Seller information
              </h3>

              <div className="mt-3 space-y-3 text-sm">

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Seller
                  </span>

                  <span className="font-medium text-gray-900">
                    Seller Name
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    FIN
                  </span>

                  <span className="font-medium text-gray-900">
                    ********
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Location
                  </span>

                  <span className="font-medium text-gray-900">
                    Injibara
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default SellerDashboardPage;