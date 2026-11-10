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
  ChevronDown,
} from "lucide-react";
import { getCategories } from "../../api/categoryApi";
import type { Category } from "../../api/categoryApi";

/**
 * Maps category name/slug to an authentic outlined icon in Adey Gold (#F59E0B / #D97706)
 */
export const getCategoryIconNode = (slugOrName: string): ReactNode => {
  const clean = slugOrName.toLowerCase().trim().replace(/\s+/g, "-");

  if (clean.includes("elect") || clean.includes("phone") || clean.includes("tech"))
    return <Smartphone className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />;
  if (clean.includes("fash") || clean.includes("cloth") || clean.includes("shoe"))
    return <Shirt className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />;
  if (clean.includes("agri") || clean.includes("teff") || clean.includes("crop") || clean.includes("grain"))
    return <Sprout className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />;
  if (clean.includes("food") || clean.includes("drink") || clean.includes("grocery") || clean.includes("bever"))
    return <ShoppingBasket className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />;
  if (clean.includes("home") || clean.includes("prop") || clean.includes("land") || clean.includes("house"))
    return <Home className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />;
  if (clean.includes("beaut") || clean.includes("cosm") || clean.includes("care"))
    return <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />;
  if (clean.includes("vehic") || clean.includes("bajaj") || clean.includes("car") || clean.includes("motor"))
    return <Car className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />;
  if (clean.includes("live") || clean.includes("cow") || clean.includes("sheep") || clean.includes("animal"))
    return <Beef className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />;
  if (clean.includes("furn"))
    return <Armchair className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />;
  if (clean.includes("serv"))
    return <Briefcase className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />;
  if (clean.includes("heal") || clean.includes("med"))
    return <Activity className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />;

  return <Layers className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />;
};

const DESKTOP_LIMIT = 6;

export default function CustomerCategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
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
                className="flex flex-col items-center justify-center rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-3.5 w-20 sm:w-auto shrink-0 animate-pulse"
              >
                <div className="h-10 w-10 rounded-xl bg-stone-200 dark:bg-stone-800" />
                <div className="mt-2 h-3 w-12 rounded bg-stone-200 dark:bg-stone-800" />
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

  // On desktop (sm+), limit visible categories; on mobile, show all in horizontal scroll
  const hasMore = categories.length > DESKTOP_LIMIT;
  const visibleCategories = expanded ? categories : categories.slice(0, DESKTOP_LIMIT);

  return (
    <section className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Mobile: horizontal scroll — always show all categories */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 sm:hidden">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center justify-center rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-3.5 w-20 shrink-0 shadow-xs hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-sm transition-all"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 dark:bg-amber-500/15 transition-transform group-hover:scale-110">
                {getCategoryIconNode(cat.slug || cat.name)}
              </div>
              <span className="mt-2 text-xs font-semibold text-stone-800 dark:text-stone-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate max-w-full text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Desktop: grid — limited to 6, expandable */}
        <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {visibleCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center justify-center rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-3.5 shadow-xs hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-sm transition-all"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 dark:bg-amber-500/15 transition-transform group-hover:scale-110">
                {getCategoryIconNode(cat.slug || cat.name)}
              </div>
              <span className="mt-2 text-xs font-semibold text-stone-800 dark:text-stone-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate max-w-full text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Expand / Collapse toggle — desktop only, when more than 6 categories */}
        {hasMore && (
          <div className="hidden sm:flex justify-center mt-2">
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="flex items-center gap-1 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-1 text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-400 dark:hover:border-amber-700 transition cursor-pointer shadow-xs"
            >
              <span>{expanded ? "Show less" : `+${categories.length - DESKTOP_LIMIT} more`}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
