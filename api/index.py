import os
import joblib
import csv
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import numpy as np
import xgboost as xgb

# Import underlying functions
from fetch_live_data import get_live_data, STATION_MAP

app = FastAPI(title="AQI Prediction System API")

# Add CORS Middleware to allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# CONSTANTS & CACHED DATA
# ---------------------------------------------------------
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'trained_model.pkl')
STATION_MODELS_DIR = os.path.join(BASE_DIR, 'models', 'station_models')
WEATHER_CSV_PATH = os.path.join(BASE_DIR, 'data', 'hyderabad_live_weather.csv')
LIVE_AQI_CSV = os.path.join(BASE_DIR, 'data', 'live_aqi_dataset.csv')
HISTORICAL_CSV = os.path.join(BASE_DIR, 'data', 'hyderabad_air_quality_10y_combined_fixed.csv')

# Simple in-memory cache
cache = {
    'global_model': None,
    'station_models': {},
}

def load_global_model():
    if cache['global_model'] is None and os.path.exists(MODEL_PATH):
        try:
            payload = joblib.load(MODEL_PATH)
            booster = xgb.Booster()
            booster.load_model(bytearray(payload['model']))
            payload['booster'] = booster
            cache['global_model'] = payload
        except Exception as e:
            print(f"Error loading global model: {e}")
    return cache['global_model']

def load_station_model(station_name):
    if station_name not in cache['station_models']:
        station_file = os.path.join(STATION_MODELS_DIR, f"{station_name.lower().replace(' ', '_')}.pkl")
        if os.path.exists(station_file):
            try:
                payload = joblib.load(station_file)
                booster = xgb.Booster()
                booster.load_model(bytearray(payload['model']))
                payload['booster'] = booster
                cache['station_models'][station_name] = payload
            except Exception as e:
                print(f"Error loading station model {station_name}: {e}")
                cache['station_models'][station_name] = None
        else:
            cache['station_models'][station_name] = None
    
    return cache['station_models'][station_name] or load_global_model()

def load_csv_data(file_path):
    """
    Helper to read CSV into a list of dictionaries.
    """
    if not os.path.exists(file_path):
        return []
    try:
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            return list(reader)
    except Exception as e:
        print(f"Error reading CSV {file_path}: {e}")
        return []

def get_aqi_category(aqi):
    if aqi is None: return "Unknown"
    aqi = float(aqi)
    if aqi <= 50: return "Good"
    if aqi <= 100: return "Moderate"
    if aqi <= 150: return "Unhealthy for Sensitive Groups"
    if aqi <= 200: return "Unhealthy"
    if aqi <= 300: return "Very Unhealthy"
    return "Hazardous"

def calculate_dominant_pollutant(live_record):
    pollutants = {k: float(live_record.get(k, 0) or 0) for k in ['PM2.5', 'PM10', 'NO2', 'SO2', 'O3', 'CO']}
    if not pollutants: return "Unknown"
    return max(pollutants.keys(), key=lambda k: pollutants[k])

# ---------------------------------------------------------
# API ROUTES
# ---------------------------------------------------------

