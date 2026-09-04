import { Link } from "react-router-dom";

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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand-900 font-bold text-lg select-none">
                  አ
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-bold text-white tracking-wider">እንጅባራ ገበያ</div>
                  <div className="text-sm font-black text-white tracking-wide">INJIBARA MARKET</div>
                </div>
              </div>

              <p className="mt-4 max-w-sm text-xs leading-relaxed text-red-100">
                Your trusted local marketplace to buy, sell, and connect in Injibara and Awi Zone.
              </p>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              <span className="h-8 w-8 rounded-full border border-red-200/40 flex items-center justify-center text-xs font-bold text-white">FB</span>
              <span className="h-8 w-8 rounded-full border border-red-200/40 flex items-center justify-center text-xs font-bold text-white">TG</span>
              <span className="h-8 w-8 rounded-full border border-red-200/40 flex items-center justify-center text-xs font-bold text-white">TT</span>
              <span className="h-8 w-8 rounded-full border border-red-200/40 flex items-center justify-center text-xs font-bold text-white">YT</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-xs text-red-100/90">
              <li><Link to="/products" className="hover:text-white transition">Browse Listings</Link></li>
              <li><Link to="/categories" className="hover:text-white transition">Categories</Link></li>
              <li><Link to="/seller" className="hover:text-white transition">Seller Hub</Link></li>
              <li><Link to="/customer/orders" className="hover:text-white transition">My Orders</Link></li>
            </ul>
          </div>

          {/* For Buyers */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">For Buyers</h4>
            <ul className="mt-4 space-y-2 text-xs text-red-100/90">
              <li><span className="hover:text-white cursor-pointer transition">Safety Tips</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Direct Inspection</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Delivery & Pickup</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Buyer Protection</span></li>
            </ul>
          </div>

          {/* For Sellers */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">For Sellers</h4>
            <ul className="mt-4 space-y-2 text-xs text-red-100/90">
              <li><Link to="/seller" className="hover:text-white transition">Seller Dashboard</Link></li>
              <li><Link to="/seller/products/new" className="hover:text-white transition">+ Add Product</Link></li>
              <li><span className="hover:text-white cursor-pointer transition">Pricing Tips</span></li>
              <li><span className="hover:text-white cursor-pointer transition">6-Angle Photos</span></li>
            </ul>
          </div>

          {/* App Info */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Mobile App</h4>
            <p className="mt-4 text-xs text-red-100/90">Coming Soon</p>
            <div className="mt-3 flex flex-col gap-2">
              <div className="rounded bg-black/30 border border-white/20 p-2 text-[10px] text-center select-none">Google Play</div>
              <div className="rounded bg-black/30 border border-white/20 p-2 text-[10px] text-center select-none">App Store</div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-red-100/70">
          <p>&copy; {new Date().getFullYear()} Injibara Market. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition">Terms & Conditions</span>
            <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default CustomerFooter;
