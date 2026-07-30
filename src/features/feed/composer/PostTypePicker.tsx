import {
  CircleHelp,
  FileText,
  Image,
  ListChecks,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../../lib/cn";
import type { Post } from "../../../lib/database.types";

interface TypeOption {
  value: Post["type"];
  label: string;
  icon: LucideIcon;
}

const options: TypeOption[] = [
  { value: "text", label: "Text", icon: FileText },
  { value: "image", label: "Image", icon: Image },
  { value: "video", label: "Video", icon: Video },
  { value: "poll", label: "Poll", icon: ListChecks },
  { value: "question", label: "Question", icon: CircleHelp },
];

interface PostTypePickerProps {
  value: Post["type"];
  onChange: (type: Post["type"]) => void;
  disabled?: boolean;
}

export function PostTypePicker({
  value,
  onChange,
  disabled,
}: PostTypePickerProps) {
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-2 text-small font-semibold text-foreground">
        Post type
      </legend>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-foreground",
              )}
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
            >
              <Icon size={19} aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
