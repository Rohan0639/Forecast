import React from 'react';

const DashboardMetrics = ({ stationData }) => {
  if (!stationData) return null;

  const { current_aqi, current_category, predicted_aqi, predicted_category, dominant_pollutant, confidence_score } = stationData;

  const getCategoryColor = (aqi) => {
    if (aqi == null) return "gray";
    if (aqi <= 50) return "#22c55e"; // Green
    if (aqi <= 100) return "#eab308"; // Yellow
    if (aqi <= 150) return "#f97316"; // Orange
    if (aqi <= 200) return "#ef4444"; // Red
    if (aqi <= 300) return "#a855f7"; // Purple
    return "#9f1239"; // Maroon
  };

  const currentAqiColor = getCategoryColor(current_aqi);
  const predictedAqiColor = getCategoryColor(predicted_aqi);
  
  let confColor = "#ef4444";
  if (confidence_score >= 90) confColor = "#22c55e";
  else if (confidence_score >= 80) confColor = "#eab308";

  return (
    <div className="grid-2" style={{ marginBottom: '2rem' }}>
      <div className="glass-card" style={{ borderLeft: `6px solid ${currentAqiColor}` }}>
        <div className="metric-flex">
          <div className="metric-label">Current Live AQI</div>
          <div className="metric-value large" style={{ color: currentAqiColor }}>
            {current_aqi ?? '--'}
          </div>
          <div className="metric-tag" style={{ backgroundColor: `${currentAqiColor}20`, color: currentAqiColor }}>
            {current_category ?? '--'}
          </div>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '1rem', fontWeight: 500 }}>
          Dominant Pollutant: <span style={{ color: '#f8fafc' }}>{dominant_pollutant}</span>
        </div>
      </div>

      <div className="glass-card" style={{ borderLeft: `6px solid ${predictedAqiColor}` }}>
        <div className="metric-flex">
          <div className="metric-label">Tomorrow AI Forecast</div>
          <div className="metric-value large" style={{ color: predictedAqiColor }}>
            {predicted_aqi ?? '--'}
          </div>
          <div className="metric-tag" style={{ backgroundColor: `${predictedAqiColor}20`, color: predictedAqiColor }}>
            {predicted_category ?? '--'}
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            color: confColor, 
            fontSize: '0.85rem', 
            background: `${confColor}15`, 
            padding: '4px 10px', 
            borderRadius: '6px', 
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            🎯 Confidence: {confidence_score}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;
