import { useEffect, useState } from "react";
import { getMyOrders, Order } from "../../api/orderApi";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyOrders();
        setOrders(data);
      } catch {
        setError(
          "Unable to load your orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading your orders...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-black text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            No orders yet
          </h2>

          <p className="mt-2 text-gray-500">
            Your orders will appear here after you make a purchase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          My Orders
        </h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border p-5"
            >
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    Order #{order.id}
                  </p>

                  <p className="text-sm text-gray-500">
                    {new Date(
                      order.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    ETB {Number(order.total_amount).toLocaleString()}
                  </p>

                  <span className="text-sm text-gray-600">
                    {order.status}
                  </span>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mt-4 border-t pt-4 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.product?.name ||
                          `Product #${item.product_id}`}
                        {" × "}
                        {item.quantity}
                      </span>

                      <span>
                        ETB{" "}
                        {Number(item.price).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}