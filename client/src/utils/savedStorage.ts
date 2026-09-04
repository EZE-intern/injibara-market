import type { Product } from "../types/Product";

const SAVED_PRODUCTS_KEY = "injibara_market_saved_products";

export function getSavedProducts(): Product[] {
  try {
    const raw = localStorage.getItem(SAVED_PRODUCTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse saved products", e);
    return [];
  }
}

export function isProductSaved(productId: number | string | undefined): boolean {
  if (!productId) return false;
  const idNum = Number(productId);
  if (isNaN(idNum)) return false;
  const saved = getSavedProducts();
  return saved.some((p) => Number(p.id) === idNum);
}

export function toggleSaveProduct(product: Product): boolean {
  if (!product || !product.id) return false;
  const idNum = Number(product.id);

  const current = getSavedProducts();
  const exists = current.some((p) => Number(p.id) === idNum);

  let updated: Product[];
  let isNowSaved: boolean;

  if (exists) {
    updated = current.filter((p) => Number(p.id) !== idNum);
    isNowSaved = false;
  } else {
    updated = [product, ...current];
    isNowSaved = true;
  }

  try {
    localStorage.setItem(SAVED_PRODUCTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save products to storage", e);
  }

  window.dispatchEvent(new Event("saved_products_updated"));
  return isNowSaved;
}

export function removeSavedProduct(productId: number | string): void {
  const idNum = Number(productId);
  if (isNaN(idNum)) return;

  const current = getSavedProducts();
  const updated = current.filter((p) => Number(p.id) !== idNum);

  try {
    localStorage.setItem(SAVED_PRODUCTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("saved_products_updated"));
  } catch (e) {
    console.error("Failed to update saved products in storage", e);
  }
}
