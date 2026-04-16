# <img src="./images/logo.png" alt="App Logo" width="200">

# Geoasis Transit \- ECCE App Challenge 2026

## Team \- Gondola Guys Environmental Zone

* Alex Brun  
* Rictor Junior Laurence Magenga  
* Gus Schiele

## Mission Statement

In 2015, the United Nations established 17 Sustainable Development Goals to promote peace and prosperity for people and the planet. Central to this vision is Goal 11: making cities and human settlements inclusive, safe, resilient, and sustainable. For growing metropolitan regions, a cornerstone of this sustainability is equitable access to public transportation. Transit connects individuals to essential services, employment, and their wider community. It serves as a critical upstream factor in overall societal well-being. However, as Metro Vancouver continues to expand, the distribution of transit infrastructure remains uneven. This creates "transit deserts" where populations with the highest demand often face the lowest accessibility.

To accurately capture and address this disparity, our approach relies on strict quantitative evidence. Our project models transit demand at the Dissemination Area (DA) level by analyzing key demographic vulnerabilities. We evaluate the percentage of low-income individuals after tax, recent immigrants from the last five years, seniors over 65, and youth under 14\. By aggregating these factors into standardized demand z-scores and comparing them against access z-scores derived from bus departures within 400 meters and SkyTrain or SeaBus departures within 800 meters of a DA centroid, we can mathematically identify and classify transit deserts across quantiles.

In support of a more equitable and connected region, our team has developed an interactive application to help Metro Vancouver residents and policymakers visualize and resolve these transit gaps. The app allows users to explore existing spatial patterns and actively test solutions by dragging and dropping new transit infrastructure like bus stops, RapidBus lines, or SkyTrain stations directly onto the map. The platform instantly calculates the real-world impact. It displays exactly how many Dissemination Areas and individual residents are pulled out of transit desert status by the proposed additions. By providing an accessible and data-driven tool, we aim to raise public awareness of transit inequity and equip decision-makers with the precise insights necessary to advocate for preventative, high-impact infrastructure investments.

## App Characteristics

* **Discover Transit Equity and Sustainability:** Move beyond basic service maps to uncover the real mobility gaps in the city. By calculating transit supply (departures, stops) and demographic demand (income, age, recent immigrants).  
* **Simulate Green Infrastructure:** Test sustainable solutions before a single dollar is spent. Our interactive web app allows planners to drop a pin on the map and visualize the immediate impact of a new rapid transit route or bus exchange. The application instantly updates local transit scores based on a formula.  
* **Explore Transit Access and Demand:** Dive into the complex spatial relationship between the people and the network. Users visually dissect the underlying data, comparing raw infrastructure capacity (like daily bus frequencies and SkyTrain proximity) directly against the specific community demographics that rely on public transit the most.  
* **Help Connect Communities:** Shift the urban planning focus from simply moving vehicles to genuinely connecting people. Explore regions that would benefit from increased services across the Vancouver metropolitan region.

## Methodology and Justifications

### Data Processing & Formulas

Data was processed from the 2021 Canadian census consisting of information for Dissemination areas (DA) within the Metro Vancouver Region. This data was filtered specifically for the population count, Percent immigration increase, prevalence of Low income (LIMAT), Percentage of population 0-14, and percentage of population 65 and over. These would factor into the formula calculating demand (Formula 1). 

**Formula 1:**  
*DA Demand \=  (Z\_income \+ Z\_seniors \+ Z\_youth \+ Z\_immigrants \+ Z\_population) / 5*

Alternatively to generate an access metric, data from GTFS provided by translink, the local transit authority, was used to derive which DA areas had better access based on the number of departures, BRT access, skytrain, and unique routes (Formula 2). This data was aggregated to surrounding DA regions.

**Formula 2:**  
*DA Access \= (Z\_busDepartures \+ Z\_rapidTransit \+ Z\_skyTrain \+ Z\_routes \+ Z\_skyTrain800m \+ Z\_BRT800m \+ Z\_numberRoutes) / 7*

Using this data, the calculation was derived from the difference in demand and access  (Formula 3\) to public transportation through dissemination areas in the Metro Vancouver Region. The difference in these values would identify which regions could be considered transit deserts or oasis based data within a 400m buffer from a DA center. A centroid within each DA was used to penalize large DA areas with sparse populations which artificially inflated transit score values. Each of the transit scores would be categorized using a quantile range to determine if they were a transit oasis or desert based on the regional context.

**Formula 3:**  
*Transit Score \= DA Access \- DA Demand*

Where DA access and supply are the average of all Z normalized values calculated using formulas 2 and 3\.

### Widgets / App

