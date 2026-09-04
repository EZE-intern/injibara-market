import { getUser } from "../../utils/authStorage";

function AdminHeader() {
  const user = getUser();

  return (
    <header className="fixed left-[270px] right-0 top-0 z-30 h-[86px] border-b border-gray-200 bg-white">
      <div className="flex h-full items-center justify-between px-8">
        
        {/* Page title */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Staff Roles, Permissions & Security Audit
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Administrative Access Delegation & System Compliance Logs
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          
          {/* Server status */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700 md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Injibara Node: Connected
          </div>

          {/* Search */}
          <div className="hidden items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 md:flex">
            <span className="text-gray-400">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search deals, users, Fayda"
              className="w-52 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Notification */}
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg"
          >
            ♧

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* User */}
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
              {user?.full_name?.charAt(0).toUpperCase() || "A"}
            </div>

            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-900">
                {user?.full_name || "Administrator"}
              </p>

              <p className="text-[11px] text-slate-500">
                {user?.role || "Admin"}
              </p>
            </div>

            <span className="text-gray-400">
             ⌄
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;