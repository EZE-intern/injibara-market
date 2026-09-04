import { describe, it, expect, beforeEach } from "vitest";
import {
  getSavedProducts,
  isProductSaved,
  toggleSaveProduct,
  removeSavedProduct,
} from "./savedStorage";
import type { Product } from "../types/Product";

describe("Saved Products Storage Utility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockProduct: Product = {
    id: 101,
    name: "Pure Injibara Teff 50kg",
    price: 4500,
    categories: {
      id: 2,
      name: "Agriculture & Teff",
      slug: "agriculture",
    },
    product_images: [
      {
        id: 1,
        image_url: "https://example.com/teff.jpg",
        is_primary: true,
      },
    ],
  };

  it("should initially return empty array", () => {
    expect(getSavedProducts()).toEqual([]);
    expect(isProductSaved(101)).toBe(false);
  });

  it("should save a product when toggled", () => {
    const isSaved = toggleSaveProduct(mockProduct);
    expect(isSaved).toBe(true);
    expect(isProductSaved(101)).toBe(true);
    expect(getSavedProducts()).toHaveLength(1);
    expect(getSavedProducts()[0].name).toBe("Pure Injibara Teff 50kg");
  });

  it("should unsave product when toggled a second time", () => {
    toggleSaveProduct(mockProduct);
    expect(isProductSaved(101)).toBe(true);

    const isSavedSecondTime = toggleSaveProduct(mockProduct);
    expect(isSavedSecondTime).toBe(false);
    expect(isProductSaved(101)).toBe(false);
    expect(getSavedProducts()).toHaveLength(0);
  });

  it("should remove product by ID", () => {
    toggleSaveProduct(mockProduct);
    expect(isProductSaved(101)).toBe(true);

    removeSavedProduct(101);
    expect(isProductSaved(101)).toBe(false);
    expect(getSavedProducts()).toEqual([]);
  });

  it("should handle corrupted JSON gracefully", () => {
    localStorage.setItem("injibara_market_saved_products", "corrupted-json{");
    expect(getSavedProducts()).toEqual([]);
    expect(isProductSaved(101)).toBe(false);
  });
});
