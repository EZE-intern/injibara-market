import axiosClient from "./axiosClient";
import type { Product } from "../types/Product";

export interface ProductsResponse {
  success: boolean;
  count: number;
  data: Product[];
}

export interface SingleProductResponse {
  success: boolean;
  data: Product;
}

export interface GetProductsParams {
  category?: string;
  categoryId?: number;
}

/**
 * Fetch all products, optionally filtered by category
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
 * Fetch only the logged-in seller's products
 */
export const getMyProducts = async (): Promise<Product[]> => {
  const response = await axiosClient.get<ProductsResponse>("/products/my-products");
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
