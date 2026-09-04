import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/common/ProductCard";
import CustomerNavbar from "../components/customer/CustomerNavbar";
import CustomerFooter from "../components/customer/CustomerFooter";
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
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <CustomerNavbar />

      <main className="flex-1 bg-gray-50">
        {/* =========================
            PAGE HEADER
        ========================== */}
        <section className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Marketplace Catalog</h1>
            <p className="mt-2 text-sm text-gray-600">
              Discover authentic products and listings from sellers around Injibara and the Awi area.
            </p>
          </div>
        </section>

        {/* =========================
            FILTER / SEARCH AREA
        ========================== */}
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div>
                <label
                  htmlFor="product-search"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700"
                >
                  Search products
                </label>
                <input
                  id="product-search"
                  type="text"
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search name, details, or location..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              {/* Location Dropdown */}
              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700"
                >
                  Location
                </label>
                <select
                  id="location"
                  value={selectedLocation}
                  onChange={(event) => handleLocationChange(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 cursor-pointer"
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
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 cursor-pointer"
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
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700"
                >
                  Sort products
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 cursor-pointer"
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
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {products.length}
              </span>{" "}
              {totalCount > products.length ? `of ${totalCount}` : ""} products
              {selectedCategory !== "All" && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 border border-brand-200">
                  Category: {selectedCategory}
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("All")}
                    className="ml-1 text-brand-700 hover:text-brand-900 cursor-pointer"
                    aria-label="Remove category filter"
                  >
                    &times;
                  </button>
                </span>
              )}
            </p>

            {(search || selectedCategory !== "All") && (
              <button
                type="button"
                onClick={() => {
                  handleSearchChange("");
                  handleCategoryChange("All");
                  setSortBy("default");
                }}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Product Grid or Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-gray-200 bg-white"
                >
                  <div className="aspect-square bg-gray-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-3 w-16 rounded bg-gray-200" />
                    <div className="h-5 w-3/4 rounded bg-gray-200" />
                    <div className="h-6 w-1/2 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
              <svg className="mx-auto h-12 w-12 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <h2 className="mt-4 text-xl font-semibold text-red-800">{error}</h2>
              <p className="mt-2 text-sm text-red-600">
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                    className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-300 px-8 py-3.5 text-sm font-bold text-gray-800 shadow-sm transition hover:bg-gray-50 hover:border-brand-500 hover:text-brand-700 disabled:opacity-50 cursor-pointer"
                  >
                    {loadingMore ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
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
            <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm border border-gray-100">
              <svg
                className="mx-auto h-12 w-12 text-gray-300"
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
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                No products found
              </h2>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                {products.length === 0
                  ? "No products listed in the marketplace yet. Registered sellers can list new products from their dashboard."
                  : selectedCategory !== "All"
                  ? `There are currently no products listed under "${selectedCategory}".`
                  : "Try searching for another product name or resetting filters."}
              </p>
              {(products.length > 0 || selectedCategory !== "All" || search) && (
                <button
                  type="button"
                  onClick={() => {
                    handleSearchChange("");
                    handleCategoryChange("All");
                    setSortBy("default");
                  }}
                  className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 shadow-sm cursor-pointer"
                >
                  View All Products
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
}

export default ProductsPage;