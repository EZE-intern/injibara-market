import axiosClient from "./axiosClient";

/* =========================================================
   ADMIN OVERVIEW
========================================================= */

export interface AdminOverview {
  totalActiveListings: number;
  pendingBrokerInquiries: number;
  faydaVerifiedSellers: number;
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
  } | null;

  seller?: {
    id: number;
    full_name: string;
    phone?: string | null;
    fayda_verified?: boolean;
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

/* =========================================================
   FAYDA KYC
========================================================= */

export type FaydaVerificationStatus =
  | "VERIFIED"
  | "PENDING"
  | "FAILED";

export interface FaydaVerification {
  id: number;

  user: {
    id: number;
    full_name: string;
    phone?: string | null;
  };

  fcn: string;

  verification_date?: string | null;

  status: FaydaVerificationStatus;

  government_photo?: string | null;

  profile_photo?: string | null;
}

interface FaydaVerificationsResponse {
  success: boolean;
  count: number;
  data: FaydaVerification[];
}

export const getFaydaVerifications =
  async (): Promise<FaydaVerification[]> => {
    const response =
      await axiosClient.get<FaydaVerificationsResponse>(
        "/admin/fayda-verifications"
      );

    return response.data.data;
  };