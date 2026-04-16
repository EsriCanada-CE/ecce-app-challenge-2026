#----- run in python window -------

import arcpy, os, datetime

# --- 1. SETTINGS ---
stop_fc = r"Z:\Your_Stops.shp"      # Path to your shapefile
out_dir = r"Z:\GTFS_Output"         # Where you want the files
fld_rt  = "RTS_NAME"                # The Line Name field
fld_nm  = "RTS_STP"              # The Stop Name field

# --- 2. PEAK SEGMENT DATA (Minutes from previous station) ---
# We only use the "Peak" (higher) numbers from your map.
SEGMENTS = {
    "PURPLE": [
        ("LARRY UTECK", 0), ("DUNBRACK", 11), ("HALIFAX SHOPPING", 14), 
        ("BRIDGE", 16), ("HIGHFIELD", 13), ("DARTMOUTH CROSSING", 7)
    ],
    "GREEN": [
        ("LACEWOOD", 0), ("MAIN", 7), ("ROBIE", 15), ("SMU", 13)
    ],
    "YELLOW": [
        ("GREYSTONE", 0), ("MUMFORD", 21), ("SPRING GARDEN", 14), ("SCOTIA SQUARE", 9)
    ],
    "RED": [
        ("DALHOUSIE", 0), ("SCOTIA SQUARE", 14), ("BRIDGE", 13), ("PORTLAND HILLS", 18)
    ]
}

def get_offset(stop_name, route_name):
    """Finds the total minutes from start to this specific stop."""
    r_up = route_name.upper()
    route_key = next((k for k in SEGMENTS if k in r_up), None)
    if not route_key: return None
    
    total = 0
    found = False
    for name, mins in SEGMENTS[route_key]:
        total += mins
        if name in stop_name.upper():
            found = True
            break
    return total if found else None

# --- 3. DATA EXTRACTION ---
if not os.path.exists(out_dir): os.makedirs(out_dir)
rt_dict, st_info, sr = {}, {}, arcpy.SpatialReference(4326)

with arcpy.da.SearchCursor(stop_fc, [fld_rt, fld_nm, "SHAPE@XY", "OID@"], spatial_reference=sr) as cur:
    for row in cur:
        if row[0] and row[1]:
            r, n = str(row[0]).strip(), str(row[1]).strip()
            sid = (r + "_" + n).replace(" ", "_").upper()
            if r not in rt_dict: rt_dict[r] = []
            rt_dict[r].append({"id": sid, "name": n, "oid": row[3]})
            st_info[sid] = f"{sid},{n},{row[2][1]},{row[2][0]}"

# --- 4. SCHEDULING ---
trips, st_times = ["route_id,service_id,trip_id,trip_headsign,direction_id"], ["trip_id,arrival_time,departure_time,stop_id,stop_sequence"]
# Constant 10-minute frequency for the whole day to simulate high-frequency BRT
frequency = 10 

for r, stops in rt_dict.items():
    s_stops = sorted(stops, key=lambda k: k['oid'])
    cnt = 1
    # Generate trips from 6 AM to 10 PM
    cur_t = datetime.datetime(2026, 6, 1, 6, 0)
    end_t = datetime.datetime(2026, 6, 1, 22, 0)
    
    while cur_t < end_t:
        for d in [0, 1]:
            tid = f"{r}_{d}_{cnt:03d}"
            active = s_stops if d == 0 else s_stops[::-1]
            trips.append(f"{r},WEEKDAY,{tid},{active[-1]['id']},{d}")
            
            for i, stop in enumerate(active):
                offset = get_offset(stop['name'], r)
                # If it's a small stop in between, estimate based on sequence
                if offset is None:
                    offset = (i / len(active)) * 45 
                
                arr = cur_t + datetime.timedelta(minutes=offset)
                ts = f"{arr.hour:02d}:{arr.minute:02d}:00"
                st_times.append(f"{tid},{ts},{ts},{stop['id']},{i+1}")
        cur_t += datetime.timedelta(minutes=frequency)
        cnt += 1

# --- 5. WRITE ALL FILES ---
with open(os.path.join(out_dir, "agency.txt"), "w") as f:
    f.write("agency_id,agency_name,agency_url,agency_timezone,agency_lang\n1,Halifax Transit,https://www.halifax.ca/transit,America/Halifax,en")
with open(os.path.join(out_dir, "calendar.txt"), "w") as f:
    f.write("service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date\nWEEKDAY,1,1,1,1,1,0,0,20260601,20261231")
with open(os.path.join(out_dir, "stops.txt"), "w") as f:
    f.write("stop_id,stop_name,stop_lat,stop_lon\n" + "\n".join(st_info.values()))
with open(os.path.join(out_dir, "trips.txt"), "w") as f:
    f.write("\n".join(trips))
with open(os.path.join(out_dir, "stop_times.txt"), "w") as f:
    f.write("\n".join(st_times))
with open(os.path.join(out_dir, "routes.txt"), "w") as f:
    f.write("route_id,agency_id,route_short_name,route_long_name,route_type,route_color,route_text_color\n")
    for rn in rt_dict.keys():
        f.write(f"{rn},1,{rn},{rn} Line,3,00558C,FFFFFF\n")

print(f"Success! Peak-only GTFS created in {out_dir}")
