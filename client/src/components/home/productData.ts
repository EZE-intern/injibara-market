import type { Product } from '../../types/Product';

export const featuredProducts: Product[] = [
  {
    id: 1,
    name: 'Samsung Galaxy A15',
    brand: 'Samsung',
    price: 18500,
    rating: 4.6,
    reviews: 128,
    batch: 'B2026-08',
    location: 'Injibara',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
    category: 'Electronics',
    subCategory: 'Mobile Phones',
  },

  {
    id: 2,
    name: 'Traditional Handwoven Basket',
    brand: 'Local Artisan',
    price: 1200,
    rating: 4.5,
    reviews: 42,
    batch: 'B2026-07',
    location: 'Injibara',
    image:
      'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d',
    category: 'Home & Living',
    subCategory: 'Handicrafts',
  },

  {
    id: 3,
    name: 'Fresh Local Coffee',
    brand: 'Awi Coffee',
    price: 850,
    rating: 4.8,
    reviews: 96,
    batch: 'B2026-08',
    location: 'Awi Zone',
    image:
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e',
    category: 'Food',
    subCategory: 'Coffee',
  },

  {
    id: 4,
    name: "Men's Casual Shirt",
    brand: 'Local Fashion',
    price: 1800,
    rating: 4.3,
    reviews: 31,
    batch: 'B2026-06',
    location: 'Injibara',
    image:
      'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab',
    category: 'Fashion',
    subCategory: "Men's Clothing",
  },
];