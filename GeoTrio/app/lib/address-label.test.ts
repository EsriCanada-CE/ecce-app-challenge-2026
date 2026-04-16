import { describe, expect, it } from "vitest";

import { getCompactAddressLabel } from "@/lib/address-label";

describe("getCompactAddressLabel", () => {
  it("compresses verbose reverse-geocoded addresses into two useful segments", () => {
    expect(
      getCompactAddressLabel(
        "132, Grace Street, Trinity-Bellwoods, University—Rosedale, Toronto, Golden Horseshoe, Ontario, M6J 2S4, Canada",
      ),
    ).toBe("132 Grace Street, Trinity-Bellwoods");
  });

  it("removes postal and region suffixes while preserving readable place names", () => {
    expect(
      getCompactAddressLabel(
        "Nelson Mandela Walk, Downtown Yonge East, Toronto Centre, Toronto, Golden Horseshoe, Ontario, M5B 2K3, Canada",
      ),
    ).toBe("Nelson Mandela Walk, Downtown Yonge East");
  });

  it("leaves already-short labels intact", () => {
    expect(getCompactAddressLabel("123 Queen St W, Toronto")).toBe("123 Queen St W, Toronto");
  });
});
