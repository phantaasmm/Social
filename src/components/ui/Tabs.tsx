import { useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({
  items,
  defaultTab,
  activeTab,
  onChange,
  className,
}: TabsProps) {
  const firstEnabledTab = items.find((item) => !item.disabled)?.id ?? "";
  const [internalTab, setInternalTab] = useState(
    defaultTab ?? firstEnabledTab,
  );
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedTab = activeTab ?? internalTab;
  const selectedItem =
    items.find((item) => item.id === selectedTab && !item.disabled) ??
    items.find((item) => !item.disabled);

  const selectTab = (id: string) => {
    if (activeTab === undefined) {
      setInternalTab(id);
    }
    onChange?.(id);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    const enabledIndexes = items
      .map((item, index) => (!item.disabled ? index : -1))
      .filter((index) => index !== -1);

    const position = enabledIndexes.indexOf(currentIndex);
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight") {
      nextIndex = enabledIndexes[(position + 1) % enabledIndexes.length];
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        enabledIndexes[
          (position - 1 + enabledIndexes.length) % enabledIndexes.length
        ];
    } else if (event.key === "Home") {
      nextIndex = enabledIndexes[0];
    } else if (event.key === "End") {
      nextIndex = enabledIndexes[enabledIndexes.length - 1];
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      const nextTab = items[nextIndex];
      selectTab(nextTab.id);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  if (!selectedItem) {
    return null;
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Content sections"
        className="flex gap-1 overflow-x-auto border-b border-border"
      >
        {items.map((item, index) => {
          const isSelected = item.id === selectedItem.id;

          return (
            <button
              key={item.id}
              ref={(element) => {
                buttonRefs.current[index] = element;
              }}
              id={`tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`panel-${item.id}`}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => selectTab(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "relative min-h-11 shrink-0 px-4 text-small font-semibold transition-colors focus-visible:rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                isSelected
                  ? "text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
                  : "text-muted hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        id={`panel-${selectedItem.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${selectedItem.id}`}
        tabIndex={0}
        className="py-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {selectedItem.content}
      </div>
    </div>
  );
}
