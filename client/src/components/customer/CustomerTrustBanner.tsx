import { useNavigate } from 'react-router-dom';
import { Store, Edit, ShieldCheck, MapPin, Heart, Wallet, Globe, Lock } from 'lucide-react';
import { getUser, isAuthenticated } from '../../utils/authStorage';

function CustomerTrustBanner() {
  const navigate = useNavigate();
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

  return (
    <section className="bg-white py-12 border-t border-gray-150">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        
        {/* Sell to your community banner */}
        <div className="rounded-2xl bg-gradient-to-r from-red-50/50 to-orange-50/30 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-red-100/50 mb-16">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Shop icon inside red circle */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <Store size={32} />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-gray-900">
                Sell to your community
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Reach thousands of buyers across Injibara.
              </p>

              {/* Items row */}
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-gray-700">
                <span className="flex items-center gap-1.5">
                  <Edit size={14} className="text-brand-600" />
                  Easy to list
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-brand-600" />
                  Secure payments
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-brand-600" />
                  Local support
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSellClick}
            className="w-full sm:w-auto shrink-0 rounded-lg bg-brand-700 px-6 py-3.5 text-sm font-bold text-white shadow transition hover:bg-brand-850 flex items-center justify-center gap-2 cursor-pointer"
          >
            Start Selling Now <span className="text-base">&rarr;</span>
          </button>
        </div>

        {/* Why Injibara Market? section */}
        <div className="text-center mb-10">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
            Why Injibara Market?
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Local & Trusted */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Heart size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Local & Trusted</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                A marketplace built for Injibara by Injibara.
              </p>
            </div>
          </div>

          {/* Secure Payments */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Wallet size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Secure Payments</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                Pay safely with Telebirr, CBE Birr, and more.
              </p>
            </div>
          </div>

          {/* Bilingual Platform */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Globe size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Bilingual Platform</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                Available in English and Amharic.
              </p>
            </div>
          </div>

          {/* Safe & Reliable */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Lock size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Safe & Reliable</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                Verified users and secure communication.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default CustomerTrustBanner;
