import { Link } from "react-router-dom";

function CustomerOrdersPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/customer"
          className="text-sm text-gray-500 hover:text-brand-600 transition"
        >
          &larr; Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          My Orders
        </h1>

        <div className="mt-8 space-y-4">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <p className="font-semibold text-gray-900">
                  #ORD-001
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Samsung Galaxy A15
                </p>
              </div>

              <div className="sm:text-right">
                <p className="font-bold text-brand-600">
                  18,500 ETB
                </p>
                <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Delivered
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <p className="font-semibold text-gray-900">
                  #ORD-002
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Traditional Injibara Teff (25kg)
                </p>
              </div>

              <div className="sm:text-right">
                <p className="font-bold text-brand-600">
                  4,500 ETB
                </p>
                <span className="mt-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                  Processing
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CustomerOrdersPage;