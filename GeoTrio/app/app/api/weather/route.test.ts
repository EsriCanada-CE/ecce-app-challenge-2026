import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  WeatherApiError,
  WeatherApiSuccess,
} from "@/lib/route-types";

import { GET } from "@/app/api/weather/route";

describe("GET /api/weather", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns current conditions from Open-Meteo", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        current: {
          time: "2026-03-29T11:45",
          temperature_2m: 13.4,
          apparent_temperature: 11.9,
          precipitation: 0,
          weather_code: 3,
          wind_speed_10m: 18.7,
          is_day: 1,
        },
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const response = await GET(
      new Request("http://localhost/api/weather?lat=43.6532&lon=-79.3832"),
    );
    const payload = (await response.json()) as WeatherApiSuccess;

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      time: "2026-03-29T11:45",
      temperatureC: 13.4,
      apparentTemperatureC: 11.9,
      precipitationMm: 0,
      weatherCode: 3,
      windSpeedKmh: 18.7,
      isDay: true,
    });
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  it("rejects invalid coordinates", async () => {
    const response = await GET(
      new Request("http://localhost/api/weather?lat=nope&lon=-79.3832"),
    );
    const payload = (await response.json()) as WeatherApiError;

    expect(response.status).toBe(400);
    expect(payload.error).toBe(
      "Weather lookup requires valid lat and lon query parameters.",
    );
  });

  it("returns an upstream failure when Open-Meteo errors", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

    const response = await GET(
      new Request("http://localhost/api/weather?lat=43.6532&lon=-79.3832"),
    );
    const payload = (await response.json()) as WeatherApiError;

    expect(response.status).toBe(502);
    expect(payload.error).toBe("Live weather is unavailable right now.");
  });
});
