import type { WeatherApiSuccess } from "@/lib/route-types";

export function describeWeatherCode(code: number, isDay: boolean) {
  if (code === 0) {
    return isDay ? "Clear sky" : "Clear evening";
  }

  if (code >= 1 && code <= 3) {
    return "Cloudy skies";
  }

  if (code === 45 || code === 48) {
    return "Foggy";
  }

  if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return "Wet conditions";
  }

  if (code >= 71 && code <= 77) {
    return "Snowy";
  }

  if (code >= 85 && code <= 86) {
    return "Snow showers";
  }

  if (code >= 95 && code <= 99) {
    return "Thunderstorms";
  }

  return "Current conditions";
}

export function formatTemperatureC(value: number) {
  return `${Math.round(value)}°C`;
}

export function formatWeatherNote(weather: WeatherApiSuccess) {
  const precipitation = weather.precipitationMm > 0
    ? `${weather.precipitationMm.toFixed(1)} mm precip`
    : "No precipitation";

  return `Feels like ${formatTemperatureC(weather.apparentTemperatureC)} • Wind ${Math.round(
    weather.windSpeedKmh,
  )} km/h • ${precipitation}`;
}
