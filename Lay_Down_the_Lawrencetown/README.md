# Team
* Glenn Gentil
* Sam Mair
* Adam Nearing

# Mission Statement

On the 25th of September 2015, the United Nations met in New York City to create a 15-year agenda aimed at promoting peace and prosperity. After three days of deliberation they constructed an action plan, signed by all 193 world leaders, called Transforming Our World: The 2030 Agenda for Sustainable Development by 2030. The plan contained 17 goals that the United Nations hoped to achieve by the year 2030 for the betterment of both people and the planet<sup>(1)</sup>.

The eleventh of these goals was to make cities inclusive, safe, resilient and sustainable. More and more people move to metropolises every year, with 70% of all people expected to live in an urban landscape by the year 2050<sup>(2)</sup>. Though cities provide great economic, cultural and societal benefits, many modern cities have been designed around the invention of the motor vehicle, leading to urban sprawl, limited green spaces, and increased air pollution. It is estimated that 40% of yearly CO<sub>2</sub> emissions are caused by the built environment<sup>(3)</sup>. This goal was introduced to ensure humans migrating towards high-density communities are still afforded easy access to the amenities needed to live comfortable lives and provide for their families: improving their quality of life and not forcing them to contribute further to our increasingly pressing environmental crisis.

Yet despite it being over a decade since Canada signed this agreement, urban sprawl still plagues Canadian communities everywhere, limiting access to important resources such as healthcare centres and daycares. Only 20% of Canadians are living in an “amenity dense” region, where basic necessities are within a reasonable distance<sup>(4)</sup>. This forces families to use costly and unsustainable forms of transport to complete simple tasks like buying groceries or bringing their children to school. A 2025 study showed that 47% of Canadians feel that they have no choice but to use a motorized vehicle to navigate their community, even if it is not environmentally friendly<sup>(5)</sup>. 

So what options are available to mitigate this necessity for motors? Carlos Moreno of Panthéon-Sorbonne University offers a solution. In order to reduce emissions and ensure equitable access to resources, cities need to be built in ways that prioritize sustainable forms of transport. One way of approaching this is the 15-minute city: an urban development strategy “where inhabitants have access to all the services they need to live, learn and thrive within their immediate vicinity”<sup>(6)</sup>. The concept is that every city resident can access all the basic amenities they need within a 15-minute walk of their apartment. This not only allows citizens the means of shifting their daily locomotive strategies to ones that are more sustainable, but also facilitates adding more green spaces, widening sidewalks, and creating livable spaces that are human-centric, not vehicle-centric.

Your 15-Minute City strongly believes that refocusing urban development on providing accessible, local resources will drastically reduce the use of unsustainable transportation, grow small businesses, and help to rebuild local communities. As people who love the city of Halifax, we want to empower families, who are looking to make Halifax their home, with tools that can help in making sustainability-conscious decisions while choosing where to move, while also publicizing data that could aid decision-makers in improving the sustainability and livability of the Halifax Regional Municipality. Our mission statement is to provide people who see, or foresee, Halifax as their home, the resources they need to make informed, future-focused decisions regarding sustainability and accessibility.

# Statement of Characteristics
Your 15-Minute City is designed with two demographics in mind: people and families looking to move to Halifax, and decision-makers who have influence over the city’s development. For this reason, our app has two separate tabs that serve different functions. The overall goal of the app is to provide resources relating to sustainable forms of transportation, namely walking and biking, centered around the idea of a 15-minute city.

### In My Neighbourhood

The page that greets you when you open the app is the ‘In My Neighbourhood’ tab. The features in this tab have Halifax house-hunters in mind, providing resources so they can choose a property that facilitates their desire to use sustainable transportation options.

The default view shows a wide range of amenities located in the Halifax Regional Municipality. Our compiled dataset includes grocery stores, green spaces, daycares, schools, libraries, healthcare centres, bus stops, and various forms of recreation. Though users can explore the full dataset and click each amenity to see a curated information panel, this initial view is designed to be a simple overview of what Halifax has to offer.

