const POSTAL_CODE_PATTERN = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;
const HOUSE_NUMBER_PATTERN = /^\d+[A-Za-z]?$/;
const IGNORED_SEGMENTS = new Set([
  "canada",
  "ontario",
  "golden horseshoe",
]);

export function getCompactAddressLabel(address: string) {
  const segments = address
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return address.trim();
  }

  const mergedSegments = mergeLeadingHouseNumber(segments).filter((segment) => {
    const normalizedSegment = segment.toLowerCase();
    return !IGNORED_SEGMENTS.has(normalizedSegment) && !POSTAL_CODE_PATTERN.test(segment);
  });

  if (mergedSegments.length === 0) {
    return address.trim();
  }

  return mergedSegments.slice(0, 2).join(", ");
}

function mergeLeadingHouseNumber(segments: string[]) {
  if (segments.length < 2 || !HOUSE_NUMBER_PATTERN.test(segments[0])) {
    return segments;
  }

  return [`${segments[0]} ${segments[1]}`, ...segments.slice(2)];
}
