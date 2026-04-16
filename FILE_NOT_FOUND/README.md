# Minute Map

[View the app here](https://experience.arcgis.com/experience/78270ce900c24294bc0b15252850f59a)

### Team  
- Laurence Jang
- Min Tang (Maggie) Zhou
- Odna Adiyatumur
 
---

Minute Map shows users how easily they can access everyday services in Toronto via different modes of transit, highlighting gaps in the city where certain transit modes are limited or essential services are unevenly distributed. 

## Mission Statement

The 15-minute city is a planning concept that says people’s daily necessities should be accessible within a 15-minute walk, bike ride, or public transit ride from any point in the city. Recent multimodal accessibility research shows that the biggest barrier is not the idea itself, but the way essential activities and services are spatially distributed, which keeps many residents car-dependent.[^1] Integrating this framework into policies and planning decisions can promote more sustainable transit, healthier living, and reduce congestion, as people would not need to rely on cars to travel further distances to reach the services they need. That shift matters for climate outcomes, because transportation emissions are heavily tied to road travel, so reducing unnecessary trip distance is a direct mitigation pathway.[^1] Toronto, like most North American cities, is quite automobile-oriented outside the downtown core. This makes a multimodal lens essential, since cycling and public transit can function as practical low-emission pathways to 15-minute access where walking access is limited. Applying spatial analysis to this framework could identify underserved areas of Toronto, highlighting issues such as the urban-suburban divide. We hope this app can encourage people to use more sustainable modes of transportation and also inform policymakers and urban planners on how to increase the viability of other modes of transit. 

## User Guide

The app opens on the **Accessible Within 15 Minutes** tab. This allows you to view which services are accessible by various modes of transit within 15 minutes.

Select **Mode of Transit** to switch between each mode of transit. In the services the colours of the Services buttons will change to the respective mode of transit selected. Then you may switch between services.

In the map, zoom in and out by using your mouse’s scroll wheel or the +/- buttons in the top left hand corner of the map. clicking on any of these service layer points (community centers, grocery stores, hospitals, libraries, or schools), shows a pop up with more information about the service in the upper right hand corner of the screen

Below the services buttons you can toggle layers of the map on and off. Clicking the three dots beside each layer and then **Transparency** allows you to modify the transparency of different layers. The **Filter by Accessibility Range** allows you to filter the Accessibility layer by 5, 10, or 15 minute intervals. 

By selecting the **Accessibility Scores** tab you can view a choropleth map showing the relative accessibility by sustainable modes of transit for each of the Toronto neighbourhoods. 

Similarly to the **Accessible Within 15 Minutes** tab, zoom in and out by using your mouse’s scroll wheel or the +/- buttons in the top left hand corner of the map. 

In the sidebar, you can toggle on and off layers, where the **Suitability** layer is a more granular view of the data summarized in the **Neighbourhoods** layer. Similarly to the maps in the **Accessibility Within 15 Minutes** tab, clicking on any of the service points or the neighbourhoods opens a pop up with more information. 

Select the About the App tab to view some information about the app and a user guide.

## Data and methods

Networks for each of the 4 transit methods (walking, cycling, public transit, and driving) were created in ArcGIS Pro. The walking network used the City of Toronto pedestrian network. The cycling network used a level of traffic stress (LTS) network. The public transit network used TTC GTFS data scheduled from 2026-01-04 to 2026-02-07 alongside the pedestrian network. The driving network similarly used the Toronto centrelines with a speed added. and the pedestrian network.

Service area was calculated from each of the service locations on all four networks at 5, 10, and 15 minute intervals. For the cycling network, LTS 3 was used (corresponding to roads "enthused and confident" cyclists might take), and the transit network used a schedule at 8:00am on a weekday. 

For the accessibility score, a suitability analysis was calculated for the city using all of the service area layers. Walking was the highest scored mode of transportation, followed by cycling, public transit, then cars. The raster produced by the tool was then summarized to the neighbourhood level. 

| Table                      | Link                                                                                                                                                  |
|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| Hospitals                  | [ArcGIS Online REST Layer (from City of Toronto)](https://services3.arcgis.com/b9WvedVPoizGfvfD/arcgis/rest/services/COTGEO_HOSPITAL/FeatureServer/0) |
| Schools                    | [Toronto Open Data](https://open.toronto.ca/dataset/school-locations-all-types/)                                                                      |
| Grocery Stores             | [ArcGIS REST Layer (from City of Toronto)](https://services3.arcgis.com/b9WvedVPoizGfvfD/arcgis/rest/services/COTGEO_SUPERMARKET/FeatureServer)       |
| Libraries                  | [Toronto Open Data](https://open.toronto.ca/dataset/library-branch-general-information/)                                                              |
| Community Centres          | [Toronto Open Data](https://open.toronto.ca/dataset/parks-and-recreation-facilities/)                                                                 |
| TTC GTFS Data              | [Transitland (from City of Toronto Open Data)](https://www.transit.land/feeds/f-dpz8-ttc~surface)                                                     |
| Toronto Neighbourhoods     | [Toronto Open Data](https://open.toronto.ca/dataset/neighbourhoods/)                                                                                  |
| Toronto Centerlines        | [Toronto Open Data](https://open.toronto.ca/dataset/toronto-centreline-tcl/)                                                                          |
| Toronto LTS                | [Github, under MIT License [^2]](https://github.com/lin-bo/Toronto_LTS_network)                                                                       |
| Toronto Pedestrian Network | [Toronto Open Data](https://open.toronto.ca/dataset/pedestrian-network/)                                                                              |

### Additional Sources  
[^1]: Jin, T., Wang, K., Xin, Y., Shi, J., Hong, Y., & Witlox, F. (2024). Is a 15-minute city within reach? Measuring multimodal accessibility and carbon footprint in 12 major American cities. Land Use Policy, 142, 107180. https://doi.org/10.1016/j.landusepol.2024.107180

[^2]: Lin, B., Chan, T. C., & Saxe, S. (2021). The Impact of COVID-19 Cycling Infrastructure on Low-Stress Cycling Accessibility: A Case Study in the City of Toronto. Findings, 19069\. DOI: https://doi.org/10.32866/001c.19069.
