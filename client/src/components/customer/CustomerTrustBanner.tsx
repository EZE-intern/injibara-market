import { ShieldCheck, Languages, CheckCircle2 } from "lucide-react";

function CustomerTrustBanner() {
  return (
    <section className="border-t border-stone-200/80 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/40 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <div className="text-center max-w-xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-amber-500/30">
            Why Adey Market? • ለምን አደይ ገበያ?
          </span>
          <p className="mt-2 text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
            Built for trust, nationwide speed, and verified commerce across Ethiopia
          </p>
        </div>

        {/* 3 Compact Trust Cards in 1 Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 max-w-4xl mx-auto">
          {/* 1. Nationwide & Verified */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate">
                Nationwide & Verified
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                Connecting genuine buyers & sellers from Addis to every region.
              </p>
            </div>
          </div>

          {/* 2. Bilingual Platform */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Languages size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate">
                Bilingual & Local-First
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                Browse seamlessly in Amharic & English with authentic ETB pricing.
              </p>
            </div>
          </div>

          {/* 3. Two-Tier Protected Deals */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <CheckCircle2 size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate">
                Two-Tier Protected Deals
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                Direct chat for retail; admin escrow mediation for high-capital deals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CustomerTrustBanner;
