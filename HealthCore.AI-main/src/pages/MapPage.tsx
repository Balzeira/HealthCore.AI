import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../api/client';

import { ALL_SP_DISTRICTS, SPDistrictRegion } from '../data/spBoundaries';
import { ALL_SP_HOSPITALS, Hospital } from '../data/hospitalsData';

// Leaflet default icons fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [22, 36],
  iconAnchor: [11, 36],
  popupAnchor: [0, -32],
  shadowSize: [36, 36]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Dark Pin Icon with distinction for district-selected vs general
const createDarkHospitalMarkerIcon = (hospital: Hospital, isSelected: boolean, isDistrictHospital: boolean) => {
  const isEmergency = hospital?.is_emergency;
  const isPublic = hospital?.is_public;
  const bg = isEmergency ? '#EF4444' : isPublic ? '#3B82F6' : '#A855F7';
  const size = isSelected ? 42 : isDistrictHospital ? 34 : 26;

  return L.divIcon({
    className: 'hospital-dark-pin',
    html: `
      <div style="
        background: ${bg};
        color: white;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size > 34 ? '18px' : size > 28 ? '15px' : '12px'};
        box-shadow: ${isSelected ? `0 0 24px #FFFFFF, 0 0 16px ${bg}` : isDistrictHospital ? `0 0 16px ${bg}` : '0 2px 8px rgba(0,0,0,0.5)'};
        border: ${isSelected ? '3px solid #FFFFFF' : isDistrictHospital ? '2px solid #FFFFFF' : '1.5px solid rgba(255,255,255,0.6)'};
        cursor: pointer;
        transition: transform 0.2s ease;
        opacity: ${isDistrictHospital || isSelected ? 1 : 0.75};
      ">
        🏥
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const MapFlyTo = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.0 });
  }, [center, zoom, map]);
  return null;
};

// Center positions for macro zones
const ZONE_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  'Centro': { center: [-23.5505, -46.6333], zoom: 13 },
  'Zona Oeste': { center: [-23.5580, -46.7050], zoom: 12 },
  'Zona Sul': { center: [-23.6400, -46.6800], zoom: 11 },
  'Zona Leste': { center: [-23.5400, -46.4900], zoom: 11 },
  'Zona Norte': { center: [-23.4800, -46.6300], zoom: 12 },
  'Todas': { center: [-23.5505, -46.6333], zoom: 12 }
};

