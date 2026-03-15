# No need to run this python file - used only to combine/aggregate the UV data

# Imports
import os
import re
import pandas as pd

# Folder containing the CSV files - inputs are not included here
DATA_FOLDER = "."

# Output file to save as
OUTPUT_FILE = "uv_yearly_max.csv"

results = []

# Ignore all the other files that aren't a csv
for filename in os.listdir(DATA_FOLDER):
    if not filename.endswith(".csv"):
        continue

    # If the file has 4 consecutive digits it's a match - representing a year (i.e. '2020')
    match = re.search(r"(\d{4})", filename)
    # Otherwise skip again
    if not match:
        print(f"Skipping {filename} (no year found in filename)")
        continue

    # Get the year
    year = int(match.group(1))
    # Get the filepath
    filepath = os.path.join(DATA_FOLDER, filename)

    try:
        df = pd.read_csv(filepath)

        # 'UV_Index' should be in the file, skip if not
        if "UV_Index" not in df.columns:
            print(f"Skipping {filename} (no UV_Index column)")
            continue

        # Get the max uv
        max_uv = pd.to_numeric(df["UV_Index"], errors="coerce").max()

        # Get the results with the year we got earlier
        results.append({
            "year": year,
            "max_uv": round(max_uv, 3)
        })

        print(f"Processed {filename}: {year} -> {max_uv:.3f}")

    except Exception as e:
        print(f"Error reading {filename}: {e}")

# Create the final dataframe
result_df = pd.DataFrame(results).sort_values("year")

# Save to CSV
result_df.to_csv(OUTPUT_FILE, index=False)

print(f"\nSaved yearly max values to {OUTPUT_FILE}")
print(result_df)