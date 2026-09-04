import axiosClient from "./axiosClient";

export interface ConversationSummary {
  contact_id: number;
  contact_name: string;
  contact_email: string;
  latest_message: string;
  latest_message_at: string;
  unread_count: number;
  product_id: number | null;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  product_id: number | null;
  order_id: number | null;
  message_text: string;
  is_read: boolean;
  created_at: string;
}

export interface SendMessageData {
  product_id?: number;
  order_id?: number;
  receiver_id?: number;
  message_text: string;
}

export interface SentMessageResponse {
  message_id: number;
  receiver_id: number;
  product_id: number | null;
}

export const getInbox = async (): Promise<ConversationSummary[]> => {
  const response = await axiosClient.get("/messages/inbox");

  return response.data.data ?? [];
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await axiosClient.get("/messages/unread-count");

  return response.data.unread_count ?? 0;
};

export const getChatByProduct = async (
  productId: number
): Promise<Message[]> => {
  const response = await axiosClient.get(`/messages/chat/${productId}`);

  return response.data.data ?? [];
};

export const getConversation = async (
  contactId: number
): Promise<Message[]> => {
  const response = await axiosClient.get(`/messages/thread/${contactId}`);

  return response.data.data ?? [];
};

export const sendMessage = async (
  data: SendMessageData
): Promise<SentMessageResponse> => {
  const response = await axiosClient.post("/messages/send", data);

  return response.data.data;
};