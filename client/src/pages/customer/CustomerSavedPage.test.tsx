import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CustomerSavedPage from "./CustomerSavedPage";
import { toggleSaveProduct } from "../../utils/savedStorage";
import type { Product } from "../../types/Product";

describe("CustomerSavedPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockProduct: Product = {
    id: 42,
    name: "Awi Zone Honey 1kg",
    price: 800,
    categories: {
      id: 5,
      name: "Local Honey",
      slug: "honey",
    },
  };

  it("renders empty state when no products are saved", () => {
    render(
      <MemoryRouter>
        <CustomerSavedPage />
      </MemoryRouter>
    );

    expect(screen.getByText("No saved products yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse products/i })).toBeInTheDocument();
  });

  it("renders saved products list and removes product on delete click", () => {
    toggleSaveProduct(mockProduct);

    render(
      <MemoryRouter>
        <CustomerSavedPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Awi Zone Honey 1kg")).toBeInTheDocument();
    expect(screen.getByText("Saved Products")).toBeInTheDocument();

    const removeBtn = screen.getByRole("button", { name: /remove from saved/i });
    fireEvent.click(removeBtn);

    expect(screen.getByText("No saved products yet")).toBeInTheDocument();
  });
});
