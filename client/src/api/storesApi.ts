import axiosClient from "./axiosClient";

export type StoreStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export interface AdminStore {
  id: number;
  name: string;
  description?: string | null;
  owner?: {
    id: number;
    full_name: string;
    email?: string | null;
    phone?: string | null;
  } | null;
  product_count: number;
  status: StoreStatus;
  created_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StoresResponse {
  success: boolean;
  count: number;
  data: AdminStore[];
  pagination: PaginationMeta;
}

export const getAdminStores = async (
  params?: { page?: number; limit?: number }
): Promise<{ data: AdminStore[]; pagination: PaginationMeta }> => {
  const response = await axiosClient.get<StoresResponse>("/admin/stores", { params });
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
};

interface StoreResponse {
  success: boolean;
  message: string;
  data: AdminStore;
}

export const updateStoreStatus = async (
  id: number,
  status: StoreStatus
): Promise<AdminStore> => {
  const response = await axiosClient.put<StoreResponse>(
    `/admin/stores/${id}/status`,
    { status }
  );

  return response.data.data;
};