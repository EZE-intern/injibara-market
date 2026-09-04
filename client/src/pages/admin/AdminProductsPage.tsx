import { useEffect, useMemo, useState } from "react";
import {
  deleteAdminProduct,
  getAdminProducts,
  rejectAdminProduct,
  updateAdminProductStatus,
  type AdminProduct,
  type AdminProductStatus,
} from "../../api/adminApi";

function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | AdminProductStatus
  >("ALL");

  const [selectedProduct, setSelectedProduct] =
    useState<AdminProduct | null>(null);

  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  /* =========================
     LOAD PRODUCTS
  ========================= */

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAdminProducts();

      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* =========================
     FILTER PRODUCTS
  ========================= */

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.seller?.full_name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        product.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  /* =========================
     APPROVE
  ========================= */

  const handleApprove = async () => {
    if (!selectedProduct) return;

    try {
      setActionLoading(true);

      const updated = await updateAdminProductStatus(
        selectedProduct.id,
        "APPROVED"
      );

      setProducts((current) =>
        current.map((product) =>
          product.id === updated.id ? updated : product
        )
      );

      setSelectedProduct(updated);
    } catch (err) {
      console.error(err);
      setError("Unable to approve product.");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================
     REJECT
  ========================= */

  const handleReject = async () => {
    if (!selectedProduct) return;

    if (!rejectReason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const updated = await rejectAdminProduct(
        selectedProduct.id,
        rejectReason.trim()
      );

      setProducts((current) =>
        current.map((product) =>
          product.id === updated.id ? updated : product
        )
      );

      setSelectedProduct(updated);

      setRejecting(false);
      setRejectReason("");
    } catch (err) {
      console.error(err);
      setError("Unable to reject product.");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================
     SOFT DELETE
  ========================= */

  const handleDelete = async () => {
    if (!selectedProduct) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this product from the marketplace?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError(null);

      await deleteAdminProduct(selectedProduct.id);

      setProducts((current) =>
        current.filter(
          (product) => product.id !== selectedProduct.id
        )
      );

      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
      setError("Unable to remove product.");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================
     STATUS BADGE
  ========================= */

  const statusBadge = (status: AdminProductStatus) => {
    const styles: Record<AdminProductStatus, string> = {
      DRAFT: "bg-gray-100 text-gray-600",
      PENDING: "bg-yellow-50 text-yellow-700",
      APPROVED: "bg-green-50 text-green-700",
      REJECTED: "bg-red-50 text-red-700",
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  /* =========================
     IMAGE
  ========================= */

  const getProductImages = (product: AdminProduct) => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }

    if (product.image) {
      return [
        {
          id: product.id,
          url: product.image,
          angle: null,
        },
      ];
    }

    return [];
  };

  return (
    <div className="space-y-6">
      {/* =========================
          HEADER
      ========================= */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Products
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review and moderate marketplace listings.
        </p>
      </div>

      {/* =========================
          FILTER BAR
      ========================= */}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            placeholder="Search products or sellers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "ALL" | AdminProductStatus
              )
            }
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =========================
          TABLE
      ========================= */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-900">
              No products found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              There are no listings matching your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Product
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Seller
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Price
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                            No image
                          </div>
                        )}

                        <div>
                          <p className="font-medium text-slate-900">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            ID #{product.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.seller?.full_name ?? "Unknown"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.category?.name ?? "Uncategorized"}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {product.price}
                    </td>

                    <td className="px-6 py-4">
                      {statusBadge(product.status)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(product);
                          setRejecting(false);
                          setRejectReason("");
                          setError(null);
                        }}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-purple-600 transition hover:bg-purple-50"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================
          REVIEW DRAWER
      ========================= */}

      {selectedProduct && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close review"
            onClick={() => setSelectedProduct(null)}
            className="absolute inset-0 h-full w-full cursor-default bg-black/30"
          />

          {/* Drawer */}

          <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-xl">
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Product Review
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Listing #{selectedProduct.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* Product information */}

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Listing Information
                </h3>

                <div className="rounded-xl border border-gray-200 p-4">
                  <h4 className="text-lg font-semibold text-slate-900">
                    {selectedProduct.name}
                  </h4>

                  <p className="mt-2 text-sm text-gray-600">
                    {selectedProduct.description ||
                      "No description provided."}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">
                        Price
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {selectedProduct.price}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Category
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {selectedProduct.category?.name ??
                          "Uncategorized"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Stock
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {selectedProduct.stock ?? "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Status
                      </p>

                      <div className="mt-1">
                        {statusBadge(selectedProduct.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Images */}

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Product Images
                </h3>

                {getProductImages(selectedProduct).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                    No product images available.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {getProductImages(selectedProduct).map(
                      (image) => (
                        <div
                          key={image.id}
                          className="overflow-hidden rounded-xl border border-gray-200"
                        >
                          <img
                            src={image.url}
                            alt={
                              image.angle ??
                              selectedProduct.name
                            }
                            className="h-40 w-full object-cover"
                          />

                          {image.angle && (
                            <p className="px-3 py-2 text-xs font-medium text-gray-500">
                              {image.angle}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>

              {/* Seller */}

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Seller
                </h3>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="font-semibold text-slate-900">
                    {selectedProduct.seller?.full_name ??
                      "Unknown seller"}
                  </p>

                  {selectedProduct.seller?.phone && (
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedProduct.seller.phone}
                    </p>
                  )}
                </div>
              </section>

              {/* Rejection */}

              {rejecting && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    Rejection Reason
                  </h3>

                  <textarea
                    value={rejectReason}
                    onChange={(e) =>
                      setRejectReason(e.target.value)
                    }
                    rows={4}
                    placeholder="Explain why this listing is being rejected..."
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRejecting(false);
                        setRejectReason("");
                      }}
                      className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleReject}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {actionLoading
                        ? "Rejecting..."
                        : "Confirm Rejection"}
                    </button>
                  </div>
                </section>
              )}

              {/* Actions */}

              {!rejecting && (
                <section className="border-t border-gray-100 pt-5">
                  <div className="flex flex-col gap-3">
                    {selectedProduct.status !== "APPROVED" && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleApprove}
                        className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
                      >
                        {actionLoading
                          ? "Processing..."
                          : "Approve Listing"}
                      </button>
                    )}

                    {selectedProduct.status !== "REJECTED" && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => setRejecting(true)}
                        className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        Reject Listing
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleDelete}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      Remove Listing
                    </button>
                  </div>
                </section>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default AdminProductsPage;