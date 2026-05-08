import React from 'react';
import { Droplets, Thermometer, CloudRain } from 'lucide-react';

const WeatherWidget = ({ weather }) => {
  if (!weather) return null;

  return (
    <div className="glass-card">
      <h3 className="premium-subtitle" style={{ marginBottom: '1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
        Current Weather
      </h3>
      <div className="grid-3">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Thermometer size={14} /> Temperature
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f8fafc' }}>
            {weather.temperature} °C
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Droplets size={14} /> Humidity
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f8fafc' }}>
            {weather.humidity} %
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CloudRain size={14} /> Rainfall
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f8fafc' }}>
            {weather.rain} mm
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
