import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../common/ProductCard";
import { getProducts } from "../../api/productApi";
import type { Product } from "../../types/Product";

function FeaturedListings() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data.slice(0, 8));
      } catch (error) {
        console.error("Failed to load featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section className="bg-shemma-50 dark:bg-stone-950 py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              National Marketplace • በአደይ ገበያ የተመረጡ
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              Featured Listings
            </h2>

            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Discover authentic products recently listed by verified sellers across Ethiopia.
            </p>
          </div>

          <Link
            to="/products"
            className="text-sm font-bold text-amber-600 dark:text-amber-400 transition-colors hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1"
          >
            View all products <span>&rarr;</span>
          </Link>
        </div>

        {/* Products */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                <div className="aspect-square bg-stone-200 dark:bg-stone-800" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-16 rounded bg-stone-200 dark:bg-stone-800" />
                  <div className="h-5 w-3/4 rounded bg-stone-200 dark:bg-stone-800" />
                  <div className="h-6 w-1/2 rounded bg-stone-200 dark:bg-stone-800" />
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 p-12 text-center text-stone-500">
              <p className="text-sm font-medium">No products listed yet.</p>
              <Link
                to="/seller"
                className="mt-4 inline-block rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white px-5 py-2.5 text-xs font-bold text-white dark:text-stone-900 transition"
              >
                + Add First Product
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default FeaturedListings;
