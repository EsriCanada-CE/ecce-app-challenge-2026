type UiRouteIcon = "bike" | "walk" | "car";

export type RouteMode = "bike" | "walk" | "car";

export type RouteModeConfig = {
  label: string;
  icon: UiRouteIcon;
  title: string;
  activeLabel: string;
};

export type RouteDashboardInsight = {
  title: string;
  subtitle: string;
  co2Value: string;
  co2Label: string;
  caloriesValue: string;
  cardioValue: string;
  cardioNote: string;
  tips: Array<{
    tone: "primary" | "secondary";
    text: string;
  }>;
  actionLabel: string;
};

export type RouteDurationOverrides = Partial<Record<RouteMode, number | null>>;

const METERS_PER_SECOND: Record<RouteMode, number> = {
  bike: 4.2,
  walk: 1.4,
  car: 8.33,
};

const ACTIVE_MET: Record<RouteMode, number> = {
  bike: 8,
  walk: 3.8,
  car: 0,
};

const CO2_KG_PER_KM_CAR = 0.17;
const DAILY_COMMUTE_DAYS_PER_YEAR = 365;
const WEEKLY_ACTIVITY_GOAL_MINUTES = 150;
const ASSUMED_RIDER_WEIGHT_KG = 70;
const MASS_EQUIVALENT_COMPARISONS = [
  { unitKg: 450, singular: "concert grand piano", plural: "concert grand pianos" },
  { unitKg: 320, singular: "vending machine", plural: "vending machines" },
  { unitKg: 380, singular: "adult moose", plural: "adult moose" },
  { unitKg: 210, singular: "sport motorcycle", plural: "sport motorcycles" },
];

export const ALL_ROUTE_MODES: RouteMode[] = ["bike", "walk", "car"];

export const ROUTE_MODE_CONFIG: Record<RouteMode, RouteModeConfig> = {
  bike: {
    label: "Bike-share",
    icon: "bike",
    title: "Bike-share impact",
    activeLabel: "Bike trip active",
  },
  walk: {
    label: "Walking",
    icon: "walk",
    title: "Walking impact",
    activeLabel: "Walk active",
  },
  car: {
    label: "Driving",
    icon: "car",
    title: "Driving impact",
    activeLabel: "Drive active",
  },
};

export function getModeSeconds(
  mode: RouteMode,
  distanceMeters: number,
  drivingDurationSeconds: number | null,
  overrides?: RouteDurationOverrides,
) {
  const overrideSeconds = overrides?.[mode];

  if (typeof overrideSeconds === "number" && Number.isFinite(overrideSeconds)) {
    return Math.round(overrideSeconds);
  }

  switch (mode) {
    case "bike":
      return Math.round(distanceMeters / METERS_PER_SECOND.bike);
    case "walk":
      return Math.round(distanceMeters / METERS_PER_SECOND.walk);
    case "car":
      return drivingDurationSeconds ?? Math.round(distanceMeters / METERS_PER_SECOND.car);
  }
}

export function getModeEmittedCo2Kg(mode: RouteMode, distanceMeters: number) {
  if (mode !== "car") {
    return 0;
  }

  return roundToSingleDecimal((distanceMeters / 1_000) * CO2_KG_PER_KM_CAR);
}

export function getModeImpactCo2Kg(mode: RouteMode, distanceMeters: number) {
  if (mode === "car") {
    return getModeEmittedCo2Kg(mode, distanceMeters);
  }

  return getModeEmittedCo2Kg("car", distanceMeters);
}

export function getModeCalories(mode: RouteMode, durationSeconds: number) {
  if (mode === "car") {
    return 0;
  }

  const hours = durationSeconds / 3_600;
  return Math.round(ACTIVE_MET[mode] * ASSUMED_RIDER_WEIGHT_KG * hours);
}

export function getModeCardioMinutes(mode: RouteMode, durationSeconds: number) {
  if (mode === "car") {
    return 0;
  }

  return Math.max(1, Math.round(durationSeconds / 60));
}

export function formatDurationCompact(seconds: number) {
  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining === 0 ? `${hours}h` : `${hours}h ${remaining}m`;
}

