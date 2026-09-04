import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getInbox,
  getUnreadCount,
  type ConversationSummary,
} from "../../api/messageApi";

function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<ConversationSummary[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const [inbox, unread] = await Promise.all([
        getInbox(),
        getUnreadCount(),
      ]);

      setNotifications(inbox);
      setUnreadCount(unread);
    } catch {
      setError("Unable to load your notifications.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Stay updated with your conversations and messages.
            </p>
          </div>

          {unreadCount > 0 && (
            <span className="rounded-full bg-black px-3 py-1 text-sm text-white">
              {unreadCount} unread
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No notifications
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              You don't have any messages or notifications yet.
            </p>

            <Link
              to="/products"
              className="mt-5 inline-block rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          /* Notifications */
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {notifications.map((notification) => (
              <Link
                key={`${notification.contact_id}-${notification.product_id}`}
                to="/customer/messages"
                className="block border-b border-gray-100 p-5 transition hover:bg-gray-50 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-gray-900">
                        {notification.contact_name}
                      </h2>

                      {notification.unread_count > 0 && (
                        <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
                          {notification.unread_count}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 truncate text-sm text-gray-600">
                      {notification.latest_message}
                    </p>

                    {notification.product_id && (
                      <p className="mt-1 text-xs text-gray-400">
                        Product #{notification.product_id}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-xs text-gray-400">
                    {formatDate(notification.latest_message_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleString();
}

export default CustomerNotificationsPage;