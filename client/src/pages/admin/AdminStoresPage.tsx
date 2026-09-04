import { useEffect, useMemo, useState } from "react";
import {
  getAdminStores,
  updateStoreStatus,
  type AdminStore,
  type StoreStatus,
} from "../../api/storesApi";

function AdminStoresPage() {
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | StoreStatus>(
    "ALL"
  );

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getAdminStores();
        setStores(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load stores.");
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  const filteredStores = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return stores.filter((store) => {
      const matchesSearch =
        !searchValue ||
        store.name.toLowerCase().includes(searchValue) ||
        store.owner?.full_name?.toLowerCase().includes(searchValue) ||
        store.owner?.email?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" || store.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stores, search, statusFilter]);

  const handleStatusChange = async (
    store: AdminStore,
    status: StoreStatus
  ) => {
    try {
      setUpdatingId(store.id);
      setError(null);

      const updatedStore = await updateStoreStatus(store.id, status);

      setStores((currentStores) =>
        currentStores.map((item) =>
          item.id === updatedStore.id ? updatedStore : item
        )
      );
    } catch (err) {
      console.error(err);
      setError("Unable to update the store status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClasses = (status: StoreStatus) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-50 text-green-700";

      case "PENDING":
        return "bg-yellow-50 text-yellow-700";

      case "SUSPENDED":
        return "bg-red-50 text-red-700";

      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Stores
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage marketplace stores and their owners.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores or owners..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "ALL" | StoreStatus
              )
            }
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-purple-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-gray-500">
              Loading stores...
            </p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              □
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No stores found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              There are no stores matching your current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Store
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Owner
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Products
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
                {filteredStores.map((store) => (
                  <tr
                    key={store.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {store.name}
                        </p>

                        {store.description && (
                          <p className="mt-1 max-w-xs truncate text-sm text-gray-500">
                            {store.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {store.owner?.full_name ?? "—"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {store.owner?.phone ??
                            store.owner?.email ??
                            "—"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700">
                        {store.product_count}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          store.status
                        )}`}
                      >
                        {store.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <select
                        value={store.status}
                        disabled={updatingId === store.id}
                        onChange={(e) =>
                          handleStatusChange(
                            store,
                            e.target.value as StoreStatus
                          )
                        }
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="SUSPENDED">Suspended</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminStoresPage;