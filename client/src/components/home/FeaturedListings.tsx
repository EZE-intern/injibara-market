import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../api/productApi';
import ProductCard from '../common/ProductCard';
import type { Product } from '../../types/Product';

function FeaturedListings() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();

        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error(
          'Failed to load featured products:',
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Featured Products
          </h2>
        </div>

        <div className="py-10 text-center text-gray-500">
          Loading products...
        </div>

      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Featured Products
          </h2>

          <p className="mt-1 text-gray-500">
            Discover products available from local sellers.
          </p>
        </div>

        <Link
          to="/products"
          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          View All
        </Link>

      </div>


      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

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

export default FeaturedListings;