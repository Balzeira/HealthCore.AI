import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icons
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

// Custom colored pin markers for Hospital vs UBS
const createFacilityMarkerIcon = (type: string) => {
  const isHospital = type === 'Hospital';
  const bg = isHospital ? '#0047AB' : '#34C759';
  const symbol = isHospital ? '🏥' : '🩺';

  return L.divIcon({
    className: 'facility-custom-marker',
    html: `
      <div style="
        background: ${bg};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
        cursor: pointer;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const FlyToLocation = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1.0 });
  }, [center, map]);
  return null;
};

export default function FacilitiesPage() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: -23.5505, lng: -46.6333 }); // Sé default
  const [searchRadius, setSearchRadius] = useState<number>(5); // 5km default
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'Todos' | 'Hospital' | 'UBS' | '24h' | 'Emergência'>('Todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Try to get user geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          fetchFacilities(pos.coords.latitude, pos.coords.longitude, searchRadius);
        },
        () => {
          fetchFacilities(userCoords.lat, userCoords.lng, searchRadius);
        }
      );
    } else {
      fetchFacilities(userCoords.lat, userCoords.lng, searchRadius);
    }
  }, [searchRadius]);

  const fetchFacilities = async (lat: number, lng: number, radius: number) => {
    setLoading(true);
    try {
      const data = await api.get<any>(`/facilities?lat=${lat}&lng=${lng}&radius=${radius}`);
      let list = [];
      if (data && Array.isArray(data.facilities)) {
        list = data.facilities;
      } else if (Array.isArray(data)) {
        list = data;
      } else {
        list = mockFacilities;
      }

      // Normalize object fields for seamless rendering
      const normalized = list.map((f: any) => {
        const latitude = f.latitude ?? f.lat ?? -23.5505;
        const longitude = f.longitude ?? f.lng ?? -46.6333;
        const distKm = f.distance_km ?? calculateDistance(lat, lng, latitude, longitude);
        return {
          id: f.id,
          name: f.name || 'Unidade de Saúde',
          type: f.type || 'UBS',
          address: f.address || 'São Paulo - SP',
          phone: f.phone || '(11) 3000-0000',
          latitude,
          longitude,
          distance_km: parseFloat(distKm.toFixed(2)),
          walking_time_mins: f.walking_time_mins || Math.max(1, Math.round(distKm / 5 * 60)),
          driving_time_mins: f.driving_time_mins || Math.max(1, Math.round(distKm / 30 * 60)),
          is_24h: Boolean(f.is_24h || f.is24h),
          is_emergency: Boolean(f.is_emergency || f.hasEmergency),
          specialties: f.specialties || f.description || 'Atendimento de Saúde Urbana'
        };
      });

      normalized.sort((a: any, b: any) => a.distance_km - b.distance_km);
      setFacilities(normalized);
    } catch (err) {
      console.error("Failed to load facilities", err);
      setFacilities(mockFacilities);
    } finally {
      setLoading(false);
    }
  };

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenRoute = (f: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${f.latitude},${f.longitude}`;
    window.open(url, '_blank');
  };

  const handleCall = (phone: string) => {
    showToast(`Ligando para ${phone}...`);
    window.location.href = `tel:${phone.replace(/\D/g, '')}`;
  };

  // Filter list by user criteria
  const displayList = facilities.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.specialties.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (filterType === 'Hospital') matchesFilter = f.type === 'Hospital';
    if (filterType === 'UBS') matchesFilter = f.type === 'UBS';
    if (filterType === '24h') matchesFilter = f.is_24h === true;
    if (filterType === 'Emergência') matchesFilter = f.is_emergency === true;

    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Inter, sans-serif', paddingBottom: '5rem' }}>
      
      {/* Toast Banner */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, backgroundColor: '#0F172A', color: '#FFF', padding: '12px 18px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header style={{ backgroundColor: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0F172A' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div>
          <h1 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0F172A' }}>Hospitais & UBSs Próximos</h1>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Busca por Geolocalização e Proximidade</span>
        </div>
      </header>

      {/* Interactive Map view of facilities */}
      <div style={{ height: '210px', width: '100%', position: 'relative' }}>
        <MapContainer 
          center={[userCoords.lat, userCoords.lng]} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <FlyToLocation center={[userCoords.lat, userCoords.lng]} />
          
          {/* User Location Pulse Circle */}
          <Circle 
            center={[userCoords.lat, userCoords.lng]} 
            radius={searchRadius * 1000} 
            pathOptions={{ color: '#0047AB', fillColor: '#0047AB', fillOpacity: 0.1, weight: 2, dashArray: '4,4' }} 
          />

          {/* User Pin */}
          <Marker position={[userCoords.lat, userCoords.lng]}>
            <Popup>Você está aqui (Centro de Busca)</Popup>
          </Marker>

          {/* Facility Pins */}
          {displayList.map(f => (
            <Marker 
              key={f.id} 
              position={[f.latitude, f.longitude]} 
              icon={createFacilityMarkerIcon(f.type)}
            >
              <Popup>
                <div style={{ minWidth: '150px', fontFamily: 'Inter, sans-serif' }}>
                  <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>{f.name}</strong>
                  <span style={{ fontSize: '11px', color: '#0047AB', fontWeight: 700 }}>📍 {f.distance_km} km de você</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Proximity Radius Slider Overlay */}
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', zIndex: 1000, backgroundColor: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', padding: '10px 14px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              📍 Raio de Busca: <strong style={{ color: '#0047AB' }}>{searchRadius} km</strong>
            </span>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{displayList.length} Encontrados</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="15" 
            step="1" 
            value={searchRadius} 
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#0047AB', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '16px' }}>
        
        {/* Search Bar */}
        <div style={{ marginBottom: '12px' }}>
          <input 
            type="text"
            placeholder="Pesquisar por nome, endereço ou especialidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', backgroundColor: '#FFF', fontWeight: 500 }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px', scrollbarWidth: 'none' }}>
          {(['Todos', 'Hospital', 'UBS', '24h', 'Emergência'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, border: 'none',
                backgroundColor: filterType === type ? '#0047AB' : '#FFF',
                color: filterType === type ? '#FFF' : '#475569', cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)', border: filterType === type ? 'none' : '1px solid #E2E8F0',
                whiteSpace: 'nowrap'
              }}
            >
              {type === 'Todos' ? '🏥 Todos' : type === 'Hospital' ? '🏥 Hospitais' : type === 'UBS' ? '🩺 UBSs' : type === '24h' ? '⏱ Plantão 24h' : '🚨 Emergência'}
            </button>
          ))}
        </div>

        {/* Facilities Cards List */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #0047AB', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
            <p style={{ fontSize: '13px', fontWeight: 600 }}>Calculando unidades mais próximas...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : displayList.length === 0 ? (
          <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '2rem', textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0, fontWeight: 600 }}>Nenhuma unidade encontrada para este filtro ou raio.</p>
            <button onClick={() => { setSearchRadius(15); setFilterType('Todos'); setSearchQuery(''); }} style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#0047AB', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
              Aumentar Raio para 15km
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {displayList.map(f => (
              <div key={f.id} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
                
                {/* Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  <span style={{ backgroundColor: f.type === 'UBS' ? '#E8F8EE' : '#E8F0FE', color: f.type === 'UBS' ? '#2E7D32' : '#0047AB', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
                    {f.type === 'UBS' ? '🩺 UNIDADE BÁSICA (UBS)' : '🏥 HOSPITAL GERAL'}
                  </span>
                  
                  {f.is_24h && (
                    <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700 }}>
                      ⏱ Plantão 24h
                    </span>
                  )}
                  
                  {f.is_emergency && (
                    <span style={{ backgroundColor: '#FFE5E3', color: '#FF3B30', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
                      🚨 EMERGÊNCIA
                    </span>
                  )}
                </div>

                {/* Title & Proximity Metrics */}
                <h2 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 4px 0', color: '#0F172A' }}>{f.name}</h2>
                
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#475569', marginBottom: '10px', fontWeight: 600 }}>
                  <span style={{ fontWeight: 800, color: '#0047AB', backgroundColor: '#E8F0FE', padding: '2px 8px', borderRadius: '6px' }}>
                    📍 {f.distance_km} km de você
                  </span>
                  <span>🚶 ~{f.walking_time_mins} min a pé</span>
                  <span>🚗 ~{f.driving_time_mins} min de carro</span>
                </div>

                {/* Specialties Description */}
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4', margin: '0 0 12px 0' }}>
                  <strong>Especialidades:</strong> {f.specialties}
                </p>

                {/* Address & Phone */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', fontSize: '12px', color: '#64748B' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span>📌</span>
                    <span>{f.address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📞</span>
                    <span>{f.phone}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleOpenRoute(f)}
                    style={{ flex: 1, backgroundColor: '#34C759', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(52,199,89,0.25)' }}
                  >
                    🗺️ Como chegar (Rota)
                  </button>
                  <button 
                    onClick={() => handleCall(f.phone)}
                    style={{ flex: 1, backgroundColor: '#FFF', color: '#0047AB', border: '2px solid #0047AB', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                  >
                    📞 Ligar
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// Fallback mock facilities if offline
const mockFacilities = [
  {
    id: 1,
    type: 'Hospital',
    name: 'Hospital Santa Casa de Misericórdia',
    address: 'R. Dr. Cesário Mota Júnior, 112 - Vila Buarque',
    phone: '(11) 2176-7000',
    latitude: -23.5430,
    longitude: -46.6508,
    is_24h: 1,
    is_emergency: 1,
    specialties: 'Geral, Traumatologia, Pediatria',
    distance_km: 0.85,
    walking_time_mins: 10,
    driving_time_mins: 2
  },
  {
    id: 2,
    type: 'UBS',
    name: 'UBS Sé',
    address: 'Rua Frederico Alvarenga, 259 - Sé',
    phone: '(11) 3105-8869',
    latitude: -23.5510,
    longitude: -46.6300,
    is_24h: 0,
    is_emergency: 0,
    specialties: 'Clínica Geral, Ginecologia, Pediatria',
    distance_km: 0.34,
    walking_time_mins: 4,
    driving_time_mins: 1
  },
  {
    id: 3,
    type: 'Hospital',
    name: 'Hospital das Clínicas (HC)',
    address: 'Av. Dr. Enéas Carvalho de Aguiar, 255 - Cerqueira César',
    phone: '(11) 2661-0000',
    latitude: -23.5567,
    longitude: -46.6670,
    is_24h: 1,
    is_emergency: 1,
    specialties: 'Alta Complexidade, Cardiologia, Neurologia',
    distance_km: 3.50,
    walking_time_mins: 42,
    driving_time_mins: 7
  }
];
