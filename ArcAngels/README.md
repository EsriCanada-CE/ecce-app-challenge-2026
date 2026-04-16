# MoveSafeTO - Citizen Collision Reporting App
*Team Members: Juliette Adams Fong, Samantha Kyle, Emmett Young*

We are the ArcAngels and this is our submission to the 2026 Esri ECCE App Challenge!
With this app, we hope to bring about changes that encourage Torontonians to travel in the most sustainable ways possible - walking and biking!

Link to resource: https://experience.arcgis.com/experience/fb1bbacf90dd42afa3362363df0516e2


**Mission Statement**

In creating this app, we asked ourselves, ‘What do Torontonians need in order to switch to more sustainable modes of transportation, like walking or biking?’. We found that a barrier to using these modes of transportation was feeling unsafe on Toronto’s streets. Active transportation is a fundamental element of sustainable urban mobility, yet the infrastructure supporting it continues to be disproportionately hazardous. In Toronto, cyclists and pedestrians face significant safety risks as the city is ranked among the most dangerous for active transportation in North America. A primary component of this is the abundance of incomplete and disconnected cycling infrastructure across the city. This problem is further compounded by the city’s lack of complete collision data. Due to the proliferation of underreporting and bias within reporting, only 20% of collision data is captured in official databases for cyclists – this number is even lower when considering pedestrian collisions. This creates a cyclical issue: the gap in collision data prevents cities from creating actionable plans to improve infrastructure, resulting in little to no impact on the improvement of active transportation safety levels, which leads to collisions occurring at the same rate in the same area without getting reported. The problem is not visible, thus the issue never gets addressed.

MoveSafe TO seeks to solve this problem by crowdsourcing collision data. Crowdsourcing allows for better spatial and temporal coverage when compared to traditional police reports, insurance claims, and hospital reports. As it stands, the current collision reporting tool for the city is convoluted, time-consuming, and requires citizens to have direct contact with the police. These are major barriers to collecting adequate data on cyclist and pedestrian collisions. MoveSafe TO allows users to easily submit reports quickly and easily, bringing information that would have likely been lost to a platform that can be viewed by planners, researchers, and the public. The concept is simple: users submit their reports through the app, the data improves, the map becomes more accurate, and in turn, community safety improves. Users of all types also are able to see important insights, like rates of different injury classifications, and how these relate to road classes. This lets users better understand their environment, and plan their routes with more complete knowledge of their safety. They also have the option of visualizing a ‘safety score’ for all Toronto streets based on road classification, cycling infrastructure, and collision density. The app has the potential to not only provide a much-needed dataset, but also aid in how we can better understand and improve infrastructure for pedestrians and cyclists.

While being restricted to a week of development, ideas concerning the future for MoveSafeTO are promising. With more user-submissions, city planners and decision-makers may be able to better justify investments in safer infrastructure, helping to make cycling and walking more approachable for the people of Toronto. Additionally, by using crowd-sourced collision data, those who do choose to walk or bike to their destination can make thoughtful decisions around choosing their routes to avoid areas of high collisions. In the future, we hope to integrate a routing tool that redirects users using our weighted safety score index to help them avoid areas dense with collisions and prioritize routes with the best safety infrastructure. With these future considerations, the current implementation of MoveSafe TO creates a foundation for development going forward.

<img width="2880" height="1263" alt="Screenshot (43)" src="https://github.com/user-attachments/assets/fe7fc225-d0ce-4264-acba-bfb44709bcf1" />


# How to use the tool - 

Click the 'About' button in the top right to get basic information about the app.

## If you want to report a collision:
1. Click the 'Report collision' button at the top of the screen
2. It will redirect you to a survey - fill it out to the best of your abilities. Scroll through the survey and you will see a map where you can click where the incident took place. Links are provided to better understand the official reporting channels and direct you there should you want to report that way as well.
3. On your next loading of the map, your added point will be there!

<img width="704" height="1246" alt="image" src="https://github.com/user-attachments/assets/1daa97bd-37f8-447a-9cf3-1eed74850647" />


## If you want to explore the map:
- Zoom in and out using the +/- buttons in the top left.
- Clicking and dragging can help move your view.
- The geocoder in the header (search bar) can help you find regions and locations in Toronto. Type in the name or address of where you are interested and hit ENTER. It will zoom you to what you need to see.
- The cycling network is included by default. Click on any of these lines to see what infrastructure exists there.
- Point data becomes visible at a higher zoom level! Click on these points to learn more.
- Click the 'Legend' widget in the bottom right to understand the map features.

## If you want to change what is visible on the map:
- Click the 'Layer' widget in the bottom right to toggle on and off different layers. Check out the safety index!
<img width="2880" height="1272" alt="Screenshot (44)" src="https://github.com/user-attachments/assets/a406a345-0ccc-42f8-81cc-831c45b52dfc" />

- Click the 'Filter' widget in the bottom right to change which types of data points you see. For police and citizen reports, you can filter to only view what is important to you - like only fatal collisions or only incidents of property damage.

- Click either of the buttons on the bottom left to perform a spatial query (check out data in a specific place) for collision points.
You can fetch all the records that correspond to points in your view, draw a polygon on the map (double-click to finish drawing) and see all records within, or drop a point and define a buffer (radius) and see records contained in that circle.
This is a great way to find data pertinent to you - are there lots of collisions around your school? How many are in your neighbourhood?

<img width="2880" height="1277" alt="Screenshot (46)" src="https://github.com/user-attachments/assets/98bfa2e5-c569-4481-bec0-b5228eb60301" />


## If you want to look at data trends:
- Click on the arrow at the bottom of the page in the center. This will open a half-screen with some more information for you!
- On the left are pie charts. Flip through them with the arrows on either side of the graph!
- On the right are bar charts. Flip between them both with arrows as well.
These charts will answer questions like:

