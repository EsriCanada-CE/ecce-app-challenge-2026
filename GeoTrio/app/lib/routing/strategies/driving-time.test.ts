import { describe, expect, it, vi } from "vitest";

import {
  getDrivingPresetDepartureTimeIso,
  getDrivingPresetLabel,
  getDrivingTimeBucket,
  getDrivingTimeOfDayMultiplier,
  getDrivingTimeOfDayMultiplierForDate,
  resolveDrivingDepartureTime,
} from "@/lib/routing/strategies/driving-time";

describe("driving time utilities", () => {
  it("maps weekday Toronto local times into 30-minute buckets", () => {
    const date = new Date("2026-03-30T12:44:00Z");

    expect(getDrivingTimeBucket(date)).toBe("08:30");
    expect(getDrivingTimeOfDayMultiplierForDate(date)).toBe(1.96);
  });

  it("uses weekend multipliers for Toronto local weekend dates", () => {
    const date = new Date("2026-03-29T12:10:00Z");

    expect(getDrivingTimeBucket(date)).toBe("08:00");
    expect(getDrivingTimeOfDayMultiplierForDate(date)).toBe(1.96);
  });

  it("uses the current time when no override is provided", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T21:10:00Z"));

    expect(resolveDrivingDepartureTime()).toEqual(new Date("2026-03-30T21:10:00Z"));
    expect(getDrivingTimeOfDayMultiplier()).toBe(2.25);

    vi.useRealTimers();
  });

  it("uses the supplied override time when present", () => {
    expect(getDrivingTimeOfDayMultiplier("2026-03-30T13:05:00Z")).toBe(1.853);
  });

  it("builds Toronto rush presets on the next Wednesday peak window", () => {
    expect(getDrivingPresetDepartureTimeIso("morningRush", new Date("2026-03-29T14:00:00Z")))
      .toBe("2026-04-01T12:30:00.000Z");
    expect(getDrivingPresetDepartureTimeIso("eveningRush", new Date("2026-03-30T14:00:00Z")))
      .toBe("2026-04-01T21:30:00.000Z");
    expect(getDrivingPresetDepartureTimeIso("morningRush", new Date("2026-04-01T14:00:00Z")))
      .toBe("2026-04-01T12:30:00.000Z");
  });

  it("returns a human label for each timing preset", () => {
    expect(getDrivingPresetLabel("auto")).toBe("Current time");
    expect(getDrivingPresetLabel("morningRush")).toBe("Morning rush");
    expect(getDrivingPresetLabel("eveningRush")).toBe("Evening rush");
  });
});
