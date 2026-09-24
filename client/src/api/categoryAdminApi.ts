import axiosClient from "./axiosClient";

export type CategoryTier = "TIER_1" | "TIER_2";

export interface AdminCategory {
  id: number;
  name: string;
  name_am?: string | null;
  slug: string;
  description?: string | null;
  icon?: string | null;
  tier: CategoryTier;
  product_count: number;
  is_active: boolean;
  created_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CategoriesResponse {
  success: boolean;
  count: number;
  data: AdminCategory[];
  pagination: PaginationMeta;
}

export const getAdminCategories = async (
  params?: { page?: number; limit?: number }
): Promise<{ data: AdminCategory[]; pagination: PaginationMeta }> => {
  const response = await axiosClient.get<CategoriesResponse>(
    "/admin/categories",
    { params }
  );
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
};

interface CategoryResponse {
  success: boolean;
  message: string;
  data: AdminCategory;
}

export interface CreateCategoryData {
  name: string;
  name_am?: string;
  slug: string;
  description?: string;
  icon?: string;
  tier: CategoryTier;
}

export const createAdminCategory = async (
  data: CreateCategoryData
): Promise<AdminCategory> => {
  const response = await axiosClient.post<CategoryResponse>(
    "/admin/categories",
    data
  );

  return response.data.data;
};

export const updateAdminCategory = async (
  id: number,
  data: Partial<CreateCategoryData>
): Promise<AdminCategory> => {
  const response = await axiosClient.put<CategoryResponse>(
    `/admin/categories/${id}`,
    data
  );

  return response.data.data;
};

export const updateCategoryStatus = async (
  id: number,
  is_active: boolean
): Promise<AdminCategory> => {
  const response = await axiosClient.put<CategoryResponse>(
    `/admin/categories/${id}/status`,
    { is_active }
  );

  return response.data.data;
};