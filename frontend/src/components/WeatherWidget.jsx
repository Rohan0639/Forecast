import React from 'react';
import { Thermometer, Droplets, CloudRain, Wind } from 'lucide-react';

const WeatherWidget = ({ weather }) => {
  if (!weather) return null;

  const metrics = [
    { label: 'Temperature', value: `${weather.temperature}°C`, icon: <Thermometer size={18} />, color: '#fbbf24' },
    { label: 'Humidity', value: `${weather.humidity}%`, icon: <Droplets size={18} />, color: '#38bdf8' },
    { label: 'Wind', value: `${weather.wind_speed}km/h`, icon: <Wind size={18} />, color: '#10b981' },
    { label: 'Precipitation', value: `${weather.rain}mm`, icon: <CloudRain size={18} />, color: '#94a3b8' }
  ];

  return (
    <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
      {metrics.map((m, i) => (
        <div key={i} className="glass-card" style={{ marginBottom: 0, padding: '1.5rem', textAlign: 'center', background: `linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, ${m.color}08 100%)` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '14px', background: `${m.color}15`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {m.icon}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>{m.value}</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{m.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeatherWidget;
