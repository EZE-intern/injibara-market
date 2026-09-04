import axiosClient from "./axiosClient";

/* =========================================================
   ADMIN OVERVIEW
========================================================= */

export interface AdminOverview {
  totalActiveListings: number;
  pendingBrokerInquiries: number;
  totalStores: number;
  totalRegisteredUsers: number;
}

interface AdminOverviewResponse {
  success: boolean;
  data: AdminOverview;
}

export const getAdminOverview =
  async (): Promise<AdminOverview> => {
    const response =
      await axiosClient.get<AdminOverviewResponse>(
        "/admin/overview"
      );

    return response.data.data;
  };

/* =========================================================
   BROKER HUB
========================================================= */

export type BrokerInquiryStatus =
  | "NEW"
  | "ASSIGNED"
  | "APPOINTMENT_SCHEDULED"
  | "MEDIATED"
  | "CLOSED";

export interface BrokerInquiry {
  id: number;

  status: BrokerInquiryStatus;

  created_at: string;

  appointment_date?: string | null;

  message_text?: string | null;

  buyer_id?: number | null;

  receiver_id?: number | null;

  product?: {
    id: number;
    name: string;
    price: number | string;
    image?: string | null;

    category?: {
      name: string;
    } | null;
  } | null;

  buyer?: {
    id: number;
    full_name: string;
    phone?: string | null;
    email?: string | null;
  } | null;

  seller?: {
    id: number;
    full_name: string;
    phone?: string | null;
  } | null;
}

export interface InquiryChatMessage {
  id: number;
  message_text: string;
  sender_id: number;
  receiver_id: number;
  product_id?: number | null;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: number;
    full_name: string;
    role: string;
  } | null;
  receiver?: {
    id: number;
    full_name: string;
    role: string;
  } | null;
}

interface BrokerInquiriesResponse {
  success: boolean;
  count: number;
  data: BrokerInquiry[];
}

export const getBrokerInquiries =
  async (): Promise<BrokerInquiry[]> => {
    const response =
      await axiosClient.get<BrokerInquiriesResponse>(
        "/admin/broker-inquiries"
      );

    return response.data.data;
  };

interface BrokerInquiryResponse {
  success: boolean;
  data: BrokerInquiry;
}

export const getBrokerInquiryById =
  async (
    id: number
  ): Promise<BrokerInquiry> => {
    const response =
      await axiosClient.get<BrokerInquiryResponse>(
        `/admin/broker-inquiries/${id}`
      );

    return response.data.data;
  };

interface InquiryMessagesResponse {
  success: boolean;
  count: number;
  data: InquiryChatMessage[];
}

export const getInquiryMessages =
  async (
    inquiryId: number
  ): Promise<InquiryChatMessage[]> => {
    const response =
      await axiosClient.get<InquiryMessagesResponse>(
        `/admin/broker-inquiries/${inquiryId}/messages`
      );

    return response.data.data;
  };

interface SendInquiryReplyResponse {
  success: boolean;
  message: string;
  data: InquiryChatMessage;
}

export const sendInquiryReply =
  async (
    inquiryId: number,
    messageText: string
  ): Promise<InquiryChatMessage> => {
    const response =
      await axiosClient.post<SendInquiryReplyResponse>(
        `/admin/broker-inquiries/${inquiryId}/messages`,
        {
          message_text: messageText,
        }
      );

    return response.data.data;
  };

interface UpdateBrokerInquiryStatusResponse {
  success: boolean;
  message: string;
  data: BrokerInquiry;
}

export const updateBrokerInquiryStatus =
  async (
    id: number,
    status: BrokerInquiryStatus
  ): Promise<BrokerInquiry> => {
    const response =
      await axiosClient.put<UpdateBrokerInquiryStatusResponse>(
        `/admin/broker-inquiries/${id}/status`,
        { status }
      );

    return response.data.data;
  };

interface SetAppointmentResponse {
  success: boolean;
  message: string;
  data: BrokerInquiry;
}

export const setBrokerAppointment =
  async (
    id: number,
    appointmentDate: string
  ): Promise<BrokerInquiry> => {
    const response =
      await axiosClient.put<SetAppointmentResponse>(
        `/admin/broker-inquiries/${id}/appointment`,
        {
          appointment_date: appointmentDate,
        }
      );

    return response.data.data;
  };

/* =========================================================
   PRODUCT MODERATION
========================================================= */

export type AdminProductStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface AdminProductImage {
  id: number;
  url: string;
  angle?: string | null;
}

export interface AdminProduct {
  id: number;

  name: string;

  description?: string | null;

  price: number | string;

  discount_price?: number | string | null;

  stock?: number | null;

  status: AdminProductStatus;

  image?: string | null;

  images?: AdminProductImage[];

  seller?: {
    id: number;
    full_name: string;
    phone?: string | null;
  } | null;

  category?: {
    id: number;
    name: string;
  } | null;

  created_at: string;

  updated_at?: string;
}

interface AdminProductsResponse {
  success: boolean;
  count: number;
  data: AdminProduct[];
}

export const getAdminProducts =
  async (): Promise<AdminProduct[]> => {
    const response =
      await axiosClient.get<AdminProductsResponse>(
        "/admin/products"
      );

    return response.data.data;
  };

interface UpdateProductStatusResponse {
  success: boolean;
  message: string;
  data: AdminProduct;
}

export const updateAdminProductStatus =
  async (
    id: number,
    status: AdminProductStatus
  ): Promise<AdminProduct> => {
    const response =
      await axiosClient.put<UpdateProductStatusResponse>(
        `/admin/products/${id}/status`,
        { status }
      );

    return response.data.data;
  };

export const rejectAdminProduct =
  async (
    id: number,
    reason: string
  ): Promise<AdminProduct> => {
    const response =
      await axiosClient.put<UpdateProductStatusResponse>(
        `/admin/products/${id}/reject`,
        { reason }
      );

    return response.data.data;
  };

interface DeleteProductResponse {
  success: boolean;
  message: string;
}

export const deleteAdminProduct =
  async (
    id: number
  ): Promise<string> => {
    const response =
      await axiosClient.delete<DeleteProductResponse>(
        `/admin/products/${id}`
      );

    return response.data.message;
  };