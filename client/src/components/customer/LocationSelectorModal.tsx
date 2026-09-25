import { MapPin, Check, X } from "lucide-react";

export interface LocationOption {
  value: string;
  label: string;
  amharicLabel: string;
}

export const AVAILABLE_LOCATIONS: LocationOption[] = [
  { value: "", label: "All Locations", amharicLabel: "ሁሉም አካባቢዎች" },
  { value: "injibara", label: "Injibara", amharicLabel: "እንጅባራ" },
  { value: "awi", label: "Awi Zone", amharicLabel: "አዊ ዞን" },
  { value: "kossober", label: "Kossober", amharicLabel: "ኮሶበር" },
  { value: "chagni", label: "Chagni", amharicLabel: "ቻግኒ" },
  { value: "bahirdar", label: "Bahir Dar", amharicLabel: "ባሕር ዳር" },
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
  if (!isOpen) return null;

  const normalizedSelected = selectedLocation.toLowerCase().trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl transition-all max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Select Location
              </h3>
              <p className="text-xs text-gray-400">
                አካባቢ ይምረጡ • Filter listings by area
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-white transition"
            aria-label="Close location selector"
          >
            <X size={18} />
          </button>
        </div>

        {/* Options List */}
        <div className="mt-4 space-y-1.5">
          {AVAILABLE_LOCATIONS.map((loc) => {
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
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                  isSelected
                    ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 font-semibold border border-red-200 dark:border-red-900"
                    : "hover:bg-gray-50 dark:hover:bg-slate-800/60 text-gray-700 dark:text-gray-200 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin
                    size={16}
                    className={isSelected ? "text-red-600" : "text-gray-400"}
                  />
                  <div>
                    <span className="text-sm font-medium">{loc.label}</span>
                    <span className="ml-2 text-xs text-gray-400">({loc.amharicLabel})</span>
                  </div>
                </div>

                {isSelected && (
                  <Check size={18} className="text-red-600 dark:text-red-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
