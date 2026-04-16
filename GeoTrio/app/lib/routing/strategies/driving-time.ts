const TORONTO_TIME_ZONE = "America/Toronto";
const TORONTO_WEDNESDAY_INDEX = 3;
const TORONTO_WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const SHARED_DRIVING_TIME_MULTIPLIERS = {
  "00:00": 1.316,
  "00:30": 1.316,
  "01:00": 1.322,
  "01:30": 1.322,
  "02:00": 1.304,
  "02:30": 1.304,
  "03:00": 1.217,
  "03:30": 1.217,
  "04:00": 1.022,
  "04:30": 1.022,
  "05:00": 1,
  "05:30": 1,
  "06:00": 1.127,
  "06:30": 1.127,
  "07:00": 1.549,
  "07:30": 1.549,
  "08:00": 1.96,
  "08:30": 1.96,
  "09:00": 1.853,
  "09:30": 1.853,
  "10:00": 1.793,
  "10:30": 1.703,
  "11:00": 1.799,
  "11:30": 1.799,
  "12:00": 2.022,
  "12:30": 2.022,
  "13:00": 2.055,
  "13:30": 2.055,
  "14:00": 2.159,
  "14:30": 2.159,
  "15:00": 2.185,
  "15:30": 2.185,
  "16:00": 2.224,
  "16:30": 2.224,
  "17:00": 2.25,
  "17:30": 2.25,
  "18:00": 2.128,
  "18:30": 2.128,
  "19:00": 1.896,
  "19:30": 1.801,
  "20:00": 1.653,
  "20:30": 1.653,
  "21:00": 1.606,
  "21:30": 1.606,
  "22:00": 1.584,
  "22:30": 1.584,
  "23:00": 1.522,
  "23:30": 1.522,
} as const;

export const DRIVING_TIME_MULTIPLIERS = {
  weekday: SHARED_DRIVING_TIME_MULTIPLIERS,
  weekend: SHARED_DRIVING_TIME_MULTIPLIERS,
} as const;

const DRIVING_DAY_TYPE_AVERAGES = {
  weekday: calculateAverageMultiplier(Object.values(DRIVING_TIME_MULTIPLIERS.weekday)),
  weekend: calculateAverageMultiplier(Object.values(DRIVING_TIME_MULTIPLIERS.weekend)),
} as const;

export type DrivingDayType = keyof typeof DRIVING_TIME_MULTIPLIERS;
type DrivingTimeBucket = keyof (typeof DRIVING_TIME_MULTIPLIERS)["weekday"];
export type DrivingTimePreset = "auto" | "morningRush" | "eveningRush";

const torontoTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TORONTO_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function resolveDrivingDepartureTime(departureTimeIso?: string, now = new Date()) {
  return departureTimeIso ? new Date(departureTimeIso) : now;
}

export function getDrivingTimeOfDayMultiplier(departureTimeIso?: string, now = new Date()) {
  return getDrivingTimeOfDayMultiplierForDate(
    resolveDrivingDepartureTime(departureTimeIso, now),
  );
}

export function getDrivingTimeOfDayMultiplierForDate(date: Date) {
  const dayType = getDrivingDayTypeForDate(date);
  const bucket = getDrivingTimeBucket(date);

  return DRIVING_TIME_MULTIPLIERS[dayType][bucket];
}

export function getDrivingRelativeTimeOfDayMultiplierForDate(date: Date) {
  const dayType = getDrivingDayTypeForDate(date);

  return getDrivingTimeOfDayMultiplierForDate(date) / DRIVING_DAY_TYPE_AVERAGES[dayType];
}

export function getDrivingTimeBucket(date: Date): DrivingTimeBucket {
  const { hour, minute } = getTorontoLocalTimeParts(date);
  const bucketMinute = minute >= 30 ? "30" : "00";

  return `${hour.toString().padStart(2, "0")}:${bucketMinute}` as DrivingTimeBucket;
}

export function getDrivingPresetDepartureTimeIso(
  preset: DrivingTimePreset,
  now = new Date(),
) {
  if (preset === "auto") {
    return undefined;
  }

  const { year, month, day, weekday } = getTorontoLocalTimeParts(now);
  const nextWednesdayDate = getNextTorontoWednesdayDate({
    year,
    month,
    day,
    weekday,
  });
  const targetHour = preset === "morningRush" ? 8 : 17;
  const targetMinute = 30;

  return getTorontoDateTimeIso({
    year: nextWednesdayDate.year,
    month: nextWednesdayDate.month,
    day: nextWednesdayDate.day,
    hour: targetHour,
    minute: targetMinute,
  });
}

export function getDrivingPresetLabel(preset: DrivingTimePreset) {
  if (preset === "morningRush") {
    return "Morning rush";
  }

  if (preset === "eveningRush") {
    return "Evening rush";
  }

  return "Current time";
}

export function getDrivingDayTypeForDate(date: Date): DrivingDayType {
  const { weekday } = getTorontoLocalTimeParts(date);

  return weekday === "Sat" || weekday === "Sun" ? "weekend" : "weekday";
}

function getTorontoLocalTimeParts(date: Date) {
  const parts = torontoTimeFormatter.formatToParts(date);
  const year = Number(getRequiredDatePart(parts, "year"));
  const month = Number(getRequiredDatePart(parts, "month"));
  const day = Number(getRequiredDatePart(parts, "day"));
  const weekday = getRequiredDatePart(parts, "weekday");
  const hour = Number(getRequiredDatePart(parts, "hour"));
  const minute = Number(getRequiredDatePart(parts, "minute"));

  return {
    year,
    month,
    day,
    weekday,
    hour,
    minute,
  };
}

function getNextTorontoWednesdayDate({
  year,
  month,
  day,
  weekday,
}: {
  year: number;
  month: number;
  day: number;
  weekday: string;
}) {
  const weekdayIndex = TORONTO_WEEKDAY_INDEX[weekday];

  if (weekdayIndex === undefined) {
    throw new Error(`Unsupported Toronto weekday "${weekday}" while resolving rush presets.`);
  }

  const offsetDays = (TORONTO_WEDNESDAY_INDEX - weekdayIndex + 7) % 7;
  const nextWednesday = new Date(Date.UTC(year, month - 1, day + offsetDays));

  return {
    year: nextWednesday.getUTCFullYear(),
    month: nextWednesday.getUTCMonth() + 1,
    day: nextWednesday.getUTCDate(),
  };
}

function getTorontoDateTimeIso({
  year,
  month,
  day,
  hour,
  minute,
}: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}) {
  let candidate = new Date(Date.UTC(year, month - 1, day, hour, minute));

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const actual = getTorontoLocalTimeParts(candidate);
    const actualDaySerial = Date.UTC(actual.year, actual.month - 1, actual.day) / 86_400_000;
    const targetDaySerial = Date.UTC(year, month - 1, day) / 86_400_000;
    const actualMinutes = (actualDaySerial * 1_440) + (actual.hour * 60) + actual.minute;
    const targetMinutes = (targetDaySerial * 1_440) + (hour * 60) + minute;
    const diffMinutes = actualMinutes - targetMinutes;

    if (diffMinutes === 0) {
      return candidate.toISOString();
    }

    candidate = new Date(candidate.getTime() - (diffMinutes * 60_000));
  }

  return candidate.toISOString();
}

function getRequiredDatePart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) {
  const part = parts.find((candidate) => candidate.type === type)?.value;

  if (!part) {
    throw new Error(`Missing ${type} while resolving Toronto local time.`);
  }

  return part;
}

function calculateAverageMultiplier(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}
