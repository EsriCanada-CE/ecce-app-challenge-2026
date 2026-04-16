import type { RoutingEdge } from "@/lib/routing/contracts";
import type { WeatherApiSuccess } from "@/lib/route-types";
import {
  getDrivingDayTypeForDate,
  getDrivingTimeOfDayMultiplierForDate,
  getDrivingTimeBucket,
  resolveDrivingDepartureTime,
} from "@/lib/routing/strategies/driving-time";

export type DrivingRoadType = "highway" | "arterial" | "local";

export type DrivingCostFactors = {
  departureDate: Date;
  routeLevelTrafficMultiplier: number;
  weatherMultiplier: number;
};

const WEEKDAY_ROAD_TYPE_RELATIVE_MULTIPLIERS = {
  highway: {
    "00:00": 0.999, "00:30": 0.996, "01:00": 0.996, "01:30": 0.996, "02:00": 0.998, "02:30": 0.996,
    "03:00": 0.997, "03:30": 1, "04:00": 1.008, "04:30": 1.007, "05:00": 1, "05:30": 1.001,
    "06:00": 0.995, "06:30": 0.989, "07:00": 0.961, "07:30": 0.961, "08:00": 0.916, "08:30": 0.91,
    "09:00": 0.928, "09:30": 0.925, "10:00": 0.927, "10:30": 0.918, "11:00": 0.906, "11:30": 0.911,
    "12:00": 0.902, "12:30": 0.896, "13:00": 0.897, "13:30": 0.901, "14:00": 0.891, "14:30": 0.892,
    "15:00": 0.887, "15:30": 0.896, "16:00": 0.897, "16:30": 0.9, "17:00": 0.897, "17:30": 0.923,
    "18:00": 0.922, "18:30": 0.926, "19:00": 0.927, "19:30": 0.928, "20:00": 0.931, "20:30": 0.93,
    "21:00": 0.929, "21:30": 0.93, "22:00": 0.928, "22:30": 0.928, "23:00": 0.93, "23:30": 0.934,
  },
  arterial: {
    "00:00": 0.998, "00:30": 0.997, "01:00": 0.997, "01:30": 0.998, "02:00": 0.999, "02:30": 0.998,
    "03:00": 0.999, "03:30": 1.002, "04:00": 1.004, "04:30": 1.003, "05:00": 1, "05:30": 0.999,
    "06:00": 0.996, "06:30": 0.996, "07:00": 0.974, "07:30": 0.975, "08:00": 0.982, "08:30": 0.974,
    "09:00": 0.975, "09:30": 0.978, "10:00": 0.985, "10:30": 0.985, "11:00": 0.98, "11:30": 0.986,
    "12:00": 0.98, "12:30": 0.987, "13:00": 0.985, "13:30": 0.987, "14:00": 0.984, "14:30": 0.974,
    "15:00": 0.986, "15:30": 0.975, "16:00": 0.975, "16:30": 0.978, "17:00": 0.977, "17:30": 0.979,
    "18:00": 0.99, "18:30": 0.958, "19:00": 0.992, "19:30": 0.99, "20:00": 0.99, "20:30": 0.99,
    "21:00": 0.989, "21:30": 0.988, "22:00": 0.985, "22:30": 0.983, "23:00": 0.986, "23:30": 0.988,
  },
  local: {
    "00:00": 1.007, "00:30": 1.005, "01:00": 1.006, "01:30": 1.005, "02:00": 1.005, "02:30": 1.005,
    "03:00": 1.003, "03:30": 0.997, "04:00": 0.993, "04:30": 0.996, "05:00": 1, "05:30": 1.003,
    "06:00": 1.008, "06:30": 1.013, "07:00": 1.027, "07:30": 1.017, "08:00": 1.02, "08:30": 1.017,
    "09:00": 1.015, "09:30": 1.01, "10:00": 0.995, "10:30": 0.989, "11:00": 0.993, "11:30": 0.994,
    "12:00": 1.004, "12:30": 1.002, "13:00": 1.011, "13:30": 1.012, "14:00": 1.013, "14:30": 1.026,
    "15:00": 1.033, "15:30": 1.039, "16:00": 1.039, "16:30": 1.04, "17:00": 1.027, "17:30": 1.033,
    "18:00": 1.032, "18:30": 1.019, "19:00": 1.019, "19:30": 1.026, "20:00": 1.026, "20:30": 1.025,
    "21:00": 1.026, "21:30": 1.026, "22:00": 1.025, "22:30": 1.024, "23:00": 1.018, "23:30": 1.013,
  },
} as const;

export function getDrivingCostFactors(
  departureTimeIso?: string,
  weather?: WeatherApiSuccess,
  now = new Date(),
): DrivingCostFactors {
  const departureDate = resolveDrivingDepartureTime(departureTimeIso, now);

  return {
    departureDate,
    routeLevelTrafficMultiplier: getDrivingRouteLevelTrafficMultiplierForDate(departureDate),
    weatherMultiplier: getDrivingWeatherMultiplier(weather),
  };
}

export function getDrivingRouteLevelTrafficMultiplierForDate(date: Date) {
  return getDrivingTimeOfDayMultiplierForDate(date);
}

export function getDrivingRoadType(speedKph?: number | null): DrivingRoadType {
  const normalizedSpeedKph =
    typeof speedKph === "number" && Number.isFinite(speedKph) && speedKph > 0 ? speedKph : 50;

  if (normalizedSpeedKph >= 80) {
    return "highway";
  }

  if (normalizedSpeedKph >= 50) {
    return "arterial";
  }

  return "local";
}

export function getDrivingEdgeTrafficMultiplier(
  edge: Pick<RoutingEdge, "speedKph" | "roadType">,
  date: Date,
) {
  const roadType = edge.roadType ?? getDrivingRoadType(edge.speedKph);

  return getDrivingRoadTypeTrafficMultiplierForDate(roadType, date);
}

export function getDrivingRoadTypeTrafficMultiplierForDate(roadType: DrivingRoadType, date: Date) {
  if (getDrivingDayTypeForDate(date) !== "weekday") {
    return 1;
  }

  return WEEKDAY_ROAD_TYPE_RELATIVE_MULTIPLIERS[roadType][getDrivingTimeBucket(date)];
}

export function getDrivingWeatherMultiplier(weather?: WeatherApiSuccess) {
  if (!weather) {
    return 1;
  }

  let multiplier = 1;
  const { precipitationMm, weatherCode, windSpeedKmh } = weather;

  if (weatherCode === 45 || weatherCode === 48) {
    multiplier = Math.max(multiplier, 1.125);
  }

  if ([71, 77, 85].includes(weatherCode)) {
    multiplier = Math.max(multiplier, 1.12);
  }

  if ([73, 75, 86].includes(weatherCode)) {
    multiplier = Math.max(multiplier, precipitationMm >= 5 || windSpeedKmh >= 35 ? 1.9 : 1.45);
  }

  if ([51, 53, 61, 80].includes(weatherCode)) {
    multiplier = Math.max(multiplier, precipitationMm >= 2 ? 1.2 : 1.16);
  }

  if ([55, 56, 57, 63, 65, 66, 67, 81, 82, 95, 96, 99].includes(weatherCode)) {
    multiplier = Math.max(multiplier, precipitationMm >= 7 || windSpeedKmh >= 40 ? 1.25 : 1.2);
  }

  if (windSpeedKmh >= 50 && multiplier > 1) {
    multiplier += 0.03;
  } else if (windSpeedKmh >= 35 && multiplier > 1) {
    multiplier += 0.02;
  }

  return Number(multiplier.toFixed(3));
}
