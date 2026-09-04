import axiosClient from "./axiosClient";

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  icon?: string | null;
  image?: string | null;
  product_count?: number;
  children?: Category[];
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export const getCategories = async (): Promise<Category[]> => {
  const response =
    await axiosClient.get<CategoriesResponse>(
      "/categories"
    );

  return response.data.data;
};