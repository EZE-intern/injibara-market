import axiosClient from "./axiosClient";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
}

export interface CategoriesResponse {
  success: boolean;
  count: number;
  data: Category[];
}

export interface SingleCategoryResponse {
  message: string;
  data: Category;
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await axiosClient.get<CategoriesResponse>("/categories");
    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
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
    return response.data?.data || null;
  } catch (error) {
    console.error("Failed to create category:", error);
    throw error;
  }
};
