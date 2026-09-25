import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Automatically scrolls the browser window to top (0, 0)
 * on every route pathname change, preventing scroll bleed
 * and unexpected jumps down to the footer.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
