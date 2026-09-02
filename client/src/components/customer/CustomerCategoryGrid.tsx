import { useEffect, useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import { 
  Tv, 
  Car, 
  Home, 
  Shirt, 
  Wheat, 
  Beef, 
  Armchair, 
  Coffee, 
  Briefcase, 
  Activity, 
  Sparkles, 
  Layers, 
  ShoppingBag,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { getCategories } from "../../api/categoryApi";
import type { Category } from "../../api/categoryApi";

export const getCategoryIconNode = (slugOrName: string): ReactNode => {
  const clean = slugOrName.toLowerCase().trim().replace(/\s+/g, "-");
  
  if (clean.includes("elect") || clean.includes("phone") || clean.includes("tech")) return <Tv className="h-6 w-6 text-brand-600" />;
  if (clean.includes("vehic") || clean.includes("bajaj") || clean.includes("car") || clean.includes("motor")) return <Car className="h-6 w-6 text-brand-600" />;
  if (clean.includes("prop") || clean.includes("land") || clean.includes("build") || clean.includes("house")) return <Home className="h-6 w-6 text-brand-600" />;
  if (clean.includes("fash") || clean.includes("cloth") || clean.includes("shoe")) return <Shirt className="h-6 w-6 text-brand-600" />;
  if (clean.includes("agri") || clean.includes("teff") || clean.includes("crop") || clean.includes("grain")) return <Wheat className="h-6 w-6 text-brand-600" />;
  if (clean.includes("live") || clean.includes("cow") || clean.includes("sheep") || clean.includes("ox") || clean.includes("animal")) return <Beef className="h-6 w-6 text-brand-600" />;
  if (clean.includes("furn") || clean.includes("home") || clean.includes("garden")) return <Armchair className="h-6 w-6 text-brand-600" />;
  if (clean.includes("food") || clean.includes("drink") || clean.includes("bever") || clean.includes("coffee") || clean.includes("honey")) return <Coffee className="h-6 w-6 text-brand-600" />;
  if (clean.includes("serv")) return <Briefcase className="h-6 w-6 text-brand-600" />;
  if (clean.includes("heal") || clean.includes("med")) return <Activity className="h-6 w-6 text-brand-600" />;
  if (clean.includes("beaut") || clean.includes("cosm")) return <Sparkles className="h-6 w-6 text-brand-600" />;
  if (clean.includes("shop") || clean.includes("retail")) return <ShoppingBag className="h-6 w-6 text-brand-600" />;

  return <Layers className="h-6 w-6 text-brand-600" />;
};

const INITIAL_DISPLAY_COUNT = 6;

function CustomerCategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories on customer grid:", error);
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

  const displayedCategories = showAll ? categories : categories.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMoreThanSix = categories.length > INITIAL_DISPLAY_COUNT;

  return (
    <section className="bg-white py-12 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight sm:text-2xl">
              Explore Categories
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Browse authentic listings across Injibara and Awi Zone
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasMoreThanSix && (
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                {showAll ? (
                  <>
                    Show Top 6 <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Show all categories ({categories.length - INITIAL_DISPLAY_COUNT} more){" "}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}

            <Link
              to="/categories"
              className="text-xs font-semibold text-gray-500 hover:text-brand-600 transition flex items-center gap-1"
            >
              Browse Category Directory &rarr;
            </Link>
          </div>
        </div>

        {/* Category Grid (6 columns on large screens) */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {displayedCategories.map((category) => {
            const productCount = category._count?.products;

            return (
              <Link
                key={category.id}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="group relative flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-5 text-center transition hover:border-brand-600 hover:shadow-md"
              >
                {/* Icon Container */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 transition-transform group-hover:scale-110 group-hover:bg-brand-100">
                  {getCategoryIconNode(category.slug || category.name)}
                </div>

                {/* Name */}
                <h3 className="mt-3 text-sm font-bold text-gray-900 transition-colors group-hover:text-brand-700 truncate max-w-full">
                  {category.name}
                </h3>

                {/* Optional product count badge */}
                {productCount !== undefined && productCount > 0 ? (
                  <span className="mt-1 text-[11px] font-medium text-gray-400">
                    {productCount} {productCount === 1 ? "item" : "items"}
                  </span>
                ) : (
                  <span className="mt-1 text-[11px] font-medium text-brand-600">
                    Browse &rarr;
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CustomerCategoryGrid;
