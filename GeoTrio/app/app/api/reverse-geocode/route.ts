import { NextResponse } from "next/server";

import {
  type ReverseGeocodeApiError,
  type ReverseGeocodeApiSuccess,
} from "@/lib/route-types";

export const runtime = "nodejs";

type NominatimReverseResponse = {
  display_name?: string;
};

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/reverse";
const INVALID_COORDINATES_ERROR =
  "Reverse geocoding requires valid lat and lon query parameters.";
const LOOKUP_FAILED_ERROR =
  "Address lookup is unavailable right now.";
const LOOKUP_MISSING_ERROR =
  "No address could be found for those coordinates.";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = Number(searchParams.get("lat"));
  const longitude = Number(searchParams.get("lon"));

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return NextResponse.json<ReverseGeocodeApiError>(
      { error: INVALID_COORDINATES_ERROR },
      { status: 400 },
    );
  }

  const lookupUrl = new URL(NOMINATIM_BASE_URL);
  lookupUrl.searchParams.set("lat", String(latitude));
  lookupUrl.searchParams.set("lon", String(longitude));
  lookupUrl.searchParams.set("format", "jsonv2");

  try {
    const response = await fetch(lookupUrl, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en-CA,en;q=0.9",
        "User-Agent": "esri-2026-app-challenge/0.1 (reverse geocoding)",
      },
      next: {
        revalidate: 86_400,
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim reverse geocode failed with ${response.status}.`);
    }

    const payload = (await response.json()) as NominatimReverseResponse;
    const address = payload.display_name?.trim();

    if (!address) {
      return NextResponse.json<ReverseGeocodeApiError>(
        { error: LOOKUP_MISSING_ERROR },
        { status: 404 },
      );
    }

    return NextResponse.json<ReverseGeocodeApiSuccess>({ address });
  } catch (error) {
    console.error("Failed to reverse geocode the route point.", error);

    return NextResponse.json<ReverseGeocodeApiError>(
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
