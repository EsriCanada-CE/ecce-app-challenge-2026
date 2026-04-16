# Halifax Regional Municipality Sustainable Transportation User Manual

An interactive App that combines carbon footprint calculator, calories calculator in functional maps to helps users explore transportation options in Halifax. Plan routes, explore mode-specific map layers (walking safety, cycling conditions, transit context, and EV/parking information), and compare them among 6 transportation modes.



Why is this APP unique:   

Currently, there is no carbon footprint app associated with maps, trip planning and fitness functions.  

Instead of simply tracking consumption after the trip, it plans trip ahead to help personalize suitable transportation, and balance among cost, eco and convenience/ accessibility  

Many features in One APP-- users can compare different transport modes in one app through visualization and summary


## Goals
- An APP based on recording your daily carbon footprint by calculating users’ travelling route
- Encouraging users to choose an eco-friendlier transportation mode by comparing data between carbon reduction and calories consumption from the same transportation mode
- Estimate carbon reduction and calories consumption ahead of the trip also help to personalize suitable transportation – find a balance between eco-friendly and physical ability 
- Not just planning track your route. Provide map-based context to support easier, safer and more informed travel choices 
- planned but waiting for further development function: 
  - summary of user selected travel preferences/ frequency/ Carbon reduction report for government analyze to build up the city
  - Cost Analysis to balance environmental sustainability and individual sustainability
 
---

## How to use
Main Page: 
1. Use the top menu bar to switch tabs: Main, Walk, Bike/Scooter, Bus, Automobile.
2. On Main page, click “Plan Your Trip!” (bottom-left) to open the sidebar of travel-mode panel on the right. Scroll to compare modes (Walk, Bike, Scooter, E-bike, Bus, EV, Hybrid, Gas).
3. Toolbox: 
   - Find Your Way: to set origin/destination and generate a route.
   - Layers: to show/hide datasets on the Main map.
   - Measurement: measure distance or area.
   - Coordinates: click/hover to display coordinates.


4.	After creating route, the mode panel will display estimated **carbon reduction vs. a gasoline car** and **calories burned**.
5.	When users have made decision on choosing a transportation mode, click on button “GO!” on the card of desired mode, then transfer to the specific Transportation mode pages

---

Transportation mode pages: 
1. Another way to navigate to transportation pages is to click on the top menu bar. 
2. Transportation modes was organized into four sections: Walk, Bike/Scooter, Bus, Automobile according to their travel characteristics 

3.Each section owns its unique designed map with helpful symbols that could make the user’s trip easier, depending on the mode they choose

4.Click any symbol open a pop-up with facilities’ detailed        information.

5.Change basemap by preference. 

6.Side bar toggle: searchable information depending on different transportation section map


6. New function in Toolbox: 
   - Layers:
       - Turn on and off map layers to help keep map clean
       - Help users understand symbols with legend
       - Choice to turn on and off pop-up
   - Near Me: 
       - Searches nearby features within chosen area and with a   customizable radius and units
          - Walk: public washrooms 
          - Bike/Scooter: bike amenities-repair shops and bike racks-
          - Bus: bus stops
          - Automobile: accessible parking spots and EV charging stations

7. What you can explore (by symbol)

- Walk
  - Pedestrian Collision Points 2025: locations of vehicle–pedestrian collisions: serve as a hint to help user reduce risks
  - HRM Public Washrooms: washroom locations with attributes (e.g., open status, washroom type, baby change table).
  - Additional features was highlighted for user to negative pedestrian-oriented business streets, sidewalks

- Bike/Scooter
  - 2025 Traffic Accidents Related to Bikers: locations of vehicle–bikes collisions: serve as a hint to help user reduce risks
  - Highlighted bike lane for users to navigate their biking/scootering ways, and encourage them to try best and stay on bike lanes for their safety

  - Bike Lane Slope Level: show gentle / moderate / difficult levels to help users estimate their physical effort consumption when biking

-Bus
  - Explore transit context layers and bus stop symbols on the map (click for pop-up details).
  - Use the sidebar to open the “bus search” panel (desktop/web: right edge; mobile/portrait tablet: bottom).

- Automobile
  - HRM-Owned EV Charging Station
  - enterprise EV Charging Stations
  - Parking Pay Zones
  - Pedestrian Oriented Commercial Streets: hint to drive carefully and Watch Out Pedestrians


Data sources
This app uses open spatial data from the Halifax Regional Municipality (HRM) and other public Canadian sources.  

Walk

trails, sidewalks, walkways, pathways and Multi-Use Pathways 

https://data-hrm.hub.arcgis.com/datasets/a3631c7664ef4ecb93afb1ea4c12022b_0/explore?location=44.652506%2C-63.599770%2C15 

 Pedestrian Oriented Commercial Streets
https://data-hrm.hub.arcgis.com/datasets/a547ade00f604ec79c8fc2c5d8d49d51_0/explore?location=44.655738%2C-63.581935%2C14


Bus

Bus stops  

https://data-hrm.hub.arcgis.com/datasets/29de9d04a3454e11a1e0a1f78a27bc07_0/explore?location=44.638687%2C-63.680296%2C13 

Transit Shelters 

https://data-hrm.hub.arcgis.com/datasets/e1ab0076711c4df8828009d248495692_0/explore?location=44.653312%2C-63.600443%2C16 

 

Transit Bus Routes 
https://data-hrm.hub.arcgis.com/datasets/69adb7a88a4e4343bf5ae7c381f2d9af_0/explore?location=44.726514%2C-63.570870%2C10 

 


Bike  
Bike lanes 
https://data-hrm.hub.arcgis.com/datasets/21ce9644218248f59a3d13690b789eec_0/explore?location=44.663826%2C-63.608528%2C12 
 
Bike Amenities 
https://data-hrm.hub.arcgis.com/datasets/218bfbdfafb44e06800723981e7812cf_0/explore?location=44.851532%2C-63.286033%2C9 

traffic collisions
https://data-hrm.hub.arcgis.com/datasets/e0293fd4721e41d7be4d7386c3c59c16_0/explore?location=44.863798%2C-63.126762%2C9


Automobile 

Accessible Parking Spots
https://data-hrm.hub.arcgis.com/apps/326598f47ca34be78e001bc2984f653a/explore


Parking Pay Zone
https://data-hrm.hub.arcgis.com/datasets/00e12ac25a244050b1842758c786f6fc_0/explore?location=44.650269%2C-63.586727%2C14

HRM owned Electricity car charging stock 
https://data-hrm.hub.arcgis.com/datasets/5447b08b3e254c99aedf9665c7e6d5a4_0/explore?location=44.675184%2C-63.645246%2C12 


Enterprise owned electricity car charging stocks

https://natural-resources.canada.ca/energy-efficiency/transportation-energy-efficiency/electric-charging-alternative-fuelling-stationslocator-map#/analyze?country=CA&tab=fuel&fuel=ELEC

aggregated fuel economy numbers
https://www.cer-rec.gc.ca/en/data-analysis/energy-markets/market-snapshots/2019/market-snapshot-how-does-canada-rank-in-terms-vehicle-fuel-economy.html

Human Food Carbon Consumption
https://www.sciencedirect.com/science/article/abs/pii/S0959652621024628?via%3Dihub
 
