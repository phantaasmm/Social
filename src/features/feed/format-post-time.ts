const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatPostTime(value: string) {
  const timestamp = new Date(value).getTime();
  const differenceSeconds = Math.round((timestamp - Date.now()) / 1000);
  const absoluteSeconds = Math.abs(differenceSeconds);

  if (absoluteSeconds < 60) {
    return relativeTime.format(differenceSeconds, "second");
  }
  if (absoluteSeconds < 3600) {
    return relativeTime.format(Math.round(differenceSeconds / 60), "minute");
  }
  if (absoluteSeconds < 86400) {
    return relativeTime.format(Math.round(differenceSeconds / 3600), "hour");
  }
  if (absoluteSeconds < 604800) {
    return relativeTime.format(Math.round(differenceSeconds / 86400), "day");
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: new Date(value).getFullYear() === new Date().getFullYear()
      ? undefined
      : "numeric",
  }).format(new Date(value));
}
