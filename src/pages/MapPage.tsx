import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import L from 'leaflet';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [0, -28],
  shadowSize: [32, 32]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Clean minimal divIcon badge for neighborhood pinpoint
const createMinimalPinIcon = (name: string, risk: string) => {
  const isHigh = risk.toLowerCase() === 'alto';
  const isMed = risk.toLowerCase() === 'médio' || risk.toLowerCase() === 'medio';
  const color = isHigh ? '#FF3B30' : isMed ? '#F5A623' : '#34C759';

  return L.divIcon({
    className: 'minimal-district-pin',
    html: `
      <div style="
        background: ${color};
        color: white;
        padding: 3px 8px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 10px;
        font-family: Inter, sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        border: 1.5px solid #FFFFFF;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        transform: translate(-50%, -50%);
      ">
        <span style="width: 5px; height: 5px; background: #FFFFFF; border-radius: 50%; display: inline-block;"></span>
        ${name}
      </div>
    `,
    iconSize: [80, 22],
    iconAnchor: [40, 11]
  });
};

const FlyToRegion = ({ center, zoom }: { center: [number, number] | null; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.0 });
    }
  }, [center, zoom, map]);
  return null;
};

// All 32 Districts of São Paulo grouped by zone with health risk level color mapping
const ALL_SP_DISTRICTS = [
  // Centro
  { id: 1, name: 'Sé', zone: 'Centro', lat: -23.5505, lng: -46.6333, risk: 'Alto', aqi: 120, cases: 605, disease: 'Dengue & Influenza', cleanliness: 2.1, air: 2.0 },
  { id: 2, name: 'República', zone: 'Centro', lat: -23.5434, lng: -46.6425, risk: 'Alto', aqi: 115, cases: 390, disease: 'Dengue & Tuberculose', cleanliness: 2.3, air: 2.2 },
  { id: 3, name: 'Bela Vista', zone: 'Centro', lat: -23.5574, lng: -46.6437, risk: 'Médio', aqi: 78, cases: 430, disease: 'Gripe (Influenza)', cleanliness: 3.5, air: 3.2 },
  { id: 4, name: 'Liberdade', zone: 'Centro', lat: -23.5677, lng: -46.6368, risk: 'Médio', aqi: 68, cases: 210, disease: 'Influenza Moderada', cleanliness: 3.8, air: 3.5 },
  { id: 5, name: 'Consolação', zone: 'Centro', lat: -23.5501, lng: -46.6575, risk: 'Médio', aqi: 72, cases: 180, disease: 'Vigilância Ativa', cleanliness: 4.0, air: 3.6 },
  { id: 6, name: 'Santa Cecília', zone: 'Centro', lat: -23.5385, lng: -46.6504, risk: 'Médio', aqi: 82, cases: 195, disease: 'Leptospirose', cleanliness: 3.2, air: 3.1 },
  { id: 7, name: 'Bom Retiro', zone: 'Centro', lat: -23.5278, lng: -46.6389, risk: 'Alto', aqi: 105, cases: 320, disease: 'Dengue Surto Local', cleanliness: 2.5, air: 2.8 },

  // Zona Oeste
  { id: 8, name: 'Pinheiros', zone: 'Zona Oeste', lat: -23.5615, lng: -46.6974, risk: 'Baixo', aqi: 45, cases: 95, disease: 'Baixa Incidência', cleanliness: 4.7, air: 4.5 },
  { id: 9, name: 'Vila Madalena', zone: 'Zona Oeste', lat: -23.5539, lng: -46.6917, risk: 'Baixo', aqi: 42, cases: 50, disease: 'Baixa Incidência', cleanliness: 4.8, air: 4.6 },
  { id: 10, name: 'Perdizes', zone: 'Zona Oeste', lat: -23.5356, lng: -46.6742, risk: 'Baixo', aqi: 48, cases: 70, disease: 'Excelente Controle', cleanliness: 4.6, air: 4.4 },
  { id: 11, name: 'Lapa', zone: 'Zona Oeste', lat: -23.5222, lng: -46.7028, risk: 'Baixo', aqi: 52, cases: 110, disease: 'Risco Controlado', cleanliness: 4.3, air: 4.2 },
  { id: 12, name: 'Butantã', zone: 'Zona Oeste', lat: -23.5719, lng: -46.7081, risk: 'Baixo', aqi: 40, cases: 65, disease: 'Área Arborizada', cleanliness: 4.7, air: 4.7 },
  { id: 13, name: 'Jardins', zone: 'Zona Oeste', lat: -23.5628, lng: -46.6667, risk: 'Baixo', aqi: 44, cases: 55, disease: 'Baixa Incidência', cleanliness: 4.8, air: 4.5 },

  // Zona Leste
  { id: 14, name: 'Itaquera', zone: 'Zona Leste', lat: -23.5367, lng: -46.4601, risk: 'Alto', aqi: 110, cases: 510, disease: 'Dengue & Respiratórias', cleanliness: 2.4, air: 2.7 },
  { id: 15, name: 'Tatuapé', zone: 'Zona Leste', lat: -23.5403, lng: -46.5764, risk: 'Médio', aqi: 75, cases: 230, disease: 'Dengue Moderada', cleanliness: 3.9, air: 3.6 },
  { id: 16, name: 'Mooca', zone: 'Zona Leste', lat: -23.5606, lng: -46.5983, risk: 'Médio', aqi: 80, cases: 280, disease: 'Respiratórias', cleanliness: 3.7, air: 3.4 },
  { id: 17, name: 'Penha', zone: 'Zona Leste', lat: -23.5264, lng: -46.5458, risk: 'Alto', aqi: 98, cases: 410, disease: 'Dengue & Influenza', cleanliness: 2.8, air: 3.0 },
  { id: 18, name: 'São Mateus', zone: 'Zona Leste', lat: -23.6128, lng: -46.4714, risk: 'Alto', aqi: 118, cases: 580, disease: 'Dengue Surto Leste', cleanliness: 2.2, air: 2.5 },
  { id: 19, name: 'Vila Prudente', zone: 'Zona Leste', lat: -23.5828, lng: -46.5819, risk: 'Médio', aqi: 76, cases: 205, disease: 'Gripe Sazonal', cleanliness: 3.6, air: 3.5 },

  // Zona Sul
  { id: 20, name: 'Vila Mariana', zone: 'Zona Sul', lat: -23.5898, lng: -46.6341, risk: 'Baixo', aqi: 42, cases: 60, disease: 'Qualidade Ar Ótima', cleanliness: 4.7, air: 4.6 },
  { id: 21, name: 'Moema', zone: 'Zona Sul', lat: -23.6006, lng: -46.6631, risk: 'Baixo', aqi: 38, cases: 12, disease: 'Risco Controlado', cleanliness: 4.9, air: 4.8 },
  { id: 22, name: 'Itaim Bibi', zone: 'Zona Sul', lat: -23.5839, lng: -46.6789, risk: 'Baixo', aqi: 41, cases: 30, disease: 'Excelente Controle', cleanliness: 4.9, air: 4.7 },
  { id: 23, name: 'Santo Amaro', zone: 'Zona Sul', lat: -23.6528, lng: -46.7083, risk: 'Médio', aqi: 74, cases: 310, disease: 'Influenza Sazonal', cleanliness: 3.8, air: 3.6 },
  { id: 24, name: 'Jabaquara', zone: 'Zona Sul', lat: -23.6467, lng: -46.6417, risk: 'Médio', aqi: 85, cases: 290, disease: 'Dengue Moderada', cleanliness: 3.3, air: 3.2 },
  { id: 25, name: 'Grajaú', zone: 'Zona Sul', lat: -23.7744, lng: -46.6961, risk: 'Alto', aqi: 125, cases: 640, disease: 'Dengue & Leptospirose', cleanliness: 2.1, air: 2.3 },
  { id: 26, name: 'Campo Limpo', zone: 'Zona Sul', lat: -23.6339, lng: -46.7583, risk: 'Alto', aqi: 112, cases: 530, disease: 'Respiratórias & Dengue', cleanliness: 2.4, air: 2.6 },

  // Zona Norte
  { id: 27, name: 'Santana', zone: 'Zona Norte', lat: -23.5042, lng: -46.6267, risk: 'Baixo', aqi: 49, cases: 85, disease: 'Risco Controlado', cleanliness: 4.4, air: 4.3 },
  { id: 28, name: 'Tucuruvi', zone: 'Zona Norte', lat: -23.4792, lng: -46.6028, risk: 'Baixo', aqi: 46, cases: 72, disease: 'Baixa Incidência', cleanliness: 4.5, air: 4.5 },
  { id: 29, name: 'Vila Guilherme', zone: 'Zona Norte', lat: -23.5139, lng: -46.6083, risk: 'Médio', aqi: 71, cases: 165, disease: 'Gripe Sazonal', cleanliness: 3.7, air: 3.6 },
  { id: 30, name: 'Casa Verde', zone: 'Zona Norte', lat: -23.5044, lng: -46.6578, risk: 'Médio', aqi: 73, cases: 190, disease: 'Influenza Sazonal', cleanliness: 3.8, air: 3.7 },
  { id: 31, name: 'Freguesia do Ó', zone: 'Zona Norte', lat: -23.4931, lng: -46.6972, risk: 'Médio', aqi: 79, cases: 220, disease: 'Dengue Moderada', cleanliness: 3.5, air: 3.4 },
  { id: 32, name: 'Brasilândia', zone: 'Zona Norte', lat: -23.4639, lng: -46.6875, risk: 'Alto', aqi: 116, cases: 590, disease: 'Dengue Surto Norte', cleanliness: 2.2, air: 2.5 }
];

