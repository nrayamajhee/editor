export function formatDate(date: string | Date | number) {
  const d =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(d);
}

export function formatTime(date: string | Date | number) {
  const d =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
  }).format(d);
}

export function formatRelativeDateTime(date: string | Date | number) {
  const d =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (daysDiff === 0 && now.getDate() === d.getDate()) {
    return `Today at ${formatTime(d)}`;
  }

  if (daysDiff === 1 || (daysDiff === 0 && now.getDate() !== d.getDate())) {
    return `Yesterday at ${formatTime(d)}`;
  }

  if (daysDiff < 7) {
    const dayName = Intl.DateTimeFormat("en-US", { weekday: "long" }).format(d);
    return `Last ${dayName} at ${formatTime(d)}`;
  }

  return `${formatDate(d)} at ${formatTime(d)}`;
}
