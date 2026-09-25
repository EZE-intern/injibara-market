import { ShieldCheck, Languages, CheckCircle2 } from "lucide-react";

function CustomerTrustBanner() {
  return (
    <section className="border-t border-gray-150 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-900/40 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <div className="text-center max-w-xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-red-200/60 dark:border-red-900/60">
            Why Injibara Market?
          </span>
          <p className="mt-1.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
            Built for trust & seamless local commerce in Injibara & Awi Zone
          </p>
        </div>

        {/* 3 Compact Trust Cards in 1 Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-5 max-w-4xl mx-auto">
          {/* 1. Local & Trusted */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 shadow-2xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/70 text-red-600 dark:text-red-400">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                Local & Verified
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug truncate sm:whitespace-normal">
                Connecting genuine local buyers & sellers.
              </p>
            </div>
          </div>

          {/* 2. Bilingual Platform */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 shadow-2xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/70 text-red-600 dark:text-red-400">
              <Languages size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                Bilingual Platform
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug truncate sm:whitespace-normal">
                Browse seamlessly in Amharic & English.
              </p>
            </div>
          </div>

          {/* 3. Direct & Safe */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 shadow-2xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/70 text-red-600 dark:text-red-400">
              <CheckCircle2 size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                Direct & Safe
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug truncate sm:whitespace-normal">
                Multi-angle photos & admin mediation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CustomerTrustBanner;
