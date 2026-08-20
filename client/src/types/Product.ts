export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
  reviews: number;
  batch: string;
  location: string;
  image: string;
  category?: string;
  subCategory?: string;
  description?: string;
}