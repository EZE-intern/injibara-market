import { useMemo, useState } from "react";
import ProductCard from "../components/common/ProductCard";
import { products } from "../data/productData";

type SortOption =
  | "default"
  | "rating"
  | "price-low"
  | "price-high"
  | "batch";

function ProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  /*
   * Filter products based on search and category
   */
  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    let result = products.filter((product) => {
      const matchesSearch =
        normalizedSearch === "" ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.brand.toLowerCase().includes(normalizedSearch) ||
        product.category?.toLowerCase().includes(normalizedSearch) ||
        product.subCategory?.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    /*
     * Sorting
     */
    if (sortBy === "rating") {
      result = [...result].sort(
        (a, b) => b.rating - a.rating
      );
    }

    if (sortBy === "price-low") {
      result = [...result].sort(
        (a, b) => a.price - b.price
      );
    }

    if (sortBy === "price-high") {
      result = [...result].sort(
        (a, b) => b.price - a.price
      );
    }

    if (sortBy === "batch") {
      result = [...result].sort((a, b) =>
        b.batch.localeCompare(a.batch)
      );
    }

    return result;
  }, [search, selectedCategory, sortBy]);

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
            Discover products from sellers around Injibara
            and the Awi area.
          </p>

        </div>
      </section>


      {/* =========================
          FILTER / SEARCH AREA
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
                placeholder="Search by product or brand..."
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
                <option value="All">
                  All Categories
                </option>

                <option value="Electronics">
                  Electronics
                </option>

                <option value="Fashion">
                  Fashion
                </option>

                <option value="Home & Living">
                  Home & Living
                </option>

                <option value="Food">
                  Food
                </option>
              </select>
            </div>


            {/* Sorting */}

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
                    event.target.value as SortOption
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              >
                <option value="default">
                  Recommended
                </option>

                <option value="rating">
                  Highest Rated
                </option>

                <option value="batch">
                  Newest Batch
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

        {/* Result information */}

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
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Clear search
            </button>
          )}

        </div>


        {/* Product Grid */}

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

          /* =========================
             NO RESULTS
          ========================== */

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
                setSearch("");
                setSelectedCategory("All");
                setSortBy("default");
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