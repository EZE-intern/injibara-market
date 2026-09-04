/**
 * Tier 1 High-Value Brokered Categories (Injibara Market Business Model):
 * Injibara Market acts as a broker for high-value capital assets to ensure trust,
 * legal compliance, and safe payment escrow:
 *   1. Property & Land (Real estate, farmland, commercial plots, residential houses)
 *   2. Vehicles & Transport (Cars, Bajaj, trucks, commercial vehicles, motorcycles)
 *   3. Heavy Machinery (Agricultural tractors, construction equipment, industrial machinery)
 *
 * For these categories, buyer inquiries are routed to the Admin brokerage desk
 * instead of connecting directly to the seller.
 */

export const BROKERED_CATEGORY_PATTERNS: RegExp[] = [
  // 1. Property & Land
  /\bproperty\b/i,
  /\bland\b/i,
  /\breal[\s_-]?estate\b/i,
  /\bfarmland\b/i,
  /\bplots?\b/i,
  /መሬት/,

  // 2. Vehicles & Transport
  /\bvehicles?\b/i,
  /\btransports?\b/i,
  /\bbajaj\b/i,
  /\bcars?\b/i,
  /\bmotorcycles?\b/i,
  /\btrucks?\b/i,
  /\bautomobiles?\b/i,
  /መኪና/,
  /ባጃጅ/,

  // 3. Heavy Machinery & Large Equipment
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

/**
 * Check if a category name or slug matches any of the Tier 1 Brokered categories.
 */
export function isBrokeredCategory(categoryName?: string | null, categorySlug?: string | null): boolean {
  const combined = `${categoryName || ''} ${categorySlug || ''}`.trim();
  if (!combined) return false;

  return BROKERED_CATEGORY_PATTERNS.some((pattern) => pattern.test(combined));
}
