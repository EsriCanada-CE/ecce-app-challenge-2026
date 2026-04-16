# Points of interest formatting and merging
# Script to clean and merge shapefiles with data from Business Analyst
# Each set of province/territory code cleans the data, adds a category column
# and writes the code to a new shapefile.

library(sf)
library(dplyr)

# MANITOBA DATA ----

# Import Manitoba shapefiles


mb_retail <- st_read("MB_POI/mb_retail.shp")
mb_restaurants <- st_read("MB_POI/mb_restaurants.shp")
mb_hotels <- st_read("MB_POI/mb_hotels.shp")
mb_health <- st_read("MB_POI/mb_health.shp")
mb_grocery <- st_read("MB_POI/mb_grocery.shp")
mb_banks <- st_read("MB_POI/mb_financial.shp")
mb_car_repair <- st_read("MB_POI/mb_car_repair.shp")

# Clean retail shapefile, add Category column
mb_retail <- mb_retail %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Retail"
  )

# Clean restaurants shapefile, add Category column
mb_restaurants <- mb_restaurants %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Restaurants"
  )

# Clean hotels shapefile, add Category column
mb_hotels <- mb_hotels %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Hotels"
  )

# Clean health shapefile, add Category column
mb_health <- mb_health %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Health"
  )

# Clean grocery shapefile, add Category column
mb_grocery <- mb_grocery %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Grocery"
  )

# Clean banks shapefile, add Category column
mb_banks <- mb_banks %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Banks & ATMs"
  )

# Clean car repair shapefile, add Category column
mb_car_repair <- mb_car_repair %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Car Repair"
  )

# Merge together 
mb_points_of_interest <- bind_rows(mb_banks, mb_car_repair, mb_grocery, mb_health, mb_hotels, mb_restaurants, mb_retail)

# Write to Shapefile
st_write(mb_points_of_interest, "mb_points_of_interest.shp")

# SASKATCHEWAN DATA ----

# Import Saskatchewan shapefiles


sk_retail <- st_read("SK_POI/sk_retail.shp")
sk_restaurants <- st_read("SK_POI/sk_restaurants.shp")
sk_hotels <- st_read("SK_POI/sk_hotels.shp")
sk_health <- st_read("SK_POI/sk_health.shp")
sk_grocery <- st_read("SK_POI/sk_grocery.shp")
sk_banks <- st_read("SK_POI/sk_financial.shp")
sk_car_repair <- st_read("SK_POI/sk_car_repair.shp")

# Clean retail shapefile, add Category column
sk_retail <- sk_retail %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Retail"
  )

# Clean restaurants shapefile, add Category column
sk_restaurants <- sk_restaurants %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Restaurants"
  )

# Clean hotels shapefile, add Category column
sk_hotels <- sk_hotels %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Hotels"
  )

# Clean health shapefile, add Category column
sk_health <- sk_health %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Health"
  )

# Clean grocery shapefile, add Category column
sk_grocery <- sk_grocery %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Grocery"
  )

# Clean banks shapefile, add Category column
sk_banks <- sk_banks %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Banks & ATMs"
  )

# Clean car repair shapefile, add Category column
sk_car_repair <- sk_car_repair %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Car Repair"
  )

# Merge together 
sk_points_of_interest <- bind_rows(sk_banks, sk_car_repair, sk_grocery, sk_health, sk_hotels, sk_restaurants, sk_retail)

# Write to Shapefile
st_write(sk_points_of_interest, "sk_points_of_interest.shp")
















# BRITISH COLUMBIA DATA----

# Import BC shapefiles

bc_retail <- st_read("BC_POI/bc_retail.shp")
bc_restaurants <- st_read("BC_POI/bc_restaurants.shp")
bc_hotels <- st_read("BC_POI/bc_hotels.shp")
bc_health <- st_read("BC_POI/bc_health.shp")
bc_grocery <- st_read("BC_POI/bc_grocery.shp")
bc_banks <- st_read("BC_POI/bc_financial.shp")
bc_car_repair <- st_read("BC_POI/bc_car_repair.shp")

