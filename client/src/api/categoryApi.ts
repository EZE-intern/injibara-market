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

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await axiosClient.get<CategoriesResponse>("/categories");
    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
};
