import axiosClient from './axiosClient';
import type { Product } from '../types/Product';

interface ProductsResponse {
  products?: Product[];
  data?: Product[];
}

interface ProductResponse {
  product?: Product;
  data?: Product;
}

/**
 * Get all products from the backend.
 */
export const getProducts = async (): Promise<Product[]> => {
  const response = await axiosClient.get<ProductsResponse | Product[]>('/products');

  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.products)) {
    return data.products;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
};

/**
 * Get one product by ID.
 */
export const getProductById = async (
  id: number,
): Promise<Product> => {
  const response = await axiosClient.get<ProductResponse | Product>(
    `/products/${id}`,
  );

  const data = response.data;

  if ('id' in data) {
    return data;
  }

  if (data.product) {
    return data.product;
  }

  if (data.data) {
    return data.data;
  }

  throw new Error('Product was not found.');
};