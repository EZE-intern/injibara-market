import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/common/ProductCard";
import CustomerNavbar from "../components/customer/CustomerNavbar";
import CustomerFooter from "../components/customer/CustomerFooter";
import { getProducts } from "../api/productApi";
import type { Product } from "../types/Product";

type SortOption =
  | "default"
  | "price-low"
  | "price-high"
  | "newest";

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products from database:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /*
   * Filter products based on search and category
   */
  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    const result = products.filter((product) => {
      const categoryName =
        typeof product.category === "object" && product.category !== null
          ? product.category.name
          : product.categories?.name || (typeof product.category === "string" ? product.category : "");

      const matchesSearch =
        normalizedSearch === "" ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        categoryName.toLowerCase().includes(normalizedSearch) ||
        (product.description &&
          product.description.toLowerCase().includes(normalizedSearch));

      const matchesCategory =
        selectedCategory === "All" ||
        categoryName.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    /*
     * Sorting
     */
    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "newest") {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [products, search, selectedCategory, sortBy]);

  // Extract unique category names from loaded products
  const categoryOptions = useMemo(() => {
    const categoriesSet = new Set<string>();
    products.forEach((p) => {
      const name =
        typeof p.category === "object" && p.category !== null
          ? p.category.name
          : p.categories?.name || (typeof p.category === "string" ? p.category : null);
      if (name) categoriesSet.add(name);
    });
    return Array.from(categoriesSet);
  }, [products]);

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
              Discover authentic products from sellers around Injibara and the Awi area.
            </p>
          </div>
        </section>

        {/* =========================
            FILTER / SEARCH AREA
        ========================== */}
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="grid gap-4 md:grid-cols-3">
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
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by product name or details..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              {/* Category */}
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
                  onChange={(event) => setSelectedCategory(event.target.value)}
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
            RESULTS
        ========================== */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          {/* Result count & clear button */}
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {filteredProducts.length}
              </span>{" "}
              products
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 cursor-pointer"
              >
                Clear search
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
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
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
                  : "Try searching for another product or changing the category filter."}
              </p>
              {products.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                    setSortBy("default");
                  }}
                  className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 shadow-sm cursor-pointer"
                >
                  Reset Filters
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