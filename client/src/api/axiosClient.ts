import axios from "axios";
import { notify } from "../utils/notify";
import { clearAuth } from "../utils/authStorage";

const API_TIMEOUT_MS = 60000; // 60 seconds — allows cloud host cold-starts without premature timeout

let lastToastTime = 0;
let lastToastMsg = "";

function notifyThrottled(type: "warning" | "error", message: string, cooldown = 5000) {
  const now = Date.now();
  if (lastToastMsg === message && now - lastToastTime < cooldown) {
    return;
  }
  lastToastTime = now;
  lastToastMsg = message;
  if (type === "warning") {
    notify.warning(message);
  } else {
    notify.error(message);
  }
}

const axiosClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: API_TIMEOUT_MS,
});

// ── Request Interceptor ─────────────────────────────────────────────
// Automatically inject JWT authorization token if present
axiosClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("injibara_market_token") ||
    localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Error Interceptor ──────────────────────────────────────
// Catches all HTTP and network errors globally, shows user-facing
// toasts, and handles session expiry without each page duplicating
// error handling logic.
axiosClient.interceptors.response.use(
  // Success pass-through — no modification
  (response) => response,

  // Error handler with automatic cold-start retry
  async (error) => {
    const config = error.config;

    // Retry idempotent GET requests on cold start, timeout, or transient gateway errors
    const isGetRequest = !config?.method || config.method.toLowerCase() === "get";
    const isRetryable =
      !error.response ||
      error.code === "ECONNABORTED" ||
      error.code === "ERR_NETWORK" ||
      [502, 503, 504].includes(error.response?.status);

    if (config && isGetRequest && isRetryable) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < 2) {
        config.__retryCount += 1;
        const delay = config.__retryCount * 1500;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return axiosClient(config);
      }
    }

    // Network error or CORS issue (no response received at all)
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        notifyThrottled(
          "warning",
          "The request timed out. Please check your internet connection and try again."
        );
      } else {
        notifyThrottled(
          "error",
          "Unable to reach the server. Please check your internet connection."
        );
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const serverMessage =
      data?.message || data?.error || "";

    switch (status) {
      case 401:
        // Session expired or invalid token
        clearAuth();
        notify.error(
          serverMessage || "Your session has expired. Please sign in again."
        );
        // Redirect to login — use window.location so it works outside React context
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        break;

      case 403:
        notify.error(
          serverMessage || "You do not have permission to perform this action."
        );
        break;

      case 404:
        // Only show for non-GET requests (missing pages handled by React Router)
        if (error.config?.method !== "get") {
          notify.error(
            serverMessage || "The requested resource was not found."
          );
        }
        break;

      case 409:
        notify.warning(
          serverMessage || "This action conflicts with existing data."
        );
        break;

      case 422:
        notify.error(
          serverMessage || "Please check your input and try again."
        );
        break;

      case 429:
        notify.warning(
          "Too many requests. Please wait a moment before trying again."
        );
        break;

      case 500:
      case 502:
      case 503:
        notify.error(
          "The server is temporarily unavailable. Please try again in a few moments."
        );
        break;

      default:
        if (status >= 400) {
          notify.error(
            serverMessage || "Something went wrong. Please try again."
          );
        }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;