# Clean retail shapefile, add Category column
bc_retail <- bc_retail %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Retail"
  )

# Clean restaurants shapefile, add Category column
bc_restaurants <- bc_restaurants %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Restaurants"
  )

# Clean hotels shapefile, add Category column
bc_hotels <- bc_hotels %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Hotels"
  )

# Clean health shapefile, add Category column
bc_health <- bc_health %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Health"
  )

# Clean grocery shapefile, add Category column
bc_grocery <- bc_grocery %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Grocery"
  )

# Clean banks shapefile, add Category column
bc_banks <- bc_banks %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Banks & ATMs"
  )

# Clean car repair shapefile, add Category column
bc_car_repair <- bc_car_repair %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Car Repair"
  )

# Merge together 
bc_points_of_interest <- bind_rows(bc_banks, bc_car_repair, bc_grocery, bc_health, bc_hotels, bc_restaurants, bc_retail)

# Write to Shapefile
st_write(bc_points_of_interest, "bc_points_of_interest.shp")
# YUKON DATA----

# Import YK shapefiles

yk_retail <- st_read("YK_POI/yk_retail.shp")
yk_restaurants <- st_read("YK_POI/yk_restaurants.shp")
yk_hotels <- st_read("YK_POI/yk_hotels.shp")
yk_health <- st_read("YK_POI/yk_health.shp")
yk_grocery <- st_read("YK_POI/yk_grocery.shp")
yk_banks <- st_read("YK_POI/yk_financial.shp")
yk_car_repair <- st_read("YK_POI/yk_car_repair.shp")

# Clean retail shapefile, add Category column
yk_retail <- yk_retail %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Retail"
  )

# Clean restaurants shapefile, add Category column
yk_restaurants <- yk_restaurants %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Restaurants"
  )

# Clean hotels shapefile, add Category column
yk_hotels <- yk_hotels %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Hotels"
  )

# Clean health shapefile, add Category column
yk_health <- yk_health %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Health"
  )

# Clean grocery shapefile, add Category column
yk_grocery <- yk_grocery %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Grocery"
  )

# Clean banks shapefile, add Category column
yk_banks <- yk_banks %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Banks & ATMs"
  )

# Clean car repair shapefile, add Category column
yk_car_repair <- yk_car_repair %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Car Repair"
  )

# Merge together 
yk_points_of_interest <- bind_rows(yk_banks, yk_car_repair, yk_grocery, yk_health, yk_hotels, yk_restaurants, yk_retail)

# Write to Shapefile
st_write(yk_points_of_interest, "yk_points_of_interest.shp")
# NORTHWEST TERRITORIES DATA----

# Import NWT shapefiles

nwt_retail <- st_read("NWT_POI/nwt_retail.shp")
nwt_restaurants <- st_read("NWT_POI/nwt_restaurants.shp")
nwt_hotels <- st_read("NWT_POI/nwt_hotels.shp")
nwt_health <- st_read("NWT_POI/nwt_health.shp")
nwt_grocery <- st_read("NWT_POI/nwt_grocery.shp")
nwt_banks <- st_read("NWT_POI/nwt_financial.shp")
nwt_car_repair <- st_read("NWT_POI/nwt_car_repair.shp")

# Clean retail shapefile, add Category column
nwt_retail <- nwt_retail %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Retail"
  )

# Clean restaurants shapefile, add Category column
nwt_restaurants <- nwt_restaurants %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Restaurants"
  )

# Clean hotels shapefile, add Category column
nwt_hotels <- nwt_hotels %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Hotels"
  )

# Clean health shapefile, add Category column
nwt_health <- nwt_health %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Health"
  )

# Clean grocery shapefile, add Category column
nwt_grocery <- nwt_grocery %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Grocery"
  )

