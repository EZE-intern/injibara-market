import { Heart, Globe, Lock } from "lucide-react";

function CustomerTrustBanner() {
  return (
    <section className="border-t border-gray-100 bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Why Injibara Market?
          </p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900">
            Built for trust and seamless local commerce
          </h3>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Local & Trusted */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Heart size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Local & Trusted</h4>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                A marketplace built specifically for the Injibara and Awi community.
              </p>
            </div>
          </div>

          {/* Bilingual Platform */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Globe size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Bilingual Platform</h4>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                Easily browse in English and Amharic.
              </p>
            </div>
          </div>

          {/* Safe & Reliable */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Lock size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Safe & Reliable</h4>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                Verified merchants with 6-angle photo inspection guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CustomerTrustBanner;
