import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Grid, Plus } from 'lucide-react';
import { getUser, isAuthenticated } from '../../utils/authStorage';

function CustomerHeroSection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const user = getUser();
  const authenticated = isAuthenticated();

  const handleSellClick = () => {
    if (!authenticated) {
      navigate('/login');
    } else if (user?.role?.toLowerCase() === 'seller') {
      navigate('/seller-dashboard');
    } else {
      navigate('/customer/become-seller');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#fafafa]">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          
          {/* Left Text and Form Column */}
          <div className="z-10 lg:col-span-7">
            {/* Tagline / Heading */}
            <div className="max-w-2xl">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Your marketplace.
                <span className="block text-brand-600 mt-1">Your community.</span>
              </h1>
              
              <p className="mt-4 text-base text-gray-600 sm:text-lg">
                Buy and sell products and services from people around Injibara.
              </p>
              <p className="mt-1.5 text-sm text-brand-700 font-medium font-ethiopic">
                በእንጅባራ የሚሸጡና የሚገዙትን ያግኙ።
              </p>
            </div>

            {/* Search Bar Form */}
            <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl">
              <div className="flex flex-col gap-2 rounded-xl bg-white p-2 shadow-md sm:flex-row sm:items-center">
                
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
                  <select className="bg-transparent text-sm font-medium text-gray-700 outline-none py-1.5 cursor-pointer">
                    <option value="injibara">Injibara</option>
                    <option value="awi">Awi Zone</option>
                    <option value="bahirdar">Bahir Dar</option>
                  </select>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="rounded-lg bg-brand-600 p-3 text-white transition hover:bg-brand-700 shrink-0 flex items-center justify-center cursor-pointer"
                  aria-label="Search button"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>

            {/* Hero Quick Actions */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/products')}
                className="flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-brand-850 cursor-pointer"
              >
                <Grid size={16} />
                Browse Categories
              </button>

              <button
                onClick={handleSellClick}
                className="flex items-center gap-2 rounded-lg border border-brand-600 bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 cursor-pointer"
              >
                <Plus size={16} />
                Sell Something
              </button>
            </div>
          </div>

          {/* Right Image Column */}
          <div className="lg:col-span-5 relative">
            <div className="overflow-hidden rounded-2xl border-4 border-white shadow-xl bg-gray-150 aspect-[4/3] w-full lg:aspect-square">
              <img
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800"
                alt="Injibara Marketplace Scenery"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-xl bg-white p-4 shadow-lg border border-gray-100 hidden sm:block">
              <div className="text-xs text-gray-500 font-medium">Local Marketplace</div>
              <div className="text-sm font-bold text-gray-900 mt-0.5">Injibara Town, Awi</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default CustomerHeroSection;
