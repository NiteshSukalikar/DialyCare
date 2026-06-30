import type { ReactNode } from "react";

type Tab = {
  label: string;
  active?: boolean;
};

export function Tabs({ tabs }: { tabs: Tab[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
      {tabs.map((tab) => (
        <button
          aria-selected={tab.active ? "true" : "false"}
          className={`min-h-9 whitespace-nowrap rounded-full px-3 text-sm font-semibold ${
            tab.active
              ? "bg-brand-primary text-brand-mint"
              : "bg-white text-brand-muted"
          }`}
          key={tab.label}
          role="tab"
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ children }: { children: ReactNode }) {
  return <div className="mt-4">{children}</div>;
}
