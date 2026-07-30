import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LazyVideoProps {
  src: string;
  label: string;
}

export function LazyVideo({ src, label }: LazyVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = containerRef.current;

    if (!element || !("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="min-h-48 w-full bg-slate-950">
      {shouldLoad ? (
        <video
          src={src}
          controls
          preload="metadata"
          className="max-h-[520px] w-full bg-black object-contain"
          aria-label={label}
        />
      ) : (
        <div className="flex min-h-48 items-center justify-center text-white/75">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <Play size={22} fill="currentColor" aria-hidden="true" />
          </span>
          <span className="sr-only">Video loads when it nears the viewport</span>
        </div>
      )}
    </div>
  );
}
