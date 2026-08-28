export interface Product {
  id: string;
  title: string;
  category: string;
  price: string;
  location: string;
  timeAgo: string;
  image: string;
  isFeatured?: boolean;
}

export const featuredProducts: Product[] = [
  {
    id: "1",
    title: "iPhone 13 Pro 128GB",
    category: "Electronics",
    price: "ETB 45,000",
    location: "Injibara",
    timeAgo: "2h ago",
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=600",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Bajaj Maxima Z",
    category: "Vehicles",
    price: "ETB 180,000",
    location: "Injibara",
    timeAgo: "5h ago",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600",
  },
  {
    id: "3",
    title: "Modern Sofa Set",
    category: "Home & Garden",
    price: "ETB 12,500",
    location: "Injibara",
    timeAgo: "1d ago",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600",
  },
  {
    id: "4",
    title: "Teff (ጤፍ) - 25kg",
    category: "Agriculture",
    price: "ETB 8,000",
    location: "Injibara",
    timeAgo: "1d ago",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=600",
  },
  {
    id: "5",
    title: "Land for Sale",
    category: "Property",
    price: "ETB 650,000",
    location: "Injibara",
    timeAgo: "2d ago",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600",
  },
];
