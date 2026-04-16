# GridTraveler 

## Background 

## The Canada Strong Pass Initiative

Since 2025, the Government of Canada has introduced the **[Canada Strong Pass](https://www.canada.ca/en/canadian-heritage/campaigns/canada-pass.html)**, a seasonal, recurring initiative that offers visitors with free admission to places operated by Parks Canada during the summer months between June and September, and occasionally for holiday periods. These places include destinations such as national parks, historic sites, national museums that are waiting for us to discover.  

### The Dilemma: Traveling to Remote Areas Sustainably and Confidently Without Range Anxiety

As part of 2050 net zero emission commitment, Canada has a mandate to transition to electric vehicles (EVs) to decarbonize transportation. There is also a goal reduce 40-45% of emissions below 2005 levels by 2030 through the **[2030 Emissions Reduction Plan](https://www.canada.ca/en/services/environment/weather/climatechange/climate-plan/climate-plan-overview/emissions-reduction-2030.html)** across all modes of transportation. 

While modern electric vehicles (EVs) can travel long distances, inadequate fast-charging options, charger unreliability, and increased trip planning requirements can make visiting remote recreational areas challenging.

Many EV drivers are climate and sustainability conscious. Some may however be deterred from visiting remote destinations such as national parks that require long drives due to underdeveloped charging infrastructure in remote areas and "**range anxiety**". Furthermore, there have also been reports of some EV drivers experiencing sub-optimal experience with in-car navigation system not finding or incorrectly listing charging stations. The fear and the feeling of uncertainty that drivers have towards locating and having the assurance that EV charging stations are available when they are on a journey to explore inspired us to create GridTraveler to overcome these emotions.

<img width="1062" height="518" alt="image" src="https://github.com/user-attachments/assets/079c69b1-232e-4564-899b-5c76fc9b5df3" />

## Mission Statement

Our mission is threefold:

### **1 | Help EV drivers plan their road trips with confidence**

By offering a map application that combines data related to popular Parks Canada destinations, EV charging options, stopovers and features enroute, we help you plan road trips across Canada to lower range anxiety and identify attractions that are EV friendly versus those that require some extra planning.

### **2 | ﻿﻿Raise awareness on the vast network of EV charging stations available as well as remote areas that could benefit from further development of EV charging options**

So that they could become more accessible to visitors who choose to travel with zero carbon footprint. And before that, alternatives options that visitors have to help them visit these locations with alternative modes of transportation while being kind to our environment. 

### **3 | ﻿Showcase 100 parks across Canada**﻿

Their whereabouts and the latest visitation statistics. 

<img width="1500" height="749" alt="image" src="https://github.com/user-attachments/assets/348020b4-2355-4227-80c6-db28def8c5eb" />

## Application Characteristics

**[Link to GridTraveler application](https://experience.arcgis.com/experience/5ed8c56f4829478a9489acdac6b9e40f)**

**[Link to Video Explainer](https://www.youtube.com/watch?v=oK3q5M5R99w)**

As you enter our homepage, you are greeted by an attractive background showcasing our love for Canada and a minimalistic design that allows you to navigate to the below pages:

1. About GridTraveler
2. Explore Attractions
3. Let's Map

<img width="1846" height="962" alt="image" src="https://github.com/user-attachments/assets/d7c3b9cd-c118-4405-a009-ab04103a389b" />
<br>
<br>

**1 | About GridTraveler**

The **About Gridtraveler** page is accessible through the tile menu located on the right hand side of the homepage. From here, you will find what inspired us to create the GridTraveler application, the committment from the Government of Canada to encourage us all to discover the natural beauty of our country through the Canada Strong Pass initiative, as well as our mission statement.

**2 | Explore Attractions**

The **Explore Attractions** is accessible through the tile menu located on the right hand side of the homepage. This is an interactive map with multiple feature layers that allows you explore and discover the following:

- ❤️ Top 10 most visited Parks Canada attractions (red heart icons)
- 🔍 Top 10 underexplored Parks Canada attractions
- 🌲 100 Parks Canada attractions
- 🟢 Latest visitation volume according to 2024-2025 data
- ⚡ EV charging stations across Canada

Using the feature layer function located on the top-right-hand corner of the map, you could toggle on and off the above layers to explore what interests you and learn more about the locations of these points of interests and infrastructure. 

On the far right hand side of the page, you would also see that we have featured the top 10 most visited Parks Canada attractions. Users could scroll through these top 10 locations and easily locate them on the map. They could also view the nearby EV charging stations. 
<br>
<br>
<img width="1025" height="313" alt="image" src="https://github.com/user-attachments/assets/4f8beedb-0ee4-4292-84db-59f62c14bf6b" />

**3 | Let's Map**

At the core of our application is a function that enables a user to input parameters including (1) a **travel from city**, (2) a **Parks Canada attraction** and a (3) **EV car model** to find the most efficient route to the destination taking into account the EV charging stations that are available enroute. As an option, users could also adjust the **EV car range**. If not adjusted, it is auto-populated based on the chosen EV car model. Once all of the parameters are entered, the application would compute the route, highlight the recommended charging stations for recharging along the way and also stopovers that may interest the user. If the car model and range provided do not meet the requirements to cover the distance, the application would inform the user. In those scenarios, users could increase the range parameter for a route to be recomputed. And through this exercise, users would also gain insights on the minimum range requirement to travel to a particular location using EV as a mode of transportation, based on the latest EV charging infrastructure available. 

<img width="1192" height="875" alt="image" src="https://github.com/user-attachments/assets/a92b5fbe-7a8d-42ed-8a6a-29c23d037747" />

## Data Sources

The key data sources that we leveraged to design the interactive application include the following: 

- [Parks Canada Visitation Data](https://open.canada.ca/data/en/dataset/59fb63af-67ae-4495-9c05-d121360aaeb4)
- [EV Charging Station Locations](https://natural-resources.canada.ca/energy-efficiency/transportation-energy-efficiency/electric-charging-alternative-fuelling-stationslocator-map#/find/nearest)


