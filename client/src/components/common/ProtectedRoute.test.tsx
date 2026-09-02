import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { saveAuth, clearAuth } from "../../utils/authStorage";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    clearAuth();
  });

  it("redirects unauthenticated users to /login and does not render protected content", () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Private Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Private Content")).not.toBeInTheDocument();
  });

  it("renders protected content when user is authenticated (wrapper pattern)", () => {
    saveAuth("dummy_token", {
      id: 1,
      full_name: "Abebe Kebede",
      email: "abebe@example.com",
      role: "customer",
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Private Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Private Content")).toBeInTheDocument();
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });

  it("renders child routes via <Outlet /> when used as a layout route", () => {
    saveAuth("dummy_token", {
      id: 2,
      full_name: "Chala Gemechu",
      email: "chala@example.com",
      role: "seller",
    });

    render(
      <MemoryRouter initialEntries={["/seller/dashboard"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/seller/dashboard"
              element={<div>Seller Dashboard Content</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Seller Dashboard Content")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to /login when using layout route pattern", () => {
    render(
      <MemoryRouter initialEntries={["/customer/orders"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/customer/orders"
              element={<div>Customer Orders Content</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Customer Orders Content")).not.toBeInTheDocument();
  });

  it("redirects to home if user does not match allowedRoles", () => {
    saveAuth("dummy_token", {
      id: 3,
      full_name: "Customer User",
      email: "cust@example.com",
      role: "customer",
    });

    render(
      <MemoryRouter initialEntries={["/admin-only"]}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route
            path="/admin-only"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div>Admin Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Home Page")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });
});
