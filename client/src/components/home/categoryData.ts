export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export const categories: Category[] = [
  {
    id: 1,
    name: 'Electronics',
    description: 'Phones, computers and accessories',
    icon: '💻',
  },
  {
    id: 2,
    name: 'Fashion',
    description: 'Clothing, shoes and accessories',
    icon: '👕',
  },
  {
    id: 3,
    name: 'Agriculture',
    description: 'Farm products and equipment',
    icon: '🌾',
  },
  {
    id: 4,
    name: 'Food',
    description: 'Local food and groceries',
    icon: '🛒',
  },
  {
    id: 5,
    name: 'Home',
    description: 'Furniture and household items',
    icon: '🏠',
  },
  {
    id: 6,
    name: 'Beauty',
    description: 'Beauty and personal care',
    icon: '✨',
  },
];
