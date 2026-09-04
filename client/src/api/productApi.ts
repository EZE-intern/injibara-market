import axiosClient from "./axiosClient";
import type { Product } from "../types/Product";

export interface ProductsResponse {
  success: boolean;
  count: number;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasMore?: boolean;
  data: Product[];
}

export interface SingleProductResponse {
  success: boolean;
  data: Product;
}

export interface GetProductsParams {
  category?: string;
  categoryId?: number;
  search?: string;
  location?: string;
  page?: number;
  limit?: number;
}

/**
 * Fetch products (optionally filtered by category, search, and paginated)
 */
export const getProducts = async (
  params?: GetProductsParams
): Promise<Product[]> => {
  const response = await axiosClient.get<ProductsResponse>("/products", {
    params,
  });
  return response.data?.data || [];
};

/**
 * Fetch products with full pagination metadata (for Show More / pagination)
 */
export const getProductsWithPagination = async (
  params?: GetProductsParams
): Promise<ProductsResponse> => {
  const response = await axiosClient.get<ProductsResponse>("/products", {
    params,
  });
  return response.data;
};

/**
 * Fetch only the logged-in seller's products (with optional pagination)
 */
export const getMyProducts = async (
  params?: { page?: number; limit?: number }
): Promise<Product[]> => {
  const response = await axiosClient.get<ProductsResponse>("/products/my-products", {
    params,
  });
  return response.data?.data || [];
};

/**
 * Fetch single product by ID with all product images
 */
export const getProductById = async (
  id: number | string
): Promise<Product | null> => {
  try {
    const response = await axiosClient.get<SingleProductResponse>(
      `/products/${id}`
    );
    return response.data?.data || null;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
};

/**
 * Create a new product (Multipart Form Data with images)
 */
export const createProduct = async (
  formData: FormData,
  token?: string
): Promise<SingleProductResponse> => {
  const headers: Record<string, string> = {
    "Content-Type": "multipart/form-data",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await axiosClient.post<SingleProductResponse>(
    "/products",
    formData,
    { headers }
  );
  return response.data;
};

/**
 * Update an existing product
 */
export const updateProduct = async (
  id: number | string,
  formData: FormData,
  token?: string
): Promise<SingleProductResponse> => {
  const headers: Record<string, string> = {
    "Content-Type": "multipart/form-data",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await axiosClient.put<SingleProductResponse>(
    `/products/${id}`,
    formData,
    { headers }
  );
  return response.data;
};

/**
 * Soft delete a product
 */
export const deleteProduct = async (
  id: number | string,
  token?: string
): Promise<{ success: boolean; message: string }> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await axiosClient.delete<{
    success: boolean;
    message: string;
  }>(`/products/${id}`, { headers });
  return response.data;
};
