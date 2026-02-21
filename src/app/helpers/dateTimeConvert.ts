import { format } from "date-fns";

export const convertDateTime = (date: Date): Date => {
  const dateStr = format(date, "yyyy-MM-dd");
  const timeStr = format(date, "HH:mm");

  // This forces the local digits (e.g., 03:00) to be stored as UTC (03:00Z)
  return new Date(`${dateStr}T${timeStr}:00Z`);
};
