function TrustBanner() {
  return (
    <section className="border-y border-amber-500/20 bg-amber-500/5 dark:bg-stone-900/50 py-14">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Why Adey Market? • ለምን አደይ ገበያ?
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-stone-900 dark:text-stone-100">
            Built for Ethiopia's Growing Commerce
          </h2>

          <p className="mt-3 text-stone-600 dark:text-stone-300">
            A trusted way for buyers and verified sellers across Ethiopia to connect, discover products, and grow together.
          </p>
        </div>

        {/* Trust points */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Nationwide */}
          <div className="rounded-2xl bg-white dark:bg-stone-900 p-6 text-center shadow-xs border border-stone-200/80 dark:border-stone-800">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            <h3 className="mt-4 font-bold text-stone-900 dark:text-stone-100">Nationwide Reach</h3>

            <p className="mt-2 text-sm leading-6 text-stone-500 dark:text-stone-400">
              Discover products and sellers from Addis Ababa to every corner of Ethiopia.
            </p>
          </div>

          {/* Verified Sellers */}
          <div className="rounded-2xl bg-white dark:bg-stone-900 p-6 text-center shadow-xs border border-stone-200/80 dark:border-stone-800">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <h3 className="mt-4 font-bold text-stone-900 dark:text-stone-100">Verified Sellers</h3>

            <p className="mt-2 text-sm leading-6 text-stone-500 dark:text-stone-400">
              Empowering genuine local businesses and entrepreneurs to reach customers safely.
            </p>
          </div>

          {/* Protected Deals */}
          <div className="rounded-2xl bg-white dark:bg-stone-900 p-6 text-center shadow-xs border border-stone-200/80 dark:border-stone-800">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>

            <h3 className="mt-4 font-bold text-stone-900 dark:text-stone-100">Easy & Safe Shopping</h3>

            <p className="mt-2 text-sm leading-6 text-stone-500 dark:text-stone-400">
              Browse products, compare prices, and connect directly with sellers with Telebirr and CBE Birr support.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustBanner;
