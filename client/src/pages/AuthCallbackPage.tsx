import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { exchangeWorkOSCode } from "../api/authApi";
import { saveAuth } from "../utils/authStorage";
import toast from "react-hot-toast";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const exchangeAttempted = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (exchangeAttempted.current) return;

    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");

    if (errorParam) {
      setError(errorDesc || "Authentication was cancelled or failed.");
      return;
    }

    if (!code) {
      setError("No authorization code received from authentication provider.");
      return;
    }

    exchangeAttempted.current = true;

    const exchange = async () => {
      try {
        const response = await exchangeWorkOSCode(code);

        // Save session
        saveAuth(response.token, response.user);
        toast.success(`Welcome, ${response.user.full_name || "User"}!`);

        // Check if there was a saved redirect destination
        const savedRedirect = sessionStorage.getItem("injibara_auth_redirect");
        if (savedRedirect) {
          sessionStorage.removeItem("injibara_auth_redirect");
          navigate(savedRedirect, { replace: true });
          return;
        }

        // Default role navigation
        const role = response.user.role?.toLowerCase();
        if (role === "admin" || role === "super_admin") {
          navigate("/admin", { replace: true });
        } else if (role === "seller") {
          navigate("/seller", { replace: true });
        } else {
          navigate("/customer", { replace: true });
        }
      } catch (err: unknown) {
        console.error("Failed to complete WorkOS authentication:", err);
        const errorObj = err as { response?: { data?: { message?: string } } };
        setError(
          errorObj.response?.data?.message ||
            "Unable to complete sign-in. Please try again."
        );
      }
    };

    exchange();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-slate-900 p-8 shadow-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 mb-4">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Authentication Error
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {error}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/login"
              className="w-full rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition shadow-xs"
            >
              Back to Sign In
            </Link>
            <Link
              to="/"
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/50">
          <div className="h-7 w-7 rounded-full border-3 border-red-600 border-t-transparent animate-spin" />
        </div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          Securing your session...
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Verifying your credentials with WorkOS AuthKit
        </p>
      </div>
    </main>
  );
}