export default function MapPage() {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]);
  const [filterZone, setFilterZone] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);

  const getRiskColor = (risk: string) => {
    const r = risk ? risk.toLowerCase() : '';
    if (r === 'alto') return '#FF3B30';
    if (r === 'médio' || r === 'medio') return '#F5A623';
    return '#34C759';
  };

  const filteredDistricts = ALL_SP_DISTRICTS.filter(d => {
    const matchesZone = filterZone === 'Todas' || d.zone.toLowerCase() === filterZone.toLowerCase();
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const handleSelectDistrict = (d: any) => {
    setSelectedDistrict(d);
    setMapCenter([d.lat, d.lng]);
    setShowDrawer(true);
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%', maxWidth: '430px', margin: '0 auto', fontFamily: 'Inter, sans-serif', overflow: 'hidden', backgroundColor: '#F8FAFC' }}>
      
      {/* Clean Floating Top Header */}
      <div style={{ position: 'absolute', top: '14px', left: '12px', right: '12px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ width: '42px', height: '42px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>

          {/* Minimal Search Input */}
          <div style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Buscar bairro (32 distritos SP)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: '#0F172A', padding: '10px 8px', outline: 'none', fontSize: '12px', fontWeight: 600 }} 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '13px' }}>✕</button>
            )}
          </div>
        </div>

        {/* Minimal Zone Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
          {['Todas', 'Centro', 'Zona Oeste', 'Zona Leste', 'Zona Sul', 'Zona Norte'].map(zone => (
            <button
              key={zone}
              onClick={() => setFilterZone(zone)}
              style={{
                padding: '5px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 700, border: 'none',
                backgroundColor: filterZone === zone ? '#0047AB' : 'rgba(255,255,255,0.92)',
                color: filterZone === zone ? '#FFFFFF' : '#475569', cursor: 'pointer', backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)', whiteSpace: 'nowrap', transition: 'all 0.2s ease'
              }}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Interactive Leaflet Map showing ALL 32 Districts with Color Fills */}
      <MapContainer 
        center={[-23.5505, -46.6333]} 
        zoom={12} 
        style={{ height: '100%', width: '100%', backgroundColor: '#F1F5F9' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
        />
        <FlyToRegion center={mapCenter} zoom={13} />

        {/* Render smooth colored area circle for EVERY district of São Paulo */}
        {filteredDistricts.map((d) => {
          const color = getRiskColor(d.risk);
          const isSelected = selectedDistrict?.id === d.id;

          return (
            <React.Fragment key={d.id}>
              {/* Colored district health zone area coverage */}
              <Circle 
                center={[d.lat, d.lng]} 
                radius={1300} 
                pathOptions={{ 
                  color: color, 
                  fillColor: color, 
                  fillOpacity: isSelected ? 0.45 : 0.25, 
                  weight: isSelected ? 3 : 1.5
                }}
                eventHandlers={{
                  click: () => handleSelectDistrict(d)
                }}
              />

              {/* Clean minimal district pin */}
              <Marker 
                position={[d.lat, d.lng]}
                icon={createMinimalPinIcon(d.name, d.risk)}
                eventHandlers={{
                  click: () => handleSelectDistrict(d)
                }}
              >
                <Popup>
                  <div style={{ padding: '2px', fontFamily: 'Inter, sans-serif' }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 800 }}>{d.name} ({d.zone})</h4>
                    <p style={{ margin: 0, fontSize: '11px', color: color, fontWeight: 700 }}>Risco {d.risk} • AQI {d.aqi}</p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Recenter Map Floating Button */}
      <button 
        onClick={() => {
          setMapCenter([-23.5505, -46.6333]);
          setSelectedDistrict(null);
          setShowDrawer(false);
        }}
        style={{ position: 'absolute', bottom: showDrawer ? '250px' : '90px', right: '14px', zIndex: 1000, width: '42px', height: '42px', backgroundColor: '#0047AB', border: '2px solid #FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,71,171,0.3)', transition: 'bottom 0.3s ease' }}
        title="Centralizar São Paulo"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
      </button>

      {/* Clean Minimalist Bottom Sheet Drawer (Appears only on Selection) */}
      {showDrawer && selectedDistrict && (
        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', zIndex: 1100, backgroundColor: '#FFFFFF', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '16px 20px 24px', color: '#0F172A', borderTop: '1px solid #E2E8F0', boxShadow: '0 -6px 24px rgba(0,0,0,0.12)', animation: 'slideUp 0.25s ease-out' }}>
          
          {/* Drawer Handle */}
          <div style={{ width: '36px', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px', margin: '0 auto 12px' }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0F172A' }}>{selectedDistrict.name}</h2>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>({selectedDistrict.zone})</span>
              </div>
              <p style={{ fontSize: '12px', color: '#475569', margin: '2px 0 0' }}>
                Foco Epidemiológico: <strong>{selectedDistrict.disease}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ backgroundColor: `${getRiskColor(selectedDistrict.risk)}15`, color: getRiskColor(selectedDistrict.risk), padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, border: `1px solid ${getRiskColor(selectedDistrict.risk)}30` }}>
                ● {selectedDistrict.risk}
              </span>
              <button onClick={() => setShowDrawer(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '16px', cursor: 'pointer', padding: '2px' }}>✕</button>
            </div>
          </div>

          {/* Clean Metric Chips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '10px', textAlign: 'center', border: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Qualidade Ar</span>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{selectedDistrict.aqi} AQI</p>
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '10px', textAlign: 'center', border: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Casos 14d</span>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{selectedDistrict.cases}</p>
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '10px', textAlign: 'center', border: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Limpeza</span>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#34C759' }}>{selectedDistrict.cleanliness}/5 ⭐</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => navigate('/map/facilities')}
              style={{ flex: 1, padding: '10px', backgroundColor: '#0047AB', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
            >
              🏥 Hospitais e UBSs
            </button>
            <button 
              onClick={() => navigate('/form/evaluation')}
              style={{ flex: 1, padding: '10px', backgroundColor: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
            >
              📝 Avaliar Bairro
            </button>
          </div>

        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
