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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UsersResponse {
  success: boolean;
  count: number;
  data: AdminUser[];
  pagination: PaginationMeta;
}

export const getAdminUsers = async (
  params?: { page?: number; limit?: number }
): Promise<{ data: AdminUser[]; pagination: PaginationMeta }> => {
  const response = await axiosClient.get<UsersResponse>(
    "/admin/users",
    { params }
  );

  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
};

export const getAllAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await axiosClient.get<UsersResponse>(
    "/admin/users",
    { params: { page: 1, limit: 10000 } }
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

export type PromotableRole = "customer" | "seller" | "admin";

interface UpdateUserRoleResponse {
  message: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    role: string;
  };
}

export const updateUserRole = async (
  id: number,
  role: PromotableRole
): Promise<UpdateUserRoleResponse["user"]> => {
  const response = await axiosClient.patch<UpdateUserRoleResponse>(
    `/auth/users/${id}/role`,
    { role }
  );

  return response.data.user;
};