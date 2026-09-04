import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import { getProducts } from "../../api/productApi";
import type { Product } from "../../types/Product";

function CustomerDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProducts({
          page: 1,
          limit: 8,
        });

        setProducts(response.data);
      } catch (err) {
        console.error("Failed to load dashboard products:", err);
        setError("Failed to load marketplace products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const totalProducts = products.length;

  const availableProducts = products.filter(
    (product) =>
      product.is_active !== false &&
      product.status?.toUpperCase() !== "SOLD"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Welcome */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to Injibara Market
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Discover products and services from sellers in the marketplace.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/marketplace"
              className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Browse Marketplace
            </Link>

            <Link
              to="/customer/orders"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              My Orders
            </Link>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Products Loaded
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "—" : totalProducts}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Available Products
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "—" : availableProducts}
            </p>
          </div>

        </section>

        {/* Recent products */}
        <section className="mt-8">

          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Recent Products
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Recently available marketplace listings.
              </p>
            </div>

            <Link
              to="/marketplace"
              className="text-sm font-semibold text-purple-600 hover:text-purple-700"
            >
              View all
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-gray-500">
                Loading products...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            products.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                <h3 className="font-semibold text-gray-800">
                  No products available
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  There are currently no marketplace listings to display.
                </p>
              </div>
            )}

          {/* Products */}
          {!loading &&
            !error &&
            products.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}

        </section>
      </main>
    </div>
  );
}

function ProductItem({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100">

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}

      </div>

      {/* Information */}
      <div className="p-4">

        <h3 className="truncate font-semibold text-gray-900">
          {product.name}
        </h3>

        {product.category && (
          <p className="mt-1 text-xs text-gray-500">
            {product.category.name}
          </p>
        )}

        <p className="mt-3 font-bold text-purple-600">
          {Number(product.price).toLocaleString()} ETB
        </p>

      </div>
    </Link>
  );
}

export default CustomerDashboardPage;