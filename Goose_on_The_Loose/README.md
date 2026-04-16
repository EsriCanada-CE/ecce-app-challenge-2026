# Welcome to the Sustainable Halifax Snow Transportation App
## <img width="1146" height="420" alt="image" src="https://github.com/user-attachments/assets/93844534-e694-497b-a0db-e078a7539691" />
<img width="1919" height="992" alt="image" src="https://github.com/user-attachments/assets/751ec003-73c7-4aa0-aee3-de00f546ab39" />

## Team
Connor Chataway

Oliver Baker

Tyson Hamilton

# Mission Statement
Most Canadian cities face a persistent mobility challenge. Severe winter events, including heavy snowfall, freezing rain, and extreme cold, regularly disrupt transportation systems, limit access to essential services, and disproportionately impact individuals who rely on public transit, active transportation, and accessible infrastructure. These disruptions are not experienced equally. Research consistently shows that mobility barriers during winter conditions disproportionately affect seniors, persons with disabilities, lower-income households, and individuals without access to private vehicles (2). As climate variability increases the frequency and intensity of extreme weather events across Canadian municipalities, ensuring safe and equitable mobility during winter conditions is becoming an increasingly urgent urban resilience priority (1). Our app responds directly to this challenge by supporting safe, inclusive, sustainable mobility during severe winter events through the identification and visualization of accessible and sustainable transportation infrastructure. Leveraging open municipal data from the Halifax Regional Municipality, including sidewalk networks, cycling infrastructure, transit routes, and accessibility features, the platform translates complex geospatial datasets into a user-centred decision-support tool.

The app's mission is to strengthen community resilience by enabling residents to navigate winter conditions more safely and confidently, particularly those who depend on barrier-free routes and public transportation. By highlighting cleared pathways, accessible connections, and multimodal options such as active transportation and transit corridors, the app promotes continued connectivity during hazardous weather events while reinforcing the visibility and usability of sustainable mobility networks. The app also advances a people-centred approach to urban systems. Transportation is a determinant of access to employment, healthcare, education, and social participation (4). When winter conditions compromise mobility, they risk deepening social exclusion and spatial inequities. By prioritizing accessibility and sustainability, the app supports more equitable access to urban space and contributes to inclusive city-building.

At its core, the app bridges the gap between publicly available municipal data and real-world decision-making. While cities increasingly publish open datasets, these resources often remain underutilized due to technical complexity and limited accessibility for everyday users (3). By operationalizing this data into an intuitive and actionable interface, the app enhances situational awareness and supports informed mobility planning during extreme weather events. Beyond improving day-to-day winter navigation, the app contributes to longer-term urban resilience by encouraging continued use of public transit and active transportation even in challenging conditions. In doing so, it aligns with broader municipal sustainability goals, including emissions reduction and the adoption of multimodal transportation, and supports the transition toward safer, more inclusive, and climate-adaptive urban mobility systems.

# App Characteristics
The Halifax Snow Transportation App is designed as a policy communication tool, reflecting a shift in policy thinking from an approach prioritizing automobile dependance toward a model focused on multimodal streets, and the use of more sustainable transportation modes. Here are the key characteristics of the app:

## 1. Multi-Modal Accessibility:
The main feature of the app is the navigation bar at the bottom of the app screen that offers toggles for multiple transportation modes that include walking, cycling, and public transit.

By separating these modes, this characteristic best acknowledges the different infrastructural requirements for plowing. For example, plowing roads for buses are a much more strenuous and complex process than clearing bike lanes (cycling) or sidewalks (walking).

## 2. Temporal Transparency (Priority Tiers)
The sidebar defines service levels based how quickly snow is cleared (12, 24, and 36 hours).

This reflects a Service Level Agreement as set out by the City of Halifax. Instead of vague promises to just clear snow, the app uses specific time intervals to manage public expectations and provide a measurable metric of city performance according to Snow Clearing Service Standards set out by the City. 

## 3. Visual Hierarchies of Infrastructure
Colours are also used to symbolize different priority tiers where Red indicates the highest priority, blue indicates a medium priority, and green indicates a low priority.

Colours allow for spatial clarity and easily distinguish primary networks from secondary or tertiary networks.

## 4. User Oriented
By asking to select the preferred transport mode and desired priority level, users can use the interactive map to support their judgement and planning for their own activities.

Through the use of this app, users can easily determine what the most accessible transit option is based on their own personalized commute plans ranging from 12-36 hours in advance. This feature also reduces accident totals and the amount of stranded commuters in the City of Halifax.

# Limitations

## 1. The "Last Mile" Connectivity Gap
The app shows when main arteries on the interactive map will be cleared, but it does not account for the unplowed curb or driveway windrow (the pile of snow left by street plows).

A cyclist or pedestrian can find a clear path for the large majority of their commute, but can still by blocked by small barriers at specific intersections or bus stops. The app provides a view over a large scale, but cannot account for these small barriers.

## 2. Intent versus Execution
The app reflects a fixed city mandate by the City, but does not always reflect execution during an anomaly.

