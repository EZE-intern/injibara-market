import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductById } from '../api/productApi';
import type { Product } from '../types/Product';

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Invalid product ID.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await getProductById(
          Number(id),
        );

        setProduct(data);
      } catch (err) {
        console.error(
          'Failed to load product:',
          err,
        );

        setError(
          'Unable to load this product.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  /*
   * Loading
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />

          <p className="mt-4 text-gray-600">
            Loading product...
          </p>

        </div>
      </main>
    );
  }

  /*
   * Error
   */
  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">

          <div className="rounded-xl bg-white p-10 shadow-sm">

            <div className="text-5xl">
              🔍
            </div>

            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Product not found
            </h1>

            <p className="mt-2 text-gray-500">
              {error ||
                'This product may have been removed or is no longer available.'}
            </p>

            <Link
              to="/products"
              className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
            >
              Back to Products
            </Link>

          </div>

        </div>
      </main>
    );
  }

  const price = Number(product.price);

  const discountPrice =
    product.discount_price !== null &&
    product.discount_price !== undefined
      ? Number(product.discount_price)
      : null;

  const displayPrice =
    discountPrice !== null &&
    discountPrice < price
      ? discountPrice
      : price;

  const image =
    product.image ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30';

  const isInStock =
    product.stock === undefined ||
    product.stock === null ||
    product.stock > 0;

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-2 text-sm text-gray-500">

            <Link
              to="/"
              className="hover:text-brand-600"
            >
              Home
            </Link>

            <span>/</span>

            <Link
              to="/products"
              className="hover:text-brand-600"
            >
              Products
            </Link>

            <span>/</span>

            <span className="text-gray-900">
              {product.name}
            </span>

          </div>

        </div>
      </section>


      {/* Product */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="grid gap-10 rounded-2xl bg-white p-6 shadow-sm lg:grid-cols-2 lg:p-10">

          {/* Image */}
          <div className="overflow-hidden rounded-xl bg-gray-100">

            <img
              src={image}
              alt={product.name}
              className="h-full max-h-[600px] w-full object-cover"
            />

          </div>


          {/* Information */}
          <div className="flex flex-col">

            {/* Category */}
            {product.category && (
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                {product.category.name}
              </p>
            )}

            {/* Name */}
            <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              {product.name}
            </h1>


            {/* Price */}
            <div className="mt-6">

              <p className="text-3xl font-bold text-brand-600">
                {displayPrice.toLocaleString()} ETB
              </p>

              {discountPrice !== null &&
                discountPrice < price && (
                  <p className="mt-1 text-lg text-gray-400 line-through">
                    {price.toLocaleString()} ETB
                  </p>
                )}

            </div>


            {/* Stock */}
            <div className="mt-5">

              {isInStock ? (
                <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                  In Stock
                  {product.stock !== undefined &&
                    product.stock !== null &&
                    ` — ${product.stock} available`}
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
                  Out of Stock
                </span>
              )}

            </div>


            {/* Description */}
            <div className="mt-8 border-t pt-6">

              <h2 className="text-lg font-semibold text-gray-900">
                Description
              </h2>

              <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
                {product.description ||
                  'No description provided by the seller.'}
              </p>

            </div>


            {/* Product information */}
            <div className="mt-8 border-t pt-6">

              <h2 className="text-lg font-semibold text-gray-900">
                Product Information
              </h2>

              <dl className="mt-4 space-y-3">

                {product.category && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">
                      Category
                    </dt>

                    <dd className="font-medium text-gray-900">
                      {product.category.name}
                    </dd>
                  </div>
                )}

                {product.status && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">
                      Status
                    </dt>

                    <dd className="font-medium capitalize text-gray-900">
                      {product.status}
                    </dd>
                  </div>
                )}

                {product.created_at && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">
                      Listed
                    </dt>

                    <dd className="font-medium text-gray-900">
                      {new Date(
                        product.created_at,
                      ).toLocaleDateString()}
                    </dd>
                  </div>
                )}

              </dl>

            </div>


            {/* Actions */}
            <div className="mt-auto pt-8">

              <button
                type="button"
                disabled={!isInStock}
                className="w-full rounded-lg bg-brand-600 px-6 py-4 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isInStock
                  ? 'Add to Cart'
                  : 'Out of Stock'}
              </button>

              <Link
                to="/products"
                className="mt-3 block w-full rounded-lg border border-gray-300 px-6 py-4 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Continue Shopping
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default ProductDetailPage;