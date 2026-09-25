import { useState, useEffect } from "react";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { AVAILABLE_LOCATIONS } from "./LocationSelectorModal";
import type { Category } from "../../api/categoryApi";

export interface FilterState {
  location: string;
  category: string;
  recentTime: "all" | "24h" | "7d" | "30d";
  minPrice: string;
  maxPrice: string;
  sortBy: "default" | "price-low" | "price-high" | "newest";
}

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  filters: FilterState;
  onApply: (newFilters: FilterState) => void;
  onReset: () => void;
}

export default function MobileFilterSheet({
  isOpen,
  onClose,
  categories,
  filters,
  onApply,
  onReset,
}: MobileFilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      location: "",
      category: "All",
      recentTime: "all",
      minPrice: "",
      maxPrice: "",
      sortBy: "default",
    };
    setLocalFilters(defaultFilters);
    onReset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Filter Listings
              </h3>
              <p className="text-xs text-gray-400">
                ማጣሪያዎች • Refine products
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-white transition"
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Filter Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* 1. Location Filter */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block mb-2.5">
              Location / አካባቢ
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LOCATIONS.map((loc) => {
                const isSelected =
                  (!localFilters.location && !loc.value) ||
                  localFilters.location.toLowerCase() === loc.value.toLowerCase();

                return (
                  <button
                    key={loc.value || "all"}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({ ...prev, location: loc.value }))
                    }
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      isSelected
                        ? "bg-red-600 text-white shadow-xs"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {loc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Category Filter */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block mb-2.5">
              Category / ምድብ
            </label>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
              <button
                type="button"
                onClick={() =>
                  setLocalFilters((prev) => ({ ...prev, category: "All" }))
                }
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  localFilters.category === "All"
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => {
                const isSelected = localFilters.category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({ ...prev, category: cat.name }))
                    }
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      isSelected
                        ? "bg-red-600 text-white shadow-xs"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Recent / Time Filter */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block mb-2.5">
              Listed Time / የተጨመረበት ጊዜ
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { value: "all", label: "Anytime" },
                { value: "24h", label: "Past 24 Hours" },
                { value: "7d", label: "Past 7 Days" },
                { value: "30d", label: "Past 30 Days" },
              ].map((timeOpt) => {
                const isSelected = localFilters.recentTime === timeOpt.value;
                return (
                  <button
                    key={timeOpt.value}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        recentTime: timeOpt.value as FilterState["recentTime"],
                      }))
                    }
                    className={`rounded-xl py-2 px-3 text-xs font-semibold text-center border transition ${
                      isSelected
                        ? "border-red-600 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold"
                        : "border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {timeOpt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Price Range & Sort */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block mb-2.5">
              Price (ETB) / ዋጋ
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min Price"
                value={localFilters.minPrice}
                onChange={(e) =>
                  setLocalFilters((prev) => ({ ...prev, minPrice: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 dark:border-slate-800 px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-red-600"
              />
              <span className="text-gray-400 font-medium">-</span>
              <input
                type="number"
                placeholder="Max Price"
                value={localFilters.maxPrice}
                onChange={(e) =>
                  setLocalFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 dark:border-slate-800 px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* 5. Sort Order */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block mb-2.5">
              Sort By / ቅደም ተከተል
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { value: "default", label: "Default" },
                { value: "newest", label: "Newest First" },
                { value: "price-low", label: "Price: Low → High" },
                { value: "price-high", label: "Price: High → Low" },
              ].map((sortOpt) => {
                const isSelected = localFilters.sortBy === sortOpt.value;
                return (
                  <button
                    key={sortOpt.value}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        sortBy: sortOpt.value as FilterState["sortBy"],
                      }))
                    }
                    className={`rounded-xl py-2 px-2.5 text-xs font-semibold text-center border transition ${
                      isSelected
                        ? "border-red-600 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold"
                        : "border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {sortOpt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-slate-800 px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <RotateCcw size={14} />
            Reset All
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 rounded-xl bg-red-600 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-red-700 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
