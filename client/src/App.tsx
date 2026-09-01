import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/common/ErrorBoundary";
import AppRoutes from "./routes/AppRoutes";

function App() {
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