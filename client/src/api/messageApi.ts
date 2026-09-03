import axiosClient from './axiosClient';

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

export interface Conversation {
  contact_id: number;
  contact_name: string;
  contact_email: string;
  latest_message: string;
  latest_message_at: string;
  unread_count: number;
  product_id: number | null;
}

/**
 * Get the inbox — list of all conversations for the authenticated user.
 */
export async function getInbox(): Promise<Conversation[]> {
  const res = await axiosClient.get('/messages/inbox');
  return res.data.data || [];
}

/**
 * Get the full thread with a specific contact.
 */
export async function getThread(contactId: number): Promise<Message[]> {
  const res = await axiosClient.get(`/messages/thread/${contactId}`);
  return res.data.data || [];
}

/**
 * Get the conversation for a specific product (buyer side).
 */
export async function getChatByProduct(productId: number | string): Promise<Message[]> {
  const res = await axiosClient.get(`/messages/chat/${productId}`);
  return res.data.data || [];
}

/**
 * Send a message.
 */
export async function sendMessage(params: {
  message_text: string;
  product_id?: number | string;
  receiver_id?: number;
  order_id?: number;
}): Promise<{ message_id: number; receiver_id: number; product_id: number | null }> {
  const res = await axiosClient.post('/messages/send', params);
  return res.data.data;
}

/**
 * Get the total unread message count for the authenticated user.
 */
export async function getUnreadCount(): Promise<number> {
  const res = await axiosClient.get('/messages/unread-count');
  return res.data.unread_count || 0;
}
