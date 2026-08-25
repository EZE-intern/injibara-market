export interface Product {
  id: number;
  store_id?: number | null;
  seller_id?: number | null;
  category_id?: number | null;

  name: string;
  slug?: string;
  description?: string | null;

  price: number | string;
  discount_price?: number | string | null;
  stock?: number | null;

  status?: string;
  image?: string | null;
  images?: string | null;

  is_active?: boolean | null;

  created_at?: string;
  updated_at?: string;

  // Frontend display fields
  brand?: string;
  rating?: number;
  reviews?: number;
  batch?: string;
  location?: string;

  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}