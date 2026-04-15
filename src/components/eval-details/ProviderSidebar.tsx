import React from "react";

export type ProviderSidebarItem = {
  key: string;
  label: string;
  success: boolean | null;
};

type ProviderSidebarProps = {
  items: ProviderSidebarItem[];
  activeKey: string | null;
  onSelect: (key: string) => void;
};

export function ProviderSidebar({ items, activeKey, onSelect }: ProviderSidebarProps) {
  return (
    <div className="md:w-48 border-b md:border-b-0 md:border-r border-border flex flex-col overflow-hidden bg-muted/10">
      <div className="overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:flex-1 p-2">
        <div className="flex md:flex-col gap-1 md:gap-1 min-w-max md:min-w-0">
          {items.map((item) => {
            const isSelected = activeKey === item.key;
            return (
              <div
                key={item.key}
                onClick={() => onSelect(item.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                  isSelected ? "bg-muted" : "hover:bg-muted/50"
                }`}
              >
                {item.success === null ? (
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse flex-shrink-0"></div>
                ) : item.success === true ? (
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <span className="text-sm text-foreground truncate">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
