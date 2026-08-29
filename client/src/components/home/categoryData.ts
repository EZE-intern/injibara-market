export interface Category {
  id: number;
  name: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Electronics",
    description: "Phones, computers and accessories",
  },
  {
    id: 2,
    name: "Fashion",
    description: "Clothing, shoes and accessories",
  },
  {
    id: 3,
    name: "Agriculture",
    description: "Farm products and equipment",
  },
  {
    id: 4,
    name: "Food",
    description: "Local food and groceries",
  },
  {
    id: 5,
    name: "Home",
    description: "Furniture and household items",
  },
  {
    id: 6,
    name: "Beauty",
    description: "Beauty and personal care",
  },
];
