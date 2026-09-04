import axiosClient from "./axiosClient";

export interface ManagedAdmin {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  role: "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  created_at: string;
}

interface AdminsResponse {
  success: boolean;
  count: number;
  data: ManagedAdmin[];
}

export const getManagedAdmins = async (): Promise<ManagedAdmin[]> => {
  const response = await axiosClient.get<AdminsResponse>(
    "/admin/management/admins"
  );

  return response.data.data;
};

export interface CreateAdminData {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  role: "ADMIN";
}

interface AdminResponse {
  success: boolean;
  message: string;
  data: ManagedAdmin;
}

export const createAdmin = async (
  data: CreateAdminData
): Promise<ManagedAdmin> => {
  const response = await axiosClient.post<AdminResponse>(
    "/admin/management/admins",
    data
  );

  return response.data.data;
};

export const updateAdminStatus = async (
  id: number,
  status: "ACTIVE" | "SUSPENDED"
): Promise<ManagedAdmin> => {
  const response = await axiosClient.put<AdminResponse>(
    `/admin/management/admins/${id}/status`,
    { status }
  );

  return response.data.data;
};