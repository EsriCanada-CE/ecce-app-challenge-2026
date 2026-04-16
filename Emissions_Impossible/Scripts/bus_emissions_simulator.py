import arcpy 
from arcpy import env
import os


def main ():
    try: 

        #initalize variable values and settings 
        arcpy.env.overwriteOutput = True
        per_census_emissions = 0.0
        projected_emissions_total = 0.0
        reference_emissions_total = 0.0


        #variables
        input_layer = arcpy.GetParameter(0) ##must be set to feature layer (halifax_census_trax:transit as default)
        hydrogen_percent = arcpy.GetParameterAsText(1) ##Int value 
        electric_percent = arcpy.GetParameterAsText(2) #Int value 
        tolerance = arcpy.GetParameterAsText(3) #user tolerance value; either 30, 45, or 60 
                                                #set as value list filter in parameter type

        #configure output layer (polygons after bus fleet changes)
        out_name = "Emissions_Simulation_Results"
        output_fc = os.path.join(arcpy.env.scratchGDB, out_name)
        arcpy.management.CopyFeatures(input_layer, output_fc)

   	 
        #add new fields to each polygon to store polygon level emissions and percent change 
        arcpy.management.AddField(output_fc, "New_Bus_Emiss", "DOUBLE")
        arcpy.management.AddField(output_fc, "Emiss_Savings", "DOUBLE")
        arcpy.management.AddField(output_fc, "Pct_Savings", "DOUBLE")
       
       #convert percentages to float proportions and calc diesel percent
        hydrogen_percent = float(hydrogen_percent) if hydrogen_percent else 0.0
        electric_percent = float(electric_percent) if electric_percent else 0.0
        diesel_percent = 100.0 - hydrogen_percent - electric_percent


        #validate input 
        if hydrogen_percent < 0 or electric_percent < 0 or diesel_percent <0:
            arcpy.AddError("Percentages cannot be negative or exceed 100% total.")
            return
        
        #dynamic field mapping from tolerance user input 
        field_map = {
            "30": "TotBusEmission30min",
            "45": "TotBusEmission45min",
            "60": "TotBusEmission60min"
        }

        target_field = field_map.get(tolerance, "TotBusEmission30min") # Default to 30

    

    #iterate through rows in bus emissions column (based on user time threshold)
        with arcpy.da.UpdateCursor(output_fc, [target_field, "New_Bus_Emiss", "Emiss_Savings", "Pct_Savings"]) as cursor:
            for row in cursor: #if not null, calculate projected new emissions for each polygon
                if row[0]is None or row[0] == 0:
                    row[1] = 0.0
                    row[2] = 0.0
                    row[3] = 0.0
                    
                elif row[0] is not None and row[0]>0:
                    #multiply hydrogen proportion of fleet by diesel bus emissions with 71.5% emissions savings
                    hydrogen_emissions = (hydrogen_percent/100) * row[0]*0.285 
                    #multiply electric proportion of fleet by diesel bus emissions with 80% emissions savings
                    electric_emissions = (electric_percent/100) * row[0]*0.20 
                    diesel_emissions = (diesel_percent/100)* row[0]

                    #calculate emissions savings for each tract
                    #calculate percent change value for each tract to enable simple display in app
                    per_census_emissions = diesel_emissions + hydrogen_emissions + electric_emissions
                    savings = row[0]-per_census_emissions
                    per_census_percent_change = ((per_census_emissions - row[0])/row[0])* 100
                    #map to new field 
                    row[1] = per_census_emissions
                    row[2] = savings
                    row[3] = per_census_percent_change

                    #tally total savings 
                    projected_emissions_total += per_census_emissions
                    reference_emissions_total += row[0]
                
                cursor.updateRow(row)
   
        #map outputs 
        percent_change = ((projected_emissions_total - reference_emissions_total)/reference_emissions_total)* 100
        arcpy.SetParameterAsText(4, f"{round(reference_emissions_total, 3)}kg CO2.")
        arcpy.SetParameterAsText(5, f"{round(projected_emissions_total, 3)}kg CO2.")
        arcpy.SetParameterAsText(6, f"{int(percent_change)}%")
        arcpy.SetParameter(7, output_fc)
        
        #add output messages
        arcpy.AddMessage(f"Calculation Successful: Total predicted emissions for sample population with {hydrogen_percent}% fleet as hydrogen, {electric_percent}% fleet as electric and {diesel_percent}% fleet diesel is {round(projected_emissions_total, 3)} kg CO2 compared to {reference_emissions_total} kg CO2 with 100% diesel buses, for a percent change of approximately {int(percent_change)}%.")

    except Exception as e: 
	    arcpy.AddError(f"An error occurred: {str(e)}")

    finally: 
        output_total = round(projected_emissions_total, 3)

if __name__ == "__main__":
    main()
    
    

        
