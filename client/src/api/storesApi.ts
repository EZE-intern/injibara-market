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

interface StoresResponse {
  success: boolean;
  count: number;
  data: AdminStore[];
}

export const getAdminStores = async (): Promise<AdminStore[]> => {
  const response = await axiosClient.get<StoresResponse>("/admin/stores");

  return response.data.data;
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