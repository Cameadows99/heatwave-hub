import {
  format,
  parseISO,
  getDay,
  startOfWeek,
  addDays,
  differenceInMinutes,
} from "date-fns";

export function groupEntriesByDate(entries: any[]) {
  const days: Record<string, any[]> = {};

  entries.forEach((entry) => {
    const clockIn = parseISO(entry.clockIn);
    const clockOut = entry.clockOut ? parseISO(entry.clockOut) : null;

    const dateKey = format(clockIn, "yyyy-MM-dd");

    const hours = clockOut
      ? +(differenceInMinutes(clockOut, clockIn) / 60).toFixed(2)
      : 0;

    if (!days[dateKey]) days[dateKey] = [];

    days[dateKey].push({
      id: entry.id,
      clockIn,
      clockOut,
      hours,
    });
  });

  return days;
}

export function groupEntriesByWeek(entries: any[]) {
  const weeks: Record<string, any> = {};

  entries.forEach((entry) => {
    const inDate = parseISO(entry.clockIn);
    const outDate = entry.clockOut ? parseISO(entry.clockOut) : null;

    const weekStart = startOfWeek(inDate, { weekStartsOn: 1 });
    const weekKey = format(weekStart, "yyyy-MM-DD");

    const dayIndex = getDay(inDate);
    const dayName = format(
      addDays(weekStart, dayIndex === 0 ? 6 : dayIndex - 1),
      "EEEE"
    );

    if (!weeks[weekKey]) {
      weeks[weekKey] = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        totalHours: 0,
      };
    }

    const hours = outDate
      ? +(differenceInMinutes(outDate, inDate) / 60).toFixed(2)
      : 0;

    weeks[weekKey][dayName].push({
      clockIn: inDate,
      clockOut: outDate,
      id: entry.id,
      hours,
    });

    weeks[weekKey].totalHours += hours;
  });

  return weeks;
}
