import axiosClient from "./axiosClient";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number | null;
  product_name?: string | null;
  price: number | string;
  quantity: number;
  products?: {
    id: number;
    name: string;
    image?: string | null;
    price: number | string;
    product_images?: Array<{
      id: number;
      image_url: string;
      is_primary?: boolean | null;
    }>;
  } | null;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: number | string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_method: string;
  payment_status: string;
  shipping_address?: string | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await axiosClient.get<{ success: boolean; count: number; data: Order[] }>(
    "/orders/my-orders"
  );
  return response.data?.data || [];
};

export const createOrder = async (orderData: {
  items: Array<{ product_id: number; quantity: number }>;
  shipping_address?: string;
  payment_method?: string;
  note?: string;
}): Promise<Order> => {
  const response = await axiosClient.post<{ success: boolean; data: Order }>(
    "/orders",
    orderData
  );
  return response.data.data;
};

export const getOrderById = async (id: number | string): Promise<Order> => {
  const response = await axiosClient.get<{ success: boolean; data: Order }>(
    `/orders/${id}`
  );
  return response.data.data;
};