To receive more detailed information, the user starts by choosing whether their preferred sustainable transport method is walking or cycling. This changes the distance calculations used by the app. They then select a location in the Halifax Regional Municipality, either by typing one into the address bar, or using the location picker to click on the map. This allows the tool to function both for those who know the addresses of potential properties they will be moving to, and those who just have a general idea of the area they are interested in.  

Once their potential property is selected, data is filtered to only show amenities within 15 minutes of travel. They can then see or download a list of those amenities, categorized by type, for their convenience.

The values for score, CO<sub>2</sub> emissions, and savings, also update once a location is selected. These general overviews are meant to be a quick and easy way for the user to tell if the property suits their needs. Below is an overview of each feature: 

**Scores:** The walkability/cyclability scores rate how much can be accessed in the chosen location within a 15-minute walk. It changes to consider the needs of a family or an individual, based on the user-selected option. A higher number indicates that the area is more convenient to walk/cycle in for the selected demographic. To make its decision, the calculator considers what amenities are of most importance for the chosen demographic. An example for families is how schools and healthcare centres are rated higher, whereas for individuals, bus stops and grocery stores are given more weight. Each of the eight amenity types are evaluated in this manner, then their value is added to the score, only if an amenity of that type is within distance. This is a quick, easy, customizable, and accessible way, for people who aren’t deeply familiar with Halifax, to determine whether their home is going to suit their desire to use sustainable transport. 

**Carbon footprint reduction:** This number represents, in kilograms of CO<sub>2</sub> per year, how much the user’s carbon footprint would be reduced if they moved to their selected address and chose to walk to amenities in their vicinity instead of driving. We believe this number to be beneficial, for those who are passionate about sustainability and the environment, to quantify how impactful moving to an area with greater walkability is for them. The number is based on a few assumptions: the first is that the user, where they currently live, chooses to drive to each amenity near them. It also makes assumptions about how often they visit each amenity type, such as going to the grocery store once a week, and a healthcare centre twice a year. A full list of assumptions and their justifications can be found in the methodology section of the README file. 

**Savings:** This feature functions identically to the carbon footprint reduction calculator, except its value is adjusted to display the price in gas you would save by walking/cycling instead. Affordability is important to all people and displaying costs saved is great not only as access to information, but also as a motivator to help people choose sustainable transportation options where available. 

Other features of this tab include:
 - A ‘what is my score?’ button, letting the user know more about how their walkability/cyclability scores were calculated, as well as which amenity types are not within their transportation boundary.
 - A basemap viewer so users can change the basemap if there are features of the default basemap that present accessibility concerns.
 - A layer viewer, letting users toggle off amenities that they do not need to see.
 - A legend that explains the symbology.

### Infrastructure Planner

This tab opens with a view of the Halifax Regional Municipality segmented into a grid of hexagons. Each of these hexagons represent a subregion of Halifax that can reasonably be walked by an able-bodied person within 15 minutes. To meet sustainable transportation goals, each of these small communities should have access to most, if not all eight amenity types, and be adequately paved for walkers and cyclists. 

Each community is coloured based on its score, calculated similarly to the scores seen on the In My Neighbourhood tab. This is to let decision-makers quickly assess what areas need the most work. More information about the colouring system can be found in the legend.

Once a community is selected, the information within the panel updates. Three data points are shown: location score, roads with sidewalks, and bike-accessible roads. These statistics were chosen because we see them as being important factors in developing communities that are accessible to means of sustainable transport, while also being easier to fix than other, more costly alterations.

**Location score:** The location score on this page matches the family walkability score from the In My Neighbourhood tab, with results multiplied by ten to produce a score out of 100. Thus, the score is impacted by whether the community has access to the types of amenities the average family might appreciate.

**Roads with sidewalks:** even if an area has many amenities within walking distance, that means little if the roadways aren’t constructed with pedestrians in mind. This calculator checks to see how many of the roads in an area have connected sidewalks: if the number is too low, that might mean those community members can’t safely walk to their desired amenities, even if they’re within walking distance.

