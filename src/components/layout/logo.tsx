import { appConfig } from "@/config/app";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        aria-label="DialyCare logo mark"
        className="size-11 shrink-0"
        role="img"
        viewBox="0 0 96 96"
      >
        <circle cx="48" cy="48" fill="#E1F5EE" r="44" />
        <path
          d="M48 20 C48 20 28 44 28 58 A20 20 0 0 0 68 58 C68 44 48 20 48 20 Z"
          fill="#0F6E56"
        />
        <path
          d="M40 56 L46 62 L58 46"
          fill="none"
          stroke="#E1F5EE"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4.5"
        />
      </svg>
      <div>
        <p className="text-base font-semibold leading-tight text-brand-ink">{appConfig.name}</p>
        <p className="text-xs text-brand-muted">{appConfig.tagline}</p>
      </div>
    </div>
  );
}
