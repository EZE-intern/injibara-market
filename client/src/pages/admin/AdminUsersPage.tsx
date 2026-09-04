import { useEffect, useMemo, useState } from "react";
import {
  getAdminUsers,
  updateUserStatus,
  type AdminUser,
  type AdminUserRole,
  type AdminUserStatus,
} from "../../api/userAdminApi";

function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<"ALL" | AdminUserRole>("ALL");

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getAdminUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load users.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !value ||
        user.full_name.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.phone?.toLowerCase().includes(value);

      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleStatusChange = async (
    user: AdminUser
  ) => {
    const newStatus: AdminUserStatus =
      user.status === "ACTIVE"
        ? "SUSPENDED"
        : "ACTIVE";

    try {
      setUpdatingId(user.id);
      setError(null);

      const updatedUser = await updateUserStatus(
        user.id,
        newStatus
      );

      setUsers((current) =>
        current.map((item) =>
          item.id === updatedUser.id
            ? updatedUser
            : item
        )
      );
    } catch (err) {
      console.error(err);
      setError("Unable to update user status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleClasses = (role: AdminUserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-50 text-purple-700";

      case "ADMIN":
        return "bg-indigo-50 text-indigo-700";

      case "SELLER":
        return "bg-blue-50 text-blue-700";

      case "CUSTOMER":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Users
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage registered marketplace users.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search by name, email or phone..."
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white"
          />

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(
                e.target.value as
                  | "ALL"
                  | AdminUserRole
              )
            }
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-purple-400"
          >
            <option value="ALL">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="SELLER">Seller</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">
              Super Admin
            </option>
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
              Loading users...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="text-sm font-semibold text-slate-900">
              No users found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              No users match your current search or filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    User
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Role
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Joined
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {user.full_name}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {user.email}
                      </p>

                      {user.phone && (
                        <p className="mt-1 text-xs text-gray-500">
                          {user.phone}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleClasses(
                          user.role
                        )}`}
                      >
                        {user.role.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={
                          user.status === "ACTIVE"
                            ? "text-sm font-medium text-green-700"
                            : "text-sm font-medium text-red-600"
                        }
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(
                        user.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        disabled={
                          updatingId === user.id
                        }
                        onClick={() =>
                          handleStatusChange(user)
                        }
                        className="text-sm font-semibold text-purple-600 hover:text-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {user.status === "ACTIVE"
                          ? "Suspend"
                          : "Activate"}
                      </button>
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

export default AdminUsersPage;