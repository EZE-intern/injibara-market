import { MapPin, Check, X, Search } from "lucide-react";
import { useState, useMemo } from "react";

export interface LocationOption {
  value: string;
  label: string;
  amharicLabel: string;
}

export const AVAILABLE_LOCATIONS: LocationOption[] = [
  { value: "", label: "All Ethiopia", amharicLabel: "መላ ኢትዮጵያ" },
  { value: "addis-ababa", label: "Addis Ababa", amharicLabel: "አዲስ አበባ" },
  { value: "bahirdar", label: "Bahir Dar", amharicLabel: "ባሕር ዳር" },
  { value: "hawassa", label: "Hawassa", amharicLabel: "ሐዋሳ" },
  { value: "adama", label: "Adama / Nazret", amharicLabel: "አዳማ" },
  { value: "dire-dawa", label: "Dire Dawa", amharicLabel: "ድሬዳዋ" },
  { value: "mekelle", label: "Mekelle", amharicLabel: "መቀሌ" },
  { value: "gondar", label: "Gondar", amharicLabel: "ጎንደር" },
  { value: "jimma", label: "Jimma", amharicLabel: "ጅማ" },
  { value: "dessie", label: "Dessie", amharicLabel: "ደሴ" },
  { value: "bishoftu", label: "Bishoftu", amharicLabel: "ቢሾፍቱ" },
  { value: "shashemene", label: "Shashemene", amharicLabel: "ሻሸመኔ" },
  { value: "harar", label: "Harar", amharicLabel: "ሐረር" },
  { value: "jigjiga", label: "Jigjiga", amharicLabel: "ጅግጅጋ" },
  { value: "arba-minch", label: "Arba Minch", amharicLabel: "አርባ ምንጭ" },
  { value: "wolaita-sodo", label: "Wolaita Sodo", amharicLabel: "ወላይታ ሶዶ" },
  { value: "dilla", label: "Dilla", amharicLabel: "ዲላ" },
  { value: "nekemte", label: "Nekemte", amharicLabel: "ነቀምቴ" },
  { value: "injibara", label: "Injibara & Awi", amharicLabel: "እንጅባራ" },
];

interface LocationSelectorModalProps {
  isOpen: boolean;
  selectedLocation: string;
  onSelect: (locationValue: string) => void;
  onClose: () => void;
}

export default function LocationSelectorModal({
  isOpen,
  selectedLocation,
  onSelect,
  onClose,
}: LocationSelectorModalProps) {
  const [filterText, setFilterText] = useState("");

  const normalizedSelected = (selectedLocation || "").toLowerCase().trim();

  const filteredLocations = useMemo(() => {
    if (!filterText.trim()) return AVAILABLE_LOCATIONS;
    const q = filterText.toLowerCase().trim();
    return AVAILABLE_LOCATIONS.filter(
      (loc) =>
        loc.label.toLowerCase().includes(q) ||
        loc.amharicLabel.toLowerCase().includes(q)
    );
  }, [filterText]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-stone-900 p-6 shadow-2xl transition-all max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Select Location • አካባቢ ይምረጡ
              </h3>
              <p className="text-xs text-stone-400">
                All over Ethiopia • መላ ኢትዮጵያ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-200 transition cursor-pointer"
            aria-label="Close location selector"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Search Input */}
        <div className="mt-3 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search city or region (e.g. Addis, Hawassa)..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none focus:border-amber-500"
          />
        </div>

        {/* Options List */}
        <div className="mt-3 space-y-1 overflow-y-auto flex-1 pr-1">
          {filteredLocations.map((loc) => {
            const isSelected =
              (!normalizedSelected && !loc.value) ||
              (Boolean(normalizedSelected) && normalizedSelected === loc.value);

            return (
              <button
                key={loc.value || "all"}
                type="button"
                onClick={() => {
                  onSelect(loc.value);
                  onClose();
                }}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left transition cursor-pointer ${
                  isSelected
                    ? "bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800"
                    : "hover:bg-stone-50 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin
                    size={16}
                    className={isSelected ? "text-amber-600 dark:text-amber-400" : "text-stone-400"}
                  />
                  <div>
                    <span className="text-sm font-medium">{loc.label}</span>
                    <span className="ml-2 text-xs text-stone-400 dark:text-stone-500">
                      ({loc.amharicLabel})
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <Check size={18} className="text-amber-600 dark:text-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
