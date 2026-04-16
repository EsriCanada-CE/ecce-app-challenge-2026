# SnowSafe – Winter Mobility Reporting for Toronto

SnowSafe is an ArcGIS Online web map designed to help Toronto residents navigate winter mobility barriers and share real-time accessibility conditions. The platform combines community-submitted reports with equity and operational datasets to support safer, more informed winter travel.

## Overview

SnowSafe allows users to:

- View reported winter mobility issues across Toronto
- Submit new accessibility reports (icy sidewalks, blocked curb cuts, unplowed bike lanes, etc.)
- Filter reports by status, severity, and issue type
- Explore vulnerability using the CISV equity overlay
- Compare reports with active snowplow routes and locations
- Highlight affected pedestrian and cycling infrastructure near each report

The map is constrained to the Toronto boundary to maintain focus on the study area.



## Key Features

### Community Reporting
- Interactive reporting system with severity classification
- Real-time feed ordered by newest reports
- Popup actions to Resolve or Delete reports
- Dynamic counters showing:
  - Total reports
  - Active reports
  - Critical reports
  - Reports in current map extent

### Equity Integration (CISV)
- Canadian Index of Social Vulnerability (CISV) overlay
- Scores range from 1 (least vulnerable) to 5 (most vulnerable)
- Popups display overall score, dimension scores, and indicators
- Supports equity-informed mobility analysis

### Infrastructure Context
- Pedestrian walkways (blue)
- Bike paths (orange)
- Subway lines (red)
- Snowplow routes and live plow locations
- Bike Share stations
- Toronto boundary

### Affected Area Highlighting
- Severity-based buffer around each report:
  - Low: 30m
  - Moderate: 50m
  - High: 80m
  - Critical: 120m
- Highlights nearby sidewalk and cycling segments


## Live App

https://taylrliam.github.io/SnowSafeApp/



## Data Sources

- Canadian Index of Social Vulnerability (CISV)
- City of Toronto Open Data
  - Snowplow routes and locations
  - Transportation infrastructure layers
- Community-submitted reports (SnowSafe layer)



## Project Context

SnowSafe is presented as a minimum viable product (MVP) focused on improving winter mobility transparency. As more reports accumulate, the platform can support:

- Barrier hotspot identification
- Equity-based prioritization
- Temporal snow response analysis
- Infrastructure planning insights

SnowSafe demonstrates how community-contributed data, combined with equity and operational datasets, can support resilient and sustainable winter transportation systems.



Developed for the Esri Canada GIS Centres of Excellence App Challenge.
