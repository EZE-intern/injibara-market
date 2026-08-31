import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import CustomerFooter from "../../components/customer/CustomerFooter";
import { getMyOrders } from "../../api/orderApi";
import type { Order } from "../../api/orderApi";
import { isAuthenticated } from "../../utils/authStorage";

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

function CustomerOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyOrders();
        setOrders(data);
      } catch (err: unknown) {
        console.error("Failed to load user orders:", err);
        setError("Unable to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <CustomerNavbar />

      <main className="flex-1 bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumb Navigation */}
          <Link
            to="/customer"
            className="text-sm font-medium text-gray-500 hover:text-brand-600 transition inline-flex items-center gap-1"
          >
            <span>&larr;</span> Back to Dashboard
          </Link>

          {/* Page Heading */}
          <div className="mt-4 mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                My Orders
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Track and manage your marketplace purchases in Injibara.
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700"
            >
              Browse Marketplace
            </Link>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-gray-600">
                Loading your orders...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              <p className="font-semibold">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : orders.length === 0 ? (
            /* Empty State (Zero Orders) */
            <div className="rounded-2xl border border-gray-150 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>

              <h2 className="mt-4 text-xl font-bold text-gray-900">
                No orders placed yet
              </h2>

              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                You have not placed any orders yet. When you buy items from local sellers in Injibara, your order history and tracking will appear here.
              </p>

              <div className="mt-6">
                <Link
                  to="/products"
                  className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700 shadow-sm"
                >
                  Explore Products
                </Link>
              </div>
            </div>
          ) : (
            /* Real Orders List */
            <div className="space-y-4">
              {orders.map((order) => {
                const totalAmount = Number(order.total_amount).toLocaleString();
                const formattedDate = new Date(order.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
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
                          {totalAmount} <span className="text-xs text-brand-600 font-bold">ETB</span>
                        </span>
                        <p className="text-xs text-gray-400 capitalize">
                          {order.payment_method.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-4 space-y-3">
                      {order.order_items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-700">
                              {item.quantity}x
                            </span>
                            <span className="font-medium text-gray-800">
                              {item.product_name || item.products?.name || "Marketplace Product"}
                            </span>
                          </div>

                          <span className="font-semibold text-gray-700">
                            {Number(item.price).toLocaleString()} ETB
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping info if available */}
                    {order.shipping_address && (
                      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">Delivery to: </span>
                        {order.shipping_address}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}

export default CustomerOrdersPage;