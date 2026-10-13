import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Briefcase,
  Store,
  Users,
  ArrowRight,
  CheckCircle2,
  PlusCircle,
  Clock,
} from "lucide-react";

import {
  getAdminOverview,
  type AdminOverview,
} from "../../api/adminApi";

function AdminDashboardPage() {
  /* =========================================
     DASHBOARD STATE
  ========================================= */

  const [overview, setOverview] =
    useState<AdminOverview | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  /* =========================================
     LOAD DASHBOARD DATA
  ========================================= */

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminOverview();
        setOverview(data);
      } catch (err) {
        console.error(
          "Failed to load admin overview:",
          err
        );
        setError(
          "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);


  /* =========================================
     KPI CARDS
  ========================================= */

  const stats = [
    {
      title: "Total Active Listings",
      value: overview
        ? overview.totalActiveListings.toLocaleString()
        : "—",
      description: "Active marketplace products",
      icon: Package,
    },
    {
      title: "Pending Broker Inquiries",
      value: overview
        ? overview.pendingBrokerInquiries.toLocaleString()
        : "—",
      description: "Deals waiting for admin action",
      icon: Briefcase,
    },
    {
      title: "Total Stores",
      value: overview
        ? overview.totalStores.toLocaleString()
        : "—",
      description: "Registered seller storefronts",
      icon: Store,
    },
    {
      title: "Total Registered Users",
      value: overview
        ? overview.totalRegisteredUsers.toLocaleString()
        : "—",
      description: "Customers and sellers",
      icon: Users,
    },
  ];


  /* =========================================
     PAGE
  ========================================= */

  return (
    <div className="space-y-7">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <section>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard Overview
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor marketplace activity, brokered
          deals, sellers, and platform operations.
        </p>
      </section>


      {/* =====================================
          ERROR MESSAGE
      ===================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-5 py-4">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            {error}
          </p>

          <p className="mt-1 text-xs text-red-500 dark:text-red-400/80">
            Make sure the backend server is running
            and the admin overview API is available.
          </p>
        </div>
      )}


      {/* =====================================
          KPI CARDS
      ===================================== */}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs"
            >

              <div className="flex items-start justify-between">

                {/* Text */}
                <div>

                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                    {loading ? "—" : stat.value}
                  </p>

                </div>


                {/* Icon */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <Icon className="h-5 w-5" />
                </div>

              </div>


              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                {stat.description}
              </p>

            </div>
          );
        })}

      </section>


      {/* =====================================
          QUICK ACTIONS
      ===================================== */}

      <section>

        <div className="mb-4">

          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Common administrative tasks.
          </p>

        </div>


        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">


          {/* Review Inquiries */}
          <Link
            to="/admin/broker-hub"
            className="group rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <Briefcase className="h-5 w-5" />
              </div>

              <div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Review Inquiries
                </h3>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Review brokered deal requests.
                </p>

              </div>

              <ArrowRight className="ml-auto h-4 w-4 text-gray-400 transition group-hover:translate-x-1" />

            </div>

          </Link>


          {/* Approve Listings */}
          <Link
            to="/admin/products"
            className="group rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Approve Listings
                </h3>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Review pending marketplace listings.
                </p>

              </div>

              <ArrowRight className="ml-auto h-4 w-4 text-gray-400 transition group-hover:translate-x-1" />

            </div>

          </Link>


          {/* Add Category */}
          <Link
            to="/admin/categories"
            className="group rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <PlusCircle className="h-5 w-5" />
              </div>

              <div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Add New Category
                </h3>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Create a marketplace category.
                </p>

              </div>

              <ArrowRight className="ml-auto h-4 w-4 text-gray-400 transition group-hover:translate-x-1" />

            </div>

          </Link>

        </div>

      </section>


      {/* =====================================
          RECENT ACTIVITY
      ===================================== */}

      <section>

        <div className="mb-4">

          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Latest administrative activity across
            the platform.
          </p>

        </div>


        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">

          <div className="flex min-h-[220px] items-center justify-center px-6 text-center">

            <div>

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500">
                <Clock className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                No recent activity
              </h3>

              <p className="mt-1 max-w-md text-xs text-gray-400 dark:text-gray-500">
                Recent administrative actions will
                appear here once the activity API is
                connected.
              </p>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default AdminDashboardPage;