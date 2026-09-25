import { useState, useEffect } from "react";

interface ScrollDirectionOptions {
  threshold?: number;
  initialVisible?: boolean;
}

/**
 * Custom hook to dynamically show/hide navigation elements on scroll.
 * Returns `isVisible = false` when scrolling down past the threshold,
 * and `isVisible = true` when scrolling up or near the top of the page.
 */
export function useScrollDirection({
  threshold = 10,
  initialVisible = true,
}: ScrollDirectionOptions = {}) {
  const [isVisible, setIsVisible] = useState(initialVisible);

  useEffect(() => {
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
    let ticking = false;

    const updateScrollDirection = () => {
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;

      // Always show when near the very top of the page
      if (currentScrollY < 60) {
        setIsVisible(true);
        lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
        ticking = false;
        return;
      }

      const diff = currentScrollY - lastScrollY;

      // Scrolling down past threshold -> hide
      if (diff > threshold) {
        setIsVisible(false);
      }
      // Scrolling up past threshold -> show
      else if (diff < -threshold) {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return isVisible;
}

export default useScrollDirection;
