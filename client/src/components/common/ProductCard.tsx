import { Link } from "react-router-dom";
import type { Product } from "../../types/Product";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const price = Number(product.price);

  const discountPrice =
    product.discount_price !== null &&
    product.discount_price !== undefined
      ? Number(product.discount_price)
      : null;

  const finalPrice =
    discountPrice !== null && discountPrice < price
      ? discountPrice
      : price;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block"
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-3">
        {product.category && (
          <p className="text-xs text-gray-500">
            {product.category.name}
          </p>
        )}

        <h3 className="mt-1 truncate text-sm font-medium text-gray-900">
          {product.name}
        </h3>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-base font-semibold text-gray-900">
            {finalPrice.toLocaleString()} ETB
          </span>

          {discountPrice !== null && discountPrice < price && (
            <span className="text-xs text-gray-400 line-through">
              {price.toLocaleString()} ETB
            </span>
          )}
        </div>

        {product.location && (
          <p className="mt-1 text-xs text-gray-400">
            {product.location}
          </p>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;