The web application was built using ArcGIS Experience Builder (Developer Edition) with custom widgets developed in React and TypeScript. Three core widgets were created to form an interactive transit planning tool. The **Transit Infrastructure** widget allows users to place hypothetical bus stops (400m buffer), BRT stops (400m buffer), and SkyTrain stations (800m buffer) on the map, rendering each placement as a point with a geodesic circular buffer using the ArcGIS JavaScript API's GraphicsLayer and Circle geometry classes. The **Transit Impact Analysis** widget connects to the hosted final\_t\_score\_v6 feature layer via the Experience Builder DataSource SDK, performing spatial intersection queries to identify dissemination areas (DAs) affected by each placed buffer. For each affected DA, the widget applies a configurable T-Score boost (+0.3 for bus, \+0.6 for BRT, \+1.0 for SkyTrain), reclassifies the DA into one of five transit service tiers (Severe Transit Desert through Strong Transit Surplus), and generates a natural-language impact summary. A scenario comparison feature lets users save and compare multiple infrastructure configurations side-by-side. The **Impact Results** widget listens for analysis outputs via browser custom events, rendering a before/after classification distribution chart, summary statistics (DAs improved, population better served), and a ranked list of top-improved areas. All three widgets communicate automatically through a publish-subscribe pattern using window CustomEvents, requiring no manual wiring between components.

## User Guide

**﻿Step 1 — Navigate to the Map**

Click the "Map" button in the navigation bar to open the analysis dashboard. You'll see the Metro Vancouver map with the transit infrastructure toolbar on the right, impact analysis panel on the bottom left, and results dashboard on the bottom right.

**Step 2 — Place Transit Infrastructure**

In the Transit Infrastructure panel, select one of three infrastructure types:

* Bus Stop — 400m service buffer, \+0.3 T-Score boost  
  * BRT Stop — 400m service buffer, \+0.6 T-Score boost  
  * SkyTrain Station — 800m service buffer, \+1.0 T-Score boost

Click the button to activate placement mode, then click anywhere on the map to drop a pin. A colored circle shows the service buffer area. You can place multiple stops of any type.

 **Step 3 — View the Impact**

The Transit Impact Analysis panel automatically identifies which DAs are affected by your placed infrastructure. For each DA, it shows the original T-Score, the boost applied, and the new classification:

* Severe Transit Desert (T-Score below \-1.5)  
  * Moderate Transit Desert (-1.5 to \-0.5)  
  * Adequate Service (-0.5 to 0.5)  
  * Moderate Transit Surplus (0.5 to 1.5)  
  * Strong Transit Surplus (above 1.5)

A summary sentence describes the total impact, such as "2 Bus Stops \+ 1 SkyTrain Station would improve transit access for 5,200 people across 4 DAs."

**Step 4 — Compare Scenarios**

Click "Save as Scenario" to snapshot your current infrastructure placement. Clear the map and try a different configuration. Save it as another scenario. Once you have two or more saved scenarios, a comparison table appears showing which configuration helps the most people and upgrades the most DAs.

**Step 5 — Remove Infrastructure**

Click the "x" button next to any placed stop in the list to remove it. Or click the stop type button again to deactivate placement mode, then click a pin on the map to remove it. All analysis updates automatically.

**﻿**

**Step 6 — Inspect a DA**

Click any DA polygon on the map to see a popup with its full profile: T-Score, population, and demographics (children, seniors, low income, recent immigrants). If the DA is affected by your placed infrastructure, the popup also shows the boosted score and new classification.

## Data Sources

