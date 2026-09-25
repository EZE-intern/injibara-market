import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ScrollToTop from "./components/common/ScrollToTop";
import AppRoutes from "./routes/AppRoutes";
import { ThemeProvider } from "./context/ThemeContext";

// Shared warm-up promise: fires a healthz ping that touches the database,
// warming the Prisma/TiDB connection pool. Homepage data components
// (CustomerCategoryGrid, CustomerFeaturedListings) await this promise
// before fetching, so their queries hit a warm connection.
const getHealthUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "") + "/healthz";
  }
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:5000/healthz`;
  }
  return "http://localhost:5000/healthz";
};

export const serverWarmup: Promise<void> = (typeof window !== "undefined"
  ? fetch(getHealthUrl(), {
      method: "GET",
      mode: "cors",
    })
      .then(() => {})
      .catch(() => {})
  : Promise.resolve());

function App() {
  useEffect(() => {
    // The warm-up is already in flight (module-level), nothing else needed
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ErrorBoundary>
          <AppRoutes />
          <Analytics />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                maxWidth: 420,
                borderRadius: "0.75rem",
                padding: "12px 16px",
              },
            }}
          />
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;