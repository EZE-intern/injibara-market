import type { Product } from "../types/Product";

/**
 * Optimizes an image URL for responsive delivery:
 * - If Cloudinary: injects `f_auto,q_auto,w_{width}` for modern AVIF/WebP compression
 * - If Unsplash: preserves/applies `auto=format&fit=crop&q=80&w={width}`
 * - If local or other host: returns unchanged
 */
export function optimizeImageUrl(url: string, width = 600): string {
  if (!url) return url;

  // Cloudinary optimization
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    // Only inject if not already transformed
    if (!url.includes("f_auto") && !url.includes("q_auto")) {
      return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
    }
  }

  // Unsplash optimization
  if (url.includes("images.unsplash.com")) {
    if (!url.includes("auto=format")) {
      const sep = url.includes("?") ? "&" : "?";
      return `${url}${sep}auto=format&fit=crop&q=80&w=${width}`;
    }
  }

  return url;
}

/**
 * Extracts and optimizes the primary display image for a product
 */
export function getProductDisplayImage(product: Product, width = 600): string {
  const primaryImg =
    product.product_images?.find((img) => img.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url;

  const rawUrl =
    (primaryImg && primaryImg.startsWith("http") ? primaryImg : null) ||
    (product.image && product.image.startsWith("http") ? product.image : null) ||
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400";

  return optimizeImageUrl(rawUrl, width);
}
