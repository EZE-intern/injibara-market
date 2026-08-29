function TrustBanner() {
  return (
    <section className="border-y border-red-100 bg-brand-50 py-14">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Why Injibara Market?
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">Built for our local community</h2>

          <p className="mt-3 text-gray-600">
            A simple way for buyers and local sellers to connect, discover products, and grow
            together.
          </p>
        </div>

        {/* Trust points */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Local */}
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">Local Marketplace</h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Discover products and sellers from Injibara and the surrounding community.
            </p>
          </div>

          {/* Sellers */}
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">Support Local Sellers</h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Give local businesses and individual sellers a place to reach more customers.
            </p>
          </div>

          {/* Convenience */}
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">Easy Shopping</h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Browse products, compare options, and connect with sellers from one place.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustBanner;
