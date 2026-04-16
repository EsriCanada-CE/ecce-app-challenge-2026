import { describe, expect, it } from "vitest";

import {
  formatDurationCompact,
  getModeImpactCo2Kg,
  getModeSeconds,
  getRouteDashboardInsight,
} from "@/lib/route-insights";

const MASS_COMPARISON_PATTERN =
  /concert grand piano|vending machine|adult moose|sport motorcycle/;

describe("route insights", () => {
  it("derives bike impact metrics from the selected trip", () => {
    const insight = getRouteDashboardInsight({
      mode: "bike",
      distanceMeters: 8_400,
      drivingDurationSeconds: 1_440,
    });

    expect(insight.title).toBe("Bike-share impact");
    expect(insight.co2Label).toBe("CO2 saved");
    expect(insight.co2Value).toBe("1.4 kg");
    expect(insight.caloriesValue).toBe("311");
    expect(insight.cardioValue).toBe("33 min");
    expect(insight.cardioNote).toContain("22%");
    expect(insight.cardioNote).toContain("slower than driving");
    expect(insight.tips[0]?.text).toMatch(MASS_COMPARISON_PATTERN);
  });

  it("surfaces the downside of driving for the same route", () => {
    const insight = getRouteDashboardInsight({
      mode: "car",
      distanceMeters: 8_400,
      drivingDurationSeconds: 1_440,
    });

    expect(insight.title).toBe("Driving impact");
    expect(insight.co2Label).toBe("CO2 emitted");
    expect(insight.co2Value).toBe("1.4 kg");
    expect(insight.cardioValue).toBe("0 min");
    expect(insight.cardioNote).toContain("faster than biking");
    expect(insight.tips[0]?.text).toContain("511 kg");
    expect(insight.tips[0]?.text).toMatch(MASS_COMPARISON_PATTERN);
  });

  it("keeps duration formatting consistent across tray modes", () => {
    expect(getModeSeconds("walk", 8_400, 1_440)).toBe(6_000);
    expect(getModeSeconds("car", 8_400, 1_440, { car: 1_620 })).toBe(1_620);
    expect(getModeSeconds("bike", 8_400, 1_440, { bike: 2_460 })).toBe(2_460);
    expect(formatDurationCompact(6_000)).toBe("1h 40m");
  });

  it("uses avoided emissions for active trips and emitted emissions for driving", () => {
    expect(getModeImpactCo2Kg("bike", 8_400)).toBe(1.4);
    expect(getModeImpactCo2Kg("walk", 8_400)).toBe(1.4);
    expect(getModeImpactCo2Kg("car", 8_400)).toBe(1.4);
  });
});
