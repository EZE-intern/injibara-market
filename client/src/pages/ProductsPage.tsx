import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/common/ProductCard';
import { getProducts } from '../api/productApi';
import type { Product } from '../types/Product';

type SortOption =
  | 'default'
  | 'price-low'
  | 'price-high'
  | 'newest';

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] =
    useState<SortOption>('default');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /*
   * Load products from backend.
   */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getProducts();

        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);

        setError(
          'Unable to load products. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  /*
   * Generate categories dynamically from backend products.
   *
   * This means we don't hard-code:
   * Electronics
   * Fashion
   * Food
   * etc.
   *
   * New categories can come from the database.
   */
  const categories = useMemo(() => {
    const categoryNames = products
      .map((product) => product.category?.name)
      .filter(
        (category): category is string =>
          Boolean(category),
      );

    return ['All', ...new Set(categoryNames)];
  }, [products]);

  /*
   * Search + category filtering + sorting.
   */
  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      search.toLowerCase().trim();

    let result = products.filter((product) => {
      const productName =
        product.name?.toLowerCase() || '';

      const description =
        product.description?.toLowerCase() || '';

      const category =
        product.category?.name?.toLowerCase() || '';

      const matchesSearch =
        normalizedSearch === '' ||
        productName.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        category.includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === 'All' ||
        product.category?.name === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'price-low') {
      result = [...result].sort(
        (a, b) =>
          Number(a.price) - Number(b.price),
      );
    }

    if (sortBy === 'price-high') {
      result = [...result].sort(
        (a, b) =>
          Number(b.price) - Number(a.price),
      );
    }

    if (sortBy === 'newest') {
      result = [...result].sort((a, b) => {
        const dateA = a.created_at
          ? new Date(a.created_at).getTime()
          : 0;

        const dateB = b.created_at
          ? new Date(b.created_at).getTime()
          : 0;

        return dateB - dateA;
      });
    }

    return result;
  }, [
    products,
    search,
    selectedCategory,
    sortBy,
  ]);

  /*
   * Loading state
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="mx-auto max-w-7xl px-4 py-16 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />

          <p className="mt-4 text-gray-600">
            Loading products...
          </p>
        </section>
      </main>
    );
  }

  /*
   * Error state
   */
  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">

            <div className="text-5xl">
              ⚠️
            </div>

            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Something went wrong
            </h1>

            <p className="mt-2 text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
            >
              Try Again
            </button>

          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* =========================
          PAGE HEADER
      ========================== */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Products
          </h1>

          <p className="mt-2 text-gray-600">
            Discover products from sellers around
            Injibara and the Awi area.
          </p>

        </div>
      </section>


      {/* =========================
          FILTERS
      ========================== */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="rounded-xl bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-3">

            {/* Search */}
            <div>
              <label
                htmlFor="product-search"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Search products
              </label>

              <input
                id="product-search"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search products..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </div>


            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Category
              </label>

              <select
                id="category"
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category === 'All'
                      ? 'All Categories'
                      : category}
                  </option>
                ))}
              </select>
            </div>


            {/* Sort */}
            <div>
              <label
                htmlFor="sort"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Sort products
              </label>

              <select
                id="sort"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value as SortOption,
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              >
                <option value="default">
                  Recommended
                </option>

                <option value="newest">
                  Newest
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>
              </select>
            </div>

          </div>

        </div>
      </section>


      {/* =========================
          RESULTS
      ========================== */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">

        <div className="mb-5 flex items-center justify-between">

          <p className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-semibold text-gray-900">
              {filteredProducts.length}
            </span>{' '}
            products
          </p>

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Clear search
            </button>
          )}

        </div>


        {/* Products */}
        {filteredProducts.length > 0 ? (

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        ) : (

          <div className="rounded-xl bg-white px-6 py-16 text-center shadow-sm">

            <div className="text-5xl">
              🔍
            </div>

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              No products found
            </h2>

            <p className="mt-2 text-gray-500">
              Try searching for another product or
              changing the category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSortBy('default');
              }}
              className="mt-6 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Reset Filters
            </button>

          </div>
        )}

      </section>

    </main>
  );
}

export default ProductsPage;