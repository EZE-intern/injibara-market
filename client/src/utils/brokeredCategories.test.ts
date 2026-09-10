import { describe, expect, it } from "vitest";
import {
  isBrokeredCategory,
  isBrokeredProduct,
} from "./brokeredCategories";

describe("isBrokeredCategory", () => {
  it("detects Tier 1 land/property listings", () => {
    expect(isBrokeredCategory("Property & Land", "property-land")).toBe(true);
    expect(isBrokeredCategory("መሬት", null)).toBe(true);
  });

  it("detects Tier 1 vehicles", () => {
    expect(isBrokeredCategory("Vehicles & Transport", "vehicles")).toBe(true);
    expect(isBrokeredCategory("Bajaj", "bajaj")).toBe(true);
  });

  it("treats general marketplace as Tier 2", () => {
    expect(isBrokeredCategory("Electronics", "electronics")).toBe(false);
    expect(isBrokeredCategory("Fashion", "fashion")).toBe(false);
    expect(isBrokeredCategory(null, null)).toBe(false);
  });
});

describe("isBrokeredProduct", () => {
  it("reads nested category relations", () => {
    expect(
      isBrokeredProduct({
        categories: { name: "Vehicles", slug: "vehicles" },
      })
    ).toBe(true);
    expect(
      isBrokeredProduct({
        category: { name: "Electronics", slug: "electronics" },
      })
    ).toBe(false);
  });
});
