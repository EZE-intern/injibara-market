import { useState } from "react";
import { getUser } from "../../utils/authStorage";

function AdminSettingsPage() {
  const user = getUser();

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your administrator account and marketplace settings.
        </p>
      </div>

      {/* Account Settings */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Account Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your administrator account information.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled
            className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white opacity-50"
          >
            Save Changes
          </button>
        </div>

        <p className="mt-3 text-right text-xs text-gray-400">
          Profile update API will be connected when the backend contract is ready.
        </p>
      </section>

      {/* Security */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Security
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your administrator password and account security.
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-sm font-medium text-slate-900">
            Change Password
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Password management will be available once the backend
            authentication endpoint is implemented.
          </p>
        </div>
      </section>

      {/* Marketplace Configuration */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Marketplace Configuration
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Configuration options for Injibara Market.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Marketplace Status
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Controls whether the marketplace is operational.
              </p>
            </div>

            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Brokered Categories
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Property, vehicles and heavy machinery require admin mediation.
              </p>
            </div>

            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              Tier 1
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Direct Marketplace
              </p>

              <p className="mt-1 text-sm text-gray-500">
                General marketplace categories allow direct buyer-seller contact.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Tier 2
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminSettingsPage;