import { Link } from "react-router-dom";

function CustomerSavedPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">

      <div className="mx-auto max-w-5xl">

        <Link
          to="/customer"
          className="text-sm text-gray-500 hover:text-brand-600"
        >
          ← Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Saved Products
        </h1>

        <div className="mt-8 rounded-xl bg-white p-10 text-center shadow-sm">

          <div className="text-5xl">
            ♡
          </div>

          <h2 className="mt-4 text-xl font-semibold">
            No saved products yet
          </h2>

          <p className="mt-2 text-gray-500">
            Save products you are interested in so you can find them later.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Browse Products
          </Link>

        </div>

      </div>

    </main>
  );
}

export default CustomerSavedPage;