import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Grid, Plus } from "lucide-react";
import { isAuthenticated } from "../../utils/authStorage";

function CustomerHeroSection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const authenticated = isAuthenticated();

  const handleSellClick = () => {
    if (!authenticated) {
      navigate("/login");
    } else {
      navigate("/seller");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    if (searchLocation.trim()) {
      params.set("location", searchLocation.trim().toLowerCase());
    }
    const queryString = params.toString();
    navigate(queryString ? `/products?${queryString}` : "/products");
  };

  return (
    <section className="relative overflow-hidden min-h-[420px] md:min-h-[480px] flex items-center">
      {/* Full-width Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/lake_zengena.jpg"
          alt="Lake Zengena in Awi Zone near Injibara"
          aria-hidden="true"
          className="h-full w-full object-cover object-[center_35%]"
        />
      </div>

      {/* Gradient overlay: solid white on the left fading to transparent on the right */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.85) 20%, rgba(255,255,255,0.60) 45%, rgba(255,255,255,0.25) 70%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* Frosted glass blur layer on the left side */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          maskImage:
            "linear-gradient(to right, black 0%, black 40%, transparent 70%)",
          WebkitMaskImage:
            "linear-gradient(to right, black 0%, black 40%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-12 md:px-12 lg:px-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Your marketplace.
            <span className="block text-brand-600 mt-1">Your community.</span>
          </h1>

          <p className="mt-4 text-base text-gray-700 sm:text-lg">
            Buy and sell products and services
            <br className="hidden sm:block" />
            from people around Injibara.
          </p>
          <p className="mt-1.5 text-sm text-brand-700 font-medium">
            በእንጅባራ የሚሸጡና የሚገዙትን ያግኙ።
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl">
          <div className="flex flex-col gap-2 rounded-xl bg-white p-2 shadow-lg sm:flex-row sm:items-center border border-gray-200">
            {/* Product Search Input */}
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, services, vehicles..."
                className="w-full py-2 text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
            </div>

            {/* Location Filter */}
            <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-2 sm:border-t-0 sm:border-l sm:py-0 shrink-0">
              <MapPin size={18} className="text-brand-600 shrink-0" />
              <select
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 outline-none py-1.5 cursor-pointer"
              >
                <option value="">All Locations</option>
                <option value="injibara">Injibara</option>
                <option value="awi">Awi Zone</option>
                <option value="kossober">Kossober</option>
                <option value="chagni">Chagni</option>
                <option value="bahirdar">Bahir Dar</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="rounded-lg bg-brand-600 p-3 text-white transition hover:bg-brand-700 shrink-0 flex items-center justify-center cursor-pointer shadow-sm"
              aria-label="Search button"
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => navigate("/categories")}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 cursor-pointer"
          >
            <Grid size={16} />
            Browse Categories
          </button>

          <button
            type="button"
            onClick={handleSellClick}
            className="flex items-center gap-2 rounded-lg border border-brand-600 bg-white/80 backdrop-blur-sm px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-white cursor-pointer"
          >
            <Plus size={16} />
            Sell Something
          </button>
        </div>
      </div>
    </section>
  );
}

export default CustomerHeroSection;
