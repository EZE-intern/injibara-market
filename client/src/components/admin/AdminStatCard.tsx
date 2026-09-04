import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

export type StatColorTheme =
  | "emerald"
  | "blue"
  | "amber"
  | "purple"
  | "rose"
  | "slate";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  description?: string;
  icon: LucideIcon;
  color?: StatColorTheme;
  loading?: boolean;
  onClick?: () => void;
}

const colorStyles: Record<
  StatColorTheme,
  { bg: string; text: string; iconBg: string; border: string }
> = {
  emerald: {
    bg: "hover:border-emerald-300",
    text: "text-emerald-600",
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    border: "border-gray-200",
  },
  blue: {
    bg: "hover:border-blue-300",
    text: "text-blue-600",
    iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
    border: "border-gray-200",
  },
  amber: {
    bg: "hover:border-amber-300",
    text: "text-amber-600",
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
    border: "border-gray-200",
  },
  purple: {
    bg: "hover:border-purple-300",
    text: "text-purple-600",
    iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
    border: "border-gray-200",
  },
  rose: {
    bg: "hover:border-rose-300",
    text: "text-rose-600",
    iconBg: "bg-rose-50 text-rose-600 border border-rose-100",
    border: "border-gray-200",
  },
  slate: {
    bg: "hover:border-slate-300",
    text: "text-slate-600",
    iconBg: "bg-slate-100 text-slate-700 border border-slate-200",
    border: "border-gray-200",
  },
};

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  change,
  changeType = "increase",
  description,
  icon: Icon,
  color = "emerald",
  loading = false,
  onClick,
}) => {
  const styles = colorStyles[color];

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded-md bg-gray-200" />
          <div className="h-10 w-10 rounded-xl bg-gray-200" />
        </div>
        <div className="mt-3 h-8 w-32 rounded-md bg-gray-200" />
        <div className="mt-4 h-3 w-40 rounded-md bg-gray-100" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col justify-between rounded-2xl border ${styles.border} bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md ${
        styles.bg
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-gray-900 group-hover:scale-102 transition-transform">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner transition-transform duration-200 group-hover:scale-110 ${styles.iconBg}`}
        >
          <Icon size={22} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        {description && (
          <p className="text-xs text-gray-500 line-clamp-1">{description}</p>
        )}

        {change && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              changeType === "increase"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : changeType === "decrease"
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-gray-100 text-gray-700 border border-gray-200"
            }`}
          >
            {changeType === "increase" ? (
              <TrendingUp size={12} />
            ) : changeType === "decrease" ? (
              <TrendingDown size={12} />
            ) : (
              <Minus size={12} />
            )}
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

export default AdminStatCard;
