import axiosClient from "./axiosClient";

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number | string;
  product?: {
    id: number;
    name: string;
    image?: string | null;
  } | null;
}

export interface Order {
  id: number;
  user_id?: number;
  total_amount: number | string;
  status: string;
  payment_status?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

interface OrdersResponse {
  success: boolean;
  data: Order[];
}

interface OrderResponse {
  success: boolean;
  data: Order;
}

export const getMyOrders = async (): Promise<Order[]> => {
  const response =
    await axiosClient.get<OrdersResponse>(
      "/orders/my-orders"
    );

  return response.data.data;
};

export const getOrderById = async (
  id: number
): Promise<Order> => {
  const response =
    await axiosClient.get<OrderResponse>(
      `/orders/${id}`
    );

  return response.data.data;
};

export const createOrder = async (): Promise<Order> => {
  const response =
    await axiosClient.post<OrderResponse>(
      "/orders"
    );

  return response.data.data;
};