export function formatDurationLong(seconds: number) {
  const minutes = Math.round(seconds / 60);

  if (minutes < 1) {
    return "<1 min";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remaining} min`;
}

export function formatDistanceKilometers(distanceMeters: number) {
  return `${(distanceMeters / 1_000).toFixed(1)} km`;
}

export function getRouteDashboardInsight({
  mode,
  distanceMeters,
  drivingDurationSeconds,
  durationOverrides,
}: {
  mode: RouteMode;
  distanceMeters: number;
  drivingDurationSeconds: number | null;
  durationOverrides?: RouteDurationOverrides;
}): RouteDashboardInsight {
  const selectedSeconds = getModeSeconds(mode, distanceMeters, drivingDurationSeconds, durationOverrides);
  const carSeconds = getModeSeconds("car", distanceMeters, drivingDurationSeconds, durationOverrides);
  const bikeSeconds = getModeSeconds("bike", distanceMeters, drivingDurationSeconds, durationOverrides);
  const selectedCalories = getModeCalories(mode, selectedSeconds);
  const selectedCardioMinutes = getModeCardioMinutes(mode, selectedSeconds);
  const weeklyGoalPercent = selectedCardioMinutes === 0
    ? 0
    : Math.round((selectedCardioMinutes / WEEKLY_ACTIVITY_GOAL_MINUTES) * 100);
  const tripCarCo2Kg = getModeEmittedCo2Kg("car", distanceMeters);
  const selectedCo2Kg = getModeEmittedCo2Kg(mode, distanceMeters);
  const annualCarCo2Kg = Math.round(tripCarCo2Kg * DAILY_COMMUTE_DAYS_PER_YEAR);
  const bikeCalories = getModeCalories("bike", bikeSeconds);
  const bikeCardioMinutes = getModeCardioMinutes("bike", bikeSeconds);
  const timeVsCar = describeTimeDelta(selectedSeconds - carSeconds, "driving");
  const distanceLabel = formatDistanceKilometers(distanceMeters);
  const durationLabel = formatDurationLong(selectedSeconds);

  if (mode === "car") {
    return {
      title: ROUTE_MODE_CONFIG.car.title,
      subtitle: `${distanceLabel} • ${durationLabel} • ${describeTimeDelta(carSeconds - bikeSeconds, "biking")}`,
      co2Value: `${formatEmissions(selectedCo2Kg)}`,
      co2Label: "CO2 emitted",
      caloriesValue: "0",
      cardioValue: "0 min",
      cardioNote: `Driving gets you there ${describeTimeDelta(
        carSeconds - bikeSeconds,
        "biking",
      )}, but it cuts out about ${bikeCardioMinutes} active minutes and ${bikeCalories} kcal of movement.`,
      tips: [
        {
          tone: "primary",
          text: `Drive this same route every day for a year and you would emit about ${formatAnnualEmissions(
            annualCarCo2Kg,
          )}, roughly the weight of ${describeMassEquivalent(annualCarCo2Kg)}.`,
        },
        {
          tone: "secondary",
          text: `Each drive adds about ${formatEmissions(
            selectedCo2Kg,
          )} of CO2 compared with biking or walking this trip.`,
        },
      ],
      actionLabel: ROUTE_MODE_CONFIG.car.activeLabel,
    };
  }

  const savedCo2Kg = tripCarCo2Kg;

  return {
    title: ROUTE_MODE_CONFIG[mode].title,
    subtitle: `${distanceLabel} • ${durationLabel} • ${timeVsCar}`,
    co2Value: `${formatEmissions(savedCo2Kg)}`,
    co2Label: "CO2 saved",
    caloriesValue: `${selectedCalories}`,
    cardioValue: `${selectedCardioMinutes} min`,
    cardioNote: `This trip contributes about ${weeklyGoalPercent}% of your weekly physical activity goal and is ${timeVsCar}.`,
    tips: [
      {
        tone: "primary",
        text: `Choose ${ROUTE_MODE_CONFIG[mode].label.toLowerCase()} over driving for this trip every day and you would avoid about ${formatAnnualEmissions(
          annualCarCo2Kg,
        )} of CO2 per year, roughly the weight of ${describeMassEquivalent(annualCarCo2Kg)}.`,
      },
      {
        tone: "secondary",
        text: `You burn about ${selectedCalories} kcal and bank ${selectedCardioMinutes} active minutes on this route instead of a sedentary drive.`,
      },
    ],
    actionLabel: ROUTE_MODE_CONFIG[mode].activeLabel,
  };
}

function describeTimeDelta(deltaSeconds: number, baseline: string) {
  const deltaMinutes = Math.max(1, Math.round(Math.abs(deltaSeconds) / 60));

  if (deltaSeconds < 0) {
    return `${deltaMinutes} min faster than ${baseline}`;
  }

  if (deltaSeconds > 0) {
    return `${deltaMinutes} min slower than ${baseline}`;
  }

  return `about the same time as ${baseline}`;
}

function formatEmissions(co2Kg: number) {
  if (co2Kg < 10) {
    return `${co2Kg.toFixed(1)} kg`;
  }

  return `${Math.round(co2Kg)} kg`;
}

function formatAnnualEmissions(co2Kg: number) {
  if (co2Kg >= 1_000) {
    return `${(co2Kg / 1_000).toFixed(1)} tonnes`;
  }

  return `${co2Kg} kg`;
}

function describeMassEquivalent(weightKg: number) {
  const eligibleComparisons = MASS_EQUIVALENT_COMPARISONS.filter(({ unitKg }) => weightKg / unitKg >= 0.2);
  const comparisonPool = eligibleComparisons.length > 0
    ? eligibleComparisons
    : [MASS_EQUIVALENT_COMPARISONS.at(-1)!];
  const comparison = comparisonPool[pickStableComparisonIndex(weightKg, comparisonPool.length)]!;
  const count = weightKg / comparison.unitKg;
  const roundedCount = count >= 10 ? Math.round(count) : Math.round(count * 10) / 10;
  const label = roundedCount === 1 ? comparison.singular : comparison.plural;

  return `${roundedCount} ${label}`;
}

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function pickStableComparisonIndex(weightKg: number, comparisonCount: number) {
  const seed = Math.max(1, Math.round(weightKg * 10));
  return (Math.imul(seed ^ 0x9e3779b1, 0x85ebca6b) >>> 0) % comparisonCount;
}
