import { useState } from "react";
import { Heart, Pin } from "lucide-react";
import { Link } from "react-router-dom";

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  side_angle: "front" | "back" | "top" | "bottom" | "left" | "right" | string;
  is_primary?: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: string | number;
  description?: string;
  category_id?: number;
  location?: string;
  created_at?: string;
  isFeatured?: boolean;
  product_images: ProductImage[];
}

interface ProductCardProps {
  product: Product;
  showThumbnails?: boolean; // Featured Listings ላይ false እናደርጋለን
}

const API_URL = "http://localhost:5000";

// ትክክለኛ Image URL መፍጠር
const getImageUrl = (imageUrl?: string | null): string => {
  if (!imageUrl) return `${API_URL}/uploads/placeholder.jpg`;

  const cleaned = String(imageUrl).trim();

  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }

  if (cleaned.startsWith("/uploads/")) {
    return `${API_URL}${cleaned}`;
  }

  if (cleaned.startsWith("uploads/")) {
    return `${API_URL}/${cleaned}`;
  }

  // filename ብቻ ከሆነ
  return `${API_URL}/uploads/${cleaned.replace(/^\/+/, "")}`;
};

function ProductCard({ product, showThumbnails = true }: ProductCardProps) {
  // front / primary image ምረጥ
  const primaryImg =
    product.product_images?.find(
      (img) => img.is_primary || img.side_angle === "front"
    )?.image_url || product.product_images?.[0]?.image_url;

  const [activeImage, setActiveImage] = useState<string | undefined>(primaryImg);

  return (
    <div className="group relative rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      
      {/* Main Image */}
      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
        <img
          src={getImageUrl(activeImage)}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = `${API_URL}/uploads/placeholder.jpg`;
          }}
        />

        {product.isFeatured && (
          <span className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-sm">
            Featured
          </span>
        )}

        {/* Favorite Button */}
        <button
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-600 backdrop-blur-sm shadow-sm transition-colors"
          aria-label="Save product"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Side Angles Thumbnails - Featured Listings ላይ አይታይም */}
      {showThumbnails &&
        product.product_images &&
        product.product_images.length > 1 && (
          <div className="flex gap-1.5 p-2 bg-gray-50 border-b border-gray-100 overflow-x-auto z-10">
            {product.product_images.map((img) => {
              const isSelected = activeImage === img.image_url;
              return (
                <button
                  key={img.id}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveImage(img.image_url);
                  }}
                  className={`relative flex-shrink-0 w-10 h-10 rounded-md overflow-hidden border-2 transition-all ${
                    isSelected
                      ? "border-red-600 scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={getImageUrl(img.image_url)}
                    alt={img.side_angle}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center capitalize leading-tight">
                    {img.side_angle}
                  </span>
                </button>
              );
            })}
          </div>
        )}

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 text-base mb-1 truncate group-hover:text-red-700 transition-colors">
          {product.name}
        </h3>

        <p className="text-red-700 font-extrabold text-lg mb-3">
          {typeof product.price === "number"
            ? `${product.price.toLocaleString()} ETB`
            : product.price}
        </p>

        <div className="mt-auto flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
          <div className="flex items-center">
            <Pin className="w-3.5 h-3.5 mr-1 text-red-600 shrink-0" />
            <span>{product.location || "Injibara"}</span>
          </div>
        </div>

        {/* Whole Card Link */}
        <Link to={`/products/${product.id}`} className="absolute inset-0 z-0">
          <span className="sr-only">View Details</span>
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;
