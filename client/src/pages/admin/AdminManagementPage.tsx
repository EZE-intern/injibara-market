import { useEffect, useMemo, useState } from "react";
import {
  createAdmin,
  getManagedAdmins,
  updateAdminStatus,
  type ManagedAdmin,
} from "../../api/adminManagementApi";
import {
  getAdminUsers,
  updateUserRole,
  type AdminUser,
} from "../../api/userAdminApi";

const initialForm = {
  full_name: "",
  email: "",
  password: "",
  phone: "",
};

function AdminManagementPage() {
  const [admins, setAdmins] = useState<ManagedAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [promotingId, setPromotingId] = useState<number | null>(null);

  const [form, setForm] = useState(initialForm);

  const [eligibleUsers, setEligibleUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [promoteSearch, setPromoteSearch] = useState("");

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getManagedAdmins();
      setAdmins(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load administrators.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const openPromoteModal = async () => {
    setShowPromoteModal(true);
    setPromoteSearch("");
    setError(null);
    setSuccess(null);
    setLoadingUsers(true);

    try {
      const users = await getAdminUsers();
      setEligibleUsers(
        users.filter(
          (user) =>
            user.role === "CUSTOMER" || user.role === "SELLER"
        )
      );
    } catch (err) {
      console.error(err);
      setError("Unable to load users for promotion.");
      setShowPromoteModal(false);
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredEligibleUsers = useMemo(() => {
    const value = promoteSearch.trim().toLowerCase();
    if (!value) return eligibleUsers;

    return eligibleUsers.filter(
      (user) =>
        user.full_name.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.phone?.toLowerCase().includes(value)
    );
  }, [eligibleUsers, promoteSearch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.full_name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (/\d/.test(form.full_name)) {
      setError("Full name cannot contain numbers.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const newAdmin = await createAdmin({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        role: "ADMIN",
      });

      setAdmins((current) => [newAdmin, ...current]);
      setForm(initialForm);
      setShowCreateModal(false);
      setSuccess("Administrator account created.");
    } catch (err) {
      console.error(err);
      setError("Unable to create administrator.");
    } finally {
      setSaving(false);
    }
  };

  const handlePromote = async (user: AdminUser) => {
    const confirmed = window.confirm(
      `Promote ${user.full_name} (${user.email}) to admin?`
    );
    if (!confirmed) return;

    try {
      setPromotingId(user.id);
      setError(null);
      setSuccess(null);

      await updateUserRole(user.id, "admin");

      setEligibleUsers((current) =>
        current.filter((item) => item.id !== user.id)
      );

      await loadAdmins();
      setSuccess(`${user.full_name} has been promoted to admin.`);
      setShowPromoteModal(false);
    } catch (err) {
      console.error(err);
      setError("Unable to promote user to admin.");
    } finally {
      setPromotingId(null);
    }
  };

  const handleStatusToggle = async (admin: ManagedAdmin) => {
    const newStatus =
      admin.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    try {
      setError(null);
      setSuccess(null);

      const updatedAdmin = await updateAdminStatus(
        admin.id,
        newStatus
      );

      setAdmins((current) =>
        current.map((item) =>
          item.id === updatedAdmin.id
            ? { ...item, status: newStatus }
            : item
        )
      );
    } catch (err) {
      console.error(err);
      setError("Unable to update administrator.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Admin Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create admins or promote existing buyers and sellers.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={openPromoteModal}
            className="rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
          >
            Promote User
          </button>

          <button
            type="button"
            onClick={() => {
              setForm(initialForm);
              setError(null);
              setSuccess(null);
              setShowCreateModal(true);
            }}
            className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            Add Admin
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-gray-500">
              Loading administrators...
            </p>
          </div>
        ) : admins.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="text-sm font-semibold text-slate-900">
              No administrators found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Promote an existing user or create a new admin account.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Administrator
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
                {admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {admin.full_name}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {admin.email}
                      </p>
                      {admin.phone && (
                        <p className="mt-1 text-xs text-gray-500">
                          {admin.phone}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                        {admin.role.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={
                          admin.status === "ACTIVE"
                            ? "text-sm font-medium text-green-700"
                            : "text-sm font-medium text-red-600"
                        }
                      >
                        {admin.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(admin)}
                        className="text-sm font-semibold text-purple-600 hover:text-purple-800"
                      >
                        {admin.status === "ACTIVE"
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

      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">
                Promote User to Admin
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Choose an existing buyer or seller to grant admin access.
              </p>
            </div>

            <div className="border-b border-gray-100 px-6 py-4">
              <input
                type="text"
                value={promoteSearch}
                onChange={(e) => setPromoteSearch(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingUsers ? (
                <p className="py-10 text-center text-sm text-gray-500">
                  Loading users...
                </p>
              ) : filteredEligibleUsers.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">
                  No buyers or sellers found to promote.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filteredEligibleUsers.map((user) => (
                    <li
                      key={user.id}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {user.full_name}
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          {user.email}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">
                          {user.role === "CUSTOMER" ? "Buyer" : "Seller"}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={promotingId === user.id}
                        onClick={() => handlePromote(user)}
                        className="shrink-0 rounded-xl bg-purple-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {promotingId === user.id
                          ? "Promoting..."
                          : "Promote"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">
                Add Administrator
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Create a new administrator account.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      full_name: e.target.value.replace(/\d/g, ""),
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-400"
                  placeholder="Administrator name"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-400"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-400"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-400"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagementPage;
