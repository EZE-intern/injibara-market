import { Link } from "react-router-dom";

interface InjibaraLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  to?: string;
}

/**
 * Traditional Ethiopian Telsem / Meskel geometric cross motif emblem
 */
export function EthioLogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 text-red-600`}
      aria-hidden="true"
    >
      {/* Outer Diamond & Frame Accents */}
      <rect
        x="6"
        y="6"
        width="36"
        height="36"
        rx="4"
        transform="rotate(45 24 24)"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Inner Central Cross Arms */}
      <path
        d="M24 4V44M4 24H44"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Diagonal Weave Lines */}
      <path
        d="M10 10L38 38M38 10L10 38"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Inner Core Diamond */}
      <rect
        x="17"
        y="17"
        width="14"
        height="14"
        transform="rotate(45 24 24)"
        fill="currentColor"
      />
      {/* Central Diamond Cutout Accent */}
      <circle cx="24" cy="24" r="2.5" fill="white" />
      {/* Traditional Endpoint Finials */}
      <circle cx="24" cy="5" r="1.5" fill="currentColor" />
      <circle cx="24" cy="43" r="1.5" fill="currentColor" />
      <circle cx="5" cy="24" r="1.5" fill="currentColor" />
      <circle cx="43" cy="24" r="1.5" fill="currentColor" />
    </svg>
  );
}

export default function InjibaraLogo({
  className = "",
  iconOnly = false,
  size = "md",
  to = "/",
}: InjibaraLogoProps) {
  const iconSizes = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const amharicSizes = {
    sm: "text-[11px]",
    md: "text-xs",
    lg: "text-sm",
  };

  const englishSizes = {
    sm: "text-xs tracking-wider",
    md: "text-sm tracking-wide",
    lg: "text-base tracking-wide",
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <EthioLogoIcon className={iconSizes[size]} />
      {!iconOnly && (
        <div className="flex flex-col text-left leading-tight select-none">
          <span className={`font-bold text-red-600 dark:text-red-500 ${amharicSizes[size]}`}>
            እንጅባራ ማርኬት
          </span>
          <span
            className={`font-black text-red-600 dark:text-red-500 uppercase ${englishSizes[size]}`}
          >
            INJIBARA MARKET
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
