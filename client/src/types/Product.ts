export interface ProductImage {
  id: number;
  image_url: string;
  side_angle?: string;
  is_primary?: boolean;
  sort_order?: number;
}

export interface Product {
  id: number;
  name: string;
  price: number | string;
  image?: string;
  description?: string;
  brand?: string;
  rating?: number;
  reviews?: number;
  batch?: string;
  location?: string;
  category?: string;
  subCategory?: string;
  category_id?: number;
  product_images?: ProductImage[];
  categories?: { id: number; name: string; slug: string };
}