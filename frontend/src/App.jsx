import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Wind, Map as MapIcon, BarChart3, CloudSun, ShieldCheck, AlertCircle, LayoutDashboard } from 'lucide-react';
import IntroScreen from './components/IntroScreen';
import DashboardMetrics from './components/DashboardMetrics';
import MapContainer from './components/MapContainer';
import TrendChart from './components/TrendChart';
import WeatherWidget from './components/WeatherWidget';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
        const response = await axios.get(`${API_BASE_URL}/api/dashboard`);
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
      
      <div style={{ opacity: introPlayed ? 1 : 0, transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)', pointerEvents: introPlayed ? 'auto' : 'none' }}>
        
        <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="live-badge-wrapper" style={{ justifyContent: 'flex-start', marginBottom: '1.25rem' }}>
              <div className="live-badge" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '8px 18px', borderRadius: '9999px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#38bdf8', borderRadius: '50%', marginRight: '12px', boxShadow: '0 0 12px rgba(56, 189, 248, 0.8)', animation: 'pulsePremium 2s infinite' }}></div>
                <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>System Live</span>
              </div>
            </div>

            <h1 className="premium-title">AirCast<span style={{ color: '#38bdf8' }}>.</span>AI</h1>
            <div className="premium-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={18} /> Hyderabad AQI Intelligence
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Station</div>
              <div style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedStation || 'Loading...'}</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <Wind size={20} />
            </div>
          </div>
        </header>

        {error ? (
          <div className="glass-card" style={{ borderLeft: '6px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
              <AlertCircle color="#ef4444" />
              <h3 style={{ margin: 0 }}>Connection Error</h3>
            </div>
            <p style={{ color: '#94a3b8', margin: 0 }}>{error}</p>
          </div>
        ) : loading && dashboardData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', color: '#94a3b8', gap: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(56, 189, 248, 0.1)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ fontWeight: 500, letterSpacing: '0.05em' }}>Initializing Intelligence Engine...</span>
          </div>
        ) : (
          <>
            <div style={{ position: 'relative', width: 'fit-content' }}>
              <LayoutDashboard size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: '#38bdf8', pointerEvents: 'none' }} />
              <select 
                className="glass-select" 
                style={{ paddingLeft: '45px' }}
                value={selectedStation || ''} 
                onChange={handleStationChange}
              >
                {dashboardData.map(station => (
                  <option key={station.station_name} value={station.station_name}>
                    {station.station_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid-2">
              <div className="metric-column">
                <DashboardMetrics stationData={currentStationData} />
                <WeatherWidget weather={currentStationData?.weather} />
              </div>
              
              <div className="map-column">
                <div className="glass-card" style={{ padding: 0, height: '100%', minHeight: '450px' }}>
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MapIcon size={18} color="#38bdf8" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Station Network</span>
                  </div>
                  <div style={{ height: 'calc(100% - 60px)' }}>
                    <MapContainer 
                      stationsData={dashboardData} 
                      selectedStation={selectedStation}
                      onStationSelect={handleMapStationSelect}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                  <BarChart3 size={20} color="#38bdf8" />
                  <span style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Predictive Trends & Analytics</span>
                </div>
                <TrendChart stationName={selectedStation} />
              </div>
            </div>
            
            {/* Legend Component */}
            <div className="glass-card" style={{ marginTop: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <ShieldCheck size={20} color="#38bdf8" />
                <h3 style={{ fontSize: '0.9rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>AQI Health Scale</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between' }}>
                {[
                  { text: 'Good (0-50)', color: '#22c55e' },
                  { text: 'Moderate (51-100)', color: '#eab308' },
                  { text: 'Unhealthy (101-150)', color: '#f97316' },
                  { text: 'High Risk (151-200)', color: '#ef4444' },
                  { text: 'Very High (201-300)', color: '#a855f7' },
                  { text: 'Hazardous (300+)', color: '#9f1239' },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}40` }}></div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulsePremium {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </>
  );
}

export default App;
