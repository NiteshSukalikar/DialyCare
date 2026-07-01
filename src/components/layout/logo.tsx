import Image from "next/image";

import { appConfig } from "@/config/app";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <Image
        alt="DialyCare logo mark"
        className="size-11 shrink-0 rounded-lg"
        height={44}
        src="/icons/icon-192.png"
        width={44}
      />
      <div>
        <p className="text-base font-semibold leading-tight text-brand-ink">{appConfig.name}</p>
        <p className="text-xs text-brand-muted">{appConfig.tagline}</p>
      </div>
    </div>
  );
}