**Bike-accessible roads:** This number is important for similar reasons to the sidewalk percentage. Without cycle lanes or designated bike paths, cyclists may feel forced to use sidewalks or high-speed roads, potentially being dangerous for themselves or others.

By clicking ‘learn more’, users can gain a more detailed breakdown of potential approaches to improve the area’s propensity for sustainable transportation. It will inform the user if any amenities are not in the area, or if the sidewalk/bike-accessible road percentages fall below 60% or 45%, respectively.

Other features include the ability to export the map, as well as an option to change the basemap.

### Addendum
It is worth noting that although each tab of Your 15-Minute City has certain demographics in mind, the tabs may also be valuable to others with a shared interest in Halifax. The app is intentionally designed to be easy to use and modify for anyone’s needs such that it is relevant and accessible to all who wish to use it.


# Methodology

### Rating Calculators
The walkability/cyclability scores as well as the location scores, considered ‘ratings’ for the rest of this documentation, are calculated by the types of amenities located in the surrounding area. Amenities are categorized into the following groups:
* Grocery stores
* Schools
* Daycares
* Healthcare centres
* Green spaces
* Recreation
* Libraries
* Bus stops

Each amenity is assigned a weight based on importance to the average individual living in Halifax. These weights are generalized and based on personal experience. The weighting system is organized as shown below.

For families:
1. Schools 20%
2. Groceries 15%
3. Daycares 15%
4. Healthcare 15%
5. Green spaces 10%
6. Bus stops 10%
7. Recreation centres 10%
8. Libraries 5%

For individuals:
1. Bus Stops 25%
2. Groceries 25%
3. Recreation centres 15%
4. Green spaces 15%
5. Healthcare 10%
6. Libraries 10%

These percentages are then converted to decimals and multiplied by 10 or 100, depending on whether the displayed rating is out of 10 or 100, respectively. The methods for determining ratings based off of these values, though similar, differ between the In My Neighbourhood and Infrastructure Planner tabs:

#### In My Neighbourhood tab:

Here, the user can choose at will whether they are calculating a rating for a family or for an individual. When the user uses our search function, or adds a point onto the map, a buffer zone is created around the selected location: this buffer has a 1km radius if walking is selected, and 2km if cycling is instead chosen. The app checks to see which of the eight aforementioned amenity types are located within the buffer zone: if an amenity type is detected, its value is added to the score. It is worth noting that the quantity of an amenity is not relevant to the calculation: a buffer containing 10 bus stops will not score higher than an otherwise identical buffer containing 1 bus stop. 

The following is an example of the app in operation:

The user indicates that their preferred method of travel is walking and that they are moving to Halifax as an individual. They then select a location in Halifax. The 1km buffer around their chosen point detects the following amenities:
* 7 grocery stores
* 5 bus stops
* 3 recreation centres
* 2 schools
* 1 healthcare centre
* 1 green space
* 0 libraries
* 0 daycares

Since the user stated that they would be moving to Halifax on their own, grocery stores and bus stops are weighted at 2.5, recreation centres and greenspaces at 1.5, healthcare centres and libraries at 1.0, and schools/daycares at 0. The app then finds the sum of values of the amenity types that were found within the buffer. For this example, that calculation would be 2.5 + 2.5 + 1.5 + 1.5 + 1, resulting in a rating of 9/10. 

#### Infrastructure Planning tab:

In this tab, ratings have been pre-calculated to reduce load times. The Halifax Regional Municipality is divided into hexagons with a 1km radius. Each hexagon has been analyzed to determine how many amenity types are either inside the hexagon, or within a 200 metre buffer of the hexagon. From there, ratings are calculated in the same manner as for the In My Neighbourhood tab. The values are chosen based on the family weighting system.

### Savings Calculators

The carbon reduction and dollars-saved calculators make a comparison between the following: living in your selected location and using sustainable transport to access amenities within your buffer zone, and living in the average Canadian residence and not using sustainable transportation options. Similarly to the rating systems, both savings calculators take into consideration the amenities located within the user’s designated buffer zone and update a “score” value based on the total amenity types. This score was calculated by the developers of Your 15-Minute City and based on the following research:

