import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icons
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

// Custom colorful DivIcon badge marker that identifies each neighborhood directly on the map
const createNeighborhoodBadgeIcon = (name: string, risk: string) => {
  const isHigh = risk.toLowerCase() === 'alto';
  const isMed = risk.toLowerCase() === 'médio' || risk.toLowerCase() === 'medio';
  const bg = isHigh ? '#FF3B30' : isMed ? '#F5A623' : '#34C759';
  const shadow = isHigh ? 'rgba(255, 59, 48, 0.4)' : isMed ? 'rgba(245, 166, 35, 0.4)' : 'rgba(52, 199, 89, 0.4)';

  return L.divIcon({
    className: 'neighborhood-badge-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, ${bg} 0%, ${bg}DD 100%);
        color: white;
        padding: 5px 12px;
        border-radius: 20px;
        font-weight: 800;
        font-size: 12px;
        font-family: Inter, sans-serif;
        box-shadow: 0 4px 14px ${shadow};
        border: 2px solid #FFFFFF;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        transform: translate(-50%, -50%);
        transition: transform 0.2s ease;
      ">
        <span style="width: 8px; height: 8px; background: #FFFFFF; border-radius: 50%; display: inline-block; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></span>
        <span>${name}</span>
        <span style="font-size: 9px; opacity: 0.9; background: rgba(0,0,0,0.25); padding: 2px 6px; border-radius: 10px;">${risk}</span>
      </div>
    `,
    iconSize: [120, 32],
    iconAnchor: [60, 16]
  });
};

const FlyToRegion = ({ center, zoom }: { center: [number, number] | null; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

// 10 São Paulo Neighborhoods with complete data
const ALL_NEIGHBORHOODS = [
  { id: 1, name: 'Sé', lat: -23.5505, lng: -46.6333, risk: 'Alto', aqi: 120, cases: 605, disease: 'Dengue & Influenza', area: 'Região Central' },
  { id: 2, name: 'Pinheiros', lat: -23.5615, lng: -46.6974, risk: 'Baixo', aqi: 45, cases: 95, disease: 'Baixa Incidência', area: 'Zona Oeste' },
  { id: 3, name: 'Itaquera', lat: -23.5367, lng: -46.4601, risk: 'Alto', aqi: 110, cases: 510, disease: 'Dengue & Respiratórias', area: 'Zona Leste' },
  { id: 4, name: 'Vila Mariana', lat: -23.5898, lng: -46.6341, risk: 'Baixo', aqi: 42, cases: 60, disease: 'Qualidade Ar Ótima', area: 'Zona Sul' },
  { id: 5, name: 'Moema', lat: -23.6006, lng: -46.6631, risk: 'Baixo', aqi: 38, cases: 12, disease: 'Risco Controlado', area: 'Zona Sul' },
  { id: 6, name: 'Bela Vista', lat: -23.5574, lng: -46.6437, risk: 'Médio', aqi: 78, cases: 430, disease: 'Gripe & COVID-19', area: 'Região Central' },
  { id: 7, name: 'Santa Cecília', lat: -23.5385, lng: -46.6504, risk: 'Médio', aqi: 82, cases: 18, disease: 'Leptospirose Atenção', area: 'Região Central' },
  { id: 8, name: 'República', lat: -23.5434, lng: -46.6425, risk: 'Alto', aqi: 115, cases: 135, disease: 'Dengue Surto Local', area: 'Região Central' },
  { id: 9, name: 'Liberdade', lat: -23.5677, lng: -46.6368, risk: 'Médio', aqi: 68, cases: 150, disease: 'Influenza Moderada', area: 'Região Central' },
  { id: 10, name: 'Consolação', lat: -23.5501, lng: -46.6575, risk: 'Médio', aqi: 72, cases: 90, disease: 'Vigilância Ativa', area: 'Região Central' }
];

export default function MapPage() {
  const navigate = useNavigate();
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<any>(ALL_NEIGHBORHOODS[0]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]);
  const [filterRisk, setFilterRisk] = useState<'Todos' | 'Alto' | 'Médio' | 'Baixo'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const data = await api.get<any[]>('/regions');
        if (Array.isArray(data) && data.length > 0) {
          // Merge API data with map metadata
          const merged = ALL_NEIGHBORHOODS.map(n => {
            const found = data.find((r: any) => r.id === n.id || r.name.toLowerCase() === n.name.toLowerCase());
            return found ? { ...n, ...found, risk: found.risk_level || n.risk } : n;
          });
          setRegions(merged);
        } else {
          setRegions(ALL_NEIGHBORHOODS);
        }
      } catch (err) {
        console.error("Failed to load map regions", err);
        setRegions(ALL_NEIGHBORHOODS);
      }
    };
    fetchRegions();
  }, []);

  const displayList = regions.length > 0 ? regions : ALL_NEIGHBORHOODS;

  const filteredRegions = displayList.filter(r => {
    const matchesRisk = filterRisk === 'Todos' || r.risk.toLowerCase() === filterRisk.toLowerCase();
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.area.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const getRiskColor = (risk: string) => {
    const r = risk ? risk.toLowerCase() : '';
    if (r === 'alto') return '#FF3B30';
    if (r === 'médio' || r === 'medio') return '#F5A623';
    return '#34C759';
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%', maxWidth: '430px', margin: '0 auto', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      
      {/* Search & Header Bar Overlay */}
      <div style={{ position: 'absolute', top: '16px', left: '14px', right: '14px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ width: '46px', height: '46px', backgroundColor: 'rgba(20, 25, 40, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          
          <div style={{ flex: 1, backgroundColor: 'rgba(20, 25, 40, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Buscar por bairro (ex: Sé, Pinheiros...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: '#fff', padding: '12px 10px', outline: 'none', fontSize: '13px', fontWeight: 500 }} 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '14px' }}>✕</button>
            )}
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {(['Todos', 'Alto', 'Médio', 'Baixo'] as const).map(riskFilter => {
            const isActive = filterRisk === riskFilter;
            const badgeColor = riskFilter === 'Alto' ? '#FF3B30' : riskFilter === 'Médio' ? '#F5A623' : riskFilter === 'Baixo' ? '#34C759' : '#0047AB';
            return (
              <button
                key={riskFilter}
                onClick={() => setFilterRisk(riskFilter)}
                style={{
                  padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, border: 'none',
                  backgroundColor: isActive ? badgeColor : 'rgba(20, 25, 40, 0.85)',
                  color: '#FFFFFF', cursor: 'pointer', backdropFilter: 'blur(10px)',
                  boxShadow: isActive ? `0 2px 8px ${badgeColor}88` : 'none',
                  whiteSpace: 'nowrap', transition: 'all 0.2s ease'
                }}
              >
                {riskFilter === 'Todos' ? '🌐 Todos Bairros (10)' : `${riskFilter === 'Alto' ? '🔴' : riskFilter === 'Médio' ? '🟠' : '🟢'} ${riskFilter}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vibrant Leaflet Map Container */}
      <MapContainer 
        center={[-23.5505, -46.6333]} 
        zoom={12} 
        style={{ height: '100%', width: '100%', backgroundColor: '#111827' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
        />
        <FlyToRegion center={mapCenter} zoom={13} />
        
        {filteredRegions.map((region) => {
          const color = getRiskColor(region.risk);
          return (
            <React.Fragment key={region.id}>
              {/* Glowing translucent risk circle around neighborhood */}
              <Circle 
                center={[region.lat, region.lng]} 
                radius={1200} 
                pathOptions={{ 
                  color: color, 
                  fillColor: color, 
                  fillOpacity: 0.25, 
                  weight: 3,
                  dashArray: region.risk === 'Alto' ? '6, 6' : undefined
                }} 
              />

              {/* Identified Neighborhood Badge Marker */}
              <Marker 
                position={[region.lat, region.lng]}
                icon={createNeighborhoodBadgeIcon(region.name, region.risk)}
                eventHandlers={{
                  click: () => {
                    setSelectedRegion(region);
                    setMapCenter([region.lat, region.lng]);
                  }
                }}
              >
                <Popup>
                  <div style={{ minWidth: '180px', fontFamily: 'Inter, sans-serif', padding: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111827' }}>{region.name}</h3>
                      <span style={{ backgroundColor: `${color}20`, color: color, padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 800 }}>
                        {region.risk}
                      </span>
                    </div>
                    
                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#4B5563' }}>
                      📍 <strong>{region.area}</strong>
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#4B5563' }}>
                      🦠 Doença: <strong>{region.disease || 'Vigilância Ativa'}</strong>
                    </p>
                    <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#4B5563' }}>
                      💨 Ar (AQI): <strong>{region.aqi || 60}</strong>
                    </p>

                    <button 
                      onClick={() => navigate('/map/facilities')} 
                      style={{ width: '100%', padding: '8px', backgroundColor: '#0047AB', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '11px' }}
                    >
                      🏥 Hospitais e UBSs da Região ▶
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Recenter Location Floating Button */}
      <button 
        onClick={() => {
          setMapCenter([-23.5505, -46.6333]);
        }}
        style={{ position: 'absolute', bottom: '210px', right: '16px', zIndex: 1000, width: '46px', height: '46px', backgroundColor: '#0047AB', border: '2px solid #FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,71,171,0.4)' }}
        title="Centralizar São Paulo"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
      </button>

      {/* Bottom Info Panel Overlay */}
      <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', zIndex: 1000, backgroundColor: 'rgba(15, 23, 42, 0.96)', backdropFilter: 'blur(16px)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 -8px 32px rgba(0,0,0,0.4)' }}>
        
        {/* Temporal Progress Slider */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginBottom: '6px', fontWeight: 600 }}>
            <span>Evolução Temporal • Monitoramento 24h</span>
            <span style={{ color: '#38BDF8' }}>Ao Vivo (Atu. há 2 min)</span>
          </div>
          <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '3px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '70%', backgroundColor: '#38BDF8', borderRadius: '3px' }}></div>
            <div style={{ position: 'absolute', left: '70%', top: '-3px', width: '12px', height: '12px', backgroundColor: '#FFFFFF', borderRadius: '50%', boxShadow: '0 0 8px #38BDF8' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
            <span>00:00</span>
            <span>12:00</span>
            <span>Agora (16:30)</span>
            <span>23:59</span>
          </div>
        </div>

        {/* Region Card Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 800, margin: 0, color: '#F8FAFC' }}>
                {selectedRegion ? selectedRegion.name : 'Sé'}
              </h2>
              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                ({selectedRegion ? selectedRegion.area : 'Região Central'})
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#CBD5E1', margin: '2px 0 0 0' }}>
              Foco Epidemiológico: <strong>{selectedRegion ? selectedRegion.disease : 'Dengue & Influenza'}</strong>
            </p>
          </div>

          <span style={{ 
            backgroundColor: `${getRiskColor(selectedRegion ? selectedRegion.risk : 'Alto')}25`, 
            color: getRiskColor(selectedRegion ? selectedRegion.risk : 'Alto'), 
            padding: '6px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: 800, 
            border: `1px solid ${getRiskColor(selectedRegion ? selectedRegion.risk : 'Alto')}50`,
            boxShadow: `0 2px 10px ${getRiskColor(selectedRegion ? selectedRegion.risk : 'Alto')}33`
          }}>
            Risco {selectedRegion ? selectedRegion.risk : 'Alto'}
          </span>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => navigate('/map/facilities')}
            style={{ flex: 1, padding: '10px', backgroundColor: '#0047AB', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            📍 Ver Hospitais e UBSs Próximas
          </button>
          <button 
            onClick={() => navigate('/form/evaluation')}
            style={{ flex: 1, padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            📝 Avaliar este Bairro
          </button>
        </div>

      </div>
    </div>
  );
}
