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

const MapController = ({ 
  center, 
  zoom, 
  zoomTrigger 
}: { 
  center: [number, number]; 
  zoom: number; 
  zoomTrigger?: { type: 'in' | 'out' | 'recenter'; timestamp: number } | null 
}) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.0 });
  }, [center, zoom, map]);

  useEffect(() => {
    if (!zoomTrigger) return;
    if (zoomTrigger.type === 'in') map.zoomIn();
    if (zoomTrigger.type === 'out') map.zoomOut();
    if (zoomTrigger.type === 'recenter') map.flyTo([-23.5505, -46.6333], 11, { duration: 1.0 });
  }, [zoomTrigger, map]);

  return null;
};

// Center positions for macro zones
const ZONE_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  'Centro': { center: [-23.5505, -46.6333], zoom: 13 },
  'Zona Oeste': { center: [-23.5580, -46.7050], zoom: 12 },
  'Zona Sul': { center: [-23.6400, -46.6800], zoom: 11 },
  'Zona Leste': { center: [-23.5400, -46.4900], zoom: 11 },
  'Zona Norte': { center: [-23.4800, -46.6300], zoom: 12 },
  'Todas': { center: [-23.5505, -46.6333], zoom: 11 }
};

export default function MapPage() {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState<SPDistrictRegion>(ALL_SP_DISTRICTS[0]); // Sé default
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]);
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [filterZone, setFilterZone] = useState<string>('Todas');
  const [filterRisk, setFilterRisk] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hospitalFilter, setHospitalFilter] = useState<string>('Todos');
  const [pinMode, setPinMode] = useState<'region' | 'all' | 'none'>('all');
  const [basemap, setBasemap] = useState<'dark' | 'satellite' | 'street' | 'voyager'>('dark');
  const [mapLayerMode, setMapLayerMode] = useState<'all' | 'risk' | 'hospitals'>('all');
  const [polygonOpacity, setPolygonOpacity] = useState<number>(0.38);
  const [showDistrictLabels, setShowDistrictLabels] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomTrigger, setZoomTrigger] = useState<{ type: 'in' | 'out' | 'recenter'; timestamp: number } | null>(null);

  const basemapUrls: Record<string, { url: string; attribution: string }> = {
    dark: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ, OpenStreetMap'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'
    },
    street: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    voyager: {
      url: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      attribution: '&copy; CARTO &copy; OpenStreetMap'
    }
  };

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

  const [hudScope, setHudScope] = useState<'zone' | 'district'>('zone');

  // HUD Hospitals calculation:
  // When hudScope === 'district', shows hospitals in selectedDistrict.
  // When hudScope === 'zone', shows all hospitals in filterZone.
  const hudHospitals = useMemo(() => {
    let list: Hospital[] = [];
    if (hudScope === 'district' && selectedDistrict?.hospitalIds) {
      list = ALL_SP_HOSPITALS.filter(h => selectedDistrict.hospitalIds.includes(h.id));
    } else {
      const targetZone = filterZone.trim().toLowerCase();
      list = ALL_SP_HOSPITALS.filter(h => {
        if (targetZone === 'todas') return true;
        return (h?.zone || '').trim().toLowerCase() === targetZone;
      });
    }

    return list.filter(h => {
      if (hospitalFilter === '24h') return Boolean(h?.is_24h);
      if (hospitalFilter === 'Emergência') return Boolean(h?.is_emergency);
      if (hospitalFilter === 'SUS') return h?.network === 'SUS';
      if (hospitalFilter === 'Privado') return h?.network === 'Privado';
      if (hospitalFilter === 'Filantrópico') return h?.network === 'Filantrópico';
      return true;
    });
  }, [hudScope, selectedDistrict, filterZone, hospitalFilter]);

  // Map Pins: Smart filtering based on pinMode and filterZone
  const mapVisibleHospitals = useMemo(() => {
    if (pinMode === 'none') return [];

    let base = ALL_SP_HOSPITALS;

    if (pinMode === 'region') {
      if (filterZone !== 'Todas') {
        base = ALL_SP_HOSPITALS.filter(h => (h?.zone || '').trim().toLowerCase() === filterZone.trim().toLowerCase());
      } else {
        // In SP Overview with region mode, show key reference hospitals to prevent dense clutter
        base = ALL_SP_HOSPITALS.filter(h => [101, 102, 201, 204, 301, 306, 401, 405, 501, 510].includes(h.id));
      }
    } else if (pinMode === 'all') {
      if (filterZone !== 'Todas') {
        base = ALL_SP_HOSPITALS.filter(h => (h?.zone || '').trim().toLowerCase() === filterZone.trim().toLowerCase());
      }
    }

    return base.filter(h => {
      if (hospitalFilter === '24h') return Boolean(h?.is_24h);
      if (hospitalFilter === 'Emergência') return Boolean(h?.is_emergency);
      if (hospitalFilter === 'SUS') return h?.network === 'SUS';
      if (hospitalFilter === 'Privado') return h?.network === 'Privado';
      if (hospitalFilter === 'Filantrópico') return h?.network === 'Filantrópico';
      return true;
    });
  }, [pinMode, filterZone, hospitalFilter]);

  const handleSelectDistrict = (d: SPDistrictRegion) => {
    setSelectedDistrict(d);
    setSelectedHospital(null);
    setHudScope('district');
    setFilterZone(d.zone);
    setMapCenter(d.center);
    setMapZoom(14);
  };

  const handleSelectZoneFilter = (z: string) => {
    setFilterZone(z);
    setSelectedHospital(null);
    setHudScope('zone');

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
    setHudScope('zone');
    setSelectedDistrict(ALL_SP_DISTRICTS[0]);
    setSelectedHospital(null);
  };

  const riskCounts = useMemo(() => {
    let alto = 0, medio = 0, baixo = 0;
    ALL_SP_DISTRICTS.forEach(d => {
      const r = (d.risk || '').toLowerCase();
      if (r === 'alto') alto++;
      else if (r === 'médio' || r === 'medio') medio++;
      else baixo++;
    });
    return { alto, medio, baixo, total: ALL_SP_DISTRICTS.length };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 'calc(100vh - 120px)' }}>
      
      {/* Top Header Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: '#0F172A', padding: '16px 24px', borderRadius: '16px', border: '1px solid #1E293B' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
            Mapa Geográfico de São Paulo Capital
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '2px 0 0' }}>
            Visualização GIS interativa das 32 subprefeituras, indicadores sanitários do SUS e rede hospitalar da capital.
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

          {/* Pin Mode Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#1E293B', padding: '4px 8px', borderRadius: '10px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8' }}>🏥 Pins:</span>
            {[
              { id: 'all', label: 'Todos (68)' },
              { id: 'region', label: 'Por Região' },
              { id: 'none', label: 'Ocultar' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPinMode(p.id as any)}
                style={{
                  padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
                  backgroundColor: pinMode === p.id ? '#3B82F6' : 'transparent',
                  color: pinMode === p.id ? '#FFF' : '#94A3B8',
                  border: 'none'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRecenterSP}
            className="btn-secondary"
            style={{ fontSize: '0.9rem', padding: '10px 18px' }}
          >
            🎯 Visão Geral SP
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

          {/* Area / Region Hospitals HUD Section */}
          <div style={{ borderTop: '1px solid #1E293B', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  🏥 {hudScope === 'district' ? `Hospitais em ${selectedDistrict.name}` : `Hospitais na ${filterZone}`}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#60A5FA', fontWeight: 700 }}>
                  {hudHospitals.length} {hudHospitals.length === 1 ? 'unidade encontrada' : 'unidades encontradas'}
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
                <option value="Emergência">Emergência</option>
                <option value="SUS">SUS (Público)</option>
                <option value="Filantrópico">Filantrópico</option>
                <option value="Privado">Privado</option>
              </select>
            </div>

            {/* Scope Switcher: District vs Entire Zone */}
            {filterZone !== 'Todas' && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setHudScope('zone')}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    backgroundColor: hudScope === 'zone' ? '#2563EB' : '#1E293B',
                    color: hudScope === 'zone' ? '#FFFFFF' : '#94A3B8',
                    border: hudScope === 'zone' ? '1px solid #3B82F6' : '1px solid #334155'
                  }}
                >
                  🌐 Toda {filterZone}
                </button>
                <button
                  type="button"
                  onClick={() => setHudScope('district')}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    backgroundColor: hudScope === 'district' ? '#2563EB' : '#1E293B',
                    color: hudScope === 'district' ? '#FFFFFF' : '#94A3B8',
                    border: hudScope === 'district' ? '1px solid #3B82F6' : '1px solid #334155'
                  }}
                >
                  📍 {selectedDistrict.name}
                </button>
              </div>
            )}

            {/* List of Hospitals Rendered Dynamically */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {hudHospitals.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', backgroundColor: '#070B14', borderRadius: '12px', border: '1px dashed #334155' }}>
                  <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '6px' }}>📍</span>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Nenhum hospital com este filtro nesta seleção.</p>
                </div>
              ) : (
                hudHospitals.map(h => (
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
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#60A5FA', backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                        {h.network || h.type}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {h.is_emergency && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                            🚨 Emergência
                          </span>
                        )}
                        {h.is_24h && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                            ⏱ 24h
                          </span>
                        )}
                      </div>
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

        {/* Right Fluid Leaflet GIS Map View */}
        <div 
          className={isFullscreen ? 'gis-map-container-fullscreen' : ''}
          style={{ 
            position: 'relative', 
            borderRadius: isFullscreen ? '0' : '20px', 
            overflow: 'hidden', 
            border: isFullscreen ? 'none' : '1px solid #1E293B', 
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)' 
          }}
        >
          
          {/* Unified Responsive GIS Map Control Header */}
          <div className="gis-map-control-bar">
            
            {/* Top Line: Basemaps & Custom Visual Settings */}
            <div className="gis-map-row">
              {/* Basemap Switcher */}
              <div className="gis-map-pill-group">
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#60A5FA', textTransform: 'uppercase', marginRight: '2px' }}>
                  🗺️ Mapa:
                </span>
                {[
                  { id: 'dark', label: '🌙 Dark' },
                  { id: 'satellite', label: '🛰️ Satélite' },
                  { id: 'street', label: '🏙️ Ruas' },
                  { id: 'voyager', label: '🪐 Noturno' }
                ].map(b => (
                  <button
                    key={b.id}
                    type="button"
                    className={`gis-map-btn ${basemap === b.id ? 'active' : ''}`}
                    onClick={() => setBasemap(b.id as any)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Visual Controls: Opacity & Labels */}
              <div className="gis-map-pill-group">
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginRight: '2px' }}>
                  🎨 Opacidade:
                </span>
                {[
                  { val: 0.18, label: '20%' },
                  { val: 0.38, label: '40%' },
                  { val: 0.70, label: '70%' }
                ].map(op => (
                  <button
                    key={op.val}
                    type="button"
                    className={`gis-map-btn ${polygonOpacity === op.val ? 'active' : ''}`}
                    onClick={() => setPolygonOpacity(op.val)}
                  >
                    {op.label}
                  </button>
                ))}

                <div style={{ width: '1px', height: '14px', backgroundColor: '#334155', margin: '0 2px' }}></div>

                <button
                  type="button"
                  className={`gis-map-btn ${showDistrictLabels ? 'active' : ''}`}
                  onClick={() => setShowDistrictLabels(!showDistrictLabels)}
                  title="Fixar nomes dos bairros nos polígonos"
                >
                  🏷️ Nomes {showDistrictLabels ? 'ON' : 'OFF'}
                </button>

                <button
                  type="button"
                  className={`gis-map-btn ${isFullscreen ? 'active' : ''}`}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title="Expandir em Tela Cheia"
                >
                  {isFullscreen ? '⛶ Sair' : '⛶ Tela Cheia'}
                </button>
              </div>
            </div>

            {/* Bottom Line: Layers, Interactive Legend / Risk Filter & Zoom Actions */}
            <div className="gis-map-row">
              {/* Layer Modes */}
              <div className="gis-map-pill-group">
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#60A5FA', textTransform: 'uppercase', marginRight: '2px' }}>
                  👁️ Camada:
                </span>
                {[
                  { id: 'all', label: '🌐 Completo' },
                  { id: 'risk', label: '🌡️ Risco' },
                  { id: 'hospitals', label: '🏥 Hospitais' }
                ].map(l => (
                  <button
                    key={l.id}
                    type="button"
                    className={`gis-map-btn ${mapLayerMode === l.id ? 'active' : ''}`}
                    onClick={() => setMapLayerMode(l.id as any)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Interactive Legend / Quick Risk Isolation */}
              <div className="gis-map-pill-group">
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginRight: '2px' }}>
                  Filtrar:
                </span>
                <button
                  type="button"
                  className={`gis-map-btn ${filterRisk === 'Alto' ? 'active' : ''}`}
                  onClick={() => setFilterRisk(filterRisk === 'Alto' ? 'Todos' : 'Alto')}
                  style={{ color: filterRisk === 'Alto' ? '#FFF' : '#EF4444' }}
                >
                  ● Alto ({riskCounts.alto})
                </button>
                <button
                  type="button"
                  className={`gis-map-btn ${filterRisk === 'Médio' ? 'active' : ''}`}
                  onClick={() => setFilterRisk(filterRisk === 'Médio' ? 'Todos' : 'Médio')}
                  style={{ color: filterRisk === 'Médio' ? '#FFF' : '#F59E0B' }}
                >
                  ● Médio ({riskCounts.medio})
                </button>
                <button
                  type="button"
                  className={`gis-map-btn ${filterRisk === 'Baixo' ? 'active' : ''}`}
                  onClick={() => setFilterRisk(filterRisk === 'Baixo' ? 'Todos' : 'Baixo')}
                  style={{ color: filterRisk === 'Baixo' ? '#FFF' : '#10B981' }}
                >
                  ● Baixo ({riskCounts.baixo})
                </button>
                {filterRisk !== 'Todos' && (
                  <button
                    type="button"
                    className="gis-map-btn"
                    onClick={() => setFilterRisk('Todos')}
                    style={{ color: '#60A5FA' }}
                  >
                    ✕ Todos
                  </button>
                )}
              </div>

              {/* Zoom & SP Recenter Controls */}
              <div className="gis-map-pill-group">
                <button
                  type="button"
                  className="gis-map-btn gis-map-btn-action"
                  onClick={() => setZoomTrigger({ type: 'in', timestamp: Date.now() })}
                  title="Aproximar Zoom (+)"
                >
                  ➕
                </button>
                <button
                  type="button"
                  className="gis-map-btn gis-map-btn-action"
                  onClick={() => setZoomTrigger({ type: 'out', timestamp: Date.now() })}
                  title="Afastar Zoom (-)"
                >
                  ➖
                </button>
                <button
                  type="button"
                  className="gis-map-btn gis-map-btn-action"
                  onClick={() => {
                    handleRecenterSP();
                    setZoomTrigger({ type: 'recenter', timestamp: Date.now() });
                  }}
                  title="Centralizar São Paulo"
                >
                  🎯 SP Geral
                </button>
              </div>

            </div>

          </div>

          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%', minHeight: isFullscreen ? '100vh' : '720px', backgroundColor: '#070B14' }}
            zoomControl={false}
          >
            {/* Dynamic Basemap Tile Layer (Dark Obsidian, Satellite HD, Street, Voyager) */}
            <TileLayer
              key={basemap}
              url={basemapUrls[basemap].url}
              attribution={basemapUrls[basemap].attribution}
            />
            <MapController 
              center={mapCenter} 
              zoom={mapZoom} 
              zoomTrigger={zoomTrigger} 
            />

            {/* Clean Modern Risk Polygons with Configurable Opacity & Labels */}
            {(mapLayerMode === 'all' || mapLayerMode === 'risk') && filteredDistricts.map(district => {
              const isSelected = selectedDistrict.id === district.id;
              const riskColor = getRiskColor(district.risk);

              return (
                <Polygon
                  key={district.id}
                  positions={district.polygon}
                  pathOptions={{
                    color: isSelected ? '#38BDF8' : riskColor,
                    fillColor: riskColor,
                    fillOpacity: isSelected ? Math.min(1, polygonOpacity + 0.3) : polygonOpacity,
                    weight: isSelected ? 4 : 2,
                    dashArray: isSelected ? undefined : '2, 2'
                  }}
                  eventHandlers={{
                    click: () => handleSelectDistrict(district)
                  }}
                >
                  <Tooltip direction="center" permanent={showDistrictLabels} className="custom-district-tooltip">
                    <div style={{ padding: '4px 6px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 900, color: '#FFFFFF' }}>{district.name}</div>
                      <div style={{ color: '#94A3B8', fontSize: '11px', marginTop: '2px' }}>{district.zone} • Subprefeitura {district.subprefeitura}</div>
                      <div style={{ color: riskColor, fontSize: '12px', fontWeight: 800, marginTop: '4px' }}>
                        ● Nível de Risco {district.risk} ({district.cases} casos)
                      </div>
                    </div>
                  </Tooltip>
                </Polygon>
              );
            })}

            {/* Hospital Markers: Clean and Smart Display without map clutter */}
            {(mapLayerMode === 'all' || mapLayerMode === 'hospitals') && pinMode !== 'none' && mapVisibleHospitals.map(h => {
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
