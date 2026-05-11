# Hyderabad Air Quality Index (AQI) Prediction System

**🔴 Live Demo:** [https://aqi-prediction-ml-2.onrender.com/](https://aqi-prediction-ml-2.onrender.com/)

[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/ML-XGBoost-EBBD3C?style=for-the-badge&logo=xgboost)](https://xgboost.ai/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

## 📖 Description

The **Hyderabad AQI Prediction System** is an AI-powered environmental forecasting platform. It solves the problem of reactive pollution management by providing real-time Air Quality Index (AQI) monitoring and proactive next-day forecasting for various stations across Hyderabad, India. By combining live weather data, historical trends, and Machine Learning models (XGBoost), the system empowers users with actionable environmental intelligence presented through a premium, glassmorphic UI.

---

## 🛠️ Tech Stack

**Frontend:**
- **Framework:** React 19 (Vite)
- **Styling:** Custom CSS (Glassmorphism aesthetics)
- **Visualization:** Recharts (dynamic charts), React-Leaflet (interactive maps)
- **Icons:** Lucide React
- **HTTP Client:** Axios

**Backend:**
- **Framework:** FastAPI
- **Machine Learning:** XGBoost, Scikit-learn, Joblib
- **Data Processing:** Pandas, NumPy
- **Server Environment:** Python 3.10+, Uvicorn

**Deployment & Tools:**
- **Containerization:** Docker
- **APIs Used:** World Air Quality Index (WAQI)

---

## ✨ Features

- **Real-Time AQI Monitoring:** Live metrics for major stations (e.g., Balanagar, HITEC City, Sanathnagar).
- **AI Forecasting:** Station-specific XGBoost regression models predict tomorrow's AQI based on current and lag features.
- **Premium Dashboard UI:** Highly responsive, glassmorphism-based design with dynamic animations.
- **Comprehensive Weather Widget:** Displays live temperature, humidity, wind speed, and precipitation.
- **Interactive Data Visualization:** Trend charts for AQI and temperature, plus real-time geographical mapping of stations.
- **Automated Data Pipeline:** Background services to fetch, deduplicate, and process data directly from WAQI.

---

## 📂 Folder Structure

```text
AQI-PREDICTION-ML/
├── api/                    # Backend FastAPI application
│   ├── data/               # Datasets (Historical & Live collected)
│   ├── models/             # Saved .pkl models (Global & Station-specific)
│   ├── fetch_live_data.py  # Utility script to interact with WAQI API
│   ├── index.py            # Main FastAPI server and route definitions
│   └── requirements.txt    # Python dependencies
├── frontend/               # Frontend React application
│   ├── public/             # Static assets
│   ├── src/                # React components (Dashboard, Widgets, Maps)
│   ├── package.json        # Node.js dependencies and scripts
│   └── vite.config.js      # Vite build configuration
├── Dockerfile              # Unified build instructions for Render
├── render.yaml             # Render deployment configuration
└── README.md               # Project documentation
```

---

## 🚀 Installation Steps

### Prerequisites
- Node.js (v20+)
- Python (v3.10+)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Rohan0639/aqi-prediction-ml.git
cd aqi-prediction-ml
```

### 2. Backend Setup
```bash
cd api
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 💻 Usage

### Starting the Backend Server
From the `api` directory, start the FastAPI server:
```bash
uvicorn index:app --reload --port 8000
```
> The API will be available at `http://localhost:8000`.

### Starting the Frontend Development Server
From the `frontend` directory, start Vite:
```bash
npm run dev
```
> The web interface will be available at `http://localhost:5173`.

---

## 📜 Scripts

Available in `frontend/package.json`:
- `npm run dev` - Starts the Vite development server.
- `npm run build` - Builds the React app for production into the `dist/` folder.
- `npm run lint` - Runs ESLint to check for code quality.
- `npm run preview` - Previews the production build locally.

---

## 🔑 Environment Variables

To run this project securely, you need to configure the following environment variables:

**Backend (`api/.env`):**
- `WAQI_API_TOKEN` = Your World Air Quality Index API key (required to fetch live pollution data).
- `PORT` = (Optional) Server port. Default is 8000.

**Frontend (`frontend/.env`):**
- `VITE_API_URL` = The base URL of the FastAPI backend. (e.g., `http://localhost:8000` for local development, or `https://aqi-prediction-ml-2.onrender.com` for production).

---

## 📡 API Endpoints

The FastAPI backend exposes the following primary endpoints:

- `GET /api/dashboard`
  - **Description:** Returns an array of objects containing live weather, current AQI, and XGBoost-predicted AQI for all configured stations.
- `GET /api/trend/{station_name}?days={N}`
  - **Description:** Fetches historical and live merged data (AQI & Temperature) for the specified station over the last `N` days.
- `GET /api/stations`
  - **Description:** Returns the geographical coordinates (lat/lon) and display names for mapping.

---

## 🔮 Future Improvements

Based on the current architecture, potential enhancements include:
- **User Authentication:** Implementing JWT login for personalized alerts.
- **Email/SMS Alerts:** Automated notifications when AQI hits "Unhealthy" levels.
- **Expanded Coverage:** Scaling models and data ingestion to support additional cities across India.
- **Database Migration:** Moving from `.csv` file storage to a structured SQL/NoSQL database (e.g., PostgreSQL or MongoDB) for better querying performance.

---

## 🤝 Contributing

Contributions are always welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License.
