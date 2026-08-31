export interface ProductImage {
  id: number;
  image_url: string;
  side_angle?: string | null;
  is_primary?: boolean | null;
  sort_order?: number | null;
}

export interface CategoryRelation {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
}

export interface Product {
  id: number;
  name: string;
  slug?: string | null;
  price: number | string;
  discount_price?: number | string | null;
  stock?: number | null;
  description?: string | null;
  image?: string | null;
  images?: string | null;

  store_id?: number | null;
  seller_id?: number | null;
  category_id?: number | null;
  is_active?: boolean | null;
  status?: string | null;

  created_at?: string;
  updated_at?: string;

  // Frontend & relation fields
  brand?: string | null;
  rating?: number | null;
  reviews?: number | null;
  batch?: string | null;
  location?: string | null;
  subCategory?: string | null;

  product_images?: ProductImage[];
  categories?: CategoryRelation | null;
  category?: CategoryRelation | string | null;
}