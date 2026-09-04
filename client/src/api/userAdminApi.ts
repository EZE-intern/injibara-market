import axiosClient from "./axiosClient";

export type AdminUserRole =
  | "CUSTOMER"
  | "SELLER"
  | "ADMIN"
  | "SUPER_ADMIN";

export type AdminUserStatus =
  | "ACTIVE"
  | "SUSPENDED";

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
  created_at: string;
}

interface UsersResponse {
  success: boolean;
  count: number;
  data: AdminUser[];
}

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await axiosClient.get<UsersResponse>(
    "/admin/users"
  );

  return response.data.data;
};

interface UserStatusResponse {
  success: boolean;
  message: string;
  data: AdminUser;
}

export const updateUserStatus = async (
  id: number,
  status: AdminUserStatus
): Promise<AdminUser> => {
  const response =
    await axiosClient.put<UserStatusResponse>(
      `/admin/users/${id}/status`,
      { status }
    );

  return response.data.data;
};