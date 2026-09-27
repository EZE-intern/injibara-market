import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LayoutGrid, PlusCircle, MapPin, ChevronRight } from "lucide-react";
import { isAuthenticated } from "../../utils/authStorage";
import { getProducts } from "../../api/productApi";
import type { Product } from "../../types/Product";
import { getProductDisplayImage } from "../../utils/imageUrl";

const SLIDE_INTERVAL = 10000; // 10 seconds auto-advance
const RESUME_DELAY = 5000; // Resume auto-advance 5s after last interaction
const MAX_PRODUCTS = 6;

export default function CustomerHeroCarousel() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const scrollRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Total slides = 1 welcome + N products
  const totalSlides = 1 + products.length;

  // ── Fetch featured products (immediately at t=0) ──────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getProducts({ limit: MAX_PRODUCTS });
        if (!cancelled) {
          setProducts(data.slice(0, MAX_PRODUCTS));
        }
      } catch (err) {
        console.error("Failed to load featured products for carousel:", err);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Scroll to a specific slide ───────────────────────────
  const scrollToSlide = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const slideWidth = container.offsetWidth;
    container.scrollTo({ left: index * slideWidth, behavior: "smooth" });
  }, []);

  // ── Track active slide via scroll position ───────────────
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const slideWidth = container.offsetWidth;
        if (slideWidth > 0) {
          const index = Math.round(container.scrollLeft / slideWidth);
          setActiveIndex(Math.min(index, totalSlides - 1));
        }
        ticking = false;
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [totalSlides]);

  // ── Auto-advance every 10s ───────────────────────────────
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;
      const slideWidth = container.offsetWidth;
      if (slideWidth === 0) return;
      const currentIndex = Math.round(container.scrollLeft / slideWidth);
      const nextIndex = (currentIndex + 1) % totalSlides;
      container.scrollTo({ left: nextIndex * slideWidth, behavior: "smooth" });
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  // ── Pause / resume helpers ───────────────────────────────
  const pauseAutoAdvance = useCallback(() => {
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), RESUME_DELAY);
  }, []);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), RESUME_DELAY);
  };

  // Cleanup resume timer on unmount
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  // ── Dot click handler ────────────────────────────────────
  const handleDotClick = (index: number) => {
    scrollToSlide(index);
    pauseAutoAdvance();
  };

  // ── Navigation handlers ──────────────────────────────────
  const handleSellClick = () => {
    navigate(authenticated ? "/seller/products/new" : "/login");
  };

  const handleBrowseClick = () => {
    navigate("/products");
  };

  return (
    <section className="px-4 py-2 sm:px-6 lg:px-8">
      <div
        className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl shadow-md"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* ════ Scrollable Slide Container ════ */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
          onTouchStart={pauseAutoAdvance}
          onTouchEnd={() => {
            if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
            resumeTimerRef.current = setTimeout(() => setIsPaused(false), RESUME_DELAY);
          }}
        >
          {/* ── Welcome Slide (Lake Zengena) ── */}
          <div className="snap-start shrink-0 w-full relative min-h-[220px] sm:min-h-[280px] lg:min-h-[320px] flex items-end">
            <img
              src="/images/lake_zengena.jpg"
              alt="Scenic Lake Zengena in Injibara, Awi Zone"
              className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
              loading="eager"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20"
              aria-hidden="true"
            />
            <div className="relative z-10 w-full p-5 sm:p-8 lg:p-10 flex flex-col items-start">
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl drop-shadow-sm">
                Find what you need nearby
              </h1>
              <p className="mt-1 text-sm font-semibold text-white/90 sm:text-base drop-shadow-sm">
                በእንጅባራ የሚፈልጉትን ያግኙ
              </p>
              <div className="mt-4 sm:mt-6 flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="hidden sm:inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-red-700 active:scale-95 transition cursor-pointer"
                >
                  <LayoutGrid size={16} strokeWidth={2.5} />
                  <span>Browse listings</span>
                </button>
                <button
                  type="button"
                  onClick={handleSellClick}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-red-600 shadow-md hover:bg-gray-100 active:scale-95 transition cursor-pointer"
                >
                  <PlusCircle size={16} strokeWidth={2.5} />
                  <span>Sell item</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Product Slides ── */}
          {products.map((product) => {
            const imageUrl = getProductDisplayImage(product, 800);
            const price = Number(product.price);
            const discountPrice =
              product.discount_price != null
                ? Number(product.discount_price)
                : null;
            const displayPrice =
              discountPrice !== null && discountPrice < price
                ? discountPrice
                : price;
            const locationText = product.location || "Injibara";

            return (
              <div
                key={product.id}
                className="snap-start shrink-0 w-full relative min-h-[220px] sm:min-h-[280px] lg:min-h-[320px] flex items-end"
              >
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"
                  aria-hidden="true"
                />
                <div className="relative z-10 w-full p-5 sm:p-8 lg:p-10 flex flex-col items-start">
                  <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl lg:text-3xl drop-shadow-sm line-clamp-1">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-lg font-bold text-red-400 sm:text-xl drop-shadow-sm">
                    ETB {displayPrice.toLocaleString()}
                    {discountPrice !== null && discountPrice < price && (
                      <span className="ml-2 text-sm text-white/60 line-through">
                        ETB {price.toLocaleString()}
                      </span>
                    )}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-white/70">
                    <MapPin size={12} className="shrink-0" />
                    <span>{locationText}</span>
                  </div>
                  <Link
                    to={`/products/${product.id}`}
                    className="mt-3 sm:mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-red-600 shadow-md hover:bg-gray-100 active:scale-95 transition"
                  >
                    <span>View Product</span>
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ════ Dot Navigation ════ */}
        {totalSlides > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleDotClick(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeIndex
                    ? "w-6 h-2 bg-red-500 shadow-sm"
                    : "w-2 h-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
