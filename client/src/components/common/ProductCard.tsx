import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../types/Product";

interface ProductCardProps {
  product: Product;
}

/** Resolve any image URL to a full, displayable path */
const getImageUrl = (product: Product): string => {
  // 1. Try Cloudinary URLs from product_images
  const primaryImg =
    product.product_images?.find((img) => img.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url;

  if (primaryImg && primaryImg.startsWith("http")) return primaryImg;

  // 2. Try the product.image field (also Cloudinary URL)
  if (product.image && product.image.startsWith("http")) return product.image;

  // 3. Fallback placeholder
  return "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400";
};

function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = imgError
    ? "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400"
    : getImageUrl(product);

  const price = Number(product.price);
  const discountPrice =
    product.discount_price !== null && product.discount_price !== undefined
      ? Number(product.discount_price)
      : null;

  const categoryName =
    typeof product.category === "object" && product.category !== null
      ? product.category.name
      : product.categories?.name || (typeof product.category === "string" ? product.category : null);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="aspect-square overflow-hidden bg-gray-100 block relative">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        {discountPrice !== null && discountPrice < price && (
          <span className="absolute top-2 left-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            Sale
          </span>
        )}
      </Link>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-4 justify-between">
        <div>
          {/* Category Badge */}
          {categoryName && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 truncate">
              {categoryName}
            </p>
          )}

          {/* Product Name */}
          <Link to={`/products/${product.id}`}>
            <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-1 hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Location */}
          {product.location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
              <svg
                className="h-3.5 w-3.5 text-gray-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">{product.location}</span>
            </p>
          )}
        </div>

        {/* Price + View Button */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-gray-900">
              {discountPrice !== null && discountPrice < price
                ? discountPrice.toLocaleString()
                : price.toLocaleString()}{" "}
              <span className="text-xs text-brand-600 font-semibold">ETB</span>
            </span>
            {discountPrice !== null && discountPrice < price && (
              <span className="block text-[11px] text-gray-400 line-through">
                {price.toLocaleString()} ETB
              </span>
            )}
          </div>

          <Link
            to={`/products/${product.id}`}
            className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-600 hover:text-white"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;