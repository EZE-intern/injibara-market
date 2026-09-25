import { useNavigate } from "react-router-dom";
import { LayoutGrid, PlusCircle } from "lucide-react";
import { isAuthenticated } from "../../utils/authStorage";

export default function CustomerHeroSection() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  const handleSellClick = () => {
    if (!authenticated) {
      navigate("/login");
    } else {
      navigate("/seller/products/new");
    }
  };

  const handleBrowseClick = () => {
    navigate("/products");
  };

  return (
    <section className="px-4 py-2 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl shadow-md min-h-[220px] sm:min-h-[280px] lg:min-h-[320px] flex items-end">
        {/* Background Image: Lake Zengena */}
        <img
          src="/images/lake_zengena.jpg"
          alt="Scenic Lake Zengena in Injibara, Awi Zone"
          className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
          loading="eager"
        />

        {/* Gradient Overlay for Text Readability */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20"
          aria-hidden="true"
        />

        {/* Content Box */}
        <div className="relative z-10 w-full p-5 sm:p-8 lg:p-10 flex flex-col items-start">
          {/* Main Headline */}
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl drop-shadow-sm">
            Find what you need nearby
          </h1>

          {/* Amharic Subtitle */}
          <p className="mt-1 text-sm font-semibold text-white/90 sm:text-base drop-shadow-sm">
            በእንጅባራ የሚፈልጉትን ያግኙ
          </p>

          {/* Action Buttons Row */}
          <div className="mt-4 sm:mt-6 flex items-center gap-3 flex-wrap">
            {/* 1. Browse listings (Red Pill) */}
            <button
              type="button"
              onClick={handleBrowseClick}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-red-700 active:scale-95 transition cursor-pointer"
            >
              <LayoutGrid size={16} strokeWidth={2.5} />
              <span>Browse listings</span>
            </button>

            {/* 2. Sell item (White Pill) */}
            <button
              type="button"
              onClick={handleSellClick}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-red-600 shadow-md hover:bg-gray-100 active:scale-95 transition cursor-pointer"
            >
              <PlusCircle size={16} strokeWidth={2.5} />
              <span>Sell item</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
