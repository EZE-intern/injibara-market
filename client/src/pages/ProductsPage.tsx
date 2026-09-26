import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/common/ProductCard";
import CustomerNavbar from "../components/customer/CustomerNavbar";
import CustomerFooter from "../components/customer/CustomerFooter";
import CustomerBottomNav from "../components/customer/CustomerBottomNav";
import { getProductsWithPagination } from "../api/productApi";
import { getCategories } from "../api/categoryApi";
import type { Product } from "../types/Product";
import type { Category } from "../api/categoryApi";

type SortOption =
  | "default"
  | "price-low"
  | "price-high"
  | "newest";

const PAGE_SIZE = 12;

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query parameters
  const initialCategory = searchParams.get("category") || searchParams.get("categoryId") || "All";
  const initialSearch = searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Keep state synchronized whenever URL search parameters change
  useEffect(() => {
    const urlCat = searchParams.get("category") || searchParams.get("categoryId") || "All";
    const urlSearch = searchParams.get("search") || "";
    const urlLoc = searchParams.get("location") || "";
    setSelectedCategory(urlCat);
    setSearch(urlSearch);
    setSelectedLocation(urlLoc);
  }, [searchParams]);

  // Load initial batch of products and categories from backend
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      setPage(1);

      const [productsRes, categoriesData] = await Promise.all([
        getProductsWithPagination({
          page: 1,
          limit: PAGE_SIZE,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          search: search.trim() || undefined,
          location:
            selectedLocation.trim() && selectedLocation.trim().toLowerCase() !== "all"
              ? selectedLocation.trim().toLowerCase()
              : undefined,
        }),
        getCategories().catch(() => []),
      ]);

      setProducts(productsRes.data || []);
      setHasMore(Boolean(productsRes.hasMore));
      setTotalCount(productsRes.total || productsRes.count || 0);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to load products or categories from database:", err);
      setError("Unable to load products. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [selectedCategory, search, selectedLocation]);

  // Handle "Show More" / Load More button click
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;

      const res = await getProductsWithPagination({
        page: nextPage,
        limit: PAGE_SIZE,
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        search: search.trim() || undefined,
        location:
          selectedLocation.trim() && selectedLocation.trim().toLowerCase() !== "all"
            ? selectedLocation.trim().toLowerCase()
            : undefined,
      });

      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newUnique = (res.data || []).filter((p) => !existingIds.has(p.id));
        return [...prev, ...newUnique];
      });

      setPage(nextPage);
      setHasMore(Boolean(res.hasMore));
      if (res.total !== undefined) setTotalCount(res.total);
    } catch (err) {
      console.error("Failed to load more products:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Update URL params when user selects another category or searches
  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    const newParams = new URLSearchParams(searchParams);
    if (newCategory === "All") {
      newParams.delete("category");
      newParams.delete("categoryId");
    } else {
      newParams.set("category", newCategory);
    }
    setSearchParams(newParams);
  };

  const handleLocationChange = (newLocation: string) => {
    setSelectedLocation(newLocation);
    const newParams = new URLSearchParams(searchParams);
    if (!newLocation.trim() || newLocation.toLowerCase() === "all") {
      newParams.delete("location");
    } else {
      newParams.set("location", newLocation.toLowerCase());
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    const newParams = new URLSearchParams(searchParams);
    if (!newSearch.trim()) {
      newParams.delete("search");
    } else {
      newParams.set("search", newSearch);
    }
    setSearchParams(newParams);
  };

  /*
   * Sorting & filtering
   */
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === "price-low") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "newest") {
      list.sort((a, b) => b.id - a.id);
    }
    return list;
  }, [products, sortBy]);

  // Combine categories loaded from backend with any unique product categories
  const categoryOptions = useMemo(() => {
    const list: string[] = [];
    categories.forEach((cat) => {
      if (cat.name && !list.includes(cat.name)) {
        list.push(cat.name);
      }
    });

    // Fallback: add categories found on product records if not in list
    products.forEach((p) => {
      const name =
        typeof p.category === "object" && p.category !== null
          ? p.category.name
          : p.categories?.name || (typeof p.category === "string" ? p.category : null);
      if (name && !list.includes(name)) {
        list.push(name);
      }
    });

    return list;
  }, [categories, products]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f19] flex flex-col justify-between">
      <CustomerNavbar />

      <main className="flex-1 bg-gray-50 dark:bg-[#0b0f19] pb-20 md:pb-0">
        {/* =========================
            PAGE HEADER
        ========================== */}
        <section className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Marketplace Catalog</h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Discover authentic products and listings from sellers around Injibara and the Awi area.
            </p>
          </div>
        </section>

        {/* =========================
            FILTER / SEARCH AREA
        ========================== */}
        <section className="mx-auto max-w-7xl px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div>
                <label
                  htmlFor="product-search"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  Search products
                </label>
                <input
                  id="product-search"
                  type="text"
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search name, details, or location..."
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/40"
                />
              </div>

              {/* Location Dropdown */}
              <div>
                <label
                  htmlFor="location"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  Location
                </label>
                <select
                  id="location"
                  value={selectedLocation}
                  onChange={(event) => handleLocationChange(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/40 cursor-pointer"
                >
                  <option value="">All Locations</option>
                  <option value="injibara">Injibara</option>
                  <option value="awi">Awi Zone</option>
                  <option value="kossober">Kossober</option>
                  <option value="chagni">Chagni</option>
                  <option value="bahirdar">Bahir Dar</option>
                </select>
              </div>

              {/* Category Dropdown */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/40 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sorting */}
              <div>
                <label
                  htmlFor="sort"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  Sort products
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/40 cursor-pointer"
                >
                  <option value="default">Default</option>
                  <option value="newest">Newest Listed</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            RESULTS & SHOW MORE
        ========================== */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          {/* Result count & active filter info */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {products.length}
              </span>{" "}
              {totalCount > products.length ? `of ${totalCount}` : ""} products
              {selectedCategory !== "All" && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                  Category: {selectedCategory}
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("All")}
                    className="ml-1 text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 cursor-pointer"
                    aria-label="Remove category filter"
                  >
                    &times;
                  </button>
                </span>
              )}
            </p>

            {(search || selectedCategory !== "All" || (selectedLocation && selectedLocation !== "All")) && (
              <button
                type="button"
                onClick={() => {
                  handleSearchChange("");
                  handleCategoryChange("All");
                  handleLocationChange("");
                  setSortBy("default");
                }}
                className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Product Grid or Skeletons */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
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
          ) : error ? (
            <div className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-6 py-16 text-center">
              <svg className="mx-auto h-12 w-12 text-red-400 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <h2 className="mt-4 text-xl font-semibold text-red-800 dark:text-red-300">{error}</h2>
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                This could be caused by a slow internet connection or a temporary server issue.
              </p>
              <button
                type="button"
                onClick={loadInitialData}
                className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 shadow-sm cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : sortedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* "Show More" Button */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={handleLoadMore}
                    className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 px-8 py-3.5 text-sm font-bold text-gray-800 dark:text-gray-200 shadow-sm transition hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 cursor-pointer"
                  >
                    {loadingMore ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        <span>ምርቶች በመጫን ላይ ናቸው... (Loading more...)</span>
                      </>
                    ) : (
                      <>
                        <span>ተጨማሪ ምርቶች አሳይ (Show More Products)</span>
                        <span className="text-xs">&darr;</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="rounded-2xl bg-white dark:bg-slate-900 px-6 py-16 text-center shadow-sm border border-gray-100 dark:border-slate-800">
              <svg
                className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                No products found
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {products.length === 0
                  ? "No products listed in the marketplace yet. Registered sellers can list new products from their dashboard."
                  : selectedCategory !== "All"
                  ? `There are currently no products listed under "${selectedCategory}".`
                  : "Try searching for another product name or resetting filters."}
              </p>
              {(products.length > 0 || selectedCategory !== "All" || search || (selectedLocation && selectedLocation !== "All")) && (
                <button
                  type="button"
                  onClick={() => {
                    handleSearchChange("");
                    handleCategoryChange("All");
                    handleLocationChange("");
                    setSortBy("default");
                  }}
                  className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 shadow-sm cursor-pointer"
                >
                  View All Products
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      <CustomerFooter />
      <CustomerBottomNav />
    </div>
  );
}

export default ProductsPage;