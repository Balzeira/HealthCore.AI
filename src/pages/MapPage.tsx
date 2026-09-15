import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../api/client';

import { ALL_SP_DISTRICTS, SPDistrictRegion } from '../data/spBoundaries';
import { ALL_SP_HOSPITALS, Hospital } from '../data/hospitalsData';
import SearchableDistrictSelect from '../components/SearchableDistrictSelect';

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
  zoomTrigger,
  onMapChange
}: { 
  center: [number, number]; 
  zoom: number; 
  zoomTrigger?: { type: 'in' | 'out' | 'recenter'; timestamp: number } | null;
  onMapChange?: (zoom: number, bounds: L.LatLngBounds) => void;
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

  useMapEvents({
    zoomend: (e) => {
      onMapChange?.(e.target.getZoom(), e.target.getBounds());
    },
    moveend: (e) => {
      onMapChange?.(e.target.getZoom(), e.target.getBounds());
    }
  });

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
  const location = useLocation();

  const userRegisteredDistrictName = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem('healthcore_user') || '{}');
      return u.district || '';
    } catch (e) {
      return '';
    }
  }, []);

  const [selectedDistrict, setSelectedDistrict] = useState<SPDistrictRegion>(ALL_SP_DISTRICTS[0]); // Sé default
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]);
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [currentZoom, setCurrentZoom] = useState<number>(11);
  const [currentBounds, setCurrentBounds] = useState<L.LatLngBounds | null>(null);
  const [filterZone, setFilterZone] = useState<string>('Todas');
  const [filterRisk, setFilterRisk] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hospitalFilter, setHospitalFilter] = useState<string>('Todos');
  const [pinMode, setPinMode] = useState<'region' | 'all' | 'none'>('region');
  const [basemap, setBasemap] = useState<'dark' | 'satellite' | 'street' | 'voyager'>('dark');
  const [mapLayerMode, setMapLayerMode] = useState<'all' | 'risk' | 'hospitals'>('all');
  const [polygonOpacity, setPolygonOpacity] = useState<number>(0.38);
  const [showDistrictLabels, setShowDistrictLabels] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomTrigger, setZoomTrigger] = useState<{ type: 'in' | 'out' | 'recenter'; timestamp: number } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  // Auto-focus on registered district or query param on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const districtIdParam = params.get('districtId');
    if (districtIdParam) {
      const found = ALL_SP_DISTRICTS.find(d => d.id === Number(districtIdParam));
      if (found) {
        handleSelectDistrict(found);
        return;
      }
    }
    if (userRegisteredDistrictName) {
      const found = ALL_SP_DISTRICTS.find(d => 
        userRegisteredDistrictName.toLowerCase().includes(d.name.toLowerCase()) ||
        d.name.toLowerCase().includes(userRegisteredDistrictName.toLowerCase().split(' ')[0])
      );
      if (found) {
        handleSelectDistrict(found);
      }
    }
  }, [location.search, userRegisteredDistrictName]);

  const basemapUrls: Record<string, { url: string; subdomains?: string[]; className?: string; attribution: string }> = {
    dark: {
      url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      className: 'leaflet-google-dark',
      attribution: '&copy; Google Maps'
    },
    satellite: {
      url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    },
    street: {
      url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    },
    voyager: {
      url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      className: 'leaflet-google-night',
      attribution: '&copy; Google Maps'
    }
  };

  // District history tab state
  const [historyTab, setHistoryTab] = useState<'surtos' | 'saude' | 'ambiental'>('surtos');


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

  // Strict point-in-polygon geometric algorithm
  const isPointInPolygon = (pt: [number, number], vs: [number, number][]) => {
    const x = pt[0], y = pt[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0], yi = vs[i][1];
      const xj = vs[j][0], yj = vs[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // HUD Hospitals calculation:
  // When hudScope === 'district', strictly shows hospitals inside selectedDistrict polygon
  // When hudScope === 'zone', shows all hospitals in filterZone
  const hudHospitals = useMemo(() => {
    let list: Hospital[] = [];
    if (hudScope === 'district' && selectedDistrict) {
      list = ALL_SP_HOSPITALS.filter(h => isPointInPolygon([h.latitude, h.longitude], selectedDistrict.polygon));
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

  // Map Pins: Strictly shows ONLY the hospitals of the selected region/district
  // AND hides them automatically when zooming out to macro city view (currentZoom < 12.5)
  const mapVisibleHospitals = useMemo(() => {
    if (pinMode === 'none') return [];

    // Quando o usuário tira o zoom para visão panorâmica de SP, esconde os pins para evitar sobreposição
    if (currentZoom < 12.5 && !selectedHospital) {
      return [];
    }

    let base: Hospital[] = [];

    if (pinMode === 'region') {
      if (hudScope === 'district' && selectedDistrict) {
        // Rigorosamente apenas os hospitais que estão DENTRO do polígono do distrito selecionado
        base = ALL_SP_HOSPITALS.filter(h => isPointInPolygon([h.latitude, h.longitude], selectedDistrict.polygon));
      } else if (filterZone !== 'Todas') {
        base = ALL_SP_HOSPITALS.filter(h => (h?.zone || '').trim().toLowerCase() === filterZone.trim().toLowerCase());
      } else {
        base = [];
      }
    } else if (pinMode === 'all') {
      if (filterZone !== 'Todas') {
        base = ALL_SP_HOSPITALS.filter(h => (h?.zone || '').trim().toLowerCase() === filterZone.trim().toLowerCase());
      } else {
        base = ALL_SP_HOSPITALS;
      }
    }

    // Se o usuário selecionou um hospital específico no HUD lateral, exibe seu pin
    if (selectedHospital && !base.some(h => h.id === selectedHospital.id)) {
      base = [...base, selectedHospital];
    }

    return base.filter(h => {
      if (hospitalFilter === '24h') return Boolean(h?.is_24h);
      if (hospitalFilter === 'Emergência') return Boolean(h?.is_emergency);
      if (hospitalFilter === 'SUS') return h?.network === 'SUS';
      if (hospitalFilter === 'Privado') return h?.network === 'Privado';
      if (hospitalFilter === 'Filantrópico') return h?.network === 'Filantrópico';
      return true;
    });
  }, [pinMode, hudScope, selectedDistrict, filterZone, selectedHospital, hospitalFilter, currentZoom]);

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
          <div style={{
            backgroundColor: '#070B14',
            borderRadius: '16px',
            padding: '20px',
            border: (() => {
              const isHome = userRegisteredDistrictName && (
                userRegisteredDistrictName.toLowerCase().includes(selectedDistrict.name.toLowerCase()) ||
                selectedDistrict.name.toLowerCase().includes(userRegisteredDistrictName.toLowerCase().split(' ')[0])
              );
              return isHome ? '2px solid #3B82F6' : `2px solid ${getRiskColor(selectedDistrict.risk)}50`;
            })(),
            boxShadow: (() => {
              const isHome = userRegisteredDistrictName && (
                userRegisteredDistrictName.toLowerCase().includes(selectedDistrict.name.toLowerCase()) ||
                selectedDistrict.name.toLowerCase().includes(userRegisteredDistrictName.toLowerCase().split(' ')[0])
              );
              return isHome ? '0 0 20px rgba(59, 130, 246, 0.2)' : 'none';
            })()
          }}>
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
          </div>

          {/* Quick Subprefeitura Picker */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
              Selecionar Subprefeitura no Mapa
            </label>
            <SearchableDistrictSelect
              value={selectedDistrict.id}
              onChange={(_, dist) => {
                if (dist) handleSelectDistrict(dist);
              }}
              buttonStyle={{
                backgroundColor: '#1E293B',
                borderRadius: '12px',
                padding: '12px 16px'
              }}
            />
          </div>

          {/* ===== HISTÓRICO DO BAIRRO ===== */}
          {(() => {
            const severityColor = (s: string) => {
              if (s === 'Alto') return '#EF4444';
              if (s === 'Médio') return '#F59E0B';
              return '#10B981';
            };
            const scoreColor = (n: number) => {
              if (n >= 75) return '#10B981';
              if (n >= 50) return '#F59E0B';
              return '#EF4444';
            };

            const baseCases = selectedDistrict.cases || 150;
            const baseClean = selectedDistrict.cleanliness || 3;
            const baseAqi = selectedDistrict.aqi || 80;

            const surtos = [
              { year: '2026', disease: selectedDistrict.disease, cases: baseCases, severity: selectedDistrict.risk },
              { year: '2025', disease: 'Dengue', cases: Math.round(baseCases * 1.25), severity: 'Médio' },
              { year: '2024', disease: 'Dengue / Leptospirose', cases: Math.round(baseCases * 0.85), severity: 'Baixo' },
              { year: '2023', disease: 'COVID-19', cases: Math.round(baseCases * 1.6), severity: 'Alto' },
              { year: '2022', disease: 'COVID-19 / Influenza H3N2', cases: Math.round(baseCases * 2.2), severity: 'Alto' },
            ];

            const saudeScores = [
              { year: '2026', score: Math.min(100, baseClean * 18 + 10), label: 'Nível Atual', highlight: selectedDistrict.risk === 'Baixo' ? 'Boa cobertura vacinal SUS' : 'Cobertura vacinal parcial' },
              { year: '2025', score: Math.min(100, baseClean * 18 + 5), label: 'Estável', highlight: 'Postos de saúde normalizados' },
              { year: '2024', score: Math.min(100, baseClean * 18 - 8), label: 'Em recuperação', highlight: 'Ampliação de UBSs na subprefeitura' },
              { year: '2023', score: Math.max(20, baseClean * 18 - 28), label: 'Crítico', highlight: 'Pandemia COVID-19 ativa — UPAs sobrecarregadas' },
              { year: '2022', score: Math.max(15, baseClean * 18 - 38), label: 'Crítico', highlight: 'Colapso de leitos de UTI na região' },
            ];

            const ambiental = [
              { year: '2026', aqi: baseAqi, focos: Math.round(baseCases * 0.4), coleta: `${Math.min(99, 78 + baseClean * 4)}%` },
              { year: '2025', aqi: Math.round(baseAqi * 1.06), focos: Math.round(baseCases * 0.55), coleta: `${Math.min(95, 73 + baseClean * 4)}%` },
              { year: '2024', aqi: Math.round(baseAqi * 1.18), focos: Math.round(baseCases * 0.72), coleta: `${Math.min(92, 68 + baseClean * 4)}%` },
              { year: '2023', aqi: Math.round(baseAqi * 1.32), focos: Math.round(baseCases * 0.92), coleta: `${Math.min(88, 63 + baseClean * 4)}%` },
              { year: '2022', aqi: Math.round(baseAqi * 1.48), focos: Math.round(baseCases * 1.15), coleta: `${Math.min(85, 58 + baseClean * 4)}%` },
            ];

            return (
              <div style={{ backgroundColor: '#070B14', borderRadius: '16px', border: '1px solid #1E293B', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #1E293B' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                    📊 Histórico do Bairro
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0' }}>
                    {selectedDistrict.name} · Evolução 2022–2026
                  </p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #1E293B' }}>
                  {([
                    { id: 'surtos', label: '🦠 Surtos' },
                    { id: 'saude', label: '❤️ Saúde' },
                    { id: 'ambiental', label: '🌿 Ambiente' }
                  ] as const).map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setHistoryTab(t.id)}
                      style={{
                        flex: 1, padding: '9px 2px', fontSize: '0.72rem', fontWeight: 800,
                        cursor: 'pointer', border: 'none',
                        borderBottom: historyTab === t.id ? '2px solid #3B82F6' : '2px solid transparent',
                        backgroundColor: historyTab === t.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                        color: historyTab === t.id ? '#60A5FA' : '#64748B',
                        transition: 'all 0.15s'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '255px', overflowY: 'auto' }}>
                  {historyTab === 'surtos' && surtos.map((s, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 10px', borderRadius: '10px',
                      backgroundColor: i === 0 ? 'rgba(59,130,246,0.07)' : '#0F172A',
                      border: `1px solid ${i === 0 ? '#334155' : '#1E293B'}`
                    }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#64748B', display: 'block' }}>{s.year}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#F8FAFC' }}>{s.disease}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#EF4444', display: 'block' }}>
                          {s.cases.toLocaleString('pt-BR')} casos
                        </span>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 800,
                          color: severityColor(s.severity),
                          backgroundColor: `${severityColor(s.severity)}1a`,
                          padding: '1px 5px', borderRadius: '4px'
                        }}>● {s.severity}</span>
                      </div>
                    </div>
                  ))}

                  {historyTab === 'saude' && saudeScores.map((s, i) => (
                    <div key={i} style={{
                      padding: '9px 10px', borderRadius: '10px',
                      backgroundColor: i === 0 ? 'rgba(59,130,246,0.07)' : '#0F172A',
                      border: `1px solid ${i === 0 ? '#334155' : '#1E293B'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#64748B' }}>{s.year} · {s.label}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: scoreColor(s.score) }}>{s.score}%</span>
                      </div>
                      <div style={{ height: '5px', backgroundColor: '#1E293B', borderRadius: '4px', overflow: 'hidden', marginBottom: '4px' }}>
                        <div style={{ width: `${s.score}%`, height: '100%', backgroundColor: scoreColor(s.score), borderRadius: '4px' }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{s.highlight}</span>
                    </div>
                  ))}

                  {historyTab === 'ambiental' && ambiental.map((s, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '44px 1fr 1fr 1fr', gap: '4px', alignItems: 'center',
                      padding: '8px 10px', borderRadius: '10px',
                      backgroundColor: i === 0 ? 'rgba(59,130,246,0.07)' : '#0F172A',
                      border: `1px solid ${i === 0 ? '#334155' : '#1E293B'}`
                    }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#64748B' }}>{s.year}</span>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.6rem', color: '#64748B', display: 'block' }}>AQI</span>
                        <strong style={{ fontSize: '0.8rem', color: s.aqi > 100 ? '#EF4444' : s.aqi > 60 ? '#F59E0B' : '#10B981' }}>{s.aqi}</strong>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.6rem', color: '#64748B', display: 'block' }}>Focos</span>
                        <strong style={{ fontSize: '0.8rem', color: '#F87171' }}>{s.focos}</strong>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.6rem', color: '#64748B', display: 'block' }}>Coleta</span>
                        <strong style={{ fontSize: '0.8rem', color: '#10B981' }}>{s.coleta}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

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
          
          {/* ── Minimal Floating Top Bar ── */}
          <div style={{
            position: 'absolute', top: 14, left: 14, right: 14, zIndex: 1000,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            pointerEvents: 'none'
          }}>
            {/* Left: 1-click basemap switches + settings button */}
            <div className="gis-map-pill-group" style={{ pointerEvents: 'auto', gap: '4px' }}>
              <button
                type="button"
                className={`gis-map-btn ${basemap === 'dark' ? 'active' : ''}`}
                onClick={() => setBasemap('dark')}
                title="Google Maps Dark Mode Suave"
                style={{ fontSize: '0.8rem', fontWeight: 800 }}
              >
                🌙 Dark Suave
              </button>
              <button
                type="button"
                className={`gis-map-btn ${basemap === 'street' ? 'active' : ''}`}
                onClick={() => setBasemap('street')}
                title="Google Maps Padrão Claro"
                style={{ fontSize: '0.8rem', fontWeight: 800 }}
              >
                ☀️ Maps Claro
              </button>
              <button
                type="button"
                className={`gis-map-btn ${basemap === 'satellite' ? 'active' : ''}`}
                onClick={() => setBasemap('satellite')}
                title="Google Satélite HD"
                style={{ fontSize: '0.8rem', fontWeight: 800 }}
              >
                🛰️ Satélite
              </button>

              {filterRisk !== 'Todos' && (
                <span style={{
                  fontSize: '0.75rem', fontWeight: 800,
                  color: filterRisk === 'Alto' ? '#EF4444' : filterRisk === 'Médio' ? '#F59E0B' : '#10B981',
                  padding: '2px 8px', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '6px'
                }}>
                  ● {filterRisk}
                </span>
              )}
              <button
                type="button"
                className="gis-map-btn"
                onClick={() => setSettingsOpen(o => !o)}
                style={{ fontWeight: 900, color: settingsOpen ? '#60A5FA' : '#CBD5E1', gap: '4px' }}
              >
                ⚙️ Opções
              </button>
            </div>

            {/* Right: zoom pill */}
            <div className="gis-map-pill-group" style={{ pointerEvents: 'auto' }}>
              <button type="button" className="gis-map-btn gis-map-btn-action"
                onClick={() => setZoomTrigger({ type: 'in', timestamp: Date.now() })} title="Zoom +"
              >➕</button>
              <button type="button" className="gis-map-btn gis-map-btn-action"
                onClick={() => setZoomTrigger({ type: 'out', timestamp: Date.now() })} title="Zoom -"
              >➖</button>
              <button type="button" className="gis-map-btn gis-map-btn-action"
                onClick={() => { handleRecenterSP(); setZoomTrigger({ type: 'recenter', timestamp: Date.now() }); }}
                title="Centralizar SP"
              >🎯 SP</button>
            </div>
          </div>

          {/* ── Sliding Settings Drawer ── */}
          <div className="gis-settings-panel" style={{ transform: settingsOpen ? 'translateX(0)' : 'translateX(100%)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: '#FFFFFF' }}>⚙️ Configurações do Mapa</span>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '1.2rem', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }}
              >✕</button>
            </div>

            {/* Section: Mapa Base */}
            <div className="gis-settings-section">
              <div className="gis-settings-section-title">🗺️ Estilo do Mapa Base</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { id: 'dark', label: '🌙 Google Dark (Suave)' },
                  { id: 'street', label: '☀️ Google Maps (Claro)' },
                  { id: 'satellite', label: '🛰️ Google Satélite HD' },
                  { id: 'voyager', label: '🪐 Google Noturno' }
                ].map(b => (
                  <button key={b.id} type="button"
                    className={`gis-map-btn ${basemap === b.id ? 'active' : ''}`}
                    onClick={() => setBasemap(b.id as any)}
                    style={{ flex: '1 1 45%' }}
                  >{b.label}</button>
                ))}
              </div>
            </div>

            {/* Section: Camada Ativa */}
            <div className="gis-settings-section">
              <div className="gis-settings-section-title">👁️ Camada Ativa</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: '🌐 Completo' },
                  { id: 'risk', label: '🌡️ Só Risco' },
                  { id: 'hospitals', label: '🏥 Só Hospitais' }
                ].map(l => (
                  <button key={l.id} type="button"
                    className={`gis-map-btn ${mapLayerMode === l.id ? 'active' : ''}`}
                    onClick={() => setMapLayerMode(l.id as any)}
                    style={{ flex: '1 1 45%' }}
                  >{l.label}</button>
                ))}
              </div>
            </div>

            {/* Section: Pins de Hospitais */}
            <div className="gis-settings-section">
              <div className="gis-settings-section-title">🏥 Pins de Hospitais</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'auto', label: '⚡ Zoom Inteligente' },
                  { id: 'region', label: '📍 Por Região' },
                  { id: 'all', label: '🌐 Todos' },
                  { id: 'none', label: '🚫 Ocultar' }
                ].map(p => (
                  <button key={p.id} type="button"
                    className={`gis-map-btn ${pinMode === p.id ? 'active' : ''}`}
                    onClick={() => setPinMode(p.id as any)}
                    style={{ flex: '1 1 45%' }}
                  >{p.label}</button>
                ))}
              </div>
            </div>

            {/* Section: Opacidade */}
            <div className="gis-settings-section">
              <div className="gis-settings-section-title">🎨 Opacidade dos Bairros</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { val: 0.18, label: '20% Leve' },
                  { val: 0.38, label: '40% Médio' },
                  { val: 0.70, label: '70% Forte' }
                ].map(op => (
                  <button key={op.val} type="button"
                    className={`gis-map-btn ${polygonOpacity === op.val ? 'active' : ''}`}
                    onClick={() => setPolygonOpacity(op.val)}
                    style={{ flex: 1 }}
                  >{op.label}</button>
                ))}
              </div>
            </div>

            {/* Section: Filtrar por Risco */}
            <div className="gis-settings-section">
              <div className="gis-settings-section-title">🔴 Filtrar por Risco</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button type="button"
                  className={`gis-map-btn ${filterRisk === 'Alto' ? 'active' : ''}`}
                  onClick={() => setFilterRisk(filterRisk === 'Alto' ? 'Todos' : 'Alto')}
                  style={{ color: filterRisk === 'Alto' ? '#FFF' : '#EF4444', flex: 1 }}
                >● Alto ({riskCounts.alto})</button>
                <button type="button"
                  className={`gis-map-btn ${filterRisk === 'Médio' ? 'active' : ''}`}
                  onClick={() => setFilterRisk(filterRisk === 'Médio' ? 'Todos' : 'Médio')}
                  style={{ color: filterRisk === 'Médio' ? '#FFF' : '#F59E0B', flex: 1 }}
                >● Médio ({riskCounts.medio})</button>
                <button type="button"
                  className={`gis-map-btn ${filterRisk === 'Baixo' ? 'active' : ''}`}
                  onClick={() => setFilterRisk(filterRisk === 'Baixo' ? 'Todos' : 'Baixo')}
                  style={{ color: filterRisk === 'Baixo' ? '#FFF' : '#10B981', flex: 1 }}
                >● Baixo ({riskCounts.baixo})</button>
                {filterRisk !== 'Todos' && (
                  <button type="button" className="gis-map-btn"
                    onClick={() => setFilterRisk('Todos')}
                    style={{ color: '#60A5FA', width: '100%' }}
                  >✕ Limpar Filtro</button>
                )}
              </div>
            </div>

            {/* Section: Visualização */}
            <div className="gis-settings-section">
              <div className="gis-settings-section-title">🖥️ Visualização</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button"
                  className={`gis-map-btn ${showDistrictLabels ? 'active' : ''}`}
                  onClick={() => setShowDistrictLabels(!showDistrictLabels)}
                  style={{ flex: 1 }}
                >🏷️ Nomes {showDistrictLabels ? 'ON' : 'OFF'}</button>
                <button type="button"
                  className={`gis-map-btn ${isFullscreen ? 'active' : ''}`}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  style={{ flex: 1 }}
                >{isFullscreen ? '⛶ Sair' : '⛶ Tela Cheia'}</button>
              </div>
            </div>

          </div>
          {/* ── Sliding backdrop (close on click outside) ── */}
          {settingsOpen && (
            <div
              onClick={() => setSettingsOpen(false)}
              style={{ position: 'absolute', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.35)', cursor: 'pointer' }}
            />
          )}

          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%', minHeight: isFullscreen ? '100vh' : '720px', backgroundColor: '#070B14' }}
            zoomControl={false}
          >
            {/* Dynamic Basemap Tile Layer (Google Maps Dark / Google Satellite / Google Street) */}
            <TileLayer
              key={basemap}
              url={basemapUrls[basemap].url}
              subdomains={basemapUrls[basemap].subdomains || ['mt0', 'mt1', 'mt2', 'mt3']}
              className={basemapUrls[basemap].className || ''}
              maxZoom={20}
              attribution={basemapUrls[basemap].attribution}
            />
            <MapController 
              center={mapCenter} 
              zoom={mapZoom} 
              zoomTrigger={zoomTrigger} 
              onMapChange={(z, b) => {
                setCurrentZoom(z);
                setCurrentBounds(b);
              }}
            />

            {/* Clean Modern Risk Polygons with Configurable Opacity & Labels */}
            {(mapLayerMode === 'all' || mapLayerMode === 'risk') && filteredDistricts.map(district => {
              const isSelected = selectedDistrict.id === district.id;
              const isUserRegistered = Boolean(
                userRegisteredDistrictName && (
                  userRegisteredDistrictName.toLowerCase().includes(district.name.toLowerCase()) ||
                  district.name.toLowerCase().includes(userRegisteredDistrictName.toLowerCase().split(' ')[0])
                )
              );
              const riskColor = getRiskColor(district.risk);

              return (
                <Polygon
                  key={district.id}
                  positions={district.polygon}
                  pathOptions={{
                    color: isSelected ? '#38BDF8' : isUserRegistered ? '#3B82F6' : riskColor,
                    fillColor: riskColor,
                    fillOpacity: isSelected ? Math.min(1, polygonOpacity + 0.3) : polygonOpacity,
                    weight: isSelected ? 4 : isUserRegistered ? 3.5 : 2,
                    dashArray: isSelected ? undefined : isUserRegistered ? '4, 4' : '2, 2'
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
