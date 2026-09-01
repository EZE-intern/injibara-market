import { Component, ReactNode } from "react";
import { Link } from "react-router-dom";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global React Error Boundary.
 * Catches unhandled rendering errors in the component tree and
 * displays a user-friendly fallback instead of a blank white screen.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught rendering error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg sm:p-10">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            {/* Title */}
            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              Something went wrong
            </h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              ችግር አጋጥሟል
            </p>

            {/* Description */}
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              We encountered an unexpected issue while loading this page.
              This has been logged and our team will investigate.
              Please try refreshing the page or return to the marketplace.
            </p>

            {/* Error detail (collapsible, for debugging) */}
            {this.state.error && (
              <details className="mt-4 rounded-lg border border-gray-200 bg-gray-50 text-left">
                <summary className="cursor-pointer px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700">
                  Technical Details
                </summary>
                <pre className="overflow-auto px-4 py-3 text-xs text-red-700">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 cursor-pointer"
              >
                Refresh Page
              </button>

              <Link
                to="/"
                onClick={this.handleReset}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
