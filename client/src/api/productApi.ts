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

// ── In-Memory Cache & In-Flight Request Deduplication ───────────────────────
// Prevents duplicate concurrent HTTP requests across components and delivers
// instant cached responses on navigation.
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const PRODUCT_CACHE_TTL_MS = 60 * 1000; // 1 minute fresh cache
const productListCache = new Map<string, CacheEntry<Product[]>>();
const productDetailCache = new Map<string, CacheEntry<Product>>();
const inFlightProductRequests = new Map<string, Promise<Product[]>>();

export const clearProductCache = () => {
  productListCache.clear();
  productDetailCache.clear();
  inFlightProductRequests.clear();
};

/**
 * Fetch products (optionally filtered by category, search, and paginated)
 */
export const getProducts = async (
  params?: GetProductsParams
): Promise<Product[]> => {
  const cacheKey = JSON.stringify(params || {});
  const now = Date.now();

  // 1. Serve from memory cache if fresh
  const cached = productListCache.get(cacheKey);
  if (cached && now - cached.timestamp < PRODUCT_CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Reuse in-flight request if an identical query is already pending
  const inFlight = inFlightProductRequests.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  // 3. Initiate request and deduplicate concurrent callers
  const requestPromise = (async () => {
    try {
      const response = await axiosClient.get<ProductsResponse>("/products", {
        params,
      });
      const data = response.data?.data || [];
      productListCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error("Failed to fetch products:", error);
      if (cached) return cached.data;
      return [];
    } finally {
      inFlightProductRequests.delete(cacheKey);
    }
  })();

  inFlightProductRequests.set(cacheKey, requestPromise);
  return requestPromise;
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
 * Fetch single product by ID with all product images (cached)
 */
export const getProductById = async (
  id: number | string
): Promise<Product | null> => {
  const key = String(id);
  const now = Date.now();
  const cached = productDetailCache.get(key);
  if (cached && now - cached.timestamp < PRODUCT_CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const response = await axiosClient.get<SingleProductResponse>(
      `/products/${id}`
    );
    const data = response.data?.data || null;
    if (data) {
      productDetailCache.set(key, { data, timestamp: Date.now() });
    }
    return data;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    if (cached) return cached.data;
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
  clearProductCache();
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
  clearProductCache();
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
  clearProductCache();
  return response.data;
};
