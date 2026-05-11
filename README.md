# Hyderabad Air Quality Index (AQI) Prediction System

**🔴 Live Demo:** [https://aqi-prediction-ml-2.onrender.com/](https://aqi-prediction-ml-2.onrender.com/)

[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/ML-XGBoost-EBBD3C?style=for-the-badge&logo=xgboost)](https://xgboost.ai/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

An AI-powered environmental forecasting system designed to monitor and predict Air Quality Index (AQI) across various monitoring stations in Hyderabad, India. This project features a **FastAPI** backend for high-performance data serving and a **React** frontend with premium glassmorphic aesthetics.

---

## 🌟 Key Features

- **Live Monitoring**: Real-time AQI tracking across multiple Hyderabad stations (Balanagar, HITEC City, Sanathnagar, etc.).
- **AI Forecasting**: Predicts next-day AQI using station-specific XGBoost regression models.
- **Premium Dashboard**: A modern React-based interface featuring:
    - **Glassmorphic Design**: Sleek, transparent UI elements with vibrant gradients.
    - **Interactive Maps**: Real-time station visualization using Leaflet.
    - **Dynamic Charts**: Interactive AQI and temperature trends powered by Recharts.
    - **Animated UX**: Smooth transitions and entry animations.
- **RESTful API**: Decoupled backend serving JSON data for predictions, trends, and station metadata.
- **Automated Data Collection**: Continuous background fetching of live data from the WAQI API.

---

## 🏗️ Project Structure

```text
AQI-PREDICTION-ML/
├── api/                    # Backend FastAPI application
│   ├── data/               # Datasets (Historical & Live collected)
│   ├── models/             # Saved .pkl models (Global & Station-specific)
│   ├── fetch_live_data.py  # Utility to interface with WAQI API
│   ├── index.py            # Main FastAPI server entry point
│   └── requirements.txt    # Python dependencies for the backend
├── frontend/               # Frontend React + Vite application
│   ├── src/                # React components, charts, and logic
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── README.md               # Project documentation
└── vercel.json             # Vercel deployment configuration
```

---

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI
- **ML Framework**: XGBoost, Scikit-learn, Joblib
- **Data Handling**: Pandas, NumPy
- **API**: World Air Quality Index (WAQI)

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Vanilla CSS (Custom Glassmorphism)
- **Charts**: Recharts
- **Maps**: React-Leaflet
- **Icons**: Lucide React
- **Data Fetching**: Axios

---

## 🚀 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Rohan0639/aqi-prediction-ml.git
cd aqi-prediction-ml
```

### 2. Backend Setup
Install Python dependencies:
```bash
cd api
pip install -r requirements.txt
```
Ensure you have the necessary environment variables set up (e.g., WAQI API token).

### 3. Frontend Setup
Install Node dependencies:
```bash
cd frontend
npm install
```

---

## 🔧 Running Locally

### Development Mode
To run the project in development mode:

1. **Start Backend**:
   ```bash
   cd api
   python index.py
   ```
   The API will be available at `http://localhost:8000`.

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

---

## 📊 Model Performance
The XGBoost forecasting engine achieves high accuracy for the Hyderabad region:
- **Mean Absolute Error (MAE)**: ~6.16 (Global)
- **R² Score**: ~0.97
- **Station MAE**: US Consulate (~3.07), HITEC City (~3.70)

---

## 📝 License
This project is for educational and demonstration purposes.

---

*Developed with focus on Environmental Intelligence for the city of Hyderabad.*

