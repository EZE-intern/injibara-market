import { useEffect, useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Smartphone,
  Shirt,
  Sprout,
  ShoppingBasket,
  Home,
  Sparkles,
  Car,
  Beef,
  Armchair,
  Briefcase,
  Activity,
  Layers,
} from "lucide-react";
import { getCategories } from "../../api/categoryApi";
import type { Category } from "../../api/categoryApi";
import { serverWarmup } from "../../App";

/**
 * Maps category name/slug to an authentic outlined icon in warm brand red/orange
 */
export const getCategoryIconNode = (slugOrName: string): ReactNode => {
  const clean = slugOrName.toLowerCase().trim().replace(/\s+/g, "-");

  if (clean.includes("elect") || clean.includes("phone") || clean.includes("tech"))
    return <Smartphone className="h-6 w-6 text-red-600 dark:text-red-500" strokeWidth={1.8} />;
  if (clean.includes("fash") || clean.includes("cloth") || clean.includes("shoe"))
    return <Shirt className="h-6 w-6 text-red-600 dark:text-red-500" strokeWidth={1.8} />;
  if (clean.includes("agri") || clean.includes("teff") || clean.includes("crop") || clean.includes("grain"))
    return <Sprout className="h-6 w-6 text-red-600 dark:text-red-500" strokeWidth={1.8} />;
  if (clean.includes("food") || clean.includes("drink") || clean.includes("grocery") || clean.includes("bever"))
    return <ShoppingBasket className="h-6 w-6 text-red-600 dark:text-red-500" strokeWidth={1.8} />;
  if (clean.includes("home") || clean.includes("prop") || clean.includes("land") || clean.includes("house"))
    return <Home className="h-6 w-6 text-red-600 dark:text-red-500" strokeWidth={1.8} />;
  if (clean.includes("beaut") || clean.includes("cosm") || clean.includes("care"))
    return <Sparkles className="h-6 w-6 text-red-600 dark:text-red-500" strokeWidth={1.8} />;
  if (clean.includes("vehic") || clean.includes("bajaj") || clean.includes("car") || clean.includes("motor"))
    return <Car className="h-6 w-6 text-red-600 dark:text-red-500" strokeWidth={1.8} />;
  if (clean.includes("live") || clean.includes("cow") || clean.includes("sheep") || clean.includes("animal"))
    return <Beef className="h-6 w-6 text-red-600 dark:text-red-500" strokeWidth={1.8} />;
  if (clean.includes("furn"))
    return <Armchair className="h-6 w-6 text-red-600 dark:text-red-500" strokeWidth={1.8} />;
  if (clean.includes("serv"))
    return <Briefcase className="h-6 w-6 text-red-600 dark:text-red-500" strokeWidth={1.8} />;
  if (clean.includes("heal") || clean.includes("med"))
    return <Activity className="h-6 w-6 text-red-600 dark:text-red-500" strokeWidth={1.8} />;

  return <Layers className="h-6 w-6 text-red-600 dark:text-red-500" strokeWidth={1.8} />;
};

export default function CustomerCategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        await serverWarmup;
        const data = await getCategories();
        if (isMounted) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to load real categories on customer grid:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Skeleton Loader
  if (loading) {
    return (
      <section className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 sm:grid sm:grid-cols-3 md:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 w-20 sm:w-auto shrink-0 animate-pulse"
              >
                <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-slate-800" />
                <div className="mt-2 h-3 w-12 rounded bg-gray-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Horizontal Category Scroller on Mobile, Grid on Tablet/Desktop */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center justify-center rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 w-20 sm:w-auto shrink-0 shadow-xs hover:border-red-600 dark:hover:border-red-500 hover:shadow-sm transition-all"
            >
              {/* Icon Container */}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 transition-transform group-hover:scale-110">
                {getCategoryIconNode(cat.slug || cat.name)}
              </div>

              {/* Category Name */}
              <span className="mt-2 text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400 truncate max-w-full text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
