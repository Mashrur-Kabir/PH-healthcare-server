import { isValid, parse } from "date-fns";

/**
 * Converts a string (yyyy-MM-dd) to a JS Date object.
 * Renamed to parseDateString to avoid confusion with Schedule DateTime helpers.
 */
export const parseDateString = (
  dateString: string | undefined,
): Date | undefined => {
  if (!dateString) return undefined;

  // For date-fns v3+, the reference date is the 3rd argument inside an object,
  // or just use the native Date constructor for ISO strings.
  const date = parse(dateString, "yyyy-MM-dd", new Date());

  if (!isValid(date)) return undefined;

  return date;
};
