import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import CustomerNavbar from "../components/customer/CustomerNavbar";
import CustomerFooter from "../components/customer/CustomerFooter";
import { getProductById } from "../api/productApi";
import { getToken } from "../utils/authStorage";
import { isProductSaved, toggleSaveProduct } from "../utils/savedStorage";
import type { Product } from "../types/Product";

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  const fetchDetail = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
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
      setError("Unable to load this product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    setIsSaved(isProductSaved(product.id));

    const handleSync = () => {
      setIsSaved(isProductSaved(product.id));
    };

    window.addEventListener("saved_products_updated", handleSync);
    return () => {
      window.removeEventListener("saved_products_updated", handleSync);
    };
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <CustomerNavbar />
        <main className="flex flex-1 items-center justify-center bg-gray-50 py-16">
          <div className="text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-gray-600">
              Loading product details...
            </p>
          </div>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <CustomerNavbar />
        <main className="flex-1 bg-gray-50 px-4 py-16">
          <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
            <svg className="mx-auto h-12 w-12 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <h1 className="mt-4 text-xl font-bold text-red-800">{error}</h1>
            <p className="mt-2 text-sm text-red-600">
              This could be caused by a slow internet connection or a temporary server issue.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={fetchDetail}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 shadow-sm cursor-pointer"
              >
                Try Again
              </button>
              <Link
                to="/products"
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Back to Marketplace
              </Link>
            </div>
          </div>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <CustomerNavbar />
        <main className="flex-1 bg-gray-50 px-4 py-16">
          <div className="mx-auto max-w-3xl rounded-2xl border border-gray-150 bg-white p-10 text-center shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Product not found
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              The product you are looking for does not exist or has been removed.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 shadow-sm"
            >
              Back to Marketplace
            </Link>
          </div>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  const categoryName =
    typeof product.category === "object" && product.category !== null
      ? product.category.name
      : product.categories?.name || (typeof product.category === "string" ? product.category : "General");

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
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <CustomerNavbar />

      <main className="flex-1 bg-gray-50">
        {/* Back Navigation */}
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <Link
            to="/products"
            className="text-sm font-medium text-gray-500 transition hover:text-brand-600 flex items-center gap-1"
          >
            <span>&larr;</span> Back to Marketplace
          </Link>
        </div>

        {/* Product Details */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-150">
            <div className="grid lg:grid-cols-2">
              {/* Media Gallery */}
              <div className="flex flex-col bg-gray-50 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-150">
                {/* Main Active Image */}
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-white shadow-inner border border-gray-200">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
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
                        className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white transition cursor-pointer ${
                          selectedImage === img.image_url
                            ? "border-brand-600 shadow-md ring-2 ring-brand-100"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={img.image_url}
                          alt={`${product.name} angle`}
                          className="h-full w-full object-cover"
                        />
                        {img.side_angle && (
                          <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-center text-[9px] font-bold uppercase text-white py-0.5">
                            {img.side_angle}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
                <div>
                  {/* Category */}
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
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
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {product.brand}
                    </p>
                  )}

                  {/* Product name */}
                  <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl tracking-tight">
                    {product.name}
                  </h1>

                  {/* Price */}
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {price} <span className="text-brand-600 text-xl font-bold">ETB</span>
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="my-6 border-t border-gray-150" />

                  {/* Description */}
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                      Description
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                      {product.description || "No description provided for this product."}
                    </p>
                  </div>

                  {/* Product Details Table */}
                  <div className="mt-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                      Listing Summary
                    </h2>

                    <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-150 bg-gray-50/50 text-xs">
                      <div className="flex justify-between px-4 py-2.5">
                        <span className="text-gray-500">Category</span>
                        <span className="font-semibold text-gray-900">{categoryName}</span>
                      </div>

                      {product.location && (
                        <div className="flex justify-between px-4 py-2.5">
                          <span className="text-gray-500">Location</span>
                          <span className="font-semibold text-gray-900">{product.location}</span>
                        </div>
                      )}

                      <div className="flex justify-between px-4 py-2.5">
                        <span className="text-gray-500">Listing Reference</span>
                        <span className="font-mono text-gray-700">#{product.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-gray-150 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      if (!getToken()) {
                        navigate("/login", { state: { from: `/messages/chat/${product.id}` } });
                        return;
                      }
                      navigate(`/messages/chat/${product.id}`);
                    }}
                    className="flex-1 rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700 shadow-sm cursor-pointer"
                  >
                    Contact Seller
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (product) {
                        const nextSaved = toggleSaveProduct(product);
                        setIsSaved(nextSaved);
                      }
                    }}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-6 py-3 font-semibold transition cursor-pointer ${
                      isSaved
                        ? "border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-label={isSaved ? "Remove from saved items" : "Save item"}
                  >
                    <Heart
                      size={18}
                      className={isSaved ? "fill-brand-600 text-brand-600" : "text-gray-500"}
                    />
                    <span>{isSaved ? "Saved" : "Save Item"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
}

export default ProductDetailPage;