export default function MapPage() {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState<SPDistrictRegion>(ALL_SP_DISTRICTS[0]); // Sé default
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [filterZone, setFilterZone] = useState<string>('Todas');
  const [filterRisk, setFilterRisk] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hospitalFilter, setHospitalFilter] = useState<'Todos' | '24h' | 'SUS' | 'Privado'>('Todos');
  const [showPins, setShowPins] = useState<boolean>(true);

  // Real SUS & Temporal Analysis State
  const [selectedYear, setSelectedYear] = useState<string>('Todos');
  const [temporalSummary, setTemporalSummary] = useState<any>(null);

  useEffect(() => {
    loadTemporalSummary();
  }, [selectedYear]);

  const loadTemporalSummary = async () => {
    try {
      let q = '';
      if (selectedYear === '2025') q = '?start_date=2025-01-01&end_date=2025-12-31';
      if (selectedYear === '2026') q = '?start_date=2026-01-01&end_date=2026-12-31';
      const data = await api.get(`/stats/temporal-analysis${q}`);
      setTemporalSummary(data);
    } catch (err) {
      console.warn('Temporal summary map load fallback:', err);
    }
  };

  const getRiskColor = (risk: string) => {
    const r = (risk || '').toLowerCase();
    if (r === 'alto') return '#EF4444';
    if (r === 'médio' || r === 'medio') return '#F59E0B';
    return '#10B981';
  };

  // Filter districts safely
  const filteredDistricts = useMemo(() => {
    return ALL_SP_DISTRICTS.filter(d => {
      const dZone = (d?.zone || '').toLowerCase();
      const dRisk = (d?.risk || '').toLowerCase();
      const dName = (d?.name || '').toLowerCase();
      const dSub = (d?.subprefeitura || '').toLowerCase();
      const q = (searchQuery || '').toLowerCase();

      const matchesZone = filterZone === 'Todas' || dZone === filterZone.toLowerCase();
      const matchesRisk = filterRisk === 'Todos' || dRisk === filterRisk.toLowerCase();
      const matchesSearch = q === '' || dName.includes(q) || dSub.includes(q);
      return matchesZone && matchesRisk && matchesSearch;
    });
  }, [filterZone, filterRisk, searchQuery]);

  // STRICT District Hospitals for HUD:
  // Shows ONLY hospitals located in the clicked area/subprefeitura!
  const districtHospitals = useMemo(() => {
    if (!selectedDistrict || !selectedDistrict.hospitalIds) return [];
    
    const matched = ALL_SP_HOSPITALS.filter(h => selectedDistrict.hospitalIds.includes(h.id));
    
    return matched.filter(h => {
      if (hospitalFilter === '24h') return Boolean(h?.is_24h);
      if (hospitalFilter === 'SUS') return Boolean(h?.is_public || h?.network === 'SUS' || h?.network === 'Filantrópico');
      if (hospitalFilter === 'Privado') return Boolean(!h?.is_public || h?.network === 'Privado');
      return true;
    });
  }, [selectedDistrict, hospitalFilter]);

  // Map Pins: All hospitals within the active zone or entire SP
  const mapVisibleHospitals = useMemo(() => {
    return ALL_SP_HOSPITALS.filter(h => {
      const hZone = (h?.zone || '').trim().toLowerCase();
      const matchesZone = filterZone === 'Todas' || hZone === filterZone.trim().toLowerCase();

      if (hospitalFilter === '24h') return matchesZone && Boolean(h?.is_24h);
      if (hospitalFilter === 'SUS') return matchesZone && Boolean(h?.is_public || h?.network === 'SUS' || h?.network === 'Filantrópico');
      if (hospitalFilter === 'Privado') return matchesZone && Boolean(!h?.is_public || h?.network === 'Privado');
      return matchesZone;
    });
  }, [filterZone, hospitalFilter]);

  const handleSelectDistrict = (d: SPDistrictRegion) => {
    setSelectedDistrict(d);
    setSelectedHospital(null);
    setMapCenter(d.center);
    setMapZoom(14);
  };

  const handleSelectZoneFilter = (z: string) => {
    setFilterZone(z);
    setSelectedHospital(null);

    if (z !== 'Todas') {
      const firstDistrictInZone = ALL_SP_DISTRICTS.find(d => d.zone.toLowerCase() === z.toLowerCase());
      if (firstDistrictInZone) {
        setSelectedDistrict(firstDistrictInZone);
      }
    }

    if (ZONE_CENTERS[z]) {
      setMapCenter(ZONE_CENTERS[z].center);
      setMapZoom(ZONE_CENTERS[z].zoom);
    }
  };

  const handleRecenterSP = () => {
    setMapCenter([-23.5505, -46.6333]);
    setMapZoom(12);
    setFilterZone('Todas');
    setFilterRisk('Todos');
    setSearchQuery('');
    setSelectedDistrict(ALL_SP_DISTRICTS[0]);
    setSelectedHospital(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 'calc(100vh - 120px)' }}>
      
      {/* Top Header Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: '#0F172A', padding: '16px 24px', borderRadius: '16px', border: '1px solid #1E293B' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
            Mapa Geográfico de São Paulo Capital
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '2px 0 0' }}>
            Clique em qualquer subprefeitura no mapa para ver exclusivamente os hospitais daquela área.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Period Filter Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1E293B', padding: '4px 8px', borderRadius: '10px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8' }}>Período:</span>
            {['Todos', '2025', '2026'].map(y => (
              <button
                key={y}
                type="button"
                onClick={() => setSelectedYear(y)}
                style={{
                  padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
                  backgroundColor: selectedYear === y ? '#3B82F6' : 'transparent',
                  color: selectedYear === y ? '#FFF' : '#94A3B8',
                  border: 'none'
                }}
              >
                {y}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRecenterSP}
            className="btn-secondary"
            style={{ fontSize: '0.9rem', padding: '10px 18px' }}
          >
            🎯 Visão Geral de SP
          </button>

          <button
            type="button"
            onClick={() => setShowPins(!showPins)}
            className="btn-primary"
            style={{ fontSize: '0.9rem', padding: '10px 18px', backgroundColor: showPins ? '#3B82F6' : '#1E293B' }}
          >
            🏥 {showPins ? 'Ocultar Pins' : 'Exibir Pins'}
          </button>
        </div>
      </div>

      {/* Main Map + HUD 2-Column Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: '20px', minHeight: '680px' }}>
        
        {/* Left Dark HUD Sidebar */}
        <aside className="hud-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '740px', overflowY: 'auto' }}>
          
          {/* Zone Filter Buttons with Active Badges */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#60A5FA', textTransform: 'uppercase' }}>
                📍 Região de SP
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>
                {filterZone}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', flexWrap: 'wrap' }}>
              {['Todas', 'Centro', 'Zona Oeste', 'Zona Sul', 'Zona Leste', 'Zona Norte'].map(z => {
                const isActive = filterZone === z;
                return (
                  <button
                    key={z}
                    type="button"
                    onClick={() => handleSelectZoneFilter(z)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: isActive ? '2px solid #3B82F6' : '1px solid #334155',
                      backgroundColor: isActive ? '#1D4ED8' : '#1E293B',
                      color: isActive ? '#FFFFFF' : '#CBD5E1',
                      boxShadow: isActive ? '0 0 12px rgba(59, 130, 246, 0.5)' : 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>{isActive ? '✓ ' : ''}{z}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Region Detailed Card */}
          <div style={{ backgroundColor: '#070B14', borderRadius: '16px', padding: '20px', border: `2px solid ${getRiskColor(selectedDistrict.risk)}50` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#60A5FA', textTransform: 'uppercase' }}>
                {selectedDistrict.zone} • {selectedDistrict.subprefeitura}
              </span>
              <span className={`badge-risk badge-risk-${(selectedDistrict.risk || 'baixo').toLowerCase().replace('é', 'e')}`}>
                ● Risco {selectedDistrict.risk}
              </span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px' }}>
              {selectedDistrict.name}
            </h2>

            <p style={{ fontSize: '0.9rem', color: '#CBD5E1', margin: '0 0 16px' }}>
              Foco Sanitário: <strong style={{ color: '#FCD34D' }}>{selectedDistrict.disease}</strong>
            </p>

            {/* Metrics 3-Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#0F172A', padding: '10px 6px', borderRadius: '10px', border: '1px solid #1E293B' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', fontWeight: 700 }}>Ar (AQI)</span>
                <strong style={{ fontSize: '1.1rem', color: '#F8FAFC' }}>{selectedDistrict.aqi}</strong>
              </div>
              <div style={{ backgroundColor: '#0F172A', padding: '10px 6px', borderRadius: '10px', border: '1px solid #1E293B' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', fontWeight: 700 }}>Casos 14d</span>
                <strong style={{ fontSize: '1.1rem', color: '#EF4444' }}>{selectedDistrict.cases}</strong>
              </div>
              <div style={{ backgroundColor: '#0F172A', padding: '10px 6px', borderRadius: '10px', border: '1px solid #1E293B' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', fontWeight: 700 }}>Limpeza</span>
                <strong style={{ fontSize: '1.1rem', color: '#10B981' }}>{selectedDistrict.cleanliness}/5 ⭐</strong>
              </div>
            </div>

            {/* Temporal Peak Insight for Area */}
            {temporalSummary && (
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #1E293B', fontSize: '0.8rem', color: '#94A3B8' }}>
                <span style={{ color: '#60A5FA', fontWeight: 800 }}>Pico Temporal SP: </span>
                <span>{temporalSummary.extremos.periodo_maior_ocorrencia.rotulo} ({Number(temporalSummary.extremos.periodo_maior_ocorrencia.total_casos).toLocaleString()} casos)</span>
              </div>
            )}
          </div>

          {/* Quick Subprefeitura Picker */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
              Selecionar Subprefeitura no Mapa
            </label>
            <select
              value={selectedDistrict.id}
              onChange={(e) => {
                const found = ALL_SP_DISTRICTS.find(d => d.id === Number(e.target.value));
                if (found) handleSelectDistrict(found);
              }}
              style={{
                width: '100%',
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '1rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {ALL_SP_DISTRICTS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.zone}) — Subprefeitura {d.subprefeitura}
                </option>
              ))}
            </select>
          </div>

          {/* STRICT Area Hospitals HUD Section */}
          <div style={{ borderTop: '1px solid #1E293B', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  🏥 Hospitais em {selectedDistrict.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#60A5FA', fontWeight: 700 }}>
                  {districtHospitals.length} {districtHospitals.length === 1 ? 'unidade localizada nesta área' : 'unidades localizadas nesta área'}
                </span>
              </div>

              <select
                value={hospitalFilter}
                onChange={(e) => setHospitalFilter(e.target.value as any)}
                style={{
                  backgroundColor: '#1E293B',
                  color: '#60A5FA',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              >
                <option value="Todos">Todos</option>
                <option value="24h">Plantão 24h</option>
                <option value="SUS">SUS / Público</option>
                <option value="Privado">Privado</option>
              </select>
            </div>

            {/* List of Hospitals STRICT to the selected district */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {districtHospitals.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', backgroundColor: '#070B14', borderRadius: '12px', border: '1px dashed #334155' }}>
                  <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '6px' }}>📍</span>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Nenhum hospital com este filtro nesta subprefeitura.</p>
                </div>
              ) : (
                districtHospitals.map(h => (
                  <div
                    key={`${h.id}-${selectedDistrict.id}`}
                    onClick={() => {
                      setSelectedHospital(h);
                      setMapCenter([h.latitude, h.longitude]);
                      setMapZoom(16);
                    }}
                    style={{
                      backgroundColor: selectedHospital?.id === h.id ? 'rgba(59, 130, 246, 0.2)' : '#070B14',
                      border: selectedHospital?.id === h.id ? '2px solid #3B82F6' : '1px solid #1E293B',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: selectedHospital?.id === h.id ? '0 0 16px rgba(59, 130, 246, 0.4)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#60A5FA', backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                        {h.network || 'HOSPITAL'}
                      </span>
                      {h.is_emergency && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F87171' }}>
                          🚨 Emergência 24h
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 4px', lineHeight: 1.3 }}>
                      {h.name}
                    </h4>

                    <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '0 0 6px', lineHeight: 1.4 }}>
                      {h.specialties || 'Atendimento Geral'}
                    </p>

                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 10px' }}>
                      📍 {h.address || 'São Paulo - SP'}
                    </p>

                    <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`, '_blank')}
                        className="btn-emerald"
                        style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px' }}
                      >
                        🗺️ Traçar Rota
                      </button>

                      <button
                        type="button"
                        onClick={() => window.location.href = `tel:${(h.phone || '').replace(/\D/g, '')}`}
                        className="btn-secondary"
                        style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px' }}
                      >
                        📞 {h.phone || '(11) 156'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </aside>

        {/* Right Dark Leaflet Map View */}
        <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid #1E293B', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}>
          
          {/* Map Status Floating Legend */}
          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1000, backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', padding: '10px 18px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', gap: '14px', fontSize: '0.9rem', fontWeight: 800, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
            <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }}></span>
              Risco Alto
            </span>
            <span style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }}></span>
              Risco Médio
            </span>
            <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
              Risco Baixo
            </span>
          </div>

          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%', minHeight: '680px', backgroundColor: '#070B14' }}
            zoomControl={false}
          >
            {/* Dark Matter Map Tiles */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
            />
            <MapFlyTo center={mapCenter} zoom={mapZoom} />

            {/* Seamless Contiguous Non-Overlapping Polygons */}
            {filteredDistricts.map(district => {
              const isSelected = selectedDistrict.id === district.id;
              const riskColor = getRiskColor(district.risk);

              return (
                <Polygon
                  key={district.id}
                  positions={district.polygon}
                  pathOptions={{
                    color: isSelected ? '#38BDF8' : riskColor,
                    fillColor: riskColor,
                    fillOpacity: isSelected ? 0.65 : 0.35,
                    weight: isSelected ? 4 : 2,
                    dashArray: isSelected ? undefined : '2, 2'
                  }}
                  eventHandlers={{
                    click: () => handleSelectDistrict(district)
                  }}
                >
                  <Tooltip direction="center" permanent={false} className="custom-district-tooltip">
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#FFFFFF' }}>{district.name}</div>
                      <div style={{ color: '#94A3B8', fontSize: '11px', marginTop: '2px' }}>{district.zone} • {district.subprefeitura}</div>
                      <div style={{ color: riskColor, fontSize: '12px', fontWeight: 800, marginTop: '4px' }}>
                        ● Risco {district.risk} ({district.cases} casos)
                      </div>
                    </div>
                  </Tooltip>
                </Polygon>
              );
            })}

            {/* Hospital Markers: Accurate GPS locations with pulse for district hospitals */}
            {showPins && mapVisibleHospitals.map(h => {
              const isSelected = selectedHospital?.id === h.id;
              const isDistrictHospital = selectedDistrict.hospitalIds.includes(h.id);

              return (
                <Marker
                  key={`${h.id}-${selectedDistrict.id}`}
                  position={[h.latitude, h.longitude]}
                  icon={createDarkHospitalMarkerIcon(h, isSelected, isDistrictHospital)}
                  eventHandlers={{
                    click: () => {
                      setSelectedHospital(h);
                      setMapCenter([h.latitude, h.longitude]);
                    }
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '220px', padding: '4px', color: '#0F172A' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 800 }}>{h.name}</h4>
                      <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748B' }}>📍 {h.district} ({h.zone})</p>
                      <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#475569' }}>{h.address}</p>
                      <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#0047AB', fontWeight: 700 }}>{h.specialties}</p>
                      <button
                        type="button"
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`, '_blank')}
                        style={{ width: '100%', backgroundColor: '#10B981', color: '#FFF', border: 'none', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                      >
                        🗺️ Traçar Rota no GPS
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

        </div>

      </div>

    </div>
  );
}
