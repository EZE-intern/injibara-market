import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSellerOrders, type Order } from "../../api/orderApi";
import { Package, User, Phone, MapPin } from "lucide-react";

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          Delivered
        </span>
      );
    case "shipped":
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
          Shipped
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
          Processing
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 border border-gray-200">
          Pending
        </span>
      );
  }
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSellerOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load seller orders:", err);
      setError("Unable to load incoming orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const totalRevenue = orders.reduce((sum, order) => {
    const orderSellerTotal = order.order_items.reduce(
      (itemSum, item) => itemSum + Number(item.price) * (Number(item.quantity) || 1),
      0
    );
    return sum + orderSellerTotal;
  }, 0);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/seller"
            className="text-sm font-medium text-gray-500 hover:text-brand-600 transition inline-flex items-center gap-1"
          >
            <span>&larr;</span> Back to Seller Hub
          </Link>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Incoming Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Customer purchases containing your marketplace listings.
          </p>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Incoming Orders
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "..." : orders.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Order Value
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "..." : `${totalRevenue.toLocaleString()} ETB`}
            </p>
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-gray-500">
              Loading incoming customer orders...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            <p className="font-semibold">{error}</p>
            <button
              type="button"
              onClick={loadOrders}
              className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-700 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Package size={28} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-gray-900">
              No customer orders yet
            </h2>
            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
              When customers purchase your listed products, incoming orders will appear here for fulfillment.
            </p>
            <div className="mt-6">
              <Link
                to="/seller/products/new"
                className="rounded-lg bg-brand-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-brand-700 shadow-sm"
              >
                Add New Product
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const formattedDate = new Date(order.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              const orderItemsTotal = order.order_items.reduce(
                (sum, item) => sum + Number(item.price) * (Number(item.quantity) || 1),
                0
              );

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-gray-900">
                          #{order.order_number}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        Placed on {formattedDate}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <span className="text-lg font-extrabold text-gray-900">
                        {orderItemsTotal.toLocaleString()}{" "}
                        <span className="text-xs font-bold text-brand-600">ETB</span>
                      </span>
                      <p className="text-xs text-gray-400 capitalize">
                        {order.payment_method.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>

                  {/* Customer Information */}
                  {order.users && (
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                        <User size={14} className="text-gray-400" />
                        Buyer: {order.users.full_name}
                      </span>
                      {order.users.phone && (
                        <a
                          href={`tel:${order.users.phone}`}
                          className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1.5"
                        >
                          <Phone size={14} />
                          {order.users.phone}
                        </a>
                      )}
                      {order.shipping_address && (
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <MapPin size={14} className="text-gray-400" />
                          {order.shipping_address}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Ordered Items List */}
                  <div className="mt-4 space-y-2">
                    {order.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-xs font-bold text-gray-700">
                            {item.quantity}x
                          </span>
                          <span className="font-medium text-gray-800">
                            {item.product_name || item.products?.name || "Product"}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-700">
                          {(Number(item.price) * (Number(item.quantity) || 1)).toLocaleString()} ETB
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Note if present */}
                  {order.note && (
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">Note: </span>
                      {order.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}