# Clean banks shapefile, add Category column
nwt_banks <- nwt_banks %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Banks & ATMs"
  )

# Clean car repair shapefile, add Category column
nwt_car_repair <- nwt_car_repair %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Car Repair"
  )

# Merge together 
nwt_points_of_interest <- bind_rows(nwt_banks, nwt_car_repair, nwt_grocery, nwt_health, nwt_hotels, nwt_restaurants, nwt_retail)

# Write to Shapefile
st_write(nwt_points_of_interest, "nwt_points_of_interest.shp")
# NEWFOUNDLAND & LABRADOR DATA----

# Import NL shapefiles

nl_retail <- st_read("NL_POI/nl_retail.shp")
nl_restaurants <- st_read("NL_POI/nl_restaurants.shp")
nl_hotels <- st_read("NL_POI/nl_hotels.shp")
nl_health <- st_read("NL_POI/nl_health.shp")
nl_grocery <- st_read("NL_POI/nl_grocery.shp")
nl_banks <- st_read("NL_POI/nl_financial.shp")
nl_car_repair <- st_read("NL_POI/nl_car_repair.shp")

# Clean retail shapefile, add Category column
nl_retail <- nl_retail %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Retail"
  )

# Clean restaurants shapefile, add Category column
nl_restaurants <- nl_restaurants %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Restaurants"
  )

# Clean hotels shapefile, add Category column
nl_hotels <- nl_hotels %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Hotels"
  )

# Clean health shapefile, add Category column
nl_health <- nl_health %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Health"
  )

# Clean grocery shapefile, add Category column
nl_grocery <- nl_grocery %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Grocery"
  )

# Clean banks shapefile, add Category column
nl_banks <- nl_banks %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Banks & ATMs"
  )

# Clean car repair shapefile, add Category column
nl_car_repair <- nl_car_repair %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Car Repair"
  )

# Merge together 
nl_points_of_interest <- bind_rows(nl_banks, nl_car_repair, nl_grocery, nl_health, nl_hotels, nl_restaurants, nl_retail)

# Write to Shapefile
st_write(nl_points_of_interest, "nl_points_of_interest.shp")
# NOVA SCOTIA DATA----

# Import NS Shapefiles
ns_retail <- st_read("NS_POI/ns_retail.shp")
ns_restaurants <- st_read("NS_POI/ns_restaurants.shp")
ns_hotels <- st_read("NS_POI/ns_hotels.shp")
ns_health <- st_read("NS_POI/ns_health.shp")
ns_grocery <- st_read("NS_POI/ns_grocery.shp")
ns_banks <- st_read("NS_POI/ns_financial.shp")
ns_car_repair <- st_read("NS_POI/ns_car_repair.shp")

# Clean retail shapefile, add Category column
ns_retail <- ns_retail %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Retail"
  )

# Clean restaurants shapefile, add Category column
ns_restaurants <- ns_restaurants %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Restaurants"
  )

# Clean hotels shapefile, add Category column
ns_hotels <- ns_hotels %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Hotels"
  )

# Clean health shapefile, add Category column
ns_health <- ns_health %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Health"
  )

# Clean grocery shapefile, add Category column
ns_grocery <- ns_grocery %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Grocery"
  )

# Clean banks shapefile, add Category column
ns_banks <- ns_banks %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Banks & ATMs"
  )

# Clean car repair shapefile, add Category column
ns_car_repair <- ns_car_repair %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Car Repair"
  )

# Merge together 
ns_points_of_interest <- bind_rows(ns_banks, ns_car_repair, ns_grocery, ns_health, ns_hotels, ns_restaurants, ns_retail)

# Write to Shapefile
st_write(ns_points_of_interest, "ns_points_of_interest.shp")
# NEW BRUNSWICK DATA----

