import { describe, expect, it } from "vitest";

import {
  getDrivingCostFactors,
  getDrivingRoadType,
  getDrivingRoadTypeTrafficMultiplierForDate,
  getDrivingRouteLevelTrafficMultiplierForDate,
  getDrivingWeatherMultiplier,
} from "@/lib/routing/strategies/driving-conditions";

describe("driving conditions", () => {
  it("uses the direct speed-based 30-minute traffic multiplier", () => {
    const multiplier = getDrivingRouteLevelTrafficMultiplierForDate(
      new Date("2026-03-30T12:44:00Z"),
    );

    expect(multiplier).toBeCloseTo(1.96, 3);
  });

  it("maps speed limits into road-type proxy buckets", () => {
    expect(getDrivingRoadType(90)).toBe("highway");
    expect(getDrivingRoadType(60)).toBe("arterial");
    expect(getDrivingRoadType(40)).toBe("local");
  });

  it("applies weekday per-road-type adjustments relative to the overall curve", () => {
    const date = new Date("2026-03-30T12:44:00Z");

    expect(getDrivingRoadTypeTrafficMultiplierForDate("highway", date)).toBe(0.91);
    expect(getDrivingRoadTypeTrafficMultiplierForDate("arterial", date)).toBe(0.974);
    expect(getDrivingRoadTypeTrafficMultiplierForDate("local", date)).toBe(1.017);
  });

  it("derives weather multipliers from current conditions", () => {
    expect(
      getDrivingWeatherMultiplier({
        time: "2026-03-30T08:44",
        temperatureC: 7,
        apparentTemperatureC: 5,
        precipitationMm: 3,
        windSpeedKmh: 18,
        weatherCode: 63,
        isDay: true,
      }),
    ).toBe(1.2);
    expect(
      getDrivingWeatherMultiplier({
        time: "2026-03-30T08:44",
        temperatureC: -3,
        apparentTemperatureC: -8,
        precipitationMm: 6,
        windSpeedKmh: 38,
        weatherCode: 86,
        isDay: true,
      }),
    ).toBe(1.92);
  });

  it("packages route-level traffic and weather into solve-time cost factors", () => {
    const costFactors = getDrivingCostFactors("2026-03-30T12:44:00Z", {
      time: "2026-03-30T08:44",
      temperatureC: 7,
      apparentTemperatureC: 5,
      precipitationMm: 3,
      windSpeedKmh: 18,
      weatherCode: 63,
      isDay: true,
    });

    expect(costFactors.routeLevelTrafficMultiplier).toBeCloseTo(1.96, 3);
    expect(costFactors.weatherMultiplier).toBe(1.2);
  });
});
