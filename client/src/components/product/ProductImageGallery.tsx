import { useState, useRef, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import type { ProductImage } from "../../types/Product";
import { optimizeImageUrl } from "../../utils/imageUrl";

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

/** ──────────────────────────────────────────────────────────────
 *  ProductImageGallery
 *  - Swipeable horizontal gallery (CSS scroll-snap)
 *  - Tap/click to open fullscreen lightbox
 *  - Pinch-to-zoom & double-tap zoom in lightbox
 *  - Dot indicators + thumbnails
 *  - Dark-mode compatible
 * ────────────────────────────────────────────────────────────── */
export default function ProductImageGallery({
  images,
  productName,
}: ImageGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // ── Track active slide via scroll ──
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const w = container.offsetWidth;
        if (w > 0) {
          setActiveIndex(Math.round(container.scrollLeft / w));
        }
        ticking = false;
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [images.length]);

  const scrollToSlide = useCallback((i: number) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ left: i * container.offsetWidth, behavior: "smooth" });
  }, []);

  // ── Open lightbox ──
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
        <div className="text-center text-gray-400">
          <svg
            className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm">No photo available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ════ Swipeable Gallery ════ */}
      <div className="relative">
        {/* Horizontal scroll container */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex overflow-x-auto snap-x snap-mandatory scroll-smooth aspect-square rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
        >
          {images.map((img, idx) => (
            <div
              key={img.id || idx}
              className="snap-start shrink-0 w-full h-full flex items-center justify-center cursor-zoom-in"
              onClick={() => openLightbox(idx)}
            >
              <img
                src={optimizeImageUrl(img.image_url, 800)}
                alt={`${productName} — photo ${idx + 1}`}
                className="h-full w-full object-contain p-2 select-none"
                draggable={false}
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Dot indicators (only when > 1 image) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSlide(i);
                }}
                aria-label={`View photo ${i + 1}`}
                className={`rounded-full transition-all duration-200 cursor-pointer ${
                  i === activeIndex
                    ? "w-5 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}

        {/* Image counter badge */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold rounded-full px-2 py-0.5">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Side angle label */}
        {images[activeIndex]?.side_angle && (
          <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold uppercase rounded-full px-2 py-0.5">
            {images[activeIndex].side_angle}
          </div>
        )}
      </div>

      {/* ════ Thumbnails (desktop, scroll if many) ════ */}
      {images.length > 1 && (
        <div className="mt-3 sm:mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => {
                setActiveIndex(idx);
                scrollToSlide(idx);
              }}
              className={`relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white dark:bg-slate-800 transition cursor-pointer ${
                activeIndex === idx
                  ? "border-red-600 shadow-md ring-2 ring-red-100 dark:ring-red-950"
                  : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
              }`}
            >
              <img
                src={optimizeImageUrl(img.image_url, 200)}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* ════ Fullscreen Lightbox with Zoom ════ */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          productName={productName}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  Lightbox — fullscreen overlay with pinch/scroll zoom & swipe
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface LightboxProps {
  images: ProductImage[];
  productName: string;
  initialIndex: number;
  onClose: () => void;
}

function Lightbox({ images, productName, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number; dist: number | null }>({
    x: 0,
    y: 0,
    dist: null,
  });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0 });
  const initialScaleRef = useRef(1);

  const MIN_SCALE = 1;
  const MAX_SCALE = 4;

  // Lock body scroll when lightbox is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") navigatePrev();
      if (e.key === "ArrowRight") navigateNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex]);

  const resetZoom = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const navigateNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((i) => i + 1);
      resetZoom();
    }
  };

  const navigatePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      resetZoom();
    }
  };

  const handleZoomIn = () => {
    setScale((s) => Math.min(s + 0.5, MAX_SCALE));
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.5, MIN_SCALE);
    setScale(newScale);
    if (newScale === MIN_SCALE) setTranslate({ x: 0, y: 0 });
  };

  // ── Double-tap to zoom ──
  const handleDoubleTap = (clientX: number, clientY: number) => {
    if (scale > MIN_SCALE) {
      resetZoom();
    } else {
      setScale(2.5);
      // Zoom toward the tap point
      const rect = imgRef.current?.getBoundingClientRect();
      if (rect) {
        const offsetX = clientX - rect.left - rect.width / 2;
        const offsetY = clientY - rect.top - rect.height / 2;
        setTranslate({ x: -offsetX, y: -offsetY });
      }
    }
  };

  // ── Touch handlers for pinch-zoom & swipe ──
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current.dist = Math.hypot(dx, dy);
      initialScaleRef.current = scale;
    } else if (e.touches.length === 1) {
      // Single touch — detect double tap or start drag/swipe
      const now = Date.now();
      const dt = now - lastTapRef.current;
      if (dt < 300 && dt > 0) {
        handleDoubleTap(e.touches[0].clientX, e.touches[0].clientY);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        dist: null,
      };
      dragRef.current = {
        dragging: scale > MIN_SCALE,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        lastX: translate.x,
        lastY: translate.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartRef.current.dist !== null) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / touchStartRef.current.dist;
      const newScale = Math.min(
        Math.max(initialScaleRef.current * ratio, MIN_SCALE),
        MAX_SCALE
      );
      setScale(newScale);
      if (newScale <= MIN_SCALE) setTranslate({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && dragRef.current.dragging) {
      // Pan while zoomed
      const dx = e.touches[0].clientX - dragRef.current.startX;
      const dy = e.touches[0].clientY - dragRef.current.startY;
      setTranslate({
        x: dragRef.current.lastX + dx,
        y: dragRef.current.lastY + dy,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // If not zoomed, detect swipe to navigate
    if (scale <= MIN_SCALE && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      if (Math.abs(dx) > 60) {
        if (dx < 0) navigateNext();
        else navigatePrev();
      }
    }
    touchStartRef.current.dist = null;
    dragRef.current.dragging = false;
  };

  // ── Mouse wheel zoom ──
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    const newScale = Math.min(Math.max(scale + delta, MIN_SCALE), MAX_SCALE);
    setScale(newScale);
    if (newScale <= MIN_SCALE) setTranslate({ x: 0, y: 0 });
  };

  // ── Mouse double-click to zoom ──
  const handleDoubleClick = (e: React.MouseEvent) => {
    handleDoubleTap(e.clientX, e.clientY);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 text-white/90">
        <span className="text-sm font-semibold">
          {currentIndex + 1} / {images.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= MIN_SCALE}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition disabled:opacity-30 cursor-pointer"
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-xs font-mono w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= MAX_SCALE}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition disabled:opacity-30 cursor-pointer"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden relative touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      >
        {/* Previous arrow */}
        {currentIndex > 0 && scale <= MIN_SCALE && (
          <button
            type="button"
            onClick={navigatePrev}
            className="absolute left-2 sm:left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Image with zoom transforms */}
        <div
          ref={imgRef}
          className="h-full w-full flex items-center justify-center transition-transform duration-150"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <img
            src={optimizeImageUrl(images[currentIndex].image_url, 1400)}
            alt={`${productName} — full size photo ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain pointer-events-none"
            draggable={false}
          />
        </div>

        {/* Next arrow */}
        {currentIndex < images.length - 1 && scale <= MIN_SCALE && (
          <button
            type="button"
            onClick={navigateNext}
            className="absolute right-2 sm:right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Bottom thumbnail strip */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                resetZoom();
              }}
              className={`shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                idx === currentIndex
                  ? "border-white shadow-lg"
                  : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <img
                src={optimizeImageUrl(img.image_url, 150)}
                alt={`Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
