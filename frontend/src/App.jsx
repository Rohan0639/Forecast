import React, { useState, useEffect } from 'react';
import axios from 'axios';
import IntroScreen from './components/IntroScreen';
import DashboardMetrics from './components/DashboardMetrics';
import MapContainer from './components/MapContainer';
import TrendChart from './components/TrendChart';
import WeatherWidget from './components/WeatherWidget';

function App() {
  const [introPlayed, setIntroPlayed] = useState(false);
  const [dashboardData, setDashboardData] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/dashboard');
        if (response.data.status === 'success') {
          const data = response.data.data;
          setDashboardData(data);
          if (data.length > 0) {
            setSelectedStation(data[0].station_name);
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Could not connect to the backend server. Make sure the FastAPI server is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Auto-refresh every 2 minutes
    const intervalId = setInterval(fetchDashboardData, 120000);
    return () => clearInterval(intervalId);
  }, []);

  const handleStationChange = (e) => {
    setSelectedStation(e.target.value);
  };

  const handleMapStationSelect = (stationName) => {
    setSelectedStation(stationName);
  };

  // Find currently selected station data
  const currentStationData = dashboardData.find(s => s.station_name === selectedStation) || null;

  return (
    <>
      <IntroScreen onComplete={() => setIntroPlayed(true)} />
      
      {/* Hide main content until intro is mostly done to avoid layout jump issues during animation, but keep it mounted so map can init */}
      <div style={{ opacity: introPlayed ? 1 : 0, transition: 'opacity 0.5s ease', pointerEvents: introPlayed ? 'auto' : 'none' }}>
        
        <header style={{ marginBottom: '2rem' }}>
          <div className="live-badge-wrapper" style={{ justifyContent: 'flex-start', marginBottom: '1rem' }}>
            <div className="live-badge" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 16px', borderRadius: '9999px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', marginRight: '12px', boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)', animation: 'pulsePremium 2s infinite cubic-bezier(0.4, 0, 0.6, 1)' }}></div>
              <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.05em' }}>LIVE SYSTEM ACTIVE</span>
            </div>
          </div>

          <h1 className="premium-title">Air Quality Prediction</h1>
          <div className="premium-subtitle">Hyderabad Live Dashboard</div>
        </header>

        {error ? (
          <div className="glass-card" style={{ borderLeft: '6px solid #ef4444', color: '#f8fafc' }}>
            <h3>Connection Error</h3>
            <p>{error}</p>
          </div>
        ) : loading && dashboardData.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#94a3b8' }}>
            Loading dashboard data...
          </div>
        ) : (
          <>
            <select 
              className="glass-select" 
              value={selectedStation || ''} 
              onChange={handleStationChange}
            >
              {dashboardData.map(station => (
                <option key={station.station_name} value={station.station_name}>
                  {station.station_name}
                </option>
              ))}
            </select>

            <div className="grid-2">
              <div>
                <DashboardMetrics stationData={currentStationData} />
                <WeatherWidget weather={currentStationData?.weather} />
              </div>
              
              <div>
                <MapContainer 
                  stationsData={dashboardData} 
                  selectedStation={selectedStation}
                  onStationSelect={handleMapStationSelect}
                />
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <TrendChart stationName={selectedStation} />
            </div>
            
            {/* Legend Component */}
            <div className="glass-card" style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#94a3b8' }}>AQI Color Legend</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between' }}>
                {[
                  { text: 'Good (0-50)', color: '#22c55e' },
                  { text: 'Satisfactory (51-100)', color: '#eab308' },
                  { text: 'Moderate (101-200)', color: '#f97316' },
                  { text: 'Poor (201-300)', color: '#ef4444' },
                  { text: 'Very Poor (301-400)', color: '#a855f7' },
                  { text: 'Severe (401+)', color: '#9f1239' },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: item.color }}></div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulsePremium {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}} />
    </>
  );
}

export default App;
