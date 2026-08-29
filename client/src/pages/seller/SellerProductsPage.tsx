import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../../api/productApi";
import type { Product } from "../../types/Product";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchSellerProducts = async () => {
    try {
      setLoading(true);
      const all = await getProducts();
      setProducts(all);
    } catch (err) {
      console.error("Failed to load seller products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`እርግጠኛ ነዎት "${name}" የተባለውን ምርት መሰረዝ ይፈልጋሉ?`)) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("እባክዎ መጀመሪያ Login ያድርጉ!");
      return;
    }

    try {
      setDeletingId(id);
      await deleteProduct(id, token);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert("ምርቱ በተሳካ ሁኔታ ተሰርዟል!");
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("ምርቱን መሰረዝ አልተቻለም።");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header with Navigation & Add Button */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Link
                to="/seller"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                ← Seller Dashboard
              </Link>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              የእኔ ምርቶች (My Listed Products)
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your active product listings on Injibara Market.
            </p>
          </div>

          <Link
            to="/seller/products/new"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
          >
            ➕ አዲስ ምርት ጨምር (Add Product)
          </Link>
        </div>

        {/* Content Table / Cards */}
        <div className="mt-8 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
              <p className="mt-3 text-sm text-gray-500">ምርቶች በመጫን ላይ ናቸው...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-4">ምርት (Product)</th>
                    <th className="px-6 py-4">ምድብ (Category)</th>
                    <th className="px-6 py-4">ዋጋ (Price)</th>
                    <th className="px-6 py-4">ፎቶዎች (Images)</th>
                    <th className="px-6 py-4 text-right">እርምጃዎች (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => {
                    const primaryImg =
                      product.product_images?.find((i) => i.is_primary)?.image_url ||
                      product.product_images?.[0]?.image_url ||
                      product.image ||
                      "https://via.placeholder.com/100?text=No+Image";

                    return (
                      <tr key={product.id} className="hover:bg-gray-50/80 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={primaryImg}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                            />
                            <div>
                              <p className="font-bold text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-400">ID: #{product.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {product.categories?.name || product.category || "General"}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-bold text-brand-700">
                          {Number(product.price).toLocaleString()} ETB
                        </td>

                        <td className="px-6 py-4 text-xs text-gray-500">
                          📸 {product.product_images?.length || 1} angle(s)
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/products/${product.id}`}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
                            >
                              View ↗
                            </Link>

                            <button
                              type="button"
                              disabled={deletingId === product.id}
                              onClick={() => handleDelete(product.id, product.name)}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                            >
                              {deletingId === product.id ? "..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="text-4xl">📦</div>
              <h3 className="mt-3 text-lg font-bold text-gray-900">
                ምንም የተመዘገበ ምርት የለም (No Products Listed Yet)
              </h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                You haven't listed any products yet. Click below to add your first item to Injibara Market.
              </p>
              <Link
                to="/seller/products/new"
                className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-700"
              >
                ➕ አዲስ ምርት መዝግብ (Add Product)
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
