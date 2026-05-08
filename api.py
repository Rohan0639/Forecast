import os
import joblib
import pandas as pd
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

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
MODEL_PATH = 'models/trained_model.pkl'
STATION_MODELS_DIR = 'models/station_models'
WEATHER_CSV_PATH = 'data/hyderabad_live_weather.csv'
LIVE_AQI_CSV = 'data/live_aqi_dataset.csv'
HISTORICAL_CSV = 'data/hyderabad_air_quality_10y_combined_fixed.csv'

# Simple in-memory cache
cache = {
    'global_model': None,
    'station_models': {},
}

def load_global_model():
    if cache['global_model'] is None and os.path.exists(MODEL_PATH):
        try:
            cache['global_model'] = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"Error loading global model: {e}")
    return cache['global_model']

def load_station_model(station_name):
    if station_name not in cache['station_models']:
        station_file = os.path.join(STATION_MODELS_DIR, f"{station_name.lower().replace(' ', '_')}.pkl")
        if os.path.exists(station_file):
            try:
                cache['station_models'][station_name] = joblib.load(station_file)
            except Exception as e:
                print(f"Error loading station model {station_name}: {e}")
                cache['station_models'][station_name] = None
        else:
            cache['station_models'][station_name] = None
    
    return cache['station_models'][station_name] or load_global_model()

def get_aqi_category(aqi):
    if aqi is None: return "Unknown"
    if aqi <= 50: return "Good"
    if aqi <= 100: return "Moderate"
    if aqi <= 150: return "Unhealthy for Sensitive Groups"
    if aqi <= 200: return "Unhealthy"
    if aqi <= 300: return "Very Unhealthy"
    return "Hazardous"

def calculate_dominant_pollutant(live_record):
    pollutants = {k: live_record.get(k, 0) for k in ['PM2.5', 'PM10', 'NO2', 'SO2', 'O3', 'CO']}
    if not pollutants: return "Unknown"
    return max(pollutants.keys(), key=lambda k: pollutants[k] if pollutants[k] is not None else 0)

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
        raise HTTPException(status_code=500, detail="Global model not found. Run training first.")

    features = global_payload.get('features', [])
    station_mapping = global_payload.get('station_mapping', {})
    name_to_code = {name: code for code, name in station_mapping.items()}
    
    all_station_details = {}
    
    try:
        if os.path.exists(LIVE_AQI_CSV):
            df_all = pd.read_csv(LIVE_AQI_CSV, parse_dates=['Date'])
            df_all = df_all.drop_duplicates(subset=['Date', 'Station'], keep='last')
        else:
            df_all = pd.DataFrame()
    except Exception as e:
        print(f"Error loading live AQI CSV: {e}")
        df_all = pd.DataFrame()

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
                
                if not df_all.empty:
                    today_str = datetime.now().strftime('%Y-%m-%d')
                    df_station = df_all[
                        (df_all['Station'] == station_name) & 
                        (df_all['Date'].dt.strftime('%Y-%m-%d') < today_str)
                    ].sort_values('Date')
                    
                    if len(df_station) >= 2:
                        hist_vals = df_station.tail(2)['AQI'].tolist()
                        aqi_yest = hist_vals[1]
                        aqi_db_yest = hist_vals[0]

                rolling_3 = (today_aqi + aqi_yest + aqi_db_yest) / 3

                live_data['AQI_Lag_1'] = today_aqi
                live_data['AQI_Lag_2'] = aqi_yest
                live_data['AQI_Rolling_3'] = rolling_3
                live_data['Station_Code'] = name_to_code.get(station_name, 1)
                
                input_dict = {f: live_data.get(f, 0) for f in features}
                df_input = pd.DataFrame([input_dict])

                prediction = float(model.predict(df_input)[0])
                
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
    dfs = []
    
    if os.path.exists(HISTORICAL_CSV):
        try:
            dfs.append(pd.read_csv(HISTORICAL_CSV, parse_dates=['Date']))
        except Exception:
            pass
            
    if os.path.exists(LIVE_AQI_CSV):
        try:
            dfs.append(pd.read_csv(LIVE_AQI_CSV, parse_dates=['Date']))
        except Exception:
            pass
            
    if not dfs:
        return {"status": "success", "data": []}

    df = pd.concat(dfs, ignore_index=True)
    df = df[df['Station'] == station_name].copy()
    
    if df.empty:
        return {"status": "success", "data": []}

    df = df.sort_values('Date').drop_duplicates(subset=['Date'], keep='last')
    df['AQI'] = pd.to_numeric(df['AQI'], errors='coerce')
    df['Temperature'] = pd.to_numeric(df['Temperature'], errors='coerce')
    df = df.dropna(subset=['Date', 'AQI'])
    
    df = df.tail(days).reset_index(drop=True)
    
    # Format for JSON
    df['Date'] = df['Date'].dt.strftime('%Y-%m-%d')
    
    records = df[['Date', 'AQI', 'Temperature']].to_dict(orient='records')
    return {"status": "success", "data": records}

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
    
    # Enrich with just names for those not in coords list
    all_stations = []
    for name in STATION_MAP.keys():
        coord = stations_coords.get(name, {"lat": 17.4, "lon": 78.4}) # Default to center
        all_stations.append({
            "name": name,
            "display_name": name.replace(' SPCB', '').replace(',', '').strip(),
            "lat": coord["lat"],
            "lon": coord["lon"]
        })
        
    return {"status": "success", "data": all_stations}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
