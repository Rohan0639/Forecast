import os
import csv
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import AQI live data retrieval helpers from same directory
try:
    from fetch_live_data import get_live_data, STATION_MAP
except ImportError:
    # Fallback to absolute paths/sys.path manipulation if running from root
    import sys
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from fetch_live_data import get_live_data, STATION_MAP

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LIVE_AQI_CSV = os.path.join(BASE_DIR, 'data', 'live_aqi_dataset.csv')
WEATHER_CSV_PATH = os.path.join(BASE_DIR, 'data', 'hyderabad_live_weather.csv')

# API Keys
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "c02ebe7947b6de1013509a77af765329")

# Coordinates of HYD Stations matching OpenWeatherMap coordinates
STATIONS = {
    "Balanagar SPCB": (17.4550, 78.4483),
    "HITEC City": (17.4435, 78.3772),
    "IDA Pashamylaram SPCB": (17.5300, 78.1800),
    "Sanathnagar SPCB": (17.4561, 78.4437),
    "US Consulate": (17.4170, 78.3470),
    "Uppal SPCB": (17.4018, 78.5602),
    "Zoo Park SPCB": (17.3507, 78.4513)
}

def get_cpcb_category(aqi):
    if aqi is None: return "Unknown"
    aqi = float(aqi)
    if aqi <= 50: return "Good"
    if aqi <= 100: return "Satisfactory"
    if aqi <= 200: return "Moderate"
    if aqi <= 300: return "Poor"
    if aqi <= 400: return "Very Poor"
    return "Severe"

