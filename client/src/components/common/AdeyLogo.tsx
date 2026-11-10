import { Link } from "react-router-dom";

interface AdeyLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  to?: string;
}

/**
 * Authentic 8-petaled Adey Abeba (Bidens macroptera) wildflower vector emblem.
 * Symbol of renewal, prosperity, and national Ethiopian unity.
 */
export function AdeyFlowerIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
      aria-hidden="true"
    >
      {/* 8 Radial Adey Petals with natural soft taper */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <path
          key={angle}
          d="M24 24 C21 16, 21 8, 24 4 C27 8, 27 16, 24 24 Z"
          fill="url(#adey-petal-grad)"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}

      {/* Central Roasted Espresso Seed Disc */}
      <circle cx="24" cy="24" r="6.5" fill="#25221D" />

      {/* Golden Inner Seed Ring */}
      <circle cx="24" cy="24" r="3.2" fill="#FBBF24" />

      {/* Central Micro Spark */}
      <circle cx="24" cy="24" r="1.2" fill="#F59E0B" />

      <defs>
        <linearGradient id="adey-petal-grad" x1="24" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Backward compatible export for any legacy imports
export const EthioLogoIcon = AdeyFlowerIcon;

export default function AdeyLogo({
  className = "",
  iconOnly = false,
  size = "md",
  to = "/",
}: AdeyLogoProps) {
  const iconSizes = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const amharicSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const englishSizes = {
    sm: "text-[10px] tracking-wider",
    md: "text-xs tracking-wider",
    lg: "text-sm tracking-widest",
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <AdeyFlowerIcon className={iconSizes[size]} />
      {!iconOnly && (
        <div className="flex flex-col text-left leading-tight select-none">
          <span className={`font-black text-stone-900 dark:text-stone-100 ${amharicSizes[size]}`}>
            አደይ ገበያ
          </span>
          <span
            className={`font-black text-amber-600 dark:text-amber-400 uppercase ${englishSizes[size]}`}
          >
            ADEY MARKET
          </span>
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="transition-opacity hover:opacity-90 inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
