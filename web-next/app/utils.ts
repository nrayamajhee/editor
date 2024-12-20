import { useEffect, useState } from "react";
import { env } from "./env";
import { useAuth } from "@clerk/remix";

export function formatDate(date: string | Date) {
  let d = typeof date === "string" ? new Date(date) : date;
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
    hour: "numeric",
    minute: "numeric",
  }).format(d);
}

export function formatTime(date: string | Date) {
  let d = typeof date === "string" ? new Date(date) : date;
  return Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
  }).format(d);
}