**Amenity distance:** a study by Smith et al. states “the median of average home-to-store distances ranged from 4 to 5 km across all cities”<sup>(7)</sup>. For this reason we decided to choose 5 kilometres as the average distance to amenities.

**Kilometres per litre:** Though we could not find Canadian data, the United States Environmental Protection Agency assumes an average fuel economy of 22.2 miles per gallon<sup>(8)</sup>, which is the number we used after converting to kilometres per litre.

**CO<sub>2</sub> per litre:** Also from the EPA<sup>(8)</sup>, we converted their calculation of 8,887 grams CO<sub>2</sub>/gallon to kilograms/litre.

**Gas costs:** The average price of gas in Halifax for the month of January 2026 was 130.3<sup>(9)</sup>.

We also needed data on how frequently people travel to each of the given amenity types. Since we could not find public data on this, we instead extrapolated values from our personal lived experiences. We decided that the average person travels:
* Twice a day to school/daycare (pick-up and drop-off), 5 days a week
* Twice a week to some form of recreation (green space or rec centre)
* Once a week to the grocery store
* Four times a year to the library
* Twice a year to a healthcare centre

We turned each of these data points into a distance-traveled-per-year dataset, which was applied to the following formula:

**Calculation for CO<sub>2</sub> emissions saved:** yearly distance / km per litre * emissions per litre 

**Calculation for costs saved:** yearly distance / km per litre * cost per litre

Based on these formulas, a value was given to each amenity type. The savings for a given location are then calculated in an identical manner to the previous ratings calculator.

### Path Percentages

The path percentages are calculated by comparing the shape length of roads in each hexagon to the shape length of sidewalks/cycle paths. Each of the three street types were segmented along the hexagon boundaries, providing length values per hexagon for cycle paths, sidewalks and roads. The following calculations were then ran:

**For cycle paths:** (cycle path length / road length) * 100

**For sidewalks:** (sidewalk length / road length) * 100

This creates percentages of roads to paths, giving us an idea of what percentage of roads within the hexagon have a connected sidewalk or cycle path. In situations where the hexagon contains total sidewalk or cycle path lengths that are greater than the total length of roads within the hexagon, the displayed value defaults to 100%.

### Cycle warning

In the In My Neighbourhood tab, if the user is working with the cycling tool and selects a location that does not have any cycle paths within a 2km buffer, a warning is displayed stating that cycling from their selected location is not recommended.

### Learn More

On the infrastructure planning tab, the user can click a button to receive recommendations to improve the selected community’s walkability. The app is capable of making three recommendations:
1. Adding more amenity types
2. Making more cycle paths
3. Building more sidewalks

**1:** Each of the hexagons have been checked for what amenity types are within, with an extra 200 metre buffer. The buffer is to ensure regions aren't penalized for missing an amenity, despite it being right outside the indicated area. If an amenity type is not detected, a recommendation is given to add one in that area.

**2:** Cycle path percentages are calculated as shown above. If the resulting value is less than 45%, it recommends adding more paths. This number is based on standards set by cities at the forefront of sustainable transport, such as Paris, France and Copenhagen, Denmark<sup>(10)</sup>.

**3:** Sidewalk percentages are calculated as shown above. If the resulting value is less than 60%, it recommends adding more sidewalks. This number is based on average sidewalk coverage within Canadian cities: it would solidly place Halifax in the upper average for small cities<sup>(11)</sup>.

# Limitations

Though Your 15-Minute City tries to consider all relevant data and scenarios for Haligonians, time and resource constraints forced certain compromises to be made that limited the app’s scope.

A major limitation was choosing our dataset of amenities. Though we tried to include all amenity types that would be relevant to the average Canadian, some data, such as general shopping, could not be considered. Though this does have an impact on all aspects of Your 15-Minute City, we believe that a large enough dataset of amenities was included that the app remains valuable for the vast majority of use cases.

Other, more minimal limitations also impact other aspects of the app:

