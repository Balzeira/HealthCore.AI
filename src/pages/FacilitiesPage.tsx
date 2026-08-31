import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
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

export default function FacilitiesPage() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'Todos' | 'Hospital' | 'UBS' | '24h' | 'Emergência'>('Todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const data = await api.get<any>('/facilities?lat=-23.5505&lng=-46.6333&radius=5');
      if (data && Array.isArray(data.facilities)) {
        setFacilities(data.facilities);
      } else if (Array.isArray(data)) {
        setFacilities(data);
      } else {
        setFacilities(mockFacilities);
      }
    } catch (err) {
      console.error("Failed to load facilities", err);
      setFacilities(mockFacilities);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Mock data if API fails
  const mockFacilities = [
    {
      id: 1,
      type: 'UBS',
      name: 'UBS República',
      status: 'open',
      is24h: false,
      distance: '450m',
      timeToWalk: 'Aprox. 6 min a pé',
      description: 'Atendimento básico, vacinação e consultas agendadas.',
      address: 'Praça da República, 299',
      phone: '(11) 3255-0000',
      lat: -23.5435,
      lng: -46.6433
    },
    {
      id: 2,
      type: 'Hospital',
      name: 'Santa Casa de Misericórdia',
      status: 'open',
      is24h: true,
      hasEmergency: true,
      distance: '1.2km',
      timeToWalk: 'Aprox. 15 min a pé',
      description: 'Hospital geral, pronto socorro adulto e infantil, maternidade.',
      address: 'Rua Dr. Cesário Mota Júnior, 112',
      phone: '(11) 2176-7000',
      lat: -23.5430,
      lng: -46.6500
    },
    {
      id: 3,
      type: 'UBS',
      name: 'UBS Sé',
      status: 'closing_soon',
      is24h: false,
      distance: '1.5km',
      timeToWalk: 'Aprox. 20 min a pé',
      description: 'Atendimento básico de saúde da família.',
      address: 'Rua Frederico Alvarenga, 259',
      phone: '(11) 3105-0000',
      lat: -23.5515,
      lng: -46.6290
    }
  ];

  const displayList = facilities.length > 0 ? facilities : mockFacilities;

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <header style={{ backgroundColor: '#fff', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#333' }}>Hospitais Próximos - Região Sé</h1>
      </header>

      {/* Mini Map */}
      <div style={{ height: '200px', width: '100%', position: 'relative' }}>
        <MapContainer 
          center={[-23.5435, -46.6433]} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {displayList.map(f => (
            <Marker key={f.id} position={[f.lat, f.lng]} />
          ))}
        </MapContainer>
        
        {/* Radius Overlay */}
        <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px', zIndex: 1000, backgroundColor: 'rgba(255,255,255,0.95)', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0047AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>
            <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>Buscando num raio de 2km</span>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#0047AB', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>Alterar</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        
        {/* Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button style={{ backgroundColor: '#eef2f6', color: '#0047AB', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Mais Próximos
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <button style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
          </button>
        </div>

        {/* Facilities List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displayList.map(facility => (
            <div key={facility.id} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              
              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <span style={{ backgroundColor: facility.type === 'UBS' ? 'rgba(52, 199, 89, 0.15)' : 'rgba(0, 71, 171, 0.15)', color: facility.type === 'UBS' ? '#28a745' : '#0047AB', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {facility.type === 'UBS' ? 'UNIDADE BÁSICA' : 'HOSPITAL GERAL'}
                </span>
                
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 'bold', color: facility.status === 'open' ? '#28a745' : '#F5A623', backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: facility.status === 'open' ? '#28a745' : '#F5A623' }}></span>
                  {facility.status === 'open' ? 'Aberto agora' : 'Fecha em 30 min'}
                </span>

                {facility.is24h && (
                  <span style={{ backgroundColor: '#f5f5f5', color: '#666', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                    Plantão 24h
                  </span>
                )}
                
                {facility.hasEmergency && (
                  <span style={{ backgroundColor: 'rgba(255, 59, 48, 0.15)', color: '#FF3B30', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    EMERGÊNCIA
                  </span>
                )}
              </div>

              {/* Title & Distance */}
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#333' }}>{facility.name}</h2>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                <span style={{ fontWeight: 'bold', color: '#0047AB' }}>{facility.distance}</span>
                <span>{facility.timeToWalk}</span>
              </div>

              {/* Description */}
              <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.4', margin: '0 0 16px 0' }}>{facility.description}</p>

              {/* Address & Phone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#666' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>{facility.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  <span>{facility.phone}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ flex: 1, backgroundColor: '#34C759', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  Como chegar
                </button>
                <button style={{ flex: 1, backgroundColor: 'transparent', color: '#0047AB', border: '2px solid #0047AB', padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  Ligar
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
