import { Link } from "react-router-dom";

export default function SellerDashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Seller Dashboard
            </h1>

            <p className="text-gray-500 mt-1">
              Manage your products and orders.
            </p>
          </div>

          <Link
            to="/seller/products/new"
            className="px-5 py-3 rounded-lg bg-black text-white"
          >
            Add Product
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <div className="bg-white border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Products
            </p>
            <p className="text-2xl font-bold mt-2">
              —
            </p>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Orders
            </p>
            <p className="text-2xl font-bold mt-2">
              —
            </p>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Sales
            </p>
            <p className="text-2xl font-bold mt-2">
              —
            </p>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Inventory
            </p>
            <p className="text-2xl font-bold mt-2">
              —
            </p>
          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-8">

          <Link
            to="/seller/products"
            className="bg-white border rounded-xl p-6 hover:shadow-sm"
          >
            <h2 className="font-semibold text-lg">
              Manage Products
            </h2>

            <p className="text-gray-500 mt-2">
              Create, edit and manage your listings.
            </p>
          </Link>

          <Link
            to="/seller/orders"
            className="bg-white border rounded-xl p-6 hover:shadow-sm"
          >
            <h2 className="font-semibold text-lg">
              Manage Orders
            </h2>

            <p className="text-gray-500 mt-2">
              Review incoming customer orders.
            </p>
          </Link>

        </div>

      </div>
    </main>
  );
}