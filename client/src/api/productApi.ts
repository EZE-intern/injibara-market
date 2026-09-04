import axiosClient from "./axiosClient";
import type { Product } from "../types/Product";

export interface ProductsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  data: Product[];
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export const getProducts = async (
  params?: {
    category?: string;
    categoryId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }
): Promise<ProductsResponse> => {
  const response = await axiosClient.get<ProductsResponse>(
    "/products",
    {
      params,
    }
  );

  return response.data;
};

export const getProductById = async (
  id: number
): Promise<Product> => {
  const response = await axiosClient.get<ProductResponse>(
    `/products/${id}`
  );

  return response.data.data;
};