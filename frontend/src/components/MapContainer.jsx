import React from 'react';
import { MapContainer as LeafletMap, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for map resizing issue
const MapResizer = () => {
  const map = useMap();
  React.useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
};

const MapContainer = ({ stationsData, selectedStation, onStationSelect }) => {
  if (!stationsData || stationsData.length === 0) return null;

  const getAqiColor = (aqi) => {
    if (aqi == null) return "gray";
    if (aqi <= 50) return "#22c55e";
    if (aqi <= 100) return "#eab308";
    if (aqi <= 150) return "#f97316";
    if (aqi <= 200) return "#ef4444";
    if (aqi <= 300) return "#a855f7";
    return "#9f1239";
  };

  // Station coordinates mapped locally as a fallback, though API returns them
  const stationsCoords = {
    "Balanagar SPCB": { lat: 17.4589, lon: 78.4412 },
    "HITEC City": { lat: 17.4419, lon: 78.3801 }, 
    "IDA Pashamylaram SPCB": { lat: 17.5303, lon: 78.1820 },
    "Sanathnagar SPCB": { lat: 17.4561, lon: 78.4437 },
    "US Consulate": { lat: 17.4170, lon: 78.3470 }, 
    "Uppal SPCB": { lat: 17.4018, lon: 78.5602 },
    "Zoo Park SPCB": { lat: 17.3507, lon: 78.4432 }
  };

  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ height: '400px', width: '100%', position: 'relative' }}>
        <LeafletMap center={[17.4000, 78.4000]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <MapResizer />
          {/* Dark themed tile layer */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {stationsData.map((station) => {
            const coords = stationsCoords[station.station_name] || { lat: 17.4, lon: 78.4 };
            const color = getAqiColor(station.current_aqi);
            const isSelected = selectedStation === station.station_name;
            
            return (
              <CircleMarker
                key={station.station_name}
                center={[coords.lat, coords.lon]}
                radius={isSelected ? 14 : 10}
                pathOptions={{ 
                  color: color, 
                  fillColor: color, 
                  fillOpacity: 0.8,
                  weight: isSelected ? 3 : 1,
                  opacity: 1
                }}
                eventHandlers={{
                  click: () => onStationSelect(station.station_name),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <div style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                      {station.station_name.replace(' SPCB', '').replace(',', '')}
                    </div>
                    <div style={{ color: color, fontWeight: 'bold', fontSize: '12px' }}>
                      AQI: {station.current_aqi} — {station.current_category}
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </LeafletMap>
      </div>
    </div>
  );
};

export default MapContainer;
