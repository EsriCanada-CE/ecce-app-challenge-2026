type RoadFeatureNameProperties = {
  STANDARD_MUNICIPALITY?: string | null;
  FULL_STREET_NAME?: string | null;
  FULL_STREET_NAME_1?: string | null;
  ORIGINAL_STREET_NAME?: string | null;
};

type RoadFeatureLike = {
  properties?: RoadFeatureNameProperties | null;
};

export function shouldIncludeRoadFeature(feature: RoadFeatureLike) {
  const properties = feature.properties;

  if (!properties) {
    return true;
  }

  const hasSourceNamingMetadata =
    "STANDARD_MUNICIPALITY" in properties ||
    "FULL_STREET_NAME" in properties ||
    "FULL_STREET_NAME_1" in properties ||
    "ORIGINAL_STREET_NAME" in properties;

  if (!hasSourceNamingMetadata) {
    return true;
  }

  const hasMunicipality =
    typeof properties.STANDARD_MUNICIPALITY === "string" &&
    properties.STANDARD_MUNICIPALITY.trim().length > 0;
  const hasStreetName =
    getNormalizedText(properties.FULL_STREET_NAME) !== null ||
    getNormalizedText(properties.FULL_STREET_NAME_1) !== null ||
    getNormalizedText(properties.ORIGINAL_STREET_NAME) !== null;

  return hasMunicipality || hasStreetName;
}

function getNormalizedText(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
