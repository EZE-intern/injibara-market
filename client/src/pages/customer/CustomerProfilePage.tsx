import { Link } from "react-router-dom";

function CustomerProfilePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">

      <div className="mx-auto max-w-3xl">

        <Link
          to="/customer"
          className="text-sm text-gray-500 hover:text-brand-600"
        >
          ← Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          My Profile
        </h1>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm sm:p-8">

          <div className="flex items-center gap-4 border-b border-gray-200 pb-6">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
              E
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Eyob
              </h2>

              <p className="text-sm text-gray-500">
                Customer
              </p>
            </div>

          </div>

          <div className="mt-6 space-y-5">

            <div>
              <p className="text-sm text-gray-500">
                Full Name
              </p>

              <p className="mt-1 font-medium text-gray-900">
                Eyob
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="mt-1 font-medium text-gray-900">
                customer@example.com
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Phone
              </p>

              <p className="mt-1 font-medium text-gray-900">
                Not provided
              </p>
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}

export default CustomerProfilePage;