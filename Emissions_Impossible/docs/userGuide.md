# Route to Change - User guide

This document provides support for users navigating the Route to Change interface by documenting key functionality and GUI elements.   
  
Visit the app [here.](https://www.arcgis.com/home/item.html?id=d15ffa9ee8b840df879277635594d149)

## Navigating the Home Menu  
<img src="../Images/homeMenu.png" alt="HomeMenu" style="width:75%; height:auto;">  
  
The user can navigate between the current situation (i.e. all current drivers), the proposed situation (i.e. new ridership from proposed bus routes) and the future scenarios (different fleet configurations) by selecting the relevant buttons. 


## Page 1   
  
Page 1 displays the current distribution of driving-related emissions among census tracts, based on the sample of daily driving commuters recorded in the 2021 Census.

The user may select a census tract polygon in the map view, and a dynamic pop-up will describe the proportion of daily commuters residing in that census tract who drive to work and the summed daily driving-related emissions for that census tract. When a polygon is selected, the daily commute journeys for all sampled drivers residing in that census tract will  flash on the map as origin-destination lines.  
<img src="../Images/p1_interaction.png" alt="Driver Census Interactivity" style="width:75%; height:auto;">  
  
The emissions were derived from routes calculated using Network Analysis in ArcGIS Pro, but for the purposes of visualization only the straight-line, "as the crow flies" paths are displayed. From here forward the terms "commute route", "commute path" and "commute line" will be used interchangeably to refer to the straight line origin-destination connectors.  

The user can choose to view the selected related records by toggling on Show selection on the Daily Commute Routes table.  
![Show Select](../Images/p1_showselect.jpg)
 
The user can select the layers icon to toggle on the daily commute route layer to visualize all commute lines at once.   
![Toggle Layer](../Images/toggle_layer.png)
  
To assess specific commute lines and their use rate and associated driving time, the user can select individual records in the table  and the corresponding line will be highlighted on the map. Alternately, they can select a line on the map and the record will be highlighted in the table.  
<img src="../Images/select_route.png" alt="Select Route" style="width:75%; height:auto;">  
  
The same logic follows for viewing census-level emissions levels; the user simply clicks on a car icon in the list and that census tract will be highlighted on the map, or vice versa.  
<img src="../Images/select_tract.png" alt="Select Tract" style="width:75%; height:auto;">  
  
The user can flip between viewing the records of commute routes or a list of census tracts by selecting the relevant option in the pane at the top of the table.  
![Table Interactivity](../Images/p1_table.png)  

The user can also choose to export any table by selecting on the Actions on the top right and selecting Export.  
![Page 1 Table Export](../Images/p1_export.jpg)  

## Page 2 
  
Page 2 is where the viewer can assess the improvements to ridership and emissions associated with the proposed bus routes, under different assumptions for max acceptable commute time (i.e. willingness to travel by transit).
  
The home view ("All Transit Time Thresholds) displays the proposed bus line feature class as well as layered service areas demonstrating the areas within different walking distances to each proposed bus stop. 
  
The figures on the right panel display projected new riders (i.e. number of previous drivers predicted to switch to transit) and the total adjusted emissions from these proposed transit users; both figures are repeated for each time threshold. These figures dynamically adjust when the user pans/zooms on the map.   
<img src="../Images/pg2_home.png" alt="Page 2 Home" style="width:75%; height:auto;">  

Switching from the "Figures" pane to the "Data Table" pane, with the "Daily Commute Route" layer selected from the dropdown, the user can re-inspect the daily commute routes but this time with an added column for predicted transit time adjusted for the proposed rapid bus network.  

![Page 2 Data Table Pane](../Images/p2_data_table.png)  

A user can click on a census tract and the number of potential new transit users within each willingness to travel threshold will be displayed along with the predicted remaining drivers and the transit-related emissions. Once again, all of the current routes taken by daily drivers from that census tract will be highlighted.  
<img src="../Images/pg2_click_census.png" alt="Page 2 Select Census Tract" style="width:75%; height:auto;">  
  
To view the predicted differences in ridership and emissions for each individual time threshold, the user can select an option from the pane on the bottom.  
<img src="../Images/p2_thresholds.png" alt="Page 2 thresholds" style="width:75%; height:auto;">  

The resulting map will be filtered to display only census tracts with commuters served by the expanded bus network (i.e. whose transit-adjusted commute time is within the specified time threshold).   
  
The figures on the right display the average census-level emissions within the threshold assumption, as well as the number of predicted new transit-users. These numbers adjust dynamically as the user zooms on the map to reflect only the census tracts in the current extent.  
<img src="../Images/p2_zoom.png" alt="Page 2 Zoom" style="width:75%; height:auto;">  

Once again, the user can select an individual census tract on the map. This time the popup will only display information related to that time threshold assumption, and only commute lines within that limit for transit-adjusted time will be displayed on the map.  
<img src="../Images/p2_click_census_within_threshold.png" alt="Page 2 Select Census Tract in Threshold" style="width:75%; height:auto;">  

If the user wants to toggle on the commute route lines as a layer in each threshold page, the layer will be filtered for only transit commutes within that time limit.  

Like in the previous page, the can user navigate to the Data Table and choose to export the data by selecting on the Actions button the top right and selecting Export.
![Page 2 Table Export](../Images/p2_export.jpg)  

Similarly to the All Transit Time Thresholds page, if the user switches to the data table pane within an individual threshold page, they will see a list of records with columns for the current volume of commuters on each route and the adjusted commute time using public/rapid transit. However, the records will once again be filtered for only commutes  served by public transit within that travel time threshold. 

## Page 3 
Page 3 models emissions results based on different bus fleet fuel configurations, assuming the proposed rapid bus is implemented. Users can toggle between the 3 scenarios in the bar at the top of the page.  
<img src="../Images/pg3_menu.png" alt="Page 3 Menu" style="width:75%; height:auto;">  

Within each scenario, users can toggle between the different willingness to travel time thresholds in the menu on the left side of the map.  

![Page 3 Time Thresholds](../Images/pg3_threshold.png) 

The percent change in emissions as well as total emissions savings (compared to the 100% diesel scenario) will display as statistics on the right side of the page. 

Since the change in emissions using the alternative fuels was modelled as a fraction of the emissions rate of 100% diesel fuel, the percent change will be preserved across the time thresholds. 
When a user toggles between the time thresholds, the total emissions savings will update. 

A user can click on a census tract to view more information about how each scenario affects each census tract individually. The popup will display information such as the total emissions under the baseline (100% diesel) scenario, the new simulated emissions and the projected emissions savings, all at the census-tract level.  

![Page 3 Popup](../Images/pg3_popup.png) 