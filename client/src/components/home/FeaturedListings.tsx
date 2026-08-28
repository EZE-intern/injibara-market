import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../common/ProductCard';
import type { Product } from '../common/ProductCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function FeaturedListings() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/products`);
        const items = response.data?.data || [];
        // Show the first 8 products as "featured"
        setProducts(items.slice(0, 8));
      } catch (error) {
        console.error('Failed to load featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

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
          {loading ? (
            // Loading skeleton placeholders
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white">
                <div className="aspect-square bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-16 rounded bg-gray-200" />
                  <div className="h-5 w-3/4 rounded bg-gray-200" />
                  <div className="h-6 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No products listed yet. Be the first seller!
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default FeaturedListings;
