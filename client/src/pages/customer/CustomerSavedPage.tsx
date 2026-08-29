import { Link } from "react-router-dom";

function CustomerSavedPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/customer"
          className="text-sm text-gray-500 hover:text-brand-600"
        >
          &larr; Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Saved Products
        </h1>

        <div className="mt-8 rounded-xl bg-white p-10 text-center shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>

          <h2 className="mt-4 text-xl font-semibold text-gray-900">
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