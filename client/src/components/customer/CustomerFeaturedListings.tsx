import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../api/productApi';
import ProductCard from '../common/ProductCard';
import type { Product } from '../../types/Product';

function CustomerFeaturedListings() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        // Show up to 5 products as in the mockup image
        setProducts(data.slice(0, 5));
      } catch (error) {
        console.error('Failed to load featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight sm:text-2xl">
            Featured Listings
          </h2>
        </div>
        <div className="py-12 text-center text-gray-500">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
          <p className="mt-3 text-sm">Loading listings...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight sm:text-2xl">
            Featured Listings
          </h2>
        </div>
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          No products listed yet. Be the first to add a product!
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-16">
      
      {/* Heading */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight sm:text-2xl">
            Featured Listings
          </h2>
        </div>

        <Link
          to="/products"
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition flex items-center gap-1"
        >
          View all listings <span className="text-xs">&rarr;</span>
        </Link>
      </div>

      {/* Grid of 5 columns on large screens */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

    </section>
  );
}

export default CustomerFeaturedListings;
