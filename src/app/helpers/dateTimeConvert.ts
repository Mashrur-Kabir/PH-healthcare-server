import { format, isValid, parse } from "date-fns";
//Use for: Appointment slots, Doctor schedules.
/**
 * Converts an existing Date Object into a new Date Object formatted to a specific time string.
 * This is usually used to "normalize" or strip seconds/milliseconds from a date.
 */
export const convertDateTime = (date: Date): Date => {
  const dateStr = format(date, "yyyy-MM-dd");
  const timeStr = format(date, "HH:mm");

  return new Date(`${dateStr}T${timeStr}:00`); //add "Z" after 00 if testing goes wrong
};

//Use for: Date of Birth, Medical Report dates.
/**
 * Converts a string (yyyy-MM-dd) to a JS Date object.
 * Renamed to parseDateString to avoid confusion with Schedule DateTime helpers.
 */
export const parseDateString = (
  dateString: string | undefined,
): Date | undefined => {
  if (!dateString) return undefined;

  const date = parse(dateString, "yyyy-MM-dd", new Date());

  if (!isValid(date)) return undefined;

  return date;
};

// for latest version of date-fns:
// export const parseDateString = (
//   dateString: string | undefined,
// ): Date | undefined => {
//   if (!dateString) return undefined;

//   const date = new Date(dateString);

//   if (isNaN(date.getTime())) return undefined;

//   return date;
// };
