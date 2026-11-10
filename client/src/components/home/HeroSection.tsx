import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <section className="bg-shemma-50 dark:bg-stone-950">
      <div className="mx-auto grid min-h-[540px] max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:px-12 lg:px-16">
        {/* Left side */}
        <div className="max-w-xl">
          <span className="mb-4 inline-block rounded-full bg-amber-500/15 border border-amber-500/30 px-4 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
            🌼 Adey Market • Where Ethiopia Shops
          </span>

          <h1 className="text-4xl font-black leading-tight text-stone-900 dark:text-stone-100 sm:text-5xl lg:text-6xl">
            Buy and sell
            <span className="text-amber-600 dark:text-amber-400"> across Ethiopia.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-stone-600 dark:text-stone-300">
            Discover verified products from trusted merchants across Ethiopia — from Addis Ababa to every region — through one unified marketplace.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/products"
              className="rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 px-6 py-3 font-bold transition shadow-md"
            >
              Explore Products
            </Link>

            <Link
              to="/seller"
              className="rounded-full border-2 border-amber-500 bg-amber-500/10 px-6 py-3 font-bold text-amber-800 dark:text-amber-300 transition hover:bg-amber-500/20"
            >
              Start Selling
            </Link>
          </div>
        </div>

        {/* Right side */}
        <div className="relative">
          <div className="overflow-hidden rounded-3xl bg-amber-500/10 border border-amber-500/20">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d"
              alt="Adey Market Ethiopian shopping"
              className="h-[420px] w-full object-cover"
            />
          </div>

          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white dark:bg-stone-900 p-5 shadow-xl border border-stone-200/80 dark:border-stone-800 sm:block">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">National Marketplace</p>
            <p className="mt-0.5 text-base font-extrabold text-stone-900 dark:text-stone-100">Where Ethiopia Shops</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
