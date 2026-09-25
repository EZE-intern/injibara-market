import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  ArrowLeft,
  Share2,
  MapPin,
  Check,
  MessageSquare,
  ShieldCheck,
  Clock,
} from "lucide-react";
import CustomerNavbar from "../components/customer/CustomerNavbar";
import CustomerFooter from "../components/customer/CustomerFooter";
import { getProductById } from "../api/productApi";
import { getToken } from "../utils/authStorage";
import { isBrokeredProduct } from "../utils/brokeredCategories";
import { isProductSaved, toggleSaveProduct } from "../utils/savedStorage";
import type { Product } from "../types/Product";

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
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
      <div className="min-h-screen bg-white dark:bg-[#0b0f19] flex flex-col justify-between">
        <CustomerNavbar hideSearchOnMobile={true} />
        <main className="flex flex-1 items-center justify-center bg-gray-50 dark:bg-[#0b0f19] py-16">
          <div className="text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
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
      <div className="min-h-screen bg-white dark:bg-[#0b0f19] flex flex-col justify-between">
        <CustomerNavbar hideSearchOnMobile={true} />
        <main className="flex-1 bg-gray-50 dark:bg-[#0b0f19] px-4 py-16">
          <div className="mx-auto max-w-lg rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-10 text-center">
            <svg className="mx-auto h-12 w-12 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <h1 className="mt-4 text-xl font-bold text-red-800 dark:text-red-300">{error}</h1>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
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
                to="/"
                className="rounded-lg border border-gray-300 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 transition hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                Return to Homepage
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
      <div className="min-h-screen bg-white dark:bg-[#0b0f19] flex flex-col justify-between">
        <CustomerNavbar hideSearchOnMobile={true} />
        <main className="flex-1 bg-gray-50 dark:bg-[#0b0f19] px-4 py-16">
          <div className="mx-auto max-w-3xl rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Product not found
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              The product you are looking for does not exist or has been removed.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 shadow-sm"
            >
              Return to Homepage
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

  const isTier1 = isBrokeredProduct(product);
  const chatPath = `/messages/chat/${product.id}`;

  const price =
    typeof product.price === "number"
      ? product.price.toLocaleString()
      : Number(product.price).toLocaleString();

  const allImages =
    product.product_images && product.product_images.length > 0
      ? product.product_images
      : product.image
        ? [{ id: 0, image_url: product.image, is_primary: true }]
        : [];

  const handleContactAction = () => {
    if (!getToken()) {
      navigate("/login", {
        state: { from: { pathname: chatPath } },
      });
      return;
    }
    navigate(chatPath);
  };

  const handleToggleSave = () => {
    if (product) {
      const nextSaved = toggleSaveProduct(product);
      setIsSaved(nextSaved);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f19] flex flex-col justify-between">
      <CustomerNavbar hideSearchOnMobile={true} />

      {/* Mobile Top Sub-Header */}
      <div className="flex sm:hidden items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-gray-150 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-red-600 transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-red-600 transition cursor-pointer"
            aria-label="Share listing"
          >
            {copiedLink ? (
              <Check size={15} className="text-green-600" />
            ) : (
              <Share2 size={15} />
            )}
          </button>
          <button
            type="button"
            onClick={handleToggleSave}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-red-600 transition cursor-pointer"
            aria-label={isSaved ? "Saved" : "Save item"}
          >
            <Heart
              size={15}
              className={
                isSaved
                  ? "fill-red-600 text-red-600"
                  : "text-gray-600 dark:text-gray-300"
              }
            />
          </button>
        </div>
      </div>

      <main className="flex-1 bg-gray-50 dark:bg-[#0b0f19] pb-28 sm:pb-12">
        {/* Desktop Back Navigation */}
        <div className="hidden sm:block mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-sm font-medium text-gray-500 dark:text-gray-400 transition hover:text-red-600 dark:hover:text-red-400 inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={16} /> Return to Homepage
          </Link>
        </div>

        {/* Product Details Section */}
        <section className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-gray-150 dark:border-slate-800">
            <div className="grid lg:grid-cols-2">
              {/* Media Gallery */}
              <div className="flex flex-col bg-gray-50/80 dark:bg-slate-900/60 p-4 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-150 dark:border-slate-800">
                {/* Main Active Image */}
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-inner border border-gray-200 dark:border-slate-700">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={product.name}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="mt-2 text-sm">No photo available</p>
                    </div>
                  )}
                </div>

                {/* Multi-angle Thumbnails */}
                {allImages.length > 1 && (
                  <div className="mt-3 sm:mt-4 flex gap-2.5 overflow-x-auto pb-1">
                    {allImages.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        type="button"
                        onClick={() => setSelectedImage(img.image_url)}
                        className={`relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white dark:bg-slate-800 transition cursor-pointer ${
                          selectedImage === img.image_url
                            ? "border-red-600 shadow-md ring-2 ring-red-100 dark:ring-red-950"
                            : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <img
                          src={img.image_url}
                          alt={`${product.name} angle`}
                          className="h-full w-full object-cover"
                        />
                        {img.side_angle && (
                          <span className="absolute bottom-0 left-0 right-0 bg-black/75 text-center text-[9px] font-bold uppercase text-white py-0.5 truncate">
                            {img.side_angle}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="p-5 sm:p-8 lg:p-10 flex flex-col justify-between">
                <div>
                  {/* Category & Attributes Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-50 dark:bg-red-950/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                      {categoryName}
                    </span>
                    {product.subCategory && (
                      <span className="rounded-full bg-gray-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                        {product.subCategory}
                      </span>
                    )}
                    {product.location && (
                      <span className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                        <MapPin size={12} className="text-red-600" />
                        <span>{product.location}</span>
                      </span>
                    )}
                    {isTier1 && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                        <ShieldCheck size={12} className="text-amber-600" />
                        <span>Verified Brokered</span>
                      </span>
                    )}
                  </div>

                  {/* Brand if exists */}
                  {product.brand && (
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {product.brand}
                    </p>
                  )}

                  {/* Product name */}
                  <h1 className="mt-2 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl lg:text-3xl tracking-tight leading-snug">
                    {product.name}
                  </h1>

                  {/* Price */}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-500">
                      {price}{" "}
                      <span className="text-base sm:text-lg font-bold">
                        ETB
                      </span>
                    </span>
                    {product.discount_price && (
                      <span className="text-sm font-semibold text-gray-400 line-through">
                        {typeof product.discount_price === "number"
                          ? product.discount_price.toLocaleString()
                          : product.discount_price}{" "}
                        ETB
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="my-5 border-t border-gray-150 dark:border-slate-800" />

                  {/* Description */}
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Description
                    </h2>
                    <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-200 whitespace-pre-line font-normal">
                      {product.description ||
                        "No description provided for this product."}
                    </p>
                  </div>

                  {/* Product Details Table */}
                  <div className="mt-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Listing Summary
                    </h2>

                    <div className="mt-2 divide-y divide-gray-100 dark:divide-slate-800 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/60 text-xs">
                      <div className="flex justify-between px-4 py-2.5">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          Category
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {categoryName}
                        </span>
                      </div>

                      {product.location && (
                        <div className="flex justify-between px-4 py-2.5">
                          <span className="text-gray-500 dark:text-gray-400 font-medium">
                            Location
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {product.location}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between px-4 py-2.5">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          Listing Reference
                        </span>
                        <span className="font-mono text-gray-700 dark:text-gray-200">
                          #{product.id}
                        </span>
                      </div>

                      {product.created_at && (
                        <div className="flex justify-between px-4 py-2.5">
                          <span className="text-gray-500 dark:text-gray-400 font-medium">
                            Posted
                          </span>
                          <span className="text-gray-700 dark:text-gray-200">
                            {new Date(product.created_at).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop Actions (hidden on mobile, replaced by sticky bottom bar) */}
                <div className="hidden sm:flex mt-8 pt-6 border-t border-gray-150 dark:border-slate-800 flex-col gap-3">
                  {isTier1 && (
                    <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-2">
                      High-value listing: an Injibara Market admin will
                      mediate this inquiry. You will not message the seller
                      directly.
                    </p>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleContactAction}
                      className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 px-6 py-3 font-semibold text-white transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={18} />
                      <span>
                        {isTier1 ? "Contact Admin / Inquire" : "Contact Seller"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleSave}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-6 py-3 font-semibold transition cursor-pointer ${
                        isSaved
                          ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-100"
                          : "border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                      }`}
                      aria-label={isSaved ? "Remove from saved items" : "Save item"}
                    >
                      <Heart
                        size={18}
                        className={
                          isSaved
                            ? "fill-red-600 text-red-600"
                            : "text-gray-500"
                        }
                      />
                      <span>{isSaved ? "Saved" : "Save Item"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 px-4 py-3 sm:hidden shadow-2xl flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggleSave}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition cursor-pointer ${
            isSaved
              ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-600"
              : "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300"
          }`}
          aria-label={isSaved ? "Saved" : "Save item"}
        >
          <Heart
            size={20}
            className={
              isSaved
                ? "fill-red-600 text-red-600"
                : "text-gray-500 dark:text-gray-400"
            }
          />
        </button>

        <button
          type="button"
          onClick={handleContactAction}
          className="flex-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold text-sm shadow-md transition cursor-pointer"
        >
          <MessageSquare size={18} />
          <span>{isTier1 ? "Inquire with Admin" : "Contact Seller"}</span>
        </button>
      </div>

      <CustomerFooter />
    </div>
  );
}

export default ProductDetailPage;