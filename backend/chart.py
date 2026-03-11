import pandas as pd
from database import get_all_skin_mortality_data

# here is the data from the excel file thats now in a database table
# you can alter the sql query in the database.py file under the get_all_skin_mortality_data function.
# this is like a playground for you to explaore the data.
# you can either use plotly and insert the charts directly into an api on main.py
# or you can make the charts in app.js and reference the data from an api endpoint in main.py.
data = get_all_skin_mortality_data()

df = pd.DataFrame(data)

print(df.head())