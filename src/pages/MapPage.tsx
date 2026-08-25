import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const FlyToRegion = ({ center, zoom }: { center: [number, number] | null, zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

export default function MapPage() {
  const navigate = useNavigate();
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const data = await api.get<any[]>('/regions');
        setRegions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load regions", err);
      }
    };
    fetchRegions();
  }, []);

  // Mock data for display purposes if API fails
  const mockRegions = [
    { id: 1, name: 'Sé', lat: -23.5505, lng: -46.6333, risk: 'Alto', aqi: 120 },
    { id: 2, name: 'Pinheiros', lat: -23.5615, lng: -46.6970, risk: 'Médio', aqi: 75 },
    { id: 3, name: 'Vila Mariana', lat: -23.5898, lng: -46.6339, risk: 'Baixo', aqi: 45 }
  ];

  const displayRegions = regions.length > 0 ? regions : mockRegions;

  const getRiskColor = (risk: string) => {
    if (risk.toLowerCase() === 'alto') return '#FF3B30';
    if (risk.toLowerCase() === 'médio' || risk.toLowerCase() === 'medio') return '#F5A623';
    return '#34C759';
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%', maxWidth: '430px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Search Bar Overlay */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 1000, display: 'flex', gap: '8px' }}>
        <button onClick={() => navigate(-1)} style={{ width: '48px', height: '48px', backgroundColor: 'rgba(30, 30, 30, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Buscar bairro ou rua" style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: '#fff', padding: '14px 12px', outline: 'none' }} />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
        </div>
      </div>

      {/* Legend */}
      <div style={{ position: 'absolute', top: '80px', right: '16px', zIndex: 1000, backgroundColor: 'rgba(30, 30, 30, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF3B30' }}></div>
          <span style={{ color: '#fff', fontSize: '10px' }}>Risco Alto</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F5A623' }}></div>
          <span style={{ color: '#fff', fontSize: '10px' }}>Risco Médio</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34C759' }}></div>
          <span style={{ color: '#fff', fontSize: '10px' }}>Risco Baixo</span>
        </div>
      </div>

      {/* Map */}
      <MapContainer 
        center={[-23.5505, -46.6333]} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <FlyToRegion center={mapCenter} zoom={13} />
        
        {displayRegions.map((region) => (
          <React.Fragment key={region.id}>
            <Circle 
              center={[region.lat, region.lng]} 
              radius={1500} 
              pathOptions={{ 
                color: getRiskColor(region.risk), 
                fillColor: getRiskColor(region.risk), 
                fillOpacity: 0.2, 
                weight: 1 
              }} 
            />
            <Marker 
              position={[region.lat, region.lng]}
              eventHandlers={{
                click: () => {
                  setSelectedRegion(region);
                  setMapCenter([region.lat, region.lng]);
                }
              }}
            >
              <Popup>
                <div style={{ minWidth: '150px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{region.name}</h3>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Risco: <strong style={{ color: getRiskColor(region.risk) }}>{region.risk}</strong></p>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px' }}>AQI: <strong>{region.aqi}</strong></p>
                  <button onClick={() => navigate('/map/facilities')} style={{ width: '100%', padding: '6px', backgroundColor: '#0047AB', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Ver Hospitais
                  </button>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Location Button */}
      <button style={{ position: 'absolute', bottom: '180px', right: '16px', zIndex: 1000, width: '48px', height: '48px', backgroundColor: 'rgba(30, 30, 30, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
      </button>

      {/* Bottom Info Panel */}
      <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', zIndex: 1000, backgroundColor: 'rgba(25, 25, 25, 0.95)', backdropFilter: 'blur(16px)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999', marginBottom: '8px' }}>
            <span>Evolução Temporal</span>
            <span>Atu. há 5 min</span>
          </div>
          <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '60%', backgroundColor: '#0047AB', borderRadius: '2px' }}></div>
            <div style={{ position: 'absolute', left: '60%', top: '-4px', width: '12px', height: '12px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 0 4px rgba(0,0,0,0.5)' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666', marginTop: '4px' }}>
            <span>00:00</span>
            <span>14:30</span>
            <span>23:59</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{selectedRegion ? selectedRegion.name : 'Região Central'}</h2>
            <p style={{ fontSize: '14px', color: '#999', margin: 0 }}>São Paulo</p>
          </div>
          <span style={{ backgroundColor: 'rgba(255,59,48,0.2)', color: '#FF3B30', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(255,59,48,0.3)' }}>
            RISCO ALTO
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ backgroundColor: 'rgba(255,59,48,0.15)', color: '#FF3B30', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: '#FF3B30', borderRadius: '50%' }}></span>
            Poluição Crítica
          </span>
          <span style={{ backgroundColor: 'rgba(245,166,35,0.15)', color: '#F5A623', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: '#F5A623', borderRadius: '50%' }}></span>
            Influenza Atenção
          </span>
        </div>

      </div>
    </div>
  );
}
