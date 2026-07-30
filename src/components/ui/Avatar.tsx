import { useEffect, useState } from "react";
import { cn } from "../../lib/cn";

type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  status?: "online" | "offline";
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-small",
  lg: "h-12 w-12 text-body",
  xl: "h-20 w-20 text-h2",
};

const statusClasses: Record<AvatarSize, string> = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
  xl: "h-4 w-4",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function Avatar({
  src,
  name,
  size = "md",
  status,
  className,
}: AvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const showImage = src && !hasImageError;

  useEffect(() => {
    setHasImageError(false);
  }, [src]);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-1 ring-inset ring-primary/10",
        sizeClasses[size],
        className,
      )}
      aria-label={name}
      role="img"
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          className="h-full w-full rounded-full object-cover"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name) || "?"}</span>
      )}
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-surface",
            statusClasses[size],
            status === "online" ? "bg-success" : "bg-muted",
          )}
          aria-label={status}
        />
      )}
    </span>
  );
}
