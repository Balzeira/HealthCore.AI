import React, { useState, useMemo } from 'react';
import { ALL_SP_HOSPITALS, Hospital } from '../data/hospitalsData';

export default function FacilitiesPage() {
  // Authoritative catalog of all 56 SP hospitals with verified zones and CNES metadata
  const [hospitals] = useState<Hospital[]>(ALL_SP_HOSPITALS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('Todas');
  const [filterType, setFilterType] = useState<string>('Todos');

  // Helper: strict type matching based on network field
  const matchesTypeFilter = (h: Hospital, t: string): boolean => {
    if (t === 'Todos') return true;
    if (t === '24h') return Boolean(h?.is_24h);
    if (t === 'Emergência') return Boolean(h?.is_emergency);
    if (t === 'SUS') return h?.network === 'SUS';
    if (t === 'Privado') return h?.network === 'Privado';
    if (t === 'Filantrópico') return h?.network === 'Filantrópico';
    return true;
  };

  // Pure reactive memoized filter calculation
  const filteredHospitals = useMemo(() => {
    return hospitals.filter(h => {
      const query = (searchQuery || '').trim().toLowerCase();
      const name = (h?.name || '').toLowerCase();
      const specs = (h?.specialties || '').toLowerCase();
      const district = (h?.district || '').toLowerCase();
      const address = (h?.address || '').toLowerCase();
      const zone = (h?.zone || '').trim().toLowerCase();

      const matchesSearch = query === '' ||
                            name.includes(query) ||
                            specs.includes(query) ||
                            district.includes(query) ||
                            address.includes(query);

      const targetZone = selectedZone.trim().toLowerCase();
      const matchesZone = selectedZone === 'Todas' || zone === targetZone;

      const matchesT = matchesTypeFilter(h, filterType);

      return matchesSearch && matchesZone && matchesT;
    });
  }, [hospitals, searchQuery, selectedZone, filterType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Banner */}
      <div style={{ backgroundColor: '#0F172A', padding: '32px 40px', borderRadius: '20px', border: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '6px 16px', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem', marginBottom: '10px' }}>
            <span>🏥</span>
            <span>Rede Hospitalar & Prontos-Socorros (CNES / SUS)</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Hospitais de São Paulo Capital
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: 0 }}>
            Catálogo completo com {hospitals.length} hospitais e prontos-socorros nas 5 zonas da cidade.
          </p>
        </div>

        <div style={{ backgroundColor: '#1E293B', padding: '12px 24px', borderRadius: '14px', border: '1px solid #334155', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Unidades Listadas</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#3B82F6' }}>{filteredHospitals.length} de {hospitals.length}</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="hud-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Main Search Input */}
        <div>
          <input
            type="text"
            placeholder="Pesquise por nome do hospital (ex: Santa Casa, HC, Einstein, Mandaqui), especialidade (ex: Cardiologia, Trauma) ou bairro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#070B14',
              color: '#FFFFFF',
              border: '1px solid #334155',
              borderRadius: '14px',
              padding: '16px 20px',
              fontSize: '1.05rem',
              fontWeight: 600,
              outline: 'none'
            }}
          />
        </div>

        {/* Filter Pills Row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Zone Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', minWidth: '60px' }}>Zona SP:</span>
            {['Todas', 'Centro', 'Zona Oeste', 'Zona Sul', 'Zona Leste', 'Zona Norte'].map(z => {
              const isActive = selectedZone === z;
              return (
                <button
                  key={z}
                  type="button"
                  onClick={() => setSelectedZone(z)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isActive ? '2px solid #3B82F6' : '1px solid #334155',
                    backgroundColor: isActive ? '#1D4ED8' : '#1E293B',
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    boxShadow: isActive ? '0 0 16px rgba(59, 130, 246, 0.5)' : 'none'
                  }}
                >
                  <span>{isActive ? '✓ ' : ''}{z}</span>
                </button>
              );
            })}
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', minWidth: '60px' }}>Tipo:</span>
            {['Todos', '24h', 'Emergência', 'SUS', 'Filantrópico', 'Privado'].map(t => {
              const isActive = filterType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isActive ? '2px solid #10B981' : '1px solid #334155',
                    backgroundColor: isActive ? '#059669' : '#1E293B',
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    boxShadow: isActive ? '0 0 16px rgba(16, 185, 129, 0.5)' : 'none'
                  }}
                >
                  <span>{isActive ? '✓ ' : ''}{t}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Dynamic Status Indicator Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', backgroundColor: '#070B14', padding: '14px 20px', borderRadius: '12px', border: '1px solid #1E293B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
            <span style={{ color: '#60A5FA', fontWeight: 800 }}>📍 Filtro Atual:</span>
            <span style={{ color: '#FFFFFF', fontWeight: 800 }}>
              Região: <strong style={{ color: '#38BDF8' }}>{selectedZone}</strong> | Tipo: <strong style={{ color: '#34D399' }}>{filterType}</strong>
              {searchQuery && <span> | Busca: "{searchQuery}"</span>}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#94A3B8', fontSize: '0.9rem', fontWeight: 700 }}>
              Mostrando <strong style={{ color: '#FFFFFF' }}>{filteredHospitals.length}</strong> {filteredHospitals.length === 1 ? 'hospital' : 'hospitais'}
            </span>
            {(selectedZone !== 'Todas' || filterType !== 'Todos' || searchQuery !== '') && (
              <button
                type="button"
                onClick={() => { setSelectedZone('Todas'); setFilterType('Todos'); setSearchQuery(''); }}
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
              >
                ✕ Limpar Filtros
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Hospitals Grid (Strictly Rendering filteredHospitals) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {filteredHospitals.length === 0 ? (
          <div className="hud-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>🔍</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px' }}>
              Nenhum hospital encontrado para os filtros selecionados
            </h3>
            <p style={{ color: '#94A3B8', margin: '0 0 16px' }}>
              Tente selecionar outra zona de São Paulo ou limpar o termo de pesquisa.
            </p>
            <button
              type="button"
              onClick={() => { setSelectedZone('Todas'); setFilterType('Todos'); setSearchQuery(''); }}
              className="btn-primary"
            >
              Exibir Todos os 45+ Hospitais
            </button>
          </div>
        ) : (
          filteredHospitals.map(h => (
            <div 
              key={`${h.id}-${h.zone}-${selectedZone}-${filterType}`} 
              className="hud-card" 
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                {/* Header Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#60A5FA', backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: '4px 10px', borderRadius: '6px' }}>
                    {h.network || h.type}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {h.is_emergency && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F87171', backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '4px 8px', borderRadius: '6px' }}>
                        🚨 Emergência 24h
                      </span>
                    )}
                    {h.is_24h && !h.is_emergency && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34D399', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '4px 8px', borderRadius: '6px' }}>
                        ⏱ 24 Horas
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Location */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px', lineHeight: 1.3 }}>
                  {h.name}
                </h3>

                <div style={{ fontSize: '0.9rem', color: '#60A5FA', fontWeight: 700, marginBottom: '12px' }}>
                  📍 {h.zone || 'São Paulo'} • {h.district || 'Capital'}
                </div>

                {/* Specialties */}
                <p style={{ fontSize: '0.9rem', color: '#CBD5E1', margin: '0 0 12px', lineHeight: 1.5 }}>
                  <strong style={{ color: '#F8FAFC' }}>Especialidades:</strong> {h.specialties || 'Atendimento Geral'}
                </p>

                {/* Address and Phone */}
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '0 0 18px', lineHeight: 1.4 }}>
                  📌 {h.address || 'São Paulo - SP'}
                </p>
              </div>

              {/* Direct Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #1E293B', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`, '_blank')}
                  className="btn-emerald"
                  style={{ flex: 1, padding: '10px 14px', fontSize: '0.9rem' }}
                >
                  🗺️ Rota no Maps
                </button>

                <button
                  type="button"
                  onClick={() => window.location.href = `tel:${(h.phone || '').replace(/\D/g, '')}`}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px 14px', fontSize: '0.9rem' }}
                >
                  📞 {h.phone || '(11) 156'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
