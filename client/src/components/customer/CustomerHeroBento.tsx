import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutGrid,
  PlusCircle,
  ShieldCheck,
  MapPin,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { isAuthenticated } from "../../utils/authStorage";
import { getProducts } from "../../api/productApi";
import type { Product } from "../../types/Product";
import { getProductDisplayImage } from "../../utils/imageUrl";
import { AdeyFlowerIcon } from "../common/AdeyLogo";

export default function CustomerHeroBento() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getProducts({ limit: 6 })
      .then((data) => {
        if (!cancelled && data.length > 0) {
          setFeaturedProducts(data.slice(0, 6));
        }
      })
      .catch((err) => {
        console.error("Failed to load bento spotlight products:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Cycle through featured products every 6 seconds in the spotlight tile
  useEffect(() => {
    if (featuredProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  const activeProduct = featuredProducts[currentProductIndex];

  return (
    <section className="px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* ==========================================================
              TILE A: Primary Hero Showcase (Cols 1-7 on desktop)
             ========================================================== */}
          <div className="lg:col-span-7 relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-stone-50 to-amber-500/5 dark:from-amber-950/30 dark:via-stone-900 dark:to-stone-950 border border-amber-500/20 dark:border-amber-500/15 p-6 sm:p-10 flex flex-col justify-between min-h-[340px] shadow-sm">
            {/* Background 8-petaled Adey flower vector watermark */}
            <div className="absolute -right-12 -bottom-12 opacity-[0.07] dark:opacity-[0.05] pointer-events-none">
              <AdeyFlowerIcon className="h-72 w-72" />
            </div>

            <div>
              {/* Top Tagline Pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 dark:bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-500/30">
                <Sparkles size={13} className="text-amber-600 dark:text-amber-400" />
                <span>አደይ ገበያ • National Ethiopian Marketplace</span>
              </div>

              {/* Main Headline */}
              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-stone-950 dark:text-stone-50 leading-[1.15]">
                Where Ethiopia <span className="text-amber-600 dark:text-amber-400">shops.</span>
              </h1>

              {/* Amharic Subtitle */}
              <p className="mt-2 text-base sm:text-lg font-bold text-stone-700 dark:text-stone-300">
                መላው ኢትዮጵያ የሚገበይበት ታማኝ የንግድ መድረክ
              </p>

              <p className="mt-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-lg leading-relaxed">
                Connect directly with verified sellers from Addis Ababa to every region. Discover fashion, electronics, highland coffee, teff, Bajaj, and verified property with zero friction.
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3 relative z-10">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <LayoutGrid size={15} />
                <span>Explore Products</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(authenticated ? "/seller/products/new" : "/login")}
                className="inline-flex items-center gap-2 rounded-full border-2 border-amber-500 hover:border-amber-600 text-amber-800 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/30 px-5 py-2 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer"
              >
                <PlusCircle size={15} />
                <span>Start Selling</span>
              </button>
            </div>
          </div>

          {/* ==========================================================
              TILE B & C: Right Column Stack (Cols 8-12 on desktop)
             ========================================================== */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* ── TILE B: Trending Product Spotlight ── */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 shadow-xs flex-1">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <TrendingUp size={15} />
                  </div>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide">
                    Trending Spotlight
                  </span>
                </div>
                <Link
                  to="/products"
                  className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              {activeProduct ? (
                <Link
                  to={`/products/${activeProduct.id}`}
                  className="mt-3 flex items-center gap-3.5 group cursor-pointer"
                >
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200/60 dark:border-stone-700/60">
                    <img
                      src={getProductDisplayImage(activeProduct, 300)}
                      alt={activeProduct.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-md bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[10px] font-medium text-stone-600 dark:text-stone-400">
                      {activeProduct.category?.name || "Featured"}
                    </span>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mt-0.5">
                      {activeProduct.name}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-sm font-extrabold text-stone-950 dark:text-stone-100">
                        ETB {Number(activeProduct.price).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-stone-400">
                      <MapPin size={11} className="text-stone-400 shrink-0" />
                      <span className="truncate">{activeProduct.location || "Addis Ababa"}</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="py-6 text-center text-xs text-stone-400">
                  Loading verified listings...
                </div>
              )}
            </div>

            {/* ── TILE C: National Trust & Two-Tier Guarantee ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5 dark:from-emerald-950/30 dark:via-stone-900 dark:to-stone-950 border border-emerald-500/20 dark:border-emerald-500/15 p-5 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Two-Tier Protected Deals
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Verified Sellers • Telebirr & CBE Birr Supported
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl bg-white/70 dark:bg-stone-800/70 p-2 border border-emerald-500/10">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Tier 1 • High Capital</span>
                  <p className="text-stone-500 dark:text-stone-400 text-[10px] mt-0.5">Title deed & broker inspection for Vehicles & Property</p>
                </div>
                <div className="rounded-xl bg-white/70 dark:bg-stone-800/70 p-2 border border-emerald-500/10">
                  <span className="font-bold text-amber-700 dark:text-amber-400">Tier 2 • Direct Goods</span>
                  <p className="text-stone-500 dark:text-stone-400 text-[10px] mt-0.5">Direct chat & rapid delivery across all regions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