def get_wind_direction_label(deg):
    if deg is None:
        return "NA"
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    idx = int((deg + 22.5) // 45) % 8
    return directions[idx]

def fetch_and_save_aqi():
    now = datetime.now()
    date_str = now.strftime('%Y-%m-%d')
    year = now.year
    month = now.month
    day = now.day
    day_of_week = now.weekday() # Monday is 0
    
    print(f"\n=== Fetching Live AQI Data ({date_str}) ===")
    
    if not os.getenv("AQI_API_KEY"):
        print("[ERROR] AQI_API_KEY environment variable is not set.")
        import sys
        sys.exit(1)
    
    new_records = []
    for station_name in STATION_MAP.keys():
        print(f"Fetching AQI for: {station_name}")
        try:
            data = get_live_data(station_name)
            if not data:
                print(f"  [FAIL] Failed to fetch AQI for {station_name}")
                continue
            
            row = {
                'Date': date_str,
                'Year': year,
                'Month': month,
                'Day': day,
                'DayOfWeek': day_of_week,
                'Station': station_name,
                'AQI': data['AQI'],
                'AQI_Category': get_cpcb_category(data['AQI']),
                'PM2.5': data['PM2.5'],
                'PM10': data['PM10'],
                'NO2': data['NO2'],
                'SO2': data['SO2'],
                'O3': data['O3'],
                'CO': data['CO'],
                'Temperature': data['Temperature'],
                'Humidity': data['Humidity'],
                'Wind_Speed': data['Wind_Speed'],
                'Rainfall': data['Rainfall']
            }
            new_records.append(row)
            print(f"  [OK] AQI: {row['AQI']} ({row['AQI_Category']})")
        except Exception as e:
            print(f"  [ERROR] Error fetching AQI for {station_name}: {e}")
            
    if not new_records:
        print("No new AQI records fetched.")
        return
        
    os.makedirs(os.path.dirname(LIVE_AQI_CSV), exist_ok=True)
    
    # Read existing
    existing_rows = []
    headers = [
        'Date', 'Year', 'Month', 'Day', 'DayOfWeek', 'Station', 'AQI', 'AQI_Category',
        'PM2.5', 'PM10', 'NO2', 'SO2', 'O3', 'CO', 'Temperature', 'Humidity', 'Wind_Speed', 'Rainfall'
    ]
    
    if os.path.exists(LIVE_AQI_CSV):
        try:
            with open(LIVE_AQI_CSV, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                existing_rows = list(reader)
        except Exception as e:
            print(f"Error reading existing AQI file: {e}")
            
    # Combine and deduplicate (keep latest entry for each Date + Station)
    combined_map = {}
    for row in existing_rows:
        key = (row.get('Date'), row.get('Station'))
        combined_map[key] = row
        
    for r in new_records:
        row_str = {k: str(v) if v is not None else "" for k, v in r.items()}
        key = (row_str.get('Date'), row_str.get('Station'))
        combined_map[key] = row_str
        
    sorted_keys = sorted(combined_map.keys(), key=lambda x: (x[0], x[1]))
    
    try:
        with open(LIVE_AQI_CSV, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            for key in sorted_keys:
                writer.writerow(combined_map[key])
        print(f"[OK] AQI dataset updated successfully: {LIVE_AQI_CSV}")
    except Exception as e:
        print(f"[ERROR] Error writing AQI dataset: {e}")

def fetch_and_save_weather():
    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")
    
    print(f"\n=== Fetching Live Weather Data ({date_str} {time_str[:-3]}) ===")
    
    if not WEATHER_API_KEY:
        print("[ERROR] WEATHER_API_KEY environment variable is not set.")
        import sys
        sys.exit(1)
        
    new_records = []
    for station, (lat, lon) in STATIONS.items():
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}&units=metric"
        try:
            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                print(f"  [FAIL] {station}: HTTP {response.status_code}")
                continue
                
            data = response.json()
            main = data.get("main", {})
            wind = data.get("wind", {})
            
            temp = main.get("temp")
            humidity = main.get("humidity")
            pressure = main.get("pressure")
            
            wind_speed = wind.get("speed")
            wind_dir = wind.get("deg")
            wind_dir_label = get_wind_direction_label(wind_dir)
            
            rainfall = data.get("rain", {}).get("1h", 0.0)
            
            record = {
                "Date": date_str,
                "Time": time_str,
                "Station": station,
                "Temperature": temp,
                "Humidity": humidity,
                "Pressure": pressure,
                "Wind_Speed": wind_speed,
                "Wind_Direction_Deg": wind_dir,
                "Wind_Direction_Label": wind_dir_label,
                "Rainfall": rainfall
            }
            new_records.append(record)
            print(f"  [OK] {station:<22}: {temp} C | Wind: {wind_speed} m/s ({wind_dir_label})")
        except Exception as e:
            print(f"  [ERROR] Failed to fetch weather for {station}: {e}")
            
    if not new_records:
        print("No new weather records fetched.")
        return
        
    os.makedirs(os.path.dirname(WEATHER_CSV_PATH), exist_ok=True)
    
    # Read existing
    existing_rows = []
    headers = [
        "Date", "Time", "Station", "Temperature", "Humidity", 
        "Pressure", "Wind_Speed", "Wind_Direction_Deg", "Wind_Direction_Label", "Rainfall"
    ]
    
    if os.path.exists(WEATHER_CSV_PATH):
        try:
            with open(WEATHER_CSV_PATH, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                existing_rows = list(reader)
        except Exception as e:
            print(f"Error reading existing weather file: {e}")
            
    # Combine and deduplicate (keep latest entry for each Date + Station)
    combined_map = {}
    for row in existing_rows:
        key = (row.get('Date'), row.get('Station'))
        combined_map[key] = row
        
    for r in new_records:
        row_str = {k: str(v) if v is not None else "" for k, v in r.items()}
        key = (row_str.get('Date'), row_str.get('Station'))
        combined_map[key] = row_str
        
    sorted_keys = sorted(combined_map.keys(), key=lambda x: (x[0], combined_map[x].get("Time", "")))
    
    try:
        with open(WEATHER_CSV_PATH, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            for key in sorted_keys:
                writer.writerow(combined_map[key])
        print(f"[OK] Weather dataset updated successfully: {WEATHER_CSV_PATH}")
    except Exception as e:
        print(f"[ERROR] Error writing weather dataset: {e}")

if __name__ == "__main__":
    fetch_and_save_aqi()
    fetch_and_save_weather()
