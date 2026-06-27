# 🌌 AirCast: Hyderabad Air Quality Index (AQI) Prediction System




---

## 📖 Description

**AirCast** is a environmental forecasting platform tailored for the city of Hyderabad, India. The project transitions environmental management from a reactive posture to a proactive forecasting model by providing real-time air quality index monitoring and predictive 24-hour next-day forecasting for key stations across Hyderabad.

By integrating live sensor telemetry from the **World Air Quality Index (WAQI)** API with historical data trends and station-specific **XGBoost Regression models**, the system calculates highly accurate AQI predictions. These insights are delivered via a high-end, glassmorphic desktop interface featuring fluid animations, responsive trend visualization, and interactive spatial mapping.

---


```


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
