import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../api/categoryApi';
import type { Category } from '../../api/categoryApi';

const categoryIconMap: Record<string, string> = {
  electronics: '📱',
  vehicles: '🚗',
  property: '🏠',
  fashion: '👕',
  agriculture: '🌾',
  livestock: '🐄',
  'home-garden': '🛋️',
  'home-&-garden': '🛋️',
  home: '🏠',
  'food-beverages': '☕',
  'food-&-beverages': '☕',
  food: '☕',
  education: '📖',
  services: '💼',
  'sports-leisure': '⚽',
  'sports-&-leisure': '⚽',
  sports: '⚽',
  business: '📊',
};

const getCategoryIcon = (slugOrName: string): string => {
  const clean = slugOrName.toLowerCase().trim().replace(/\s+/g, '-');
  return categoryIconMap[clean] || '📦';
};

function CustomerCategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories on customer grid:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
          <p className="mt-3 text-sm text-gray-500">Loading categories...</p>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        
        {/* Section Heading */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight sm:text-2xl">
            Explore Categories
          </h2>
          <Link
            to="/products"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition flex items-center gap-1"
          >
            View all categories <span className="text-xs">&rarr;</span>
          </Link>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="group flex flex-col items-center justify-center rounded-xl border border-gray-150 bg-white p-5 text-center transition hover:border-brand-200 hover:shadow-md"
            >
              {/* Icon Container */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl transition-colors group-hover:bg-brand-100">
                {getCategoryIcon(category.slug || category.name)}
              </div>

              {/* Name */}
              <h3 className="mt-3 text-sm font-semibold text-gray-800 transition-colors group-hover:text-brand-700">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

export default CustomerCategoryGrid;
