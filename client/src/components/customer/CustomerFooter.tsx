import { Link } from 'react-router-dom';

function CustomerFooter() {
  return (
    <footer className="border-t border-brand-900 bg-brand-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-16">
        
        {/* Main Grid */}
        <div className="grid gap-10 md:grid-cols-12">
          
          {/* Logo & About Column */}
          <div className="md:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-brand-900 font-bold text-lg select-none">
                  አ
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-bold text-white tracking-wider font-ethiopic">እንጅባራ ገበያ</div>
                  <div className="text-sm font-black text-white tracking-wide">INJIBARA MARKET</div>
                </div>
              </div>

              <p className="mt-4 max-w-sm text-xs leading-relaxed text-red-100">
                Your trusted local marketplace to buy, sell, and connect in Injibara.
              </p>
            </div>

            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-4">
              <a href="#" className="h-8 w-8 rounded-full border border-red-200/50 flex items-center justify-center text-xs hover:bg-white hover:text-brand-900 transition" aria-label="Facebook">FB</a>
              <a href="#" className="h-8 w-8 rounded-full border border-red-200/50 flex items-center justify-center text-xs hover:bg-white hover:text-brand-900 transition" aria-label="Telegram">TG</a>
              <a href="#" className="h-8 w-8 rounded-full border border-red-200/50 flex items-center justify-center text-xs hover:bg-white hover:text-brand-900 transition" aria-label="TikTok">TT</a>
              <a href="#" className="h-8 w-8 rounded-full border border-red-200/50 flex items-center justify-center text-xs hover:bg-white hover:text-brand-900 transition" aria-label="YouTube">YT</a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-xs text-red-100/90">
              <li><Link to="/products" className="hover:text-white transition">Browse Listings</Link></li>
              <li><Link to="/products" className="hover:text-white transition">Categories</Link></li>
              <li><Link to="/customer/become-seller" className="hover:text-white transition">Sell an Item</Link></li>
              <li><Link to="/" className="hover:text-white transition">How It Works</Link></li>
              <li><Link to="/" className="hover:text-white transition">Help Center</Link></li>
            </ul>
          </div>

          {/* For Buyers Column */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">For Buyers</h4>
            <ul className="mt-4 space-y-2 text-xs text-red-100/90">
              <li><a href="#" className="hover:text-white transition">Safety Tips</a></li>
              <li><a href="#" className="hover:text-white transition">Payment Methods</a></li>
              <li><a href="#" className="hover:text-white transition">Delivery</a></li>
              <li><a href="#" className="hover:text-white transition">Buyer Protection</a></li>
            </ul>
          </div>

          {/* For Sellers Column */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">For Sellers</h4>
            <ul className="mt-4 space-y-2 text-xs text-red-100/90">
              <li><a href="#" className="hover:text-white transition">Selling Tips</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing Your Item</a></li>
              <li><a href="#" className="hover:text-white transition">Manage Listings</a></li>
              <li><a href="#" className="hover:text-white transition">Seller Protection</a></li>
            </ul>
          </div>

          {/* Download Our App Column */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Download Our App</h4>
            <p className="mt-4 text-xs text-red-100/90">Coming Soon</p>
            <div className="mt-3 flex flex-col gap-2">
              <div className="rounded bg-black/40 border border-white/20 p-2 text-[10px] text-center select-none cursor-not-allowed">Google Play</div>
              <div className="rounded bg-black/40 border border-white/20 p-2 text-[10px] text-center select-none cursor-not-allowed">App Store</div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-red-100/70">
          <p>&copy; {new Date().getFullYear()} Injibara Market. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">Terms & Conditions</a>
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default CustomerFooter;
