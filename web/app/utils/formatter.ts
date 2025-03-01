export function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(d);
}

export function formatTime(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
  }).format(d);
}