Plows must attend higher priority routes first, but cannot do so if city resources are pulled away from disruptive events such as a major water main breaking or if emergency vehicles are stuck on other streets. The app does not show how priority routes are affected in emergencies.

## 3. Digital Divide and Accessibility
The app requires a smartphone, data plan, and the basic ability to interpret a GIS map.

Vulnerable populations such as the elderly, those with visual impairments, or low income residents without reliable data may not be able to access or understand information presented in this app. This creates an inequality where technically proficient residents are safer than others.

# User Guide
## Getting Started
When you open the application you will be greeted with a splash page containing basic information about the application. Click on 'Close' to proceed to the main app. Also check 'Don't show this message again' to avoid seeing the splash page again after hitting refresh.
<img width="1919" height="995" alt="image" src="https://github.com/user-attachments/assets/2b6e07cf-d45d-4772-b729-af61cc1fadb5" />

## App Interface and How to Use
### Main Page (Walking): <img width="1328" height="749" alt="image" src="https://github.com/user-attachments/assets/57a3b9f2-9393-475d-b74c-a738618e4928" />
These elements are common to all pages in the app:
  1. Dynamic Network Map: The primary visual field that displays cleared       routes (e.g., "Plowed Walkways") across the Halifax and Dartmouth         regions.

  2. Modality Selectors: Tabs that allow users to switch between               different transportation modes including Walking, Cycling and             Transit.

  3. Service Level Agreement Filters: Interactive buttons that let             users toggle routes based on the city's committed clearance               timelines: 12, 24, or 36 hours where displayed routes are cleared         within the time period selected in addition to routes serviced in         less time (i.e. must select 12 and 24 to view all routes cleared          within 24 hours, etc).

  4. Interactive Symbol Guide / Legend: A reference panel explaining the       colour coding (Red, Blue, Green) used to represent different priority      levels on the map.

  5. Navigation Toolbar: A suite of map-management tools, including a          search function, home view, and base map gallery.

  6. Geolocation Tool: A button used to center the map on the user’s           current physical location for localized route planning.

  7. Zoom Controls: Standard buttons to adjust the map scale for better        visibility of specific streets or neighbourhood connections.

  8. Contextual Help & Instructions: A sidebar providing "Helpful Tips"        to guide the user on how to interact with the different data layers       and filters.

### Features only available in other pages:
#### Cycling Page:
<img width="371" height="305" alt="image" src="https://github.com/user-attachments/assets/5f6db5e4-1ec7-4caa-a3c8-6eb5568e2650" />

The Cycling Abbreviations panel serves as a technical legend that translates municipal infrastructure codes into plain language for residents.

#### Transit Page: 
<img width="287" height="420" alt="image" src="https://github.com/user-attachments/assets/3491cef7-16fb-4d64-bd4e-dfca7bd8256f" />

The Bus Route Selection Tool acts as a personalized filter for the transit network:
  
  - Individual Isolation: When you select a specific route number, the        map hides all other data to show exactly where that bus travels.

  - Multi-Route Planning: You can select multiple buttons at once to          visualize a full trip that involves transfers between different buses.

  - Status Mapping: Once selected, the specific bus lines appear on the       map colour coded by their Priority Level (Red for 12h, Blue for 24h,       or Green for 36h).

  - Operational Transparency: This allows a rider to see if the specific      streets their bus relies on have been cleared yet according to the        city’s promised timeline.

## Statement of AI Use
For this submission we used AI in a variety of ways. AI was mainly used to help brainstorm ideal qualities for the Halifax Snow Transportation App and learning how to use ArcGIS Online and GitHub software through identifying key steps for the use of certain tools and concepts. AI was less extensively used for outlining a written structure for documents such as this markdown document and for the video. 

# Sources

## Articles:
(1) Climate Change 2023 Synthesis Report: Summary for Policymakers. IPCC. (2023). https://www.ipcc.ch/report/ar6/syr/downloads/report/IPCC_AR6_SYR_SPM.pdf 

(2) Ermagun, A., & Zhang, E. (2025). Mobility of disadvantaged communities exhibits lower sensitivity to extreme weather. Travel Behaviour and Society, 42, 101163. https://doi.org/10.1016/j.tbs.2025.101163 

(3) Janssen, M., Charalabidis, Y., & Zuiderwijk, A. (2012). Benefits, adoption barriers and myths of open data and open government. Information Systems Management, 29(4), 258–268. https://doi.org/10.1080/10580530.2012.716740 

(4) Lucas, K. (2012). Transport and social exclusion: Where are we now? Transport Policy, 20, 105–113. https://doi.org/10.1016/j.tranpol.2012.01.013 

(5) Snow Clearing Service Standards. Halifax Regional Municipality. (2025). https://www.halifax.ca/transportation/winter-operations/snow-clearing-service-standards

## Data:
(1) Halifax Open Data Catalogue. Halifax Regional Municipality. (2026). https://data-hrm.hub.arcgis.com/pages/open-data-catalogue
