import axiosClient from "./axiosClient";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  name_am?: string | null;
  parent_id?: number | null;
  icon?: string | null;
  product_count?: number;
  children?: Category[];
  _count?: {
    products?: number;
  };
}

export interface CategoriesResponse {
  success: boolean;
  count: number;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasMore?: boolean;
  data: Category[];
}

export interface SingleCategoryResponse {
  message: string;
  data: Category;
}

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
}

// ── In-Memory Cache & In-Flight Request Deduplication ───────────────────────
// Prevents duplicate concurrent HTTP calls from different homepage components
// and serves cached categories instantly (0ms) on re-renders / page transitions.
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CATEGORY_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache
const categoryCache = new Map<string, CacheEntry<Category[]>>();
const inFlightCategoryRequests = new Map<string, Promise<Category[]>>();

export const clearCategoryCache = () => {
  categoryCache.clear();
  inFlightCategoryRequests.clear();
};

export const getCategories = async (
  params?: GetCategoriesParams
): Promise<Category[]> => {
  const cacheKey = JSON.stringify(params || {});
  const now = Date.now();

  // 1. Serve from memory cache if fresh
  const cached = categoryCache.get(cacheKey);
  if (cached && now - cached.timestamp < CATEGORY_CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Reuse in-flight request if an identical query is already pending
  const inFlight = inFlightCategoryRequests.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  // 3. Initiate request and deduplicate concurrent callers
  const requestPromise = (async () => {
    try {
      const response = await axiosClient.get<CategoriesResponse>("/categories", {
        params,
      });
      const data = response.data?.data || [];
      categoryCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      // Return stale cache if available upon error
      if (cached) return cached.data;
      return [];
    } finally {
      inFlightCategoryRequests.delete(cacheKey);
    }
  })();

  inFlightCategoryRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

export const createCategory = async (
  name: string,
  description?: string,
  token?: string
): Promise<Category | null> => {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await axiosClient.post<SingleCategoryResponse>(
      "/categories",
      { name, description },
      { headers }
    );
    clearCategoryCache();
    return response.data?.data || null;
  } catch (error) {
    console.error("Failed to create category:", error);
    throw error;
  }
};
