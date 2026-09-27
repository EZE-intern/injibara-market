import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import type { Product } from "../../types/Product";
import { isProductSaved, toggleSaveProduct } from "../../utils/savedStorage";
import { getProductDisplayImage } from "../../utils/imageUrl";
import VerifiedBadge from "./VerifiedBadge";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

/** Format ISO timestamp to relative time string (e.g. '2h ago', '1d ago') */
function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "Recently";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "Recently";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) {
      return `${diffWeeks}w ago`;
    }
    return `${Math.floor(diffDays / 30)}mo ago`;
  } catch {
    return "Recently";
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [saved, setSaved] = useState(() => isProductSaved(product.id));

  // Sync saved state with external storage events
  useEffect(() => {
    const handleUpdate = () => {
      setSaved(isProductSaved(product.id));
    };
    window.addEventListener("saved_products_updated", handleUpdate);
    return () => window.removeEventListener("saved_products_updated", handleUpdate);
  }, [product.id]);

  const handleToggleHeart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowSaved = toggleSaveProduct(product);
    setSaved(isNowSaved);
    if (isNowSaved) {
      toast.success(`Saved "${product.name}" to favorites`, { id: `saved-${product.id}` });
    } else {
      toast.success(`Removed from favorites`, { id: `unsaved-${product.id}` });
    }
  };

  const imageUrl = imgError
    ? "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400"
    : getProductDisplayImage(product, 400);

  const price = Number(product.price);
  const discountPrice =
    product.discount_price !== null && product.discount_price !== undefined
      ? Number(product.discount_price)
      : null;

  const displayPrice = discountPrice !== null && discountPrice < price ? discountPrice : price;
  const locationText = product.location || "Injibara";
  const timeAgoText = formatTimeAgo(product.created_at);

  // Only show verified badge when admin has explicitly approved the product
  const isVerified = product.status === "approved";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      {/* Product Image Box */}
      <Link
        to={`/products/${product.id}`}
        className="aspect-square w-full overflow-hidden bg-gray-50 dark:bg-slate-800 block relative"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
          loading="lazy"
        />

        {/* Wishlist Heart Button (Top Right) */}
        <button
          type="button"
          onClick={handleToggleHeart}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 dark:bg-slate-800/95 shadow-sm text-red-600 transition-transform active:scale-90 hover:scale-110 cursor-pointer"
        >
          <Heart
            size={15}
            className={saved ? "fill-red-600 text-red-600" : "text-red-500"}
          />
        </button>
      </Link>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-3 justify-between">
        <div>
          {/* Title + Verified Badge */}
          <Link to={`/products/${product.id}`} className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              {product.name}
            </h3>
            {isVerified && <VerifiedBadge size="sm" />}
          </Link>

          {/* Price */}
          <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-red-600 dark:text-red-500 tracking-tight">
              ETB {displayPrice.toLocaleString()}
            </span>
            {discountPrice !== null && discountPrice < price && (
              <span className="text-[10px] text-gray-400 line-through">
                ETB {price.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Location & Time */}
        <div className="mt-2 pt-1.5 flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-400 truncate">
          <MapPin size={12} className="shrink-0 text-gray-400" />
          <span className="truncate">
            {locationText} • {timeAgoText}
          </span>
        </div>
      </div>
    </article>
  );
}