**User-selected locations:** When the user specifies a location in Halifax that they would like to learn more about, a buffer is created to approximate a walking or biking distance, respectively. However, this buffer does not consider the local road network, meaning that it may over-approximate how far an individual could travel within fifteen minutes. It also does not take into consideration that people move at different speeds, instead assuming walking and cycling speeds of four and eight kilometres an hour, respectively. 

**Emissions reduced:** This feature makes a lot of assumptions about the user in order to make its calculations. Some of these assumptions are:
* The fuel efficiency of their vehicle
* How far their current residence is from amenities
* The frequency with which they visit amenities
* Their chosen means of travel after moving to Halifax

For each assumption that is wrong, the calculated value becomes less accurate. The dollars-saved calculator makes similar assumptions, while also presuming that the cost of fuel will not fluctuate from its average value during the month of January 2026.

**Cycle warning:** The warning that displays if the user-selected location does not contain any cycle paths does not consider what percentage of the surrounding roads have cycle paths. This could lead to scenarios where no warning is displayed, despite only a small fraction of their usual cycling routes having proper accommodations.

**Path percentages:** when calculating the percentages that represent how many roads in a hexagon have accompanying sidewalks, accommodations were not made for scenarios in which there are sidewalks without accompanying roads. This scenario could lead to a hexagon claiming that 100% of roads in the area have a sidewalk attached to them, despite the statement being inaccurate. A similar issue could occur for the bike-accessible roads calculation.

# User Manual 

Your 15-Minute City is an app  that provides two main functions. In the In My Neighbourhood tab, the user selects a location within Halifax and a personal city is generated, showing local amenities and providing a rating on how well the location functions for people looking to use sustainable transportation. The infrastructure planning window has segmented the Halifax Regional Municipality into a grid of over one hundred 15-minute cities, each providing a detailed overview for city planners to decide what adjustments should be made to turn the area into one that promotes sustainable transportation options.

### In My Neighbourhood tab

This function is designed for people who are looking to move within the Halifax Regional Municipality and want information to help them choose a location that accommodates their sustainable transport choices. An overview is given of amenities within a 15-minute distance either walking or cycling, which is used to generate an overall rating of the area. If cycling is selected, a warning is displayed if there are no cycle paths around your home.

**Step 1.** If the app does not default to the correct tab, start by selecting it in the top right corner.

**Step 2.** On the left side of the app, select whether your preferred method of transport is walking or cycling.

**Step 3.** Choose a location on the map that is located in or around Halifax. This can be done either by searching for the address using the provided search bar or clicking on this: ![location picker icon](./images/locationChooseIcon.png) icon and then selecting a location on the map manually.

**Step 4.** After making your selection, wait for the app to finish analyzing. You’ll know it is finished when the area below the search bar has been populated with your results. When looking at the map, you’ll see a collection of icons that show what amenities can be accessed within 15 minutes of travel from your location. These amenities will be listed in the sidebar on the left side of your screen. You may click this: ![download icon](./images/downloadIcon.png) icon to download the list to a format of your choice.

**Step 5.** On the right side of your screen you will see a rating. This rating indicates how well your chosen location accommodates the method of transportation that you chose in step 2. If you would like to know more about how the rating is formulated, click this: ![information icon](./images/InfoIcon.png) icon, located beside the score. Below the rating, a display also shows how much your greenhouse gas emissions are reduced, and how much money is saved, if you choose to walk to the amenities in your area instead of moving to a less accessible location and driving. By selecting the ‘family’ or ‘individual’ setting, these ratings are adjusted based on your needs.

### Infrastructure Planner tab

This tab is primarily designed to aid people who are making decisions that relate to planning and developing the Halifax Regional Municipality for improvements in accommodating accessible forms of transportation. The city has been divided into a grid of walkable 15-minute cities and evaluated based on a variety of factors. Recommendations for that area of the city can be seen by clicking on the ‘Learn More’ button.

**Step 1.** Navigate to the Infrastructure Planner tab by clicking on it in the top right corner of the app. 

**Step 2.** Click on one of the coloured hexagons to bring up more information about it. The colour pertains to said hexagon’s location score, which can be seen in the panel on the right side. Use the legend to find out more about how these colours are assigned.

