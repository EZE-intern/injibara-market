import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById } from "../api/productApi";
import type { Product } from "../types/Product";

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        if (data) {
          const mainImg =
            data.product_images?.find((img) => img.is_primary)?.image_url ||
            data.product_images?.[0]?.image_url ||
            data.image ||
            null;
          setSelectedImage(mainImg);
        }
      } catch (err) {
        console.error("Error fetching product detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-gray-600">
            Loading product details...
          </p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-10 text-center shadow-sm">
          <div className="text-5xl">🔍</div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Product not found
          </h1>
          <p className="mt-2 text-gray-500">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  const categoryName = product.categories?.name || product.category || "General";
  const price =
    typeof product.price === "number"
      ? product.price.toLocaleString()
      : Number(product.price).toLocaleString();

  const allImages = product.product_images && product.product_images.length > 0
    ? product.product_images
    : product.image
      ? [{ id: 0, image_url: product.image, is_primary: true }]
      : [];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          to="/products"
          className="text-sm font-medium text-gray-500 transition hover:text-brand-600"
        >
          ← Back to Products
        </Link>
      </div>

      {/* Product Details */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="grid lg:grid-cols-2">
            {/* Media Gallery */}
            <div className="flex flex-col bg-gray-100 p-6 lg:p-8">
              {/* Main Active Image */}
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-white shadow-inner">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <p className="text-4xl">📷</p>
                    <p className="mt-2 text-sm">No photo available</p>
                  </div>
                )}
              </div>

              {/* Multi-angle Thumbnails */}
              {allImages.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setSelectedImage(img.image_url)}
                      className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white transition ${
                        selectedImage === img.image_url
                          ? "border-brand-600 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`${product.name} angle`}
                        className="h-full w-full object-cover"
                      />
                      {img.side_angle && (
                        <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-[10px] font-medium capitalize text-white">
                          {img.side_angle}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Information */}
            <div className="p-6 sm:p-10 lg:p-12">
              {/* Category */}
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  {categoryName}
                </span>
                {product.subCategory && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {product.subCategory}
                  </span>
                )}
              </div>

              {/* Brand if exists */}
              {product.brand && (
                <p className="mt-4 text-sm font-medium uppercase tracking-wide text-gray-500">
                  {product.brand}
                </p>
              )}

              {/* Product name */}
              <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mt-6">
                <span className="text-3xl font-bold text-brand-600">
                  {price} ETB
                </span>
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-gray-200" />

              {/* Description */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Description
                </h2>
                <p className="mt-3 leading-7 text-gray-600">
                  {product.description || "No description provided for this product."}
                </p>
              </div>

              {/* Product Information Table */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900">
                  Product Details
                </h2>

                <div className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200">
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-gray-500">Category</span>
                    <span className="text-sm font-medium text-gray-900">
                      {categoryName}
                    </span>
                  </div>

                  {product.location && (
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-sm text-gray-500">Location</span>
                      <span className="text-sm font-medium text-gray-900">
                        📍 {product.location}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-gray-500">Product ID</span>
                    <span className="text-sm font-medium text-gray-900">
                      #{product.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => alert(`Inquiring about ${product.name}. Direct messaging will be connected shortly!`)}
                  className="flex-1 rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700 shadow-sm"
                >
                  Contact Seller
                </button>

                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  ♡ Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProductDetailPage;