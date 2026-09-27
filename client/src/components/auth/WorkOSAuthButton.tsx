import { useState } from "react";
import { getWorkOSUrl } from "../../api/authApi";
import toast from "react-hot-toast";

interface WorkOSAuthButtonProps {
  label?: string;
  redirectTo?: string;
}

export default function WorkOSAuthButton({
  label = "Continue with Google or WorkOS",
  redirectTo,
}: WorkOSAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);

      // Save post-login destination if provided
      if (redirectTo) {
        sessionStorage.setItem("injibara_auth_redirect", redirectTo);
      }

      // Compute redirect URI:
      // If developing on localhost, use localhost callback.
      // In production or on Vercel preview URLs (e.g. *-git-develop-*.vercel.app),
      // leave undefined so backend uses the registered WORKOS_REDIRECT_URI.
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      const redirectUri = isLocalhost
        ? `${window.location.origin}/auth/callback`
        : undefined;

      const authUrl = await getWorkOSUrl(redirectUri);
      if (authUrl) {
        window.location.href = authUrl;
      }
    } catch (err: unknown) {
      console.error("Failed to initiate WorkOS login:", err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(
        errorObj.response?.data?.message ||
          "Could not connect to authentication provider. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/60 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-xs transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="h-4 w-4 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
      ) : (
        <>
          {/* Multi-colored Google Icon */}
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