# Import NB Shapefiles
nb_retail <- st_read("NB_POI/nb_retail.shp")
nb_restaurants <- st_read("NB_POI/nb_restaurants.shp")
nb_hotels <- st_read("NB_POI/nb_hotels.shp")
nb_health <- st_read("NB_POI/nb_health.shp")
nb_grocery <- st_read("NB_POI/nb_grocery.shp")
nb_banks <- st_read("NB_POI/nb_financial.shp")
nb_car_repair <- st_read("NB_POI/nb_car_repair.shp")

# Clean retail shapefile, add Category column
nb_retail <- nb_retail %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Retail"
  )

# Clean restaurants shapefile, add Category column
nb_restaurants <- nb_restaurants %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Restaurants"
  )

# Clean hotels shapefile, add Category column
nb_hotels <- nb_hotels %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Hotels"
  )

# Clean health shapefile, add Category column
nb_health <- nb_health %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Health"
  )

# Clean grocery shapefile, add Category column
nb_grocery <- nb_grocery %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Grocery"
  )

# Clean banks shapefile, add Category column
nb_banks <- nb_banks %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Banks & ATMs"
  )

# Clean car repair shapefile, add Category column
nb_car_repair <- nb_car_repair %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Car Repair"
  )

# Merge together 
nb_points_of_interest <- bind_rows(nb_banks, nb_car_repair, nb_grocery, nb_health, nb_hotels, nb_restaurants, nb_retail)

# Write to Shapefile
st_write(nb_points_of_interest, "nb_points_of_interest.shp")
# PRINCE EDWARD ISLAND DATA----

# Import PEI Shapefiles
pe_retail <- st_read("PE_POI/pe_retail.shp")
pe_restaurants <- st_read("PE_POI/pe_restaurants.shp")
pe_hotels <- st_read("PE_POI/pe_hotels.shp")
pe_health <- st_read("PE_POI/pe_health.shp")
pe_grocery <- st_read("PE_POI/pe_grocery.shp")
pe_banks <- st_read("PE_POI/pe_financial.shp")
pe_car_repair <- st_read("PE_POI/pe_car_repair.shp")

# Clean retail shapefile, add Category column
pe_retail <- pe_retail %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Retail"
  )

# Clean restaurants shapefile, add Category column
pe_restaurants <- pe_restaurants %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Restaurants"
  )

# Clean hotels shapefile, add Category column
pe_hotels <- pe_hotels %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Hotels"
  )

# Clean health shapefile, add Category column
pe_health <- pe_health %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Health"
  )

# Clean grocery shapefile, add Category column
pe_grocery <- pe_grocery %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Grocery"
  )

# Clean banks shapefile, add Category column
pe_banks <- pe_banks %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Banks & ATMs"
  )

# Clean car repair shapefile, add Category column
pe_car_repair <- pe_car_repair %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Car Repair"
  )

# Merge together 
pe_points_of_interest <- bind_rows(pe_banks, pe_car_repair, pe_grocery, pe_health, pe_hotels, pe_restaurants, pe_retail)

# Write to Shapefile
st_write(pe_points_of_interest, "pe_points_of_interest.shp")
# ONTARIO DATA----

# Import ON Shapefiles

on_retail <- st_read("ON_POI/on_retail.shp")
on_restaurants <- st_read("ON_POI/on_restaurants.shp")
on_hotels <- st_read("ON_POI/on_hotels.shp")
on_health <- st_read("ON_POI/on_health.shp")
on_grocery <- st_read("ON_POI/on_grocery.shp")
on_banks <- st_read("ON_POI/on_financial.shp")
on_car_repair <- st_read("ON_POI/on_car_repair.shp")

# Clean retail shapefile, add Category column
on_retail <- on_retail %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Retail"
  )

# Clean restaurants shapefile, add Category column
on_restaurants <- on_restaurants %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Restaurants"
  )

# Clean hotels shapefile, add Category column
on_hotels <- on_hotels %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Hotels"
  )

