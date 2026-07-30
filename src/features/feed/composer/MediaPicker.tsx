import { ImagePlus, Trash2, UploadCloud, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "../feed-limits";

interface MediaPickerProps {
  type: "image" | "video";
  value: File | null;
  onChange: (file: File | null) => void;
  onError: (message: string | null) => void;
  disabled?: boolean;
}

export function MediaPicker({
  type,
  value,
  onChange,
  onError,
  disabled,
}: MediaPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl],
  );

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const acceptedTypes =
      type === "image" ? ACCEPTED_IMAGE_TYPES : ACCEPTED_VIDEO_TYPES;
    const maxBytes = type === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
    const maxLabel = type === "image" ? "10 MB" : "50 MB";

    if (!acceptedTypes.has(file.type)) {
      onError(
        type === "image"
          ? "Choose a JPG, PNG, WebP, or GIF image."
          : "Choose an MP4, WebM, or Ogg video.",
      );
      return;
    }

    if (file.size > maxBytes) {
      onError(`${type === "image" ? "Images" : "Videos"} must be ${maxLabel} or smaller.`);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    onError(null);
    onChange(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onChange(null);
    onError(null);
  };

  const Icon = type === "image" ? ImagePlus : Video;

  return (
    <div>
      <p className="mb-2 text-small font-semibold text-foreground">
        {type === "image" ? "Image" : "Video"}
      </p>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={
          type === "image"
            ? "image/jpeg,image/png,image/webp,image/gif"
            : "video/mp4,video/webm,video/ogg"
        }
        onChange={handleFile}
        disabled={disabled}
      />

      {value && previewUrl ? (
        <div className="overflow-hidden rounded-card border border-border bg-surface-2">
          {type === "image" ? (
            <img
              src={previewUrl}
              alt="Selected upload preview"
              className="max-h-80 w-full object-contain"
              loading="lazy"
            />
          ) : (
            <video
              src={previewUrl}
              controls
              preload="metadata"
              className="max-h-80 w-full bg-black object-contain"
            />
          )}
          <div className="flex flex-col gap-3 border-t border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-small font-semibold text-foreground">
                {value.name}
              </p>
              <p className="text-xs text-muted">
                {(value.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 size={16} aria-hidden="true" />}
              onClick={clearFile}
              disabled={disabled}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex min-h-40 w-full flex-col items-center justify-center rounded-card border border-dashed border-border bg-surface-2 px-6 text-center transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-primary shadow-sm">
            <Icon size={23} aria-hidden="true" />
          </span>
          <span className="mt-3 text-small font-semibold text-foreground">
            Choose {type}
          </span>
          <span className="mt-1 text-xs text-muted">
            {type === "image"
              ? "JPG, PNG, WebP or GIF · up to 10 MB"
              : "MP4, WebM or Ogg · up to 50 MB"}
          </span>
          <UploadCloud
            size={16}
            className="mt-3 text-muted"
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}
