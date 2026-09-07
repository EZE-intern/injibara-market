import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/common/ErrorBoundary";
import AppRoutes from "./routes/AppRoutes";

function App() {
  useEffect(() => {
    // Send background wake-up ping to server to eliminate cold-start delay
    const apiBase =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    const healthUrl = apiBase.replace(/\/api\/?$/, "") + "/healthz";
    fetch(healthUrl, { method: "GET", mode: "cors" }).catch(() => {});
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