import axiosClient from "./axiosClient";

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
}

export const registerUser = async (
  data: RegisterData
): Promise<AuthResponse> => {
  const response = await axiosClient.post<AuthResponse>(
    "/auth/register",
    data
  );

  return response.data;
};

export const loginUser = async (
  data: LoginData
): Promise<AuthResponse> => {
  const response = await axiosClient.post<AuthResponse>(
    "/auth/login",
    data
  );

  return response.data;
};