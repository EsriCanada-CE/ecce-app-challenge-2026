# ECCE App Challenge 2026: The Mapping Marauders

This repository contains the Python source code utilized by team The Mapping Marauders from McMaster University for data analysis and visualization, developed as part of the ECCE App Challenge 2026.


## Team Members
- Sarah Paquin 
- Skyler Grasley 
- Zehui Yin


## Links

Source Webmap: https://www.arcgis.com/apps/mapviewer/index.html?webmap=3e8a1f05e10049379f263a6235d8c616
Video: https://www.youtube.com/watch?v=KQQYzMDgpiU 
Application: See zip file in main repo bin. (ArcGIS Experience Builder SDK Export)


## Mission Statement

Sustainable transportation dominates policy discussions surrounding urban sustainability, carbon emissions reductions, and urban redevelopment in a Canadian context. With many cities such as Hamilton, ON adopting Light Rail Transit plans and expanding their bike share networks, it is clear that urban planners and policy experts value sustainable transportation. In fact, according to the City of Toronto, sustainable transportation contributed $1.44 billion to Toronto’s real GDP in 2018.  

However, access to these technologies remains uneven across Canada, with rural areas experiencing an extreme lack of investment and continued dependence on automobiles as a primary means of transportation. The positive impact of investing in and developing sustainable transportation in urban areas is then diminished by the continued influx of personal automobiles from surrounding rural areas. A demand for parking space and wider roads persists as rural populations commute to city centers for work and necessities, limiting the capacity of urban planners and policy makers to impact meaningful change via sustainable transportation.  

For example, in a recent decision by Ontario’s Conservative Provincial Government (Elected 2025), the development of bike lanes in Ontario cities has been halted, largely due to the needs of rural drivers. As such, continued dependence on cars presents a challenge for sustainable mobility in urban and rural contexts.  

A service virtually non-existent in the Canadian rural context is healthcare. Rural populations often rely on urban hospitals, clinics, and healthcare facilities due to the limited availability of such services in their own communities. The majority of this transportation occurs in personal vehicles due to the lack of access to public and sustainable transportation in urban areas. Clearly, transportation presents a barrier to access, as the Rural Ontario Medical Association estimates that 525,000 rural residents in Ontario lack a primary care provider.  

Our group recognizes the significant urban-rural divide in both healthcare availability and the accessibility of sustainable transportation options. This disparity directly affects how easily individuals can obtain timely medical services. In response, we have developed an application focused specifically on Hamilton and Toronto that analyzes and displays accessibility across the regions. The app highlights how well different areas are connected by public transit and evaluates how easily residents can reach hospitals and clinics within these two cities. By doing so, it provides a clearer understanding of transportation-related barriers to healthcare access and supports more informed decision-making around improving equitable access.  

While common understandings of sustainability focus on environmental sustainability alone, our app considers social sustainability as well. Sustainable transportation can improve population health through individual transportation choices, activity patterns, neighborhood walkability, and increased exposure to green spaces. According to the National Institutes of Health, rural settings overwhelmingly have worse measures of health and social determinants of health at the county level.

## Analysis Methodology

We assessed spatial accessibility to hospital services in Toronto and Hamilton using multimodal travel‑time analysis and hexagonal grid-based metrics. The study area was defined by the municipal boundaries of both cities. To ensure spatially consistent measurement, we generated a hexagonal grid (H3 resolution 9) across the combined land area, using each hexagon centroid as the origin for all travel‑time computations.

Hospital and clinic locations obtained from OpenStreetMap were merged into a single opportunity dataset, and all facilities were converted to representative point features.

A multimodal transport network was constructed by integrating the OpenStreetMap road network with the latest scheduled transit services from the Toronto Transit Commission and Hamilton Street Railway.

Accessibility was evaluated under four representative departure-time conditions: weekday peak, weekday off-peak, weekend peak, and weekend off‑peak. For each origin–destination pair, we computed travel times for two modal scenarios: (1) transit-and-walking only, and (2) cycling‑plus‑transit, with cycling permitted for both access and egress legs. Accessibility scores were derived using a bisquare distance‑decay function that down-weights longer travel times and assigns zero weight to trips exceeding 60 minutes.

Finally, we generated isochrone polygons for each hospital and clinic to delineate areas reachable within specified travel-time thresholds under both modal scenario assumptions.


## Data Sources

Toronto Open Data: https://www.toronto.ca/city-government/data-research-maps/open-data/     
Hamilton Open Data:  https://www.hamilton.ca/city-council/data-maps/open-data   
Open Street Maps: https://services6.arcgis.com/Do88DoK2xjTUCXd1/arcgis/rest/services/OSM_NA_Medical/FeatureServer   





Copyright © 2025 Sarah Paquin, Skyler Grasley, Zehui Yin.  
*Toronto-Hamilton MedBridge is an original creative work of the above individuals.*  
*All software and other products used remain the intellectual property of their original owners.*  


