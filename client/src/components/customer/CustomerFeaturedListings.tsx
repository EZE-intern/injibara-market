import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { SlidersHorizontal, RefreshCw } from "lucide-react";
import { getProducts } from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import ProductCard from "../common/ProductCard";
import MobileFilterSheet, { FilterState } from "./MobileFilterSheet";
import type { Product } from "../../types/Product";
import type { Category } from "../../api/categoryApi";
import { serverWarmup } from "../../App";

interface CustomerFeaturedListingsProps {
  initialLocation?: string;
}

export default function CustomerFeaturedListings({
  initialLocation = "",
}: CustomerFeaturedListingsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Active filters
  const [filters, setFilters] = useState<FilterState>({
    location: initialLocation,
    category: "All",
    recentTime: "all",
    minPrice: "",
    maxPrice: "",
    sortBy: "default",
  });

  // Keep location in sync if parent changes it
  useEffect(() => {
    if (initialLocation !== undefined) {
      setFilters((prev) => ({ ...prev, location: initialLocation }));
    }
  }, [initialLocation]);

  // Load categories once for filter sheet
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error("Failed to load filter categories:", err));
  }, []);

  // Fetch real products from database API
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      await serverWarmup;

      const queryParams: { category?: string; location?: string } = {};
      if (filters.category && filters.category !== "All") {
        queryParams.category = filters.category;
      }
      if (filters.location && filters.location.toLowerCase() !== "all") {
        queryParams.location = filters.location.toLowerCase();
      }

      const data = await getProducts(queryParams);
      setProducts(data);
    } catch (err) {
      console.error("Failed to load featured products from database:", err);
      setError("Unable to load listings right now. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [filters.category, filters.location]);

  // Filter and sort products according to Recent (time), Price range, and Sort By
  const displayedProducts = useMemo(() => {
    let result = [...products];

    // Filter by Recent Time
    if (filters.recentTime !== "all") {
      const now = new Date().getTime();
      const timeLimits: Record<string, number> = {
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
      };
      const limitMs = timeLimits[filters.recentTime];

      if (limitMs) {
        result = result.filter((p) => {
          if (!p.created_at) return true;
          const createdTime = new Date(p.created_at).getTime();
          return now - createdTime <= limitMs;
        });
      }
    }

    // Filter by Min Price
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      if (!isNaN(min)) {
        result = result.filter((p) => Number(p.price) >= min);
      }
    }

    // Filter by Max Price
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      if (!isNaN(max)) {
        result = result.filter((p) => Number(p.price) <= max);
      }
    }

    // Sorting
    if (filters.sortBy === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (filters.sortBy === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (filters.sortBy === "newest") {
      result.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });
    }

    return result;
  }, [products, filters.recentTime, filters.minPrice, filters.maxPrice, filters.sortBy]);

  // Check if any filter is active
  const hasActiveFilters =
    Boolean(filters.location) ||
    filters.category !== "All" ||
    filters.recentTime !== "all" ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    filters.sortBy !== "default";

  return (
    <section className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading & Filter Button */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white sm:text-xl">
              Featured Listings
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              በእንጅባራ የተመረጡ • Fresh listings around Injibara
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-xs transition cursor-pointer ${
                hasActiveFilters
                  ? "border-red-600 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-bold"
                  : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:border-red-600"
              }`}
            >
              <SlidersHorizontal size={14} className={hasActiveFilters ? "text-red-600" : "text-gray-500"} />
              <span>Filter</span>
              {hasActiveFilters && (
                <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              )}
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse"
              >
                <div className="aspect-square bg-gray-200 dark:bg-slate-800" />
                <div className="p-3 space-y-2">
                  <div className="h-3.5 w-3/4 rounded bg-gray-200 dark:bg-slate-800" />
                  <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-slate-800" />
                  <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && displayedProducts.length === 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40 p-6 text-center">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{error}</p>
            <button
              type="button"
              onClick={loadProducts}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition"
            >
              <RefreshCw size={13} />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && displayedProducts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              No products found matching your filters.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Try adjusting your location, category, or price filters.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    location: "",
                    category: "All",
                    recentTime: "all",
                    minPrice: "",
                    maxPrice: "",
                    sortBy: "default",
                  })
                }
                className="mt-3 inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-slate-700 px-4 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}

        {/* Real Product Grid */}
        {!loading && displayedProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* View All Listings Link */}
        <div className="mt-6 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 hover:underline"
          >
            <span>View all products in Injibara</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Filter Bottom Sheet */}
      <MobileFilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onReset={() =>
          setFilters({
            location: "",
            category: "All",
            recentTime: "all",
            minPrice: "",
            maxPrice: "",
            sortBy: "default",
          })
        }
      />
    </section>
  );
}