@app.get("/api/dashboard")
def get_dashboard_data():
    """
    Returns dashboard metrics for all stations, including current and predicted AQI.
    """
    global_payload = load_global_model()
    if not global_payload:
        raise HTTPException(status_code=500, detail="Global model not found.")

    features = global_payload.get('features', [])
    station_mapping = global_payload.get('station_mapping', {})
    name_to_code = {name: code for code, name in station_mapping.items()}
    
    all_station_details = {}
    
    # Load all live data records
    all_records = load_csv_data(LIVE_AQI_CSV)
    # Deduplicate in memory (keep last for each Date/Station)
    records_map = {}
    for r in all_records:
        key = (r.get('Date'), r.get('Station'))
        records_map[key] = r
    deduped_records = list(records_map.values())

    for station_name in STATION_MAP.keys():
        try:
            live_data = get_live_data(station_name)
            if not live_data:
                continue
                
            current_aqi_val = int(live_data.get('AQI', 0)) 
            dominant = calculate_dominant_pollutant(live_data)
            
            payload = load_station_model(station_name)
            prediction = None
            confidence_val = 97.9
            mae = 6.16
            model_used = 'Global Fallback'

            if payload and 'model' in payload:
                model = payload['model']
                model_used = 'Station-specific' if 'station_name' in payload else 'Global Fallback'
                
                today_aqi = current_aqi_val
                aqi_yest = today_aqi
                aqi_db_yest = today_aqi
                
                # Filter records for this station before today
                today_str = datetime.now().strftime('%Y-%m-%d')
                station_history = [
                    r for r in deduped_records 
                    if r.get('Station') == station_name and r.get('Date', '') < today_str
                ]
                # Sort by date
                station_history.sort(key=lambda x: x.get('Date', ''))
                
                if len(station_history) >= 2:
                    aqi_yest = float(station_history[-1].get('AQI', today_aqi))
                    aqi_db_yest = float(station_history[-2].get('AQI', today_aqi))

                rolling_3 = (today_aqi + aqi_yest + aqi_db_yest) / 3

                live_data['AQI_Lag_1'] = today_aqi
                live_data['AQI_Lag_2'] = aqi_yest
                live_data['AQI_Rolling_3'] = rolling_3
                live_data['Station_Code'] = name_to_code.get(station_name, 1)
                
                # Prepare input features as a list (for NumPy)
                input_row = [float(live_data.get(f, 0)) for f in features]
                input_array = np.array([input_row])

                # Use native XGBoost booster to predict
                dmatrix = xgb.DMatrix(input_array, feature_names=features)
                booster = payload['booster']
                prediction = float(booster.predict(dmatrix)[0])
                
                if 'station_name' in payload:
                    mae_map = {
                        'Balanagar SPCB': 4.89, 'HITEC City': 3.70, 
                        'IDA Pashamylaram SPCB': 5.72, 'Sanathnagar SPCB': 4.80, 
                        'US Consulate': 3.07, 'Uppal SPCB': 4.13, 'Zoo Park SPCB': 4.22
                    }
                    base_mae = mae_map.get(station_name, 4.5)
                    confidence_val = round(100 - (base_mae * 1.5), 1)
                    mae = mae_map.get(station_name, 6.16)

            all_station_details[station_name] = {
                'station_name': station_name,
                'current_aqi': current_aqi_val,
                'current_category': get_aqi_category(current_aqi_val),
                'dominant_pollutant': dominant,
                'predicted_aqi': int(prediction) if prediction else None,
                'predicted_category': get_aqi_category(int(prediction)) if prediction else None,
                'model_used': model_used,
                'confidence_score': confidence_val,
                'mae': mae,
                'weather': {
                    'temperature': live_data.get('Temperature', '--'),
                    'humidity': live_data.get('Humidity', '--'),
                    'wind_speed': live_data.get('Wind_Speed', '--'),
                    'rain': live_data.get('Rainfall', '--')
                }
            }
        except Exception as e:
            print(f"Skipping {station_name} due to error: {e}")
            continue

    return {"status": "success", "data": list(all_station_details.values())}


@app.get("/api/trend/{station_name}")
def get_trend_data(station_name: str, days: int = 7):
    """
    Returns historical trend data for AQI and Temperature for a station.
    """
    all_rows = []
    
    # Read files manually
    all_rows.extend(load_csv_data(HISTORICAL_CSV))
    all_rows.extend(load_csv_data(LIVE_AQI_CSV))
            
    if not all_rows:
        return {"status": "success", "data": []}

    # Filter by station
    station_rows = [r for r in all_rows if r.get('Station') == station_name]
    
    if not station_rows:
        return {"status": "success", "data": []}

    # Deduplicate and Sort
    rows_map = {}
    for r in station_rows:
        date = r.get('Date')
        if date:
            rows_map[date] = r
    
    sorted_dates = sorted(rows_map.keys())
    final_rows = []
    for d in sorted_dates:
        r = rows_map[d]
        try:
            final_rows.append({
                'Date': d,
                'AQI': int(float(r.get('AQI', 0))),
                'Temperature': float(r.get('Temperature', 0))
            })
        except:
            continue
    
    # Get last N days
    result = final_rows[-days:] if len(final_rows) > days else final_rows
    return {"status": "success", "data": result}

@app.get("/api/stations")
def get_stations():
    """
    Returns a list of all supported stations and their coordinates.
    """
    stations_coords = {
        "Balanagar SPCB": {"lat": 17.4589, "lon": 78.4412},
        "HITEC City": {"lat": 17.4419, "lon": 78.3801}, 
        "IDA Pashamylaram SPCB": {"lat": 17.5303, "lon": 78.1820},
        "Sanathnagar SPCB": {"lat": 17.4561, "lon": 78.4437},
        "US Consulate": {"lat": 17.4170, "lon": 78.3470}, 
        "Uppal SPCB": {"lat": 17.4018, "lon": 78.5602},
        "Zoo Park SPCB": {"lat": 17.3507, "lon": 78.4432}
    }
    
    all_stations = []
    for name in STATION_MAP.keys():
        coord = stations_coords.get(name, {"lat": 17.4, "lon": 78.4})
        all_stations.append({
            "name": name,
            "display_name": name.replace(' SPCB', '').replace(',', '').strip(),
            "lat": coord["lat"],
            "lon": coord["lon"]
        })
        
    return {"status": "success", "data": all_stations}

# ---------------------------------------------------------
# ENTRY POINT — for Render (uvicorn) and local development
# ---------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("index:app", host="0.0.0.0", port=port, reload=True)
