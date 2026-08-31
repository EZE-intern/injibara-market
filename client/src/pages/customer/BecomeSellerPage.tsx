import { FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { isAuthenticated } from "../../utils/authStorage";

function BecomeSellerPage() {
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  const [phone, setPhone] = useState("");
  const [finNumber, setFinNumber] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSendOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    // Temporary until backend OTP endpoint is ready.
    console.log("Send OTP to:", phone);

    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 800);
  };

  const handleSubmitApplication = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);

    // Temporary until backend seller application endpoint is ready.
    console.log({
      phone,
      finNumber,
      businessName,
      otp,
    });

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-lg">

          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
              ✓
            </div>

            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Application Submitted
            </h1>

            <p className="mt-3 text-gray-600">
              Your seller application has been submitted successfully.
              The system will process your application.
            </p>

            <Link
              to="/customer"
              className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
            >
              Back to Dashboard
            </Link>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">

      <div className="mx-auto max-w-2xl">

        {/* Back */}
        <Link
          to="/customer"
          className="text-sm font-medium text-gray-500 hover:text-brand-600"
        >
          ← Back to dashboard
        </Link>

        {/* Header */}
        <div className="mt-6 mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Become a Seller
          </h1>

          <p className="mt-2 text-gray-600">
            Start selling your products on Injibara Market.
          </p>

        </div>

        {/* Application Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          {!otpSent ? (

            /* =========================
               SELLER INFORMATION
            ========================== */

            <form onSubmit={handleSendOtp}>

              <div className="rounded-xl bg-gray-50 p-4">

                <h2 className="font-semibold text-gray-900">
                  Seller Information
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Enter your information below. Your phone number
                  will be verified using an OTP.
                </p>

              </div>

              {/* Phone */}
              <div className="mt-6">

                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="+251 9XXXXXXXX"
                  autoComplete="tel"
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />

                <p className="mt-2 text-xs text-gray-500">
                  We will send a verification code to this number.
                </p>

              </div>

              {/* FIN */}
              <div className="mt-5">

                <label
                  htmlFor="finNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  FIN Number
                </label>

                <input
                  id="finNumber"
                  type="text"
                  value={finNumber}
                  onChange={(event) =>
                    setFinNumber(event.target.value)
                  }
                  placeholder="Enter your FIN number"
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />

              </div>

              {/* Business Name */}
              <div className="mt-5">

                <label
                  htmlFor="businessName"
                  className="text-sm font-medium text-gray-700"
                >
                  Business / Shop Name
                </label>

                <input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(event) =>
                    setBusinessName(event.target.value)
                  }
                  placeholder="Enter your business or shop name"
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />

              </div>

              {/* Send OTP */}
              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

            </form>

          ) : (

            /* =========================
               OTP VERIFICATION
            ========================== */

            <form onSubmit={handleSubmitApplication}>

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-2xl">
                  📱
                </div>

                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  Verify your phone number
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  We sent a verification code to
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {phone}
                </p>

              </div>

              {/* OTP */}
              <div className="mt-8">

                <label
                  htmlFor="otp"
                  className="text-sm font-medium text-gray-700"
                >
                  Verification Code
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="Enter 6-digit OTP"
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl tracking-[0.5em] text-gray-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />

              </div>

              {/* Verify */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="mt-6 w-full rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Verifying..."
                  : "Verify & Submit Application"}
              </button>

              {/* Change number */}
              <button
                type="button"
                onClick={() => {
                  setOtp("");
                  setOtpSent(false);
                }}
                className="mt-4 w-full text-sm font-medium text-gray-500 hover:text-brand-600"
              >
                Change phone number
              </button>

              {/* Resend */}
              <button
                type="button"
                onClick={() => {
                  console.log("Resend OTP to:", phone);
                }}
                className="mt-3 w-full text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Resend OTP
              </button>

            </form>
          )}

        </div>

      </div>

    </main>
  );
}

export default BecomeSellerPage;