export function parseIsoParts(value: string): {
  day: string;
  month: string;
  year: string;
} {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { day: "", month: "", year: "" };
  }

  const [year, month, day] = value.split("-");
  return {
    day: String(Number(day)),
    month: String(Number(month)),
    year,
  };
}

export function combineIsoParts(day: string, month: string, year: string): string {
  if (!day || !month || !year) {
    return "";
  }

  const dayNumber = Number(day);
  const monthNumber = Number(month);
  const yearNumber = Number(year);

  if (
    !Number.isInteger(dayNumber) ||
    !Number.isInteger(monthNumber) ||
    !Number.isInteger(yearNumber) ||
    year.length !== 4
  ) {
    return "";
  }

  return `${String(yearNumber).padStart(4, "0")}-${String(monthNumber).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
}

export function daysInMonth(month: number, year: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return 31;
  }

  if (!Number.isInteger(year) || year < 1) {
    return 31;
  }

  return new Date(year, month, 0).getDate();
}

export function buildYearOptions(currentYear = new Date().getFullYear()): number[] {
  const years: number[] = [];
  for (let year = currentYear; year >= 1900; year -= 1) {
    years.push(year);
  }
  return years;
}