# Clean health shapefile, add Category column
on_health <- on_health %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Health"
  )

# Clean grocery shapefile, add Category column
on_grocery <- on_grocery %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Grocery"
  )

# Clean banks shapefile, add Category column
on_banks <- on_banks %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Banks & ATMs"
  )

# Clean car repair shapefile, add Category column
on_car_repair <- on_car_repair %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Car Repair"
  )

# Merge together 
on_points_of_interest <- bind_rows(on_banks, on_car_repair, on_grocery, on_health, on_hotels, on_restaurants, on_retail)

# Write to Shapefile
st_write(on_points_of_interest, "on_points_of_interest.shp")

# QUEBEC DATA----

# Load QC Shapefiles

qc_retail <- st_read("QC_POI/qc_retail.shp")
qc_restaurants <- st_read("QC_POI/qc_restaurants.shp")
qc_hotels <- st_read("QC_POI/qc_hotels.shp")
qc_health <- st_read("QC_POI/qc_health.shp")
qc_grocery <- st_read("QC_POI/qc_grocery.shp")
qc_banks <- st_read("QC_POI/qc_financial.shp")
qc_car_repair <- st_read("QC_POI/qc_car_repair.shp")

# Clean retail shapefile, add Category column
qc_retail <- qc_retail %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Retail"
  )

# Clean restaurants shapefile, add Category column
qc_restaurants <- qc_restaurants %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Restaurants"
  )

# Clean hotels shapefile, add Category column
qc_hotels <- qc_hotels %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Hotels"
  )

# Clean health shapefile, add Category column
qc_health <- qc_health %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Health"
  )

# Clean grocery shapefile, add Category column
qc_grocery <- qc_grocery %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Grocery"
  )

# Clean banks shapefile, add Category column
qc_banks <- qc_banks %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Banks & ATMs"
  )

# Clean car repair shapefile, add Category column
qc_car_repair <- qc_car_repair %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Car Repair"
  )

# Merge together 
qc_points_of_interest <- bind_rows(qc_banks, qc_car_repair, qc_grocery, qc_health, qc_hotels, qc_restaurants, qc_retail)

# Write to Shapefile
st_write(qc_points_of_interest, "qc_points_of_interest.shp")
# ALBERTA DATA ----
retail <- st_read("retail.shp")
restaurants <- st_read("restaurants.shp")
hotels <- st_read("hotels.shp")
health <- st_read("health.shp")
grocery <- st_read("grocery.shp")
banks <- st_read("financial.shp")
car_repair <- st_read("car_repair.shp")

# Clean retail shapefile, add Category column
retail <- retail %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Retail"
  )

# Clean restaurants shapefile, add Category column
restaurants <- restaurants %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Restaurants"
  )

# Clean hotels shapefile, add Category column
hotels <- hotels %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Hotels"
  )

# Clean health shapefile, add Category column
health <- health %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Health"
  )

# Clean grocery shapefile, add Category column
grocery <- grocery %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Grocery"
  )

# Clean banks shapefile, add Category column
banks <- banks %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Banks & ATMs"
  )

# Clean car repair shapefile, add Category column
car_repair <- car_repair %>% 
  select(
    ESRI_PID = matches("ESRI_PID", ignore.case = TRUE),
    `Company Name` = matches("CONAME", ignore.case = TRUE),
    Street = matches("STREET", ignore.case = TRUE),
    City = matches("CITY", ignore.case = TRUE),
    Province = matches("PROV", ignore.case = TRUE),
    `Postal Code` = matches("POSTCD", ignore.case = TRUE),
    geometry = matches("geometry", ignore.case = TRUE)
  ) %>% 
  mutate(
    Category = "Car Repair"
  )

# Merge together
points_of_interest <- bind_rows(banks, car_repair, grocery, health, hotels, restaurants, retail)

# Write to Shapefile
st_write(points_of_interest, "points_of_interest.shp")



