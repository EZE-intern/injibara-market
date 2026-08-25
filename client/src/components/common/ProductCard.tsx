import { Link } from 'react-router-dom';
import type { Product } from '../../types/Product';

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

  const displayImage =
    product.image ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30';

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      {/* Product Image */}
      <Link to={`/products/${product.id}`}>
        <div className="h-56 overflow-hidden bg-gray-100">
          <img
            src={displayImage}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
          />
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-5">

        {/* Category */}
        {product.category && (
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {product.category.name}
          </p>
        )}

        {/* Product Name */}
        <Link to={`/products/${product.id}`}>
          <h3 className="mt-1 text-lg font-semibold text-gray-900 hover:text-brand-600">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-500">
            {product.description}
          </p>
        )}

        {/* Stock */}
        <div className="mt-3">
          {product.stock !== undefined && product.stock !== null ? (
            product.stock > 0 ? (
              <span className="text-sm text-green-600">
                {product.stock} in stock
              </span>
            ) : (
              <span className="text-sm text-red-600">
                Out of stock
              </span>
            )
          ) : null}
        </div>

        {/* Price */}
        <div className="mt-4 flex items-center justify-between gap-3">

          <div>
            {discountPrice !== null && discountPrice < price ? (
              <>
                <p className="text-xl font-bold text-brand-600">
                  {discountPrice.toLocaleString()} ETB
                </p>

                <p className="text-sm text-gray-400 line-through">
                  {price.toLocaleString()} ETB
                </p>
              </>
            ) : (
              <p className="text-xl font-bold text-brand-600">
                {price.toLocaleString()} ETB
              </p>
            )}
          </div>

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