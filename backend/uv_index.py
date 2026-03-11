# import openmeteo_requests
# import requests_cache
# import pandas as pd
# from retry_requests import retry

# def get_uv_index():
#     """
#     Fetches the max UV index for the next day from the Open-Meteo API.
#     """
#     # Setup the Open-Meteo API client with cache and retry on error
#     cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
#     retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
#     openmeteo = openmeteo_requests.Client(session=retry_session)

#     # API request parameters
#     url = "https://api.open-meteo.com/v1/forecast"
#     params = {
#         "latitude": -37.814,
#         "longitude": 144.9633,
#         "daily": "uv_index_max",
#         "forecast_days": 1,
#     }
#     responses = openmeteo.weather_api(url, params=params)
#     response = responses[0]

#     # Process daily data
#     daily = response.Daily()
#     daily_uv_index_max = daily.Variables(0).ValuesAsNumpy()

#     # The API gives a single value in an array, so we extract it.
#     uv_index = daily_uv_index_max[0] if daily_uv_index_max.size > 0 else None

#     # Return as a dictionary
#     return {"uv_index_max": uv_index}

# def main():
#     """
#     Main function to test the UV index fetch and print the results.
#     """
#     data = get_uv_index()
#     print(data)

# if __name__ == "__main__":
#     main()
