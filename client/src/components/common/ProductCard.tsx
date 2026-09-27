import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import type { Product } from "../../types/Product";
import { isProductSaved, toggleSaveProduct } from "../../utils/savedStorage";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

/** Resolve any image URL to a full, displayable path */
const getImageUrl = (product: Product): string => {
  const primaryImg =
    product.product_images?.find((img) => img.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url;

  if (primaryImg && primaryImg.startsWith("http")) return primaryImg;
  if (product.image && product.image.startsWith("http")) return product.image;

  // Authentic fallback placeholder
  return "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400";
};

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
    : getImageUrl(product);

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
          <Link to={`/products/${product.id}`} className="flex items-center gap-1">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              {product.name}
            </h3>
            {isVerified && (
              <svg
                viewBox="0 0 22 22"
                aria-label="Verified"
                className="shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4"
              >
                <path
                  fill="#1d9bf0"
                  d="M20.396 11c.396-.868.172-1.897-.514-2.583a2.09 2.09 0 0 0-.673-.42l-.119-.045c.084-.18.138-.372.16-.57a2.09 2.09 0 0 0-.79-1.862 2.09 2.09 0 0 0-.645-.357l-.048-.015a2.09 2.09 0 0 0-.409-1.939 2.09 2.09 0 0 0-1.573-.726h-.064a2.09 2.09 0 0 0-1.897-.892 2.09 2.09 0 0 0-1.143.517l-.048.043a2.09 2.09 0 0 0-1.81-.004l-.05-.044a2.09 2.09 0 0 0-1.143-.519 2.09 2.09 0 0 0-1.894.892h-.067a2.09 2.09 0 0 0-1.572.727 2.09 2.09 0 0 0-.41 1.94l-.047.014a2.09 2.09 0 0 0-.646.357 2.09 2.09 0 0 0-.789 1.862c.022.198.076.39.16.57l-.119.045c-.262.1-.49.253-.673.42a2.09 2.09 0 0 0-.514 2.583l-.027.065a2.09 2.09 0 0 0 .016 2.025c.1.19.233.36.395.503l.09.074a2.09 2.09 0 0 0 .213 1.963c.17.272.4.497.673.66l.08.04a2.09 2.09 0 0 0 .788 1.78c.29.22.627.366.985.422l.074.01a2.09 2.09 0 0 0 1.3 1.42 2.09 2.09 0 0 0 1.067.088l.065-.012a2.09 2.09 0 0 0 1.723.782 2.09 2.09 0 0 0 1.166-.455l.05-.042a2.09 2.09 0 0 0 1.811.002l.049.043a2.09 2.09 0 0 0 1.165.454 2.09 2.09 0 0 0 1.724-.783l.064.012c.355.066.72.035 1.067-.088a2.09 2.09 0 0 0 1.3-1.42l.073-.01c.358-.056.696-.202.985-.422a2.09 2.09 0 0 0 .788-1.78l.08-.04c.273-.163.504-.388.674-.66a2.09 2.09 0 0 0 .212-1.963l.09-.074c.163-.143.296-.313.396-.503a2.09 2.09 0 0 0 .016-2.025l-.027-.065Z"
                />
                <path
                  fill="#fff"
                  d="M9.585 14.929l-3.28-3.28 1.168-1.168 2.112 2.112 5.36-5.36 1.168 1.168-6.528 6.528Z"
                />
              </svg>
            )}
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