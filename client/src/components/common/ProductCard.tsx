import type { Product } from '../../types/Product';

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      {/* Product Image */}
      <div className="h-56 overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Product Information */}
      <div className="p-5">

        {/* Brand */}
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {product.brand}
        </p>

        {/* Product Name */}
        <h3 className="mt-1 text-lg font-semibold text-gray-900">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-yellow-500">
            ★
          </span>

          <span className="font-medium text-gray-800">
            {product.rating.toFixed(1)}
          </span>

          <span className="text-sm text-gray-500">
            ({product.reviews})
          </span>
        </div>

        {/* Batch */}
        <p className="mt-2 text-sm text-gray-500">
          Batch: {product.batch}
        </p>

        {/* Location */}
        <p className="mt-1 text-sm text-gray-500">
          📍 {product.location}
        </p>

        {/* Price */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-brand-600">
            {product.price.toLocaleString()} ETB
          </span>

          <button
            type="button"
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            View
          </button>
        </div>

      </div>
    </article>
  );
}

export default ProductCard;