By default, the app shows a rating for the area and what percentage of roads have bike-accessible roads or sidewalks. The rating is calculated based on how many different amenity types are found within the walkable city. The eight categories of amenities that the app bases its decisions on are:
* Grocery stores
* Schools
* Daycares  
* Healthcare centres  
* Green spaces  
* Recreation 
* Libraries  
* Bus stops

**Step 3.** Click on the ‘Learn More’ button below the ratings. This brings up our personal recommendations for making the area more sustainable, based on the collected data. Recommendations may include adding new amenities, making new bike lanes, or building more sidewalks.


# Data Sources

| Dataset | Type | Description | Projection | Source | Format |
|---------|------|-------------|------------|--------|--------|
| Building Symbols | Point | Locations of specific building types in Halifax Regional Municipality (HRM). | WKID: 3857 | [HRM Open Data - Buildings](https://data-hrm.hub.arcgis.com/datasets/HRM::building-symbols/about) | File Geodatabase Feature Class |
| Bus Stops | Point | Bus stop locations within the HRM. | WKID: 3857 | [HRM Open Data - Bus Stops](https://data-hrm.hub.arcgis.com/datasets/HRM::bus-stops/about) | File Geodatabase Feature Class |
| Groceries | Point | Food resource locations in Halifax, including grocery stores and food banks. | WKID: 3857 | [Groceries - AGOL Feature Layer](https://cogsnscc.maps.arcgis.com/home/item.html?id=8d8640dd272e4da999cb66dff7a5e63c), [Data Source - Dalhousie](https://storymaps.arcgis.com/stories/c3a8744541d8425c9afc9cc0662ef10c) | ArcGIS Online Feature Layer |
| Active Travelways | Line | Locations of travelways including sidewalks and trails in the HRM. | WKID: 3857 | [HRM Open Data - Travelways](https://data-hrm.hub.arcgis.com/datasets/HRM::active-travelways/about) | File Geodatabase Feature Class |
| Parks | Polygon | Polygons of parks owned by HRM. | WKID: 3857 | [HRM Open Data - Parks](https://data-hrm.hub.arcgis.com/datasets/HRM::hrm-parks/about) | File Geodatabase Feature Class |
| Community Boundaries | Polygon | Polygon of community boundaries, Nova Scotia. | WKID: 3857 | [Government of Nova Scotia - Community Boundaries](https://data.novascotia.ca/Municipalities/Nova-Scotia-Civic-Address-File-NSCAF-Community-Bou/qazs-jfca) | File Geodatabase Feature Class |
|Nova Scotia Hydrographic Network (NSHN) - Inland Waters | Polygon | Water features in Nova Scotia. | WKID: 2961 | [Nova Scotia Geographic Data Directory](https://nsgiwa.novascotia.ca/arcgis/rest/services/WTR/WTR_NSHN_UT83/MapServer) | Map Service |

# References

(1) https://docs.un.org/en/A/RES/70/1

(2) https://www.un.org/sustainabledevelopment/cities/

(3) https://www.ube.ac.uk/whats-happening/articles/15-minute-city/#Heading%203

(4) https://www150.statcan.gc.ca/n1/pub/18-001-x/18-001-x2020001-eng.htm

(5) https://reclimate.ca/wp-content/uploads/2025/06/Re.Climate-Public-Opinion-Summary-2025-Report.pdf

(6) https://www.c40knowledgehub.org/s/article/Carlos-Moreno-The-15-minute-city?language=en_US

(7) https://journals.sagepub.com/doi/10.1177/23998083221129272

(8) https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle

(9) https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000101&pickMembers%5B0%5D=2.2&cubeTimeFrame.startMonth=09&cubeTimeFrame.startYear=2025&cubeTimeFrame.endMonth=01&cubeTimeFrame.endYear=2026&referencePeriods=20250901%2C20260101

(10) https://cleancitiescampaign.org/city-ranking-2025-cycling-infrastructure/

(11) https://pmc.ncbi.nlm.nih.gov/articles/PMC3359219/table/T1/