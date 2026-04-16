import { describe, expect, it } from "vitest";

import {
  getModeDepartureTimeIso,
  isModeRouteFresh,
  modeUsesTimePreset,
} from "@/lib/route-timing";

describe("route timing helpers", () => {
  it("treats bike and car as time-of-day-sensitive modes", () => {
    expect(modeUsesTimePreset("bike")).toBe(true);
    expect(modeUsesTimePreset("car")).toBe(true);
    expect(modeUsesTimePreset("walk")).toBe(false);
  });

  it("generates a departure time for bike and car presets only", () => {
    expect(getModeDepartureTimeIso("bike", "morningRush")).toBeTruthy();
    expect(getModeDepartureTimeIso("car", "eveningRush")).toBeTruthy();
    expect(getModeDepartureTimeIso("walk", "auto")).toBeUndefined();
  });

  it("marks cached routes stale when their time preset no longer matches", () => {
    expect(isModeRouteFresh("bike", { timePreset: "morningRush" }, "morningRush")).toBe(true);
    expect(isModeRouteFresh("bike", { timePreset: "auto" }, "eveningRush")).toBe(false);
    expect(isModeRouteFresh("car", { timePreset: "auto" }, "eveningRush")).toBe(false);
    expect(isModeRouteFresh("walk", {}, "eveningRush")).toBe(true);
    expect(isModeRouteFresh("walk", null, "auto")).toBe(false);
  });
});
