import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import axios from 'axios';

const TrendChart = ({ stationName }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('AQI');

  useEffect(() => {
    if (!stationName) return;
    
    const fetchTrend = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/trend/${encodeURIComponent(stationName)}`);
        if (response.data.status === 'success') {
          // Format dates for display
          const formattedData = response.data.data.map(d => {
            const dateObj = new Date(d.Date);
            return {
              ...d,
              displayDate: `${dateObj.toLocaleString('default', { month: 'short' })} ${dateObj.getDate()}`
            };
          });
          setData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching trend data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrend();
  }, [stationName]);

  if (loading) {
    return <div style={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>Loading trend data...</div>;
  }

  if (data.length === 0) {
    return <div style={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>No trend data available.</div>;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '10px', borderRadius: '8px', color: '#f8fafc' }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{payload[0].payload.displayDate}</p>
          <p style={{ margin: 0, color: chartType === 'AQI' ? '#3b82f6' : '#f97316' }}>
            {chartType}: {payload[0].value} {chartType === 'Temperature' ? '°C' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="premium-subtitle" style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>Historical Trends</h3>
        <select 
          value={chartType} 
          onChange={(e) => setChartType(e.target.value)}
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontFamily: 'Outfit',
            cursor: 'pointer'
          }}
        >
          <option value="AQI">AQI</option>
          <option value="Temperature">Temperature</option>
        </select>
      </div>
      
      <div style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="displayDate" stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            
            {chartType === 'AQI' && (
              <>
                <ReferenceArea y1={0} y2={50} fill="#22c55e" fillOpacity={0.05} />
                <ReferenceArea y1={50} y2={100} fill="#eab308" fillOpacity={0.05} />
                <ReferenceArea y1={100} y2={150} fill="#f97316" fillOpacity={0.05} />
                <ReferenceArea y1={150} y2={200} fill="#ef4444" fillOpacity={0.05} />
                <ReferenceArea y1={200} y2={300} fill="#a855f7" fillOpacity={0.05} />
              </>
            )}

            <Line 
              type="monotone" 
              dataKey={chartType} 
              stroke={chartType === 'AQI' ? "#3b82f6" : "#f97316"} 
              strokeWidth={3} 
              dot={{ r: 4, fill: chartType === 'AQI' ? "#3b82f6" : "#f97316", stroke: '#0f172a', strokeWidth: 2 }} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
