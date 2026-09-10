/**
 * Tier 1 high-value brokered categories — keep in sync with
 * server/src/utils/brokeredCategories.ts
 */
const BROKERED_CATEGORY_PATTERNS: RegExp[] = [
  /\bproperty\b/i,
  /\bland\b/i,
  /\breal[\s_-]?estate\b/i,
  /\bfarmland\b/i,
  /\bplots?\b/i,
  /መሬት/,
  /\bvehicles?\b/i,
  /\btransports?\b/i,
  /\bbajaj\b/i,
  /\bcars?\b/i,
  /\bmotorcycles?\b/i,
  /\btrucks?\b/i,
  /\bautomobiles?\b/i,
  /መኪና/,
  /ባጃጅ/,
  /\bheavy[\s_-]?machinery\b/i,
  /\blarge[\s_-]?machinery\b/i,
  /\bmachinery?\b/i,
  /\bmachines?\b/i,
  /\bconstruction[\s_-]?materials?\b/i,
  /\bconstruction[\s_-]?machinery\b/i,
  /\bconstruction[\s_-]?equipments?\b/i,
  /\bindustrial[\s_-]?equipments?\b/i,
  /\btractors?\b/i,
  /\bexcavators?\b/i,
  /\bbulldozers?\b/i,
  /ማሽነሪ/,
];

export function isBrokeredCategory(
  categoryName?: string | null,
  categorySlug?: string | null
): boolean {
  const combined = `${categoryName || ""} ${categorySlug || ""}`.trim();
  if (!combined) return false;
  return BROKERED_CATEGORY_PATTERNS.some((pattern) => pattern.test(combined));
}

/** Resolve category name/slug from a product-like object. */
export function getProductCategoryFields(product: {
  categories?: { name?: string; slug?: string } | null;
  category?: { name?: string; slug?: string } | string | null;
}): { name?: string; slug?: string } {
  if (typeof product.category === "object" && product.category !== null) {
    return {
      name: product.category.name,
      slug: product.category.slug,
    };
  }
  if (product.categories) {
    return {
      name: product.categories.name,
      slug: product.categories.slug,
    };
  }
  if (typeof product.category === "string") {
    return { name: product.category };
  }
  return {};
}

export function isBrokeredProduct(product: {
  categories?: { name?: string; slug?: string } | null;
  category?: { name?: string; slug?: string } | string | null;
}): boolean {
  const { name, slug } = getProductCategoryFields(product);
  return isBrokeredCategory(name, slug);
}
