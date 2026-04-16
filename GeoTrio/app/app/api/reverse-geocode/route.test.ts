import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  ReverseGeocodeApiError,
  ReverseGeocodeApiSuccess,
} from "@/lib/route-types";

import { GET } from "@/app/api/reverse-geocode/route";

describe("GET /api/reverse-geocode", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a full address from Nominatim", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        display_name: "123 Queen St W, Toronto, Ontario, Canada",
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const response = await GET(
      new Request("http://localhost/api/reverse-geocode?lat=43.6532&lon=-79.3832"),
    );
    const payload = (await response.json()) as ReverseGeocodeApiSuccess;

    expect(response.status).toBe(200);
    expect(payload.address).toBe("123 Queen St W, Toronto, Ontario, Canada");
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  it("rejects invalid coordinates", async () => {
    const response = await GET(
      new Request("http://localhost/api/reverse-geocode?lat=nope&lon=-79.3832"),
    );
    const payload = (await response.json()) as ReverseGeocodeApiError;

    expect(response.status).toBe(400);
    expect(payload.error).toBe(
      "Reverse geocoding requires valid lat and lon query parameters.",
    );
  });

  it("returns an upstream failure when Nominatim errors", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

    const response = await GET(
      new Request("http://localhost/api/reverse-geocode?lat=43.6532&lon=-79.3832"),
    );
    const payload = (await response.json()) as ReverseGeocodeApiError;

    expect(response.status).toBe(502);
    expect(payload.error).toBe("Address lookup is unavailable right now.");
  });
});
