import axiosClient from './axiosClient';

export interface PermissionsResponse {
  success: boolean;
  permissions: string[];
}

export async function getMyPermissions(): Promise<string[]> {
  const res = await axiosClient.get<PermissionsResponse>('/admin/my-permissions');
  return res.data.permissions;
}

export async function getAdminPermissions(userId: number): Promise<string[]> {
  const res = await axiosClient.get<PermissionsResponse>(`/admin/permissions/${userId}`);
  return res.data.permissions;
}

export async function setAdminPermissions(userId: number, permissions: string[]): Promise<string[]> {
  const res = await axiosClient.put<PermissionsResponse>(`/admin/permissions/${userId}`, { permissions });
  return res.data.permissions;
}