*How many of these collisions were fatal?
How many collisions involved bikes?
What types of street infrastructure are most of these collisions happening at?
How does road class interact with injury severity in the case of collisions?*


<img width="2880" height="1080" alt="Screenshot (45)" src="https://github.com/user-attachments/assets/4b9d6867-978b-4f2e-add1-eeaf82449c47" />



**Sources Consulted**

Agran, P. F., Castillo, D. N., & Winn, D. G. (1990). Limitations of data compiled from police reports on pediatric pedestrian and bicycle motor vehicle events. Accident Analysis & Prevention, 22(4), 361–370. https://doi.org/10.1016/0001-4575(90)90051-l

Branion-Calles, M., Nelson, T., & Winters, M. (2017). Comparing Crowdsourced Near-Miss and Collision Cycling Data and Official Bike Safety Reporting. Transportation Research Record, 2662(1), 1–11. https://doi.org/10.3141/2662-01

City of Toronto & Nanos Research. (2019). City of Toronto Cycling Study. Nanos Research. https://www.toronto.ca/wp-content/uploads/2021/04/8f76-2019-Cycling-Public-Option-Survey-City-of-Toronto-Cycling.pdf

Faghih Imani, A., Miller, E. J., & Saxe, S. (2019). Cycle accessibility and level of traffic stress: A case study of toronto. Journal of Transport Geography, 80, 102496. https://doi.org/10.1016/j.jtrangeo.2019.102496

Fischer, J., Nelson, T., Laberee, K., & Winters, M. (2020). What does crowdsourced data tell us about bicycling injury? A case study in a mid-sized Canadian city. Accident Analysis and Prevention, 145, Article 105695. https://doi.org/10.1016/j.aap.2020.105695

Irving, T. (2019, September 11). Why don’t more Torontonians Bike to work? U of T study points to disconnected cycling infrastructure. University of Toronto. https://www.utoronto.ca/news/why-don-t-more-torontonians-bike-work-u-t-study-points-disconnected-cycling-infrastructure

Janstrup, K. H., Kaplan, S., Hels, T., Lauritsen, J., & Prato, C. G. (2016). Understanding traffic crash under-reporting: Linking police and medical records to individual and crash characteristics. Traffic Injury Prevention, 17(6), 580–584. https://doi.org/10.1080/15389588.2015.1128533 

Loo, B. P. Y., & Tsui, K. L. (2007). Factors affecting the likelihood of reporting road crashes resulting in medical treatment to the police. Injury Prevention, 13(3), 186–189. https://doi.org/10.1136/ip.2006.013458

Loidl, M., Traun, C., & Wallentin, G. (2016). Spatial patterns and temporal dynamics of urban bicycle crashes—A case study from Salzburg (Austria). Journal of Transport Geography, 52, 38–50. https://doi.org/10.1016/j.jtrangeo.2016.02.008

Macpherson, A. K., Zagorski, B., Saskin, R., Howard, A. W., Harris, M. A., Namin, S., & Rothman, L. (2024). Comparison of the number of pedestrian and cyclist injuries captured in police data compared with health service utilisation data in Toronto, Canada 2016-2021. Injury prevention : journal of the International Society for Child and Adolescent Injury Prevention, 30(2), 161–166. https://doi.org/10.1136/ip-2023-044974 

Miranda-Moreno, L. F., Morency, P., & El-Geneidy, A. M. (2011). The link between built environment, pedestrian activity and pedestrian–vehicle collision occurrence at signalized intersections. Accident Analysis and Prevention, 43(5), 1624–1634. https://doi.org/10.1016/j.aap.2011.02.005
Murphy, J. (2018, July 15). How dangerous are toronto streets for the city’s cyclists? BBC News. https://www.bbc.com/news/world-us-canada-44746889 

Sciortino, S., Vassar, M., Radetsky, M., & Knudson, M. M. (2005). San Francisco pedestrian injury surveillance: Mapping, under-reporting, and injury severity in police and hospital records. Accident Analysis & Prevention, 37(6), 1102–1113. https://doi.org/10.1016/j.aap.2005.06.010

Wang, H., De Backer, H., Lauwers, D., & Chang, S. K. J. (2019). A spatio-temporal mapping to assess bicycle collision risks on high-risk areas (Bridges) - A case study from Taipei (Taiwan). Journal of Transport Geography, 75, 94–109. https://doi.org/10.1016/j.jtrangeo.2019.01.014

Winters, M., Beairsto, J., Ferster, C., Laberee, K., Manaugh, K., & Nelson, T. (2022). The Canadian Bikeway Comfort and Safety metrics (Can-BICS): National measures of the bicycling environment for use in research and policy. Statistics Canada, Health Reports (Catalogue no. 82-003-X). https://www.doi.org/10.25318/82-003-x202201000001-eng

Winters, M., & Branion-Calles, M. (2017). Cycling safety: Quantifying the under reporting of cycling incidents in Vancouver, British Columbia. Journal of Transport & Health, 7, 48–53. https://doi.org/10.1016/j.jth.2017.02.010
Winters, M., Zanotto, M., & Butler, G. (2020). The Canadian Bikeway Comfort and safety (can-BICS) classification system: A common naming convention for Cycling Infrastructure. Health Promotion and Chronic Disease Prevention in Canada, 40(9), 288–293. https://doi.org/10.24095/hpcdp.40.9.04
Yiannakoulias, N., Bennet, S. A., & Scott, D. M. (2012). Mapping commuter cycling risk in urban areas. Accident Analysis and Prevention, 45, 164–172. https://doi.org/10.1016/j.aap.2011.12.002 
