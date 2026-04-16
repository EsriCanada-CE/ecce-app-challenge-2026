# The following script cleans and merges data for all new Electric Vehicle registrations per year from 2017 to Q3 of 2025. 

# Retrived from the following database: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=2010002501&pickMembers%5B0%5D=1.1&pickMembers%5B1%5D=3.1&cubeTimeFrame.startMonth=01&cubeTimeFrame.startYear=2017&cubeTimeFrame.endMonth=10&cubeTimeFrame.endYear=2025&referencePeriods=20170101%2C20251001 

# downloaded as a csv file

library(dplyr)
library(readr)
library(lubridate)

canada <- read_csv("20100025.csv")

# Each set of following code subsets the data to that province/territory/whole country. 

# CANADA ----
# This code does the initial cleaning before processing for each location
canada <- canada %>% 
  mutate(
    Year = year(ym(REF_DATE))
  ) %>% 
  select(
    GEO = matches("GEO", ignore.case = TRUE),
    `Fuel Type` = matches("Fuel type", ignore.case = TRUE),
    `Total Vehicles` = matches("Value", ignore.case = TRUE),
    Year = matches("Year", ignore.case = TRUE)
  ) 

# WHOLE COUNTRY----

country <- read_csv("20100025.csv")


country <- country %>% 
  mutate(
    Year = year(ym(REF_DATE))
  ) %>% 
  select(
    GEO = matches("GEO", ignore.case = TRUE),
    `Fuel Type` = matches("Fuel type", ignore.case = TRUE),
    `Total Vehicles` = matches("Value", ignore.case = TRUE),
    Year = matches("Year", ignore.case = TRUE)
  ) %>% 
  filter(GEO %in% c("Canada", "Newfoundland and Labrador", "Nova Scotia", "New Brunswick", "Prince Edward Island", "Quebec", "Ontario", "Manitoba", "Saskatchewan", "Alberta", "British Columbia", "Yukon", "Northwest Territories", "Nunavut")) %>% 
  group_by(`Fuel Type`, Year, GEO) %>% 
  summarise(
    total = sum(`Total Vehicles`, na.rm = TRUE),
    .groups = "drop"
  )

write_csv(country, "canada_vehicles.csv")



# NL


# NEWFOUNDLAND----

newfoundland <- canada %>% 
  filter(GEO == "Newfoundland and Labrador") %>% 
  group_by(`Fuel Type`, Year, GEO) %>% 
  summarise(
    total = sum(`Total Vehicles`, na.rm = TRUE),
    .groups = "drop"
  )

write_csv(newfoundland, "newfoundland.csv")
# NOVA SCOTIA----

novascotia <- canada %>% 
  filter(GEO == "Nova Scotia") %>% 
  group_by(`Fuel Type`, Year, GEO) %>% 
  summarise(
    total = sum(`Total Vehicles`, na.rm = TRUE),
    .groups = "drop"
  )

write_csv(novascotia, "novascotia.csv")


# NEW BRUNSWICK----

newbrunswick <- canada %>% 
  filter(GEO == "New Brunswick") %>% 
  group_by(`Fuel Type`, Year, GEO) %>% 
  summarise(
    total = sum(`Total Vehicles`, na.rm = TRUE),
    .groups = "drop"
  )

write_csv(newbrunswick, "newbrunswick.csv")

# PRINCE EDWARD ISLAND----
pei <- canada %>% 
  filter(GEO == "Prince Edward Island") %>% 
  group_by(`Fuel Type`, Year, GEO) %>% 
  summarise(
    total = sum(`Total Vehicles`, na.rm = TRUE),
    .groups = "drop"
  )

write_csv(pei, "pei.csv")

# QUEBEC----

quebec <- canada %>% 
  filter(GEO == "Quebec") %>% 
  group_by(`Fuel Type`, Year, GEO) %>% 
  summarise(
    total = sum(`Total Vehicles`, na.rm = TRUE),
    .groups = "drop"
  )

write_csv(quebec, "quebec.csv")
# ONTARIO----

ontario <- canada %>% 
  filter(GEO == "Ontario") %>% 
  group_by(`Fuel Type`, Year, GEO) %>% 
  summarise(
    total = sum(`Total Vehicles`, na.rm = TRUE),
    .groups = "drop"
  )

write_csv(ontario, "ontario.csv")

# MANITOBA----

manitoba <- canada %>% 
  filter(GEO == "Manitoba") %>% 
  group_by(`Fuel Type`, Year, GEO) %>% 
  summarise(
    total = sum(`Total Vehicles`, na.rm = TRUE),
    .groups = "drop"
  )

write_csv(manitoba, "manitoba.csv")

# SASKATCHEWAN----

saskatchewan <- canada %>% 
  filter(GEO == "Saskatchewan") %>% 
  group_by(`Fuel Type`, Year, GEO) %>% 
  summarise(
    total = sum(`Total Vehicles`, na.rm = TRUE),
    .groups = "drop"
  )

write_csv(saskatchewan, "saskatchewan.csv")

# ALBERTA----

alberta <- canada %>% 
  filter(GEO == "Alberta") %>% 
  group_by(`Fuel Type`, Year, GEO) %>% 
  summarise(
    total = sum(`Total Vehicles`, na.rm = TRUE),
    .groups = "drop"
  )

write_csv(alberta, "alberta.csv")

# BRITISH COLUMBIA----

britishcolumbia <- canada %>% 
  filter(GEO == "British Columbia") %>% 
  group_by(`Fuel Type`, Year, GEO) %>% 
  summarise(
    total = sum(`Total Vehicles`, na.rm = TRUE),
    .groups = "drop"
  )

write_csv(britishcolumbia, "britishcolumbia.csv")

# YUKON----

yukon <- canada %>% 
  filter(GEO == "Yukon") %>% 
  group_by(`Fuel Type`, Year, GEO) %>% 
  summarise(
    total = sum(`Total Vehicles`, na.rm = TRUE),
    .groups = "drop"
  )

write_csv(yukon, "yukon.csv")


# NORTHWEST TERRITORIES----

nwt <- canada %>% 
  filter(GEO == "Northwest Territories") %>% 
  group_by(`Fuel Type`, Year, GEO) %>% 
  summarise(
    total = sum(`Total Vehicles`, na.rm = TRUE),
    .groups = "drop"
  )

write_csv(nwt, "nwt.csv")


# NUNAVUT----

nunavut <- canada %>% 
  filter(GEO == "Nunavut") %>% 
  group_by(`Fuel Type`, Year, GEO) %>% 
  summarise(
    total = sum(`Total Vehicles`, na.rm = TRUE),
    .groups = "drop"
  )

write_csv(nunavut, "nunavut.csv")






