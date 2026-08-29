import { Link } from "react-router-dom";

function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-gray-900">
            Injibara Market
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/products"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600"
            >
              Products
            </Link>

            <Link
              to="/customer/orders"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600"
            >
              My Orders
            </Link>

            <Link
              to="/customer/profile"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600"
            >
              Profile
            </Link>
          </nav>

          {/* User */}
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-600 sm:block">
              Welcome
            </span>

            <Link
              to="/customer/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700"
            >
              U
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome section */}
        <section className="mb-10">
          <p className="mb-2 text-sm font-medium text-brand-600">
            Welcome to Injibara Market
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            What are you looking for today?
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Discover products from local sellers and shop easily through
            Injibara Market.
          </p>
        </section>

        {/* Search */}
        <section className="mb-10">
          <div className="flex max-w-3xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <input
              type="text"
              placeholder="Search for products..."
              className="min-w-0 flex-1 px-5 py-4 text-sm outline-none"
            />

            <button className="bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
              Search
            </button>
          </div>
        </section>

        {/* Quick actions */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Browse products */}
          <Link
            to="/products"
            className="rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              Browse Products
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Explore products from sellers around Injibara.
            </p>
          </Link>

          {/* Orders */}
          <Link
            to="/customer/orders"
            className="rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              My Orders
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Track your purchases and view your order history.
            </p>
          </Link>

          {/* Become seller */}
          <Link
            to="/become-seller"
            className="rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              Become a Seller
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Start selling your products after completing verification.
            </p>
          </Link>
        </section>
      </main>
    </div>
  );
}

export default MarketplacePage;