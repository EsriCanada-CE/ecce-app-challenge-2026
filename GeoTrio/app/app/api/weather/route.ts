import { NextResponse } from "next/server";

import type {
  WeatherApiError,
  WeatherApiSuccess,
} from "@/lib/route-types";

export const runtime = "nodejs";

type OpenMeteoCurrentResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    is_day?: number;
  };
};

const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const INVALID_COORDINATES_ERROR =
  "Weather lookup requires valid lat and lon query parameters.";
const LOOKUP_FAILED_ERROR =
  "Live weather is unavailable right now.";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = Number(searchParams.get("lat"));
  const longitude = Number(searchParams.get("lon"));

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return NextResponse.json<WeatherApiError>(
      { error: INVALID_COORDINATES_ERROR },
      { status: 400 },
    );
  }

  const lookupUrl = new URL(OPEN_METEO_BASE_URL);
  lookupUrl.searchParams.set("latitude", String(latitude));
  lookupUrl.searchParams.set("longitude", String(longitude));
  lookupUrl.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day",
  );
  lookupUrl.searchParams.set("temperature_unit", "celsius");
  lookupUrl.searchParams.set("wind_speed_unit", "kmh");
  lookupUrl.searchParams.set("precipitation_unit", "mm");
  lookupUrl.searchParams.set("timezone", "auto");

  try {
    const response = await fetch(lookupUrl, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 900,
      },
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo lookup failed with ${response.status}.`);
    }

    const payload = (await response.json()) as OpenMeteoCurrentResponse;
    const weather = payload.current;

    if (!weather || !isValidOpenMeteoCurrent(weather)) {
      throw new Error("Open-Meteo returned an incomplete current weather payload.");
    }

    return NextResponse.json<WeatherApiSuccess>({
      time: weather.time,
      temperatureC: weather.temperature_2m,
      apparentTemperatureC: weather.apparent_temperature,
      precipitationMm: weather.precipitation,
      weatherCode: weather.weather_code,
      windSpeedKmh: weather.wind_speed_10m,
      isDay: weather.is_day === 1,
    });
  } catch (error) {
    console.error("Failed to fetch current weather from Open-Meteo.", error);

    return NextResponse.json<WeatherApiError>(
      { error: LOOKUP_FAILED_ERROR },
      { status: 502 },
    );
  }
}

function isValidLatitude(value: number) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

function isValidOpenMeteoCurrent(
  value: NonNullable<OpenMeteoCurrentResponse["current"]>,
): value is Required<NonNullable<OpenMeteoCurrentResponse["current"]>> {
  return (
    typeof value.time === "string" &&
    Number.isFinite(value.temperature_2m) &&
    Number.isFinite(value.apparent_temperature) &&
    Number.isFinite(value.precipitation) &&
    Number.isFinite(value.weather_code) &&
    Number.isFinite(value.wind_speed_10m) &&
    (value.is_day === 0 || value.is_day === 1)
  );
}
