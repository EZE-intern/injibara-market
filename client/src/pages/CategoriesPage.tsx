import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CustomerNavbar from "../components/customer/CustomerNavbar";
import CustomerFooter from "../components/customer/CustomerFooter";
import { getCategories, type Category } from "../api/categoryApi";
import { getCategoryIconNode } from "../components/customer/CustomerCategoryGrid";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const filteredCategories = categories.filter((cat) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase().trim();
    return (
      cat.name.toLowerCase().includes(query) ||
      cat.slug.toLowerCase().includes(query) ||
      (cat.description && cat.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <CustomerNavbar />

      <main className="flex-1 bg-gray-50 pb-16">
        {/* Header Banner */}
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-brand-600 transition"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </Link>
                  <span className="text-gray-300">/</span>
                  <span className="text-xs font-semibold text-brand-600">Categories</span>
                </div>
                <h1 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
                  Marketplace Categories (የምርት ምድቦች)
                </h1>
                <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                  Explore everything sold on Injibara Market. Click any category to view all available products and listings from local sellers.
                </p>
              </div>

              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
              >
                Browse All Products &rarr;
              </Link>
            </div>

            {/* Search filter for categories */}
            <div className="mt-8 max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories (e.g. Vehicles, Crops, Electronics)..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {loading ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-gray-500">Loading categories directory...</p>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredCategories.map((cat) => {
                const productCount = cat._count?.products;

                return (
                  <Link
                    key={cat.id}
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-brand-500 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 transition-colors group-hover:bg-brand-100">
                          {getCategoryIconNode(cat.slug || cat.name)}
                        </div>
                        {productCount !== undefined && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 group-hover:bg-brand-50 group-hover:text-brand-700">
                            {productCount} {productCount === 1 ? "item" : "items"}
                          </span>
                        )}
                      </div>

                      <h2 className="mt-4 text-lg font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
                        {cat.name}
                      </h2>

                      <p className="mt-1.5 text-xs leading-relaxed text-gray-500 line-clamp-2">
                        {cat.description || `Browse active ${cat.name.toLowerCase()} listings in Injibara.`}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:text-brand-700">
                      <span>View Products</span>
                      <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center shadow-sm">
              <p className="text-lg font-bold text-gray-900">No categories matching "{search}"</p>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
}
