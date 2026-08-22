import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

function BecomeSellerPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Backend integration will be added later.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">

        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm sm:p-12">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-3xl">
            ⏳
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Application Submitted
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-gray-600">
            Your seller application has been submitted successfully.
            An administrator will review your application.
          </p>

          <div className="mt-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            Status: <strong>Pending Review</strong>
          </div>

          <Link
            to="/customer"
            className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Back to Dashboard
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-3xl">

        {/* Back */}
        <Link
          to="/customer"
          className="text-sm font-medium text-gray-500 hover:text-brand-600"
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mt-6">

          <h1 className="text-3xl font-bold text-gray-900">
            Become a Seller
          </h1>

          <p className="mt-2 text-gray-600">
            Tell us about yourself and your business.
          </p>

        </div>

        {/* Form */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">

          <form onSubmit={handleSubmit}>

            {/* Full name */}
            <div>
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-gray-700"
              >
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                required
                placeholder="Enter your full name"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Phone */}
            <div className="mt-5">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                required
                placeholder="09XXXXXXXX"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Shop name */}
            <div className="mt-5">
              <label
                htmlFor="shopName"
                className="text-sm font-medium text-gray-700"
              >
                Shop / Business Name
              </label>

              <input
                id="shopName"
                type="text"
                required
                placeholder="Enter your shop or business name"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Category */}
            <div className="mt-5">
              <label
                htmlFor="category"
                className="text-sm font-medium text-gray-700"
              >
                Main Product Category
              </label>

              <select
                id="category"
                required
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">
                  Select a category
                </option>

                <option value="electronics">
                  Electronics
                </option>

                <option value="fashion">
                  Fashion
                </option>

                <option value="food">
                  Food & Agriculture
                </option>

                <option value="home">
                  Home & Living
                </option>

                <option value="handicrafts">
                  Handicrafts
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>

            {/* Location */}
            <div className="mt-5">
              <label
                htmlFor="location"
                className="text-sm font-medium text-gray-700"
              >
                Business Location
              </label>

              <input
                id="location"
                type="text"
                required
                placeholder="e.g. Injibara"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Description */}
            <div className="mt-5">
              <label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Business Description
              </label>

              <textarea
                id="description"
                required
                rows={5}
                placeholder="Tell us briefly about what you sell..."
                className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Info */}
            <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
              <strong className="text-gray-900">
                What happens next?
              </strong>

              <p className="mt-1">
                Your application will be reviewed by an administrator.
                If approved, you will receive access to your seller
                dashboard.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
            >
              Submit Seller Application
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}

export default BecomeSellerPage;