| Source | Description |
| :---- | :---- |
| [GTFS Static Data | TransLink](https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources/gtfs/gtfs-data)  | All data for Translink including bus stops and their locations. Saved as txt data. Easily converted to csv |
| [2021 Census Boundary files](https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/boundary-limites/index2021-eng.cfm?year=21)  | Dissemination areas for all of Canada.. Multiple formats available  |
| [2021 Census Profile Downloads](https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/details/download-telecharger.cfm?Lang=E) | See “Canada, provinces, territories, census divisions (CDs), census subdivisions (CSDs) and dissemination areas (DAs) \- British Columbia only”Downloadable as csv file  |
| [Boundaries](https://open-data-portal-metrovancouver.hub.arcgis.com/search?categories=%252Fcategories%252Fboundaries)  | Regions for metrovancouver |

## Literature Sources

Allen, J., & Farber, S. (2019). Sizing up transport poverty: A national scale accounting of low-income households suffering from inaccessibility in Canada, and what to do about it. Transport Policy, 74, 214–223. https://doi.org/10.1016/j.tranpol.2018.11.018

Cai, M., Jiao, J., Luo, M., & Liu, Y. (2020). Identifying transit deserts for low-income commuters in Wuhan Metropolitan Area, China. Transportation Research Part D: Transport and Environment, 82, 102292\. https://doi.org/10.1016/j.trd.2020.102292

City of Vancouver. (2020). Climate Emergency Action Plan. https://vancouver.ca/green-vancouver/transportation.aspx

Conway, M. W., Byrd, A., & van der Linden, M. (2017). Evidence-based transit and land use sketch planning using interactive accessibility methods on combined schedule and headway-based networks. Transportation Research Record, 2653(1), 45–53. https://doi.org/10.3141/2653-06

Currie, G. (2010). Quantifying spatial gaps in public transport supply based on social needs. Journal of Transport Geography, 18(1), 31–41. https://doi.org/10.1016/j.jtrangeo.2009.03.002

Currie, G., & Delbosc, A. (2011). Understanding bus rapid transit route ridership drivers: An empirical study of Australian BRT systems. Transport Policy, 18(5), 755–764. https://doi.org/10.1016/j.tranpol.2011.03.003

El-Geneidy, A., Grimsrud, M., Wasfi, R., Tétreault, P., & Surprenant-Legault, J. (2014). New evidence on walking distances to transit stops: Identifying redundancies and gaps using variable service areas. Transportation, 41(1), 193–210. https://doi.org/10.1007/s11116-013-9508-z

Farber, S., Morang, M. Z., & Widener, M. J. (2014). Temporal variability in transit-based accessibility to supermarkets. Applied Geography, 53, 149–159. https://doi.org/10.1016/j.apgeog.2014.06.012  
Foth, N., Manaugh, K., & El-Geneidy, A. (2013). Towards equitable transit: Examining transit accessibility and social need in Toronto, Canada, 1996–2006. Journal of Transport Geography, 29, 1–10. https://doi.org/10.1016/j.jtrangeo.2012.12.008

Geurs, K. T., & van Wee, B. (2004). Accessibility evaluation of land-use and transport strategies: Review and research directions. Journal of Transport Geography, 12(2), 127–140. https://doi.org/10.1016/j.jtrangeo.2003.10.005

Jiao, J. (2017). Identifying transit deserts in major Texas cities where the supplies missed the demands. Journal of Transport and Land Use, 10(1), 529–540. https://www.jtlu.org/index.php/jtlu/article/view/899

Jiao, J., & Dillivan, M. (2013). Transit deserts: The gap between demand and supply. Journal of Public Transportation, 16(3), 23–39. https://digitalcommons.usf.edu/jpt/vol16/iss3/2/

Lee, H. K., Jiao, J., & Choi, S. J. (2024). Developing a transit desert interactive dashboard: Supervised modeling for forecasting transit deserts. PLOS ONE, 19(7), e0306782. https://doi.org/10.1371/journal.pone.0306782

Manaugh, K., Badami, M. G., & El-Geneidy, A. (2015). Integrating social equity into urban transportation planning: A critical evaluation of equity objectives and measures in transportation plans in North America. Transport Policy, 37, 167–176. https://doi.org/10.1016/j.tranpol.2014.09.013

Santana Palacios, M., & El-Geneidy, A. (2022). The impacts of accessibility measure choice on public transit project evaluation. Journal of Transport Geography, 105, 103482\. https://doi.org/10.1016/j.jtrangeo.2022.103482

Statistics Canada. (2022). Census Profile, 2021 Census of Population. https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/index.cfm?Lang=E

Statistics Canada. (2023). The Canadian Index of Multiple Deprivation: Dataset, 2021\. https://open.canada.ca/data/en/dataset/ec6dc8e7-2fa0-4e49-8969-38541ca0a34d  
Statistics Canada. (2024). Active and public transportation spatial accessibility measures: Methodology and key results (Catalogue No. 18-001-X).   
https://www150.statcan.gc.ca/n1/pub/18-001-x/18-001-x2024005-eng.htm

TransLink. (2025). 2024 Transit Service Performance Review. https://www.translink.ca/plans-and-projects/strategies-plans-and-guidelines/managing-the-transit-network

## AI Disclosure

Claude (Anthropic) was used to: debug JavaScript and TypeScript compilation errors when setting up the ArcGIS Experience Builder Developer Edition environment; generate boilerplate code for custom widget scaffolding (manifest.json, config.ts, setting.tsx) which were then edited manually to sync to our data and troubleshoot the connection between custom widgets and hosted feature layers using the Experience Builder DataSource SDK and DataSourceComponent. 

[image1]: <data:image/png;base64,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>
