import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ALL_SP_DISTRICTS, SPDistrictRegion } from '../data/spBoundaries';

interface SearchableDistrictSelectProps {
  value: string | number; // Can be "Nome (Zona)" or district ID
  onChange: (value: string, district: SPDistrictRegion) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  popupDirection?: 'down' | 'up';
}

export default function SearchableDistrictSelect({
  value,
  onChange,
  placeholder = 'Selecione um bairro / região...',
  style,
  buttonStyle,
  popupDirection = 'down'
}: SearchableDistrictSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>('Todas');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine current selected district object
  const selectedDistrict = useMemo(() => {
    if (typeof value === 'number') {
      return ALL_SP_DISTRICTS.find(d => d.id === value) || ALL_SP_DISTRICTS[0];
    }
    return ALL_SP_DISTRICTS.find(d => 
      `${d.name} (${d.zone})` === value ||
      d.name.toLowerCase() === String(value).toLowerCase() ||
      String(value).toLowerCase().includes(d.name.toLowerCase())
    ) || ALL_SP_DISTRICTS[0];
  }, [value]);

  // Filter districts based on search and zone filter
  const filteredDistricts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_SP_DISTRICTS.filter(d => {
      const matchesZone = activeZoneFilter === 'Todas' || d.zone.toLowerCase() === activeZoneFilter.toLowerCase();
      const matchesSearch = !q || 
        d.name.toLowerCase().includes(q) || 
        d.zone.toLowerCase().includes(q) || 
        d.subprefeitura.toLowerCase().includes(q);
      return matchesZone && matchesSearch;
    });
  }, [search, activeZoneFilter]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (d: SPDistrictRegion) => {
    onChange(`${d.name} (${d.zone})`, d);
    setIsOpen(false);
    setSearch('');
  };

  const zones = ['Todas', 'Centro', 'Zona Oeste', 'Zona Sul', 'Zona Leste', 'Zona Norte'];

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#070B14',
          color: '#FFFFFF',
          border: isOpen ? '1px solid #3B82F6' : '1px solid #334155',
          borderRadius: '12px',
          padding: '12px 14px',
          fontSize: '0.9rem',
          fontWeight: 700,
          outline: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          boxShadow: isOpen ? '0 0 12px rgba(59, 130, 246, 0.3)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          ...buttonStyle
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <span style={{ fontSize: '1rem' }}>📍</span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedDistrict ? `${selectedDistrict.name} (${selectedDistrict.zone})` : placeholder}
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94A3B8', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </button>

      {/* Floating Searchable Dropdown Popup */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            ...(popupDirection === 'up' ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }),
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: '#0F172A',
            border: '1px solid #334155',
            borderRadius: '14px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'fadeIn 0.15s ease-out',
            minWidth: '280px'
          }}
        >
          {/* Search Input Box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '10px', fontSize: '0.85rem', color: '#64748B' }}>🔍</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar bairro (ex: Mooca, Butantã)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#070B14',
                color: '#FFFFFF',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '8px 10px 8px 32px',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  padding: '2px'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Zone Filter Pills */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }} className="no-scrollbar">
            {zones.map(z => {
              const active = activeZoneFilter === z;
              return (
                <button
                  key={z}
                  type="button"
                  onClick={() => setActiveZoneFilter(z)}
                  style={{
                    backgroundColor: active ? '#2563EB' : '#1E293B',
                    color: active ? '#FFFFFF' : '#94A3B8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {z}
                </button>
              );
            })}
          </div>

          {/* Scrollable Compact District List (Constrained Height) */}
          <div
            style={{
              maxHeight: '220px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              paddingRight: '2px'
            }}
          >
            {filteredDistricts.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#64748B', fontSize: '0.8rem' }}>
                Nenhum bairro encontrado para "{search}"
              </div>
            ) : (
              filteredDistricts.map(d => {
                const isSelected = selectedDistrict?.id === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelect(d)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.25)' : 'transparent',
                      border: isSelected ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
                      color: isSelected ? '#60A5FA' : '#F1F5F9',
                      fontSize: '0.83rem',
                      fontWeight: isSelected ? 800 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.1s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#1E293B';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div>
                      <span style={{ display: 'block' }}>{d.name}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                        {d.zone} • Subprefeitura {d.subprefeitura}
                      </span>
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: '0.8rem', color: '#3B82F6', fontWeight: 900 }}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
          
          <div style={{ borderTop: '1px solid #1E293B', paddingTop: '6px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
              Mostrando {filteredDistricts.length} de {ALL_SP_DISTRICTS.length} distritos
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
