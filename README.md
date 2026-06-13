# 🌌 AirCast: Hyderabad Air Quality Index (AQI) Prediction System

**🔴 Live Production Demo:** [https://aqi-prediction-ml-nine.vercel.app/](https://aqi-prediction-ml-nine.vercel.app/)

[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/ML-XGBoost-EBBD3C?style=for-the-badge&logo=xgboost&logoColor=black)](https://xgboost.ai/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📖 Description

**AirCast** is a environmental forecasting platform tailored for the city of Hyderabad, India. The project transitions environmental management from a reactive posture to a proactive forecasting model by providing real-time air quality index monitoring and predictive 24-hour next-day forecasting for key stations across Hyderabad.

By integrating live sensor telemetry from the **World Air Quality Index (WAQI)** API with historical data trends and station-specific **XGBoost Regression models**, the system calculates highly accurate AQI predictions. These insights are delivered via a high-end, glassmorphic desktop interface featuring fluid animations, responsive trend visualization, and interactive spatial mapping.

---


```

### **1. Frontend Layer**
*   **Core Library:** React 19 (managed through Vite for lightning-fast HMR and building).
*   **Aesthetics:** Pure Vanilla CSS styled with **Frosted Glassmorphism** (backdrop blurs, linear color gradients, responsive grid layouts, and custom micro-animations).
*   **Spatial Visualization:** **React-Leaflet** & **Leaflet** for interactive mapping, rendering geographical locations of stations with color-coded status overlays.
*   **Trend Analytics:** **Recharts** for rendering high-fidelity, interactive, and responsive area charts showing AQI and Temperature trends over configurable timeframes.
*   **Iconography:** **Lucide React** for smooth, lightweight SVG icons.
*   **HTTP Client:** **Axios** with environments-configured API URL mapping.

### **2. Backend Layer**
*   **Core Framework:** **FastAPI** (Python 3.10+) providing asynchronous execution endpoints, automatic documentation, and unified CORS support.
*   **Machine Learning Inference:**
    *   **XGBoost:** Station-specific regression models loaded at startup.
    *   **Scikit-Learn:** Data preprocessing pipelines and models.
    *   **Joblib:** Serialization/deserialization for global and station-specific models.
*   **Data Processing:** **NumPy** for vector arrays, and native Python `csv` modules for lightweight file ingestion (ensuring minimal system overhead).
*   **Environment Configuration:** `python-dotenv` for local API keys and network routing configurations.

### **3. Deployment & DevOps**
*   **Containerization:** **Docker** utilizing a multi-stage compilation image to unify the React frontend production bundle with the FastAPI server.
*   **Orchestration:** `railway.json` and `render.yaml` for instant cloud blueprints deployment.

---

## ✨ Key Features & Functionality

### **1. Real-Time Telemetry Pipeline**
AirCast queries the WAQI API using unique sensor identifiers for seven major stations in Hyderabad:
*   `Balanagar SPCB` (`@8179`)
*   `HITEC City` (`@9129`)
*   `IDA Pashamylaram SPCB` (`@9144`)
*   `Sanathnagar SPCB` (`@8182`)
*   `US Consulate` (`@7022`)
*   `Uppal SPCB` (`@11333`)
*   `Zoo Park SPCB` (`@8677`)

Since training datasets operate on pollutant concentration levels rather than raw sub-indexes, the system converts live AQI sub-indices to physical concentrations ($\mu g/m^3$) for **PM2.5** and **PM10** using standard **Indian CPCB (Central Pollution Control Board)** breakpoint formulas.

### **2. Station-Specific AI Forecasting Engine**
Rather than utilizing a generic, one-size-fits-all model, AirCast loads a dedicated, station-tuned XGBoost model for each monitoring site.
*   **Inference Features:** Live metrics (`PM2.5`, `PM10`, `NO2`, `SO2`, `O3`, `CO`, `Temperature`, `Humidity`, `Wind_Speed`, `Rainfall`), `Station_Code`, and engineered lag metrics:
    *   `AQI_Lag_1` (Today's AQI)
    *   `AQI_Lag_2` (Yesterday's AQI)
    *   `AQI_Rolling_3` (3-day rolling average AQI)
*   **Performance Metrics:** Displays dynamic Mean Absolute Error (MAE) and calculates model confidence metrics ($100 - (\text{MAE} \times 1.5)$) unique to each station (ranging from 91% to 95%+ confidence).

### **3. Interactive Map Integration**
*   Embeds a high-fidelity **Leaflet** map focused over Hyderabad.
*   Draws station markers with color-coded circles matching CPCB air quality severity.
*   Clicking any station marker triggers a state update, rendering that station's detailed metrics and historical trends across the entire application interface.

### **4. Advanced Analytics & Trend Charting**
*   Fuses 10 years of combined historical data (`hyderabad_air_quality_10y_combined_fixed.csv`) with real-time collected data (`live_aqi_dataset.csv`).
*   Renders dual-axis trend lines displaying how **AQI** and **Temperature** correlate over customizable time windows (7, 15, or 30 days).

---

## 📂 Project Structure

```text
AQI-PREDICTION-ML/
├── .devcontainer/          # Codespaces container configurations
├── api/                    # Backend FastAPI application
│   ├── data/               # Historical & Live telemetry data
│   │   ├── hyderabad_air_quality_10y_combined_fixed.csv
│   │   ├── hyderabad_live_weather.csv
│   │   └── live_aqi_dataset.csv
│   ├── models/             # Trained serialized ML models
│   │   ├── station_models/ # Station-specific PKL models
│   │   └── trained_model.pkl # Global fallback model
│   ├── fetch_live_data.py  # WAQI API client & concentration conversions
│   ├── index.py            # Main API server, endpoints, and ML inference
│   └── requirements.txt    # Backend Python dependencies
├── frontend/               # Frontend React 19 application
│   ├── src/                # Components, hooks, and style system
│   │   ├── components/     # UI components (Map, Trends, Metrics, Weather)
│   │   │   ├── DashboardMetrics.jsx
│   │   │   ├── IntroScreen.css/jsx
│   │   │   ├── MapContainer.jsx
│   │   │   ├── TrendChart.jsx
│   │   │   └── WeatherWidget.jsx
│   │   ├── App.jsx         # Primary App layout and state manager
│   │   ├── index.css       # Glassmorphic style sheet and animations
│   │   └── main.jsx        # Mounting context
│   ├── package.json        # Frontend Node dependencies & scripts
│   └── vite.config.js      # Vite compilation configuration
├── Dockerfile              # Unified build image (FastAPI + React static mount)
├── railway.json            # Railway deployment setup
├── render.yaml             # Render Blueprint environment settings
└── README.md               # Project documentation
```

---

## 🚀 Installation & Local Setup

### **Prerequisites**
*   **Node.js** (v20 or higher)
*   **Python** (v3.10 or higher)
*   **WAQI API Key** (Free key obtainable at [aqicn.org/api/](https://aqicn.org/api/))

---

### **Step 1: Clone the Project**
```bash
git clone https://github.com/Rohan0639/aqi-prediction-ml.git
cd aqi-prediction-ml
```

### **Step 2: Backend Configuration**
1. Navigate to the API directory:
   ```bash
   cd api
   ```
2. Set up a virtual environment:
   ```bash
   python -m venv venv
   # Activate on Windows:
   .\venv\Scripts\activate
   # Activate on macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create an `.env` file inside the `api` folder:
   ```env
   AQI_API_KEY=your_waqi_api_token_here
   PORT=8000
   ```

### **Step 3: Frontend Configuration**
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an `.env` file inside the `frontend` folder:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

---

## 💻 Running the Application Locally

### **1. Launch Backend Server**
Ensure you are in the `api` directory with your virtual environment activated:
```bash
uvicorn index:app --reload --port 8000
```
*The interactive API Swagger docs will be available at `http://localhost:8000/docs`.*

### **2. Launch Frontend Dev Server**
Ensure you are in the `frontend` directory:
```bash
npm run dev
```
Open `http://localhost:5173` in your web browser.

---

## 📡 API Reference

| Endpoint | Method | Response Payload | Description |
| :--- | :---: | :--- | :--- |
| `/api/dashboard` | `GET` | `{"status": "success", "data": [...]}` | Fetches current AQI, calculated dominant pollutant, next-day forecast, model metrics, and live weather variables for all 7 stations. |
| `/api/trend/{name}` | `GET` | `{"status": "success", "data": [{"Date", "AQI", "Temperature"}]}` | Returns time-series data for a station's trend charting. Supports querying days via query parameter (e.g., `?days=30`). |
| `/api/stations` | `GET` | `{"status": "success", "data": [{"name", "lat", "lon"}]}` | Returns latitudinal and longitudinal metadata coordinates for spatial map initialization. |

---

## 📊 AQI Health Scale Reference (Indian CPCB Standard)

The frontend maps real-time AQI readings to the following classification standards:

| AQI Range | Classification | Theme Color | Health Implications |
| :---: | :---: | :---: | :--- |
| **0 - 50** | **Good** | `#22c55e` (Green) | Minimal impact |
| **51 - 100** | **Moderate** | `#eab308` (Yellow) | Minor breathing discomfort to sensitive people |
| **101 - 150** | **Unhealthy for Sensitive Groups** | `#f97316` (Orange) | Discomfort to people with lungs/heart diseases |
| **151 - 200** | **Unhealthy** | `#ef4444` (Red) | Breathing discomfort to most people on prolonged exposure |
| **201 - 300** | **Very Unhealthy** | `#a855f7` (Purple) | Respiratory illness on prolonged exposure |
| **300+** | **Hazardous** | `#9f1239` (Maroon) | Severe respiratory effects even on healthy people |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
