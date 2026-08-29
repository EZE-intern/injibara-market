import { useState } from 'react';
import { Link } from 'react-router-dom';

export interface ProductImage {
  id: number;
  image_url: string;
  side_angle?: string;
  is_primary?: boolean;
  sort_order?: number;
}

export interface Product {
  id: number;
  name: string;
  price: number | string;
  description?: string;
  image?: string;
  category_id?: number;
  location?: string;
  brand?: string;
  rating?: number;
  reviews?: number;
  batch?: string;
  product_images?: ProductImage[];
  categories?: { id: number; name: string; slug: string };
}

interface ProductCardProps {
  product: Product;
}

/** Resolve any image URL to a full, displayable path */
const getImageUrl = (product: Product): string => {
  // 1. Try Cloudinary URLs from product_images
  const primaryImg = product.product_images?.find(img => img.is_primary)?.image_url
    || product.product_images?.[0]?.image_url;

  if (primaryImg && primaryImg.startsWith('http')) return primaryImg;

  // 2. Try the product.image field (also Cloudinary URL)
  if (product.image && product.image.startsWith('http')) return product.image;

  // 3. Fallback placeholder
  return 'https://via.placeholder.com/400x300?text=No+Image';
};

function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = imgError
    ? 'https://via.placeholder.com/400x300?text=No+Image'
    : getImageUrl(product);

  const price = typeof product.price === 'number'
    ? product.price.toLocaleString()
    : Number(product.price).toLocaleString();

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">

      {/* Product Image */}
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      </div>

      {/* Product Information */}
      <div className="p-5">

        {/* Category Badge */}
        {product.categories && (
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {product.categories.name}
          </p>
        )}

        {/* Product Name */}
        <h3 className="mt-1 text-lg font-semibold text-gray-900 line-clamp-1">
          {product.name}
        </h3>

        {/* Location (if available) */}
        {product.location && (
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <svg
              className="h-3.5 w-3.5 text-gray-400"
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
            {product.location}
          </p>
        )}

        {/* Price + View */}
        <div className="mt-4 flex items-center justify-between">

          <span className="text-xl font-bold text-brand-600">
            {price} ETB
          </span>

          <Link
            to={`/products/${product.id}`}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            View
          </Link>

        </div>

      </div>
    </article>
  );
}

export default ProductCard;