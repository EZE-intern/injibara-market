import axiosClient from "./axiosClient";

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    role: string;
  };
  token: string;
}

export const registerUser = async (
  data: RegisterData
): Promise<RegisterResponse> => {
  const response = await axiosClient.post<RegisterResponse>(
    "/auth/register",
    data
  );

  return response.data;
};