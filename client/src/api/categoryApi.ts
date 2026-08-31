import axiosClient from './axiosClient';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  created_at?: string;
  deleted_at?: string | null;
}

interface CategoriesResponse {
  success: boolean;
  count: number;
  data: Category[];
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await axiosClient.get<CategoriesResponse>('/categories');
  return response.data.data || [];
};
