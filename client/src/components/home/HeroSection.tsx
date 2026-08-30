import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid min-h-[600px] max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:px-12 lg:px-16">
        {/* Left side */}
        <div className="max-w-xl">
          <span className="mb-4 inline-block rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-600">
            Injibara's Local Marketplace
          </span>

          <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Buy and sell
            <span className="text-brand-600"> locally.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
            Discover products from local sellers in Injibara and connect with your community through
            one simple marketplace.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/products"
              className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
            >
              Explore Products
            </Link>

            <Link
              to="/seller"
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-800 transition hover:border-brand-600 hover:text-brand-600"
            >
              Start Selling
            </Link>
          </div>
        </div>

        {/* Right side */}
        <div className="relative">
          <div className="overflow-hidden rounded-3xl bg-brand-50">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d"
              alt="Local marketplace shopping"
              className="h-[420px] w-full object-cover"
            />
          </div>

          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-5 shadow-xl sm:block">
            <p className="text-sm text-gray-500">Local marketplace</p>

            <p className="mt-1 text-lg font-bold text-gray-900">Made for Injibara</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
