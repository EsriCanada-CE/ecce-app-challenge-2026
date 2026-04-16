import { describe, expect, it, vi } from "vitest";

import {
  getCyclingTimeBucket,
  getCyclingTimeOfDayMultiplier,
  getCyclingTimeOfDayMultiplierForDate,
  resolveCyclingDepartureTime,
} from "@/lib/routing/strategies/cycling-time";

describe("cycling time utilities", () => {
  it("maps Toronto local times into 30-minute buckets", () => {
    const date = new Date("2026-03-30T12:44:00Z");

    expect(getCyclingTimeBucket(date)).toBe("08:30");
    expect(getCyclingTimeOfDayMultiplierForDate(date)).toBe(1.068);
  });

  it("uses the current time when no override is provided", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T21:10:00Z"));

    expect(resolveCyclingDepartureTime()).toEqual(new Date("2026-03-30T21:10:00Z"));
    expect(getCyclingTimeOfDayMultiplier()).toBe(1.062);

    vi.useRealTimers();
  });

  it("uses the supplied override time when present", () => {
    expect(getCyclingTimeOfDayMultiplier("2026-03-30T13:05:00Z")).toBe(1.058);
  });
});
