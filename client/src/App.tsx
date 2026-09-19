import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/common/ErrorBoundary";
import AppRoutes from "./routes/AppRoutes";

// Shared warm-up promise: fires a healthz ping that touches the database,
// warming the Prisma/TiDB connection pool. Homepage data components
// (CustomerCategoryGrid, CustomerFeaturedListings) await this promise
// before fetching, so their queries hit a warm connection.
const apiBase =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const healthUrl = apiBase.replace(/\/api\/?$/, "") + "/healthz";

export const serverWarmup: Promise<void> = fetch(healthUrl, {
  method: "GET",
  mode: "cors",
})
  .then(() => {})
  .catch(() => {});

function App() {
  useEffect(() => {
    // The warm-up is already in flight (module-level), nothing else needed
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRoutes />
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
  );
}

export default App;