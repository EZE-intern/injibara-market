import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { saveAuth, clearAuth } from "../utils/authStorage";

// Mock API calls in pages to prevent unhandled network requests
vi.mock("../api/productApi", () => ({
  getMyProducts: vi.fn().mockResolvedValue([]),
  getProducts: vi.fn().mockResolvedValue([]),
  getProductById: vi.fn().mockResolvedValue(null),
}));

vi.mock("../api/orderApi", () => ({
  getMyOrders: vi.fn().mockResolvedValue([]),
}));

vi.mock("../api/categoryApi", () => ({
  getCategories: vi.fn().mockResolvedValue([]),
}));

describe("AppRoutes Route Protection", () => {
  beforeEach(() => {
    clearAuth();
    vi.clearAllMocks();
  });

  describe("Unauthenticated Access to Protected Routes", () => {
    const sensitiveRoutes = [
      "/seller",
      "/seller/dashboard",
      "/seller/products",
      "/seller/products/new",
      "/seller/products/1/edit",
      "/seller/add-product",
      "/myproducts",
      "/customer",
      "/customer/cart",
      "/customer/orders",
      "/customer/saved",
      "/customer/profile",
      "/customer/become-seller",
      "/become-seller",
    ];

    sensitiveRoutes.forEach((route) => {
      it(`redirects unauthenticated user accessing ${route} to /login`, () => {
        render(
          <MemoryRouter initialEntries={[route]}>
            <AppRoutes />
          </MemoryRouter>
        );

        // Should render the Login page
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
    });
  });

  describe("Public Routes Access", () => {
    it("allows unauthenticated access to home page /", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByRole("heading", { name: /Your marketplace/i, level: 1 })).toBeInTheDocument();
    });

    it("allows unauthenticated access to /login", () => {
      render(
        <MemoryRouter initialEntries={["/login"]}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("allows unauthenticated access to /register", () => {
      render(
        <MemoryRouter initialEntries={["/register"]}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
    });
  });

  describe("Authenticated Access to Protected Routes", () => {
    beforeEach(() => {
      saveAuth("mock_jwt_token", {
        id: 10,
        full_name: "Abebe Seller",
        email: "abebe@seller.com",
        role: "seller",
      });
    });

    it("allows authenticated user to view /seller", () => {
      render(
        <MemoryRouter initialEntries={["/seller"]}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByText(/Welcome back, Abebe Seller!/i)).toBeInTheDocument();
    });

    it("allows authenticated user to view /customer/profile", () => {
      render(
        <MemoryRouter initialEntries={["/customer/profile"]}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByText("My Profile")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Abebe Seller" })).toBeInTheDocument();
    });

    it("allows authenticated user to view /customer/orders", () => {
      render(
        <MemoryRouter initialEntries={["/customer/orders"]}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(screen.getByRole("heading", { name: "My Orders" })).toBeInTheDocument();
    });
  });
});
