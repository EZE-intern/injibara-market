import toast from "react-hot-toast";

/**
 * Centralized toast notification helpers.
 * Use these instead of raw toast() calls so styling and behavior
 * stay consistent across the entire application.
 */
export const notify = {
  /** Green success toast for completed actions */
  success(message: string) {
    toast.success(message, {
      duration: 3000,
      position: "top-right",
      style: {
        background: "#f0fdf4",
        color: "#166534",
        border: "1px solid #bbf7d0",
        fontSize: "0.875rem",
        fontWeight: 500,
      },
    });
  },

  /** Red error toast for failed actions */
  error(message: string) {
    toast.error(message, {
      duration: 5000,
      position: "top-right",
      style: {
        background: "#fef2f2",
        color: "#991b1b",
        border: "1px solid #fecaca",
        fontSize: "0.875rem",
        fontWeight: 500,
      },
    });
  },

  /** Amber warning toast for degraded state or partial failures */
  warning(message: string) {
    toast(message, {
      duration: 4000,
      position: "top-right",
      icon: "\u26A0",
      style: {
        background: "#fffbeb",
        color: "#92400e",
        border: "1px solid #fde68a",
        fontSize: "0.875rem",
        fontWeight: 500,
      },
    });
  },

  /** Blue info toast for neutral confirmations */
  info(message: string) {
    toast(message, {
      duration: 3000,
      position: "top-right",
      icon: "\u2139\uFE0F",
      style: {
        background: "#eff6ff",
        color: "#1e40af",
        border: "1px solid #bfdbfe",
        fontSize: "0.875rem",
        fontWeight: 500,
      },
    });
  },

  /** Promise-based toast that tracks loading → success / error */
  promise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) {
    return toast.promise(promise, messages, {
      position: "top-right",
      style: {
        fontSize: "0.875rem",
        fontWeight: 500,
      },
    });
  },
};
