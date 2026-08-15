import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { featuredProducts } from './productData';

function FeaturedListings() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Local Marketplace
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">Featured Listings</h2>

            <p className="mt-3 max-w-2xl text-gray-600">
              Discover products recently listed by local sellers.
            </p>
          </div>

          <Link
            to="/products"
            className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            View all products →
          </Link>
        </div>

        {/* Products */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedListings;
