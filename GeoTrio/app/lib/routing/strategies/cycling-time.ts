const TORONTO_TIME_ZONE = "America/Toronto";

export const CYCLING_TIME_MULTIPLIERS = {
  "00:00": 1,
  "00:30": 1,
  "01:00": 1,
  "01:30": 1,
  "02:00": 1,
  "02:30": 1,
  "03:00": 1,
  "03:30": 1,
  "04:00": 1,
  "04:30": 1,
  "05:00": 1,
  "05:30": 1.002,
  "06:00": 1.008,
  "06:30": 1.018,
  "07:00": 1.032,
  "07:30": 1.048,
  "08:00": 1.062,
  "08:30": 1.068,
  "09:00": 1.058,
  "09:30": 1.045,
  "10:00": 1.032,
  "10:30": 1.026,
  "11:00": 1.022,
  "11:30": 1.02,
  "12:00": 1.02,
  "12:30": 1.021,
  "13:00": 1.022,
  "13:30": 1.023,
  "14:00": 1.024,
  "14:30": 1.026,
  "15:00": 1.03,
  "15:30": 1.036,
  "16:00": 1.044,
  "16:30": 1.054,
  "17:00": 1.062,
  "17:30": 1.066,
  "18:00": 1.058,
  "18:30": 1.046,
  "19:00": 1.034,
  "19:30": 1.024,
  "20:00": 1.016,
  "20:30": 1.01,
  "21:00": 1.006,
  "21:30": 1.004,
  "22:00": 1.002,
  "22:30": 1.001,
  "23:00": 1,
  "23:30": 1,
} as const;

type CyclingTimeBucket = keyof typeof CYCLING_TIME_MULTIPLIERS;

const torontoTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TORONTO_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function resolveCyclingDepartureTime(departureTimeIso?: string, now = new Date()) {
  return departureTimeIso ? new Date(departureTimeIso) : now;
}

export function getCyclingTimeOfDayMultiplier(departureTimeIso?: string, now = new Date()) {
  return getCyclingTimeOfDayMultiplierForDate(resolveCyclingDepartureTime(departureTimeIso, now));
}

export function getCyclingTimeOfDayMultiplierForDate(date: Date) {
  return CYCLING_TIME_MULTIPLIERS[getCyclingTimeBucket(date)];
}

export function getCyclingTimeBucket(date: Date): CyclingTimeBucket {
  const parts = torontoTimeFormatter.formatToParts(date);
  const hour = Number(getRequiredDatePart(parts, "hour"));
  const minute = Number(getRequiredDatePart(parts, "minute"));
  const bucketMinute = minute >= 30 ? "30" : "00";

  return `${hour.toString().padStart(2, "0")}:${bucketMinute}` as CyclingTimeBucket;
}

function getRequiredDatePart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) {
  const part = parts.find((candidate) => candidate.type === type)?.value;

  if (!part) {
    throw new Error(`Missing ${type} while resolving Toronto cycling time.`);
  }

  return part;
}
