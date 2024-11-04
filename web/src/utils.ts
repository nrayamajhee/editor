export const formatDate = (date: string | Date) => {
  let d = typeof date === "string" ? new Date(date) : date;
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
    hour: "numeric",
    minute: "numeric",
  }).format(d);
};
