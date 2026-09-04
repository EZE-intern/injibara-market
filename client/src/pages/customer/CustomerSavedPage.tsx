import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import ProductCard from "../../components/common/ProductCard";
import { getSavedProducts, removeSavedProduct } from "../../utils/savedStorage";
import type { Product } from "../../types/Product";

function CustomerSavedPage() {
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);

  useEffect(() => {
    setSavedProducts(getSavedProducts());

    const handleUpdate = () => {
      setSavedProducts(getSavedProducts());
    };

    window.addEventListener("saved_products_updated", handleUpdate);
    return () => {
      window.removeEventListener("saved_products_updated", handleUpdate);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/customer"
          className="text-sm text-gray-500 hover:text-brand-600 transition"
        >
          &larr; Dashboard
        </Link>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Saved Products
            {savedProducts.length > 0 && (
              <span className="ml-3 text-lg font-normal text-gray-500">
                ({savedProducts.length})
              </span>
            )}
          </h1>
          {savedProducts.length > 0 && (
            <Link
              to="/products"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition"
            >
              Browse more products &rarr;
            </Link>
          )}
        </div>

        {savedProducts.length === 0 ? (
          <div className="mt-8 rounded-xl bg-white p-12 text-center shadow-sm border border-gray-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Heart size={32} />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              No saved products yet
            </h2>

            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              Save products you are interested in so you can find and purchase them later.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 transition shadow-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {savedProducts.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <button
                  type="button"
                  onClick={() => removeSavedProduct(product.id)}
                  className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow-md backdrop-blur-sm transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  title="Remove from saved"
                  aria-label="Remove from saved"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default CustomerSavedPage;