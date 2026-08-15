import { Link } from 'react-router-dom';

export interface Product {
  id: number;
  name: string;
  price: number;
  location: string;
  image: string;
}

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* Product image */}
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product information */}
      <div className="p-5">
        <h3 className="truncate text-base font-semibold text-gray-900">{product.name}</h3>

        <p className="mt-2 text-lg font-bold text-brand-600">
          {product.price.toLocaleString()} ETB
        </p>

        <p className="mt-1 text-sm text-gray-500">{product.location}</p>

        <Link
          to={`/products/${product.id}`}
          className="mt-4 block rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white"
        >
          View Product
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
