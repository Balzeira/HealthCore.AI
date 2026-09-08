import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_SP_DISTRICTS } from '../data/spBoundaries';
import { ALL_SP_HOSPITALS } from '../data/hospitalsData';
import SearchableDistrictSelect from '../components/SearchableDistrictSelect';

export default function HomePage() {
  const navigate = useNavigate();

  // Read logged-in user to default the quick region
  const user = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('healthcore_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const [selectedQuickRegion, setSelectedQuickRegion] = useState(() => {
    if (user?.district) {
      const found = ALL_SP_DISTRICTS.find(d =>
        user.district.toLowerCase().includes(d.name.toLowerCase()) ||
        d.name.toLowerCase().includes(user.district.toLowerCase().split(' ')[0])
      );
      if (found) return found;
    }
    return ALL_SP_DISTRICTS[0];
  });

  // Calculate global summary numbers cleanly
  const totalCasesSP = React.useMemo(() => {
    return ALL_SP_DISTRICTS.reduce((acc, d) => acc + (d.cases || 0), 0);
  }, []);

  const getRiskColor = (risk: string) => {
    const r = (risk || '').toLowerCase();
    if (r === 'alto') return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#F87171' };
    if (r === 'médio' || r === 'medio') return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#FCD34D' };
    return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#34D399' };
  };

  const currentDistrictBadge = getRiskColor(selectedQuickRegion.risk);

  const services = [
    {
      title: 'Mapa Epidemiológico',
      icon: '🗺️',
      tag: 'Visualização GIS',
      desc: 'Navegue pelas 32 subprefeituras de SP com áreas de risco e hospitais dedicados.',
      actionText: 'Explorar Mapa',
      route: '/map',
      color: '#3B82F6'
    },
    {
      title: 'Doenças Mais Recorrentes',
      icon: '🦠',
      tag: 'Vigilância Ativa',
      desc: 'Consulte o ranking de doenças e descubra quais bairros estão sob maior impacto.',
      actionText: 'Consultar Doenças',
      route: '/diseases',
      color: '#EF4444'
    },
    {
      title: 'Rede de Hospitais & UPAs',
      icon: '🏥',
      tag: '205+ Unidades',
      desc: 'Diretório completo de hospitais públicos (SUS) e privados com rotas e plantões.',
      actionText: 'Acessar Hospitais',
      route: '/map/facilities',
      color: '#10B981'
    },
    {
      title: 'Avaliação de Bairro',
      icon: '📝',
      tag: 'Vigilância Cidadã',
      desc: 'Informe as condições sanitárias, focos de vetores e atendimento do seu posto de saúde.',
      actionText: 'Avaliar Região',
      route: '/form/evaluation',
      color: '#F59E0B'
    },
    {
      title: 'Fatores de Risco',
      icon: '🩺',
      tag: 'Saúde Preventiva',
      desc: 'Analise fatores de risco cruzando hábitos individuais com indicadores ambientais e regionais.',
      actionText: 'Analisar Fatores',
      route: '/form/predisposition',
      color: '#A855F7'
    },
    {
      title: 'Missão Agente de Saúde',
      icon: '🎮',
      tag: 'Capacitação',
      desc: 'Treinamento educativo em vigilância sanitária com emissão de certificado e relatório.',
      actionText: 'Iniciar Missão',
      route: '/game',
      color: '#EC4899'
    },
    {
      title: 'Metodologia & Fontes',
      icon: '📚',
      tag: 'Transparência',
      desc: 'Consulte a documentação técnica dos dados abertos (GeoSampa, CNES, SINAN, CETESB).',
      actionText: 'Ver Metodologia',
      route: '/methodology',
      color: '#6366F1'
    }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '40px' }}>
      
      {/* 1. Clean Executive Hero Banner */}
      <section style={{
        backgroundColor: '#0F172A',
        border: '1px solid #1E293B',
        borderRadius: '20px',
        padding: '36px 40px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '6px 14px',
            borderRadius: '100px',
            color: '#60A5FA',
            fontWeight: 800,
            fontSize: '0.8rem',
            marginBottom: '14px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            <span>Inteligência em Saúde Urbana • São Paulo</span>
          </div>

          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '0 0 12px',
            lineHeight: 1.25,
            letterSpacing: '-0.5px'
          }}>
            Descubra os riscos de saúde ao seu redor.
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: '#CBD5E1',
            margin: 0,
            lineHeight: 1.6,
            maxWidth: '880px'
          }}>
            Monitore doenças, condições ambientais, tendências e serviços de saúde da sua região em um só lugar.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/map')} 
            className="btn-primary"
            style={{
              fontSize: '0.95rem',
              padding: '12px 24px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🗺️</span>
            <span>Explorar Mapa Interativo</span>
          </button>

          <button 
            onClick={() => navigate('/diseases')} 
            style={{
              backgroundColor: '#1E293B',
              color: '#FFFFFF',
              border: '1px solid #334155',
              fontSize: '0.95rem',
              padding: '12px 24px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 800
            }}
          >
            <span>🦠</span>
            <span>Monitor de Doenças</span>
          </button>

          <button 
            onClick={() => navigate('/methodology')} 
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#60A5FA',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              fontSize: '0.95rem',
              padding: '12px 20px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            <span>📚</span>
            <span>Metodologia &amp; Fontes</span>
          </button>
        </div>

        {/* 4 Clean Indicators */}
        <div style={{
          borderTop: '1px solid #1E293B',
          paddingTop: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
              Subprefeituras
            </span>
            <strong style={{ fontSize: '1.35rem', color: '#FFFFFF' }}>32 Regiões</strong>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>96 Distritos (GeoSampa)</span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
              Casos Monitorados (14d)
            </span>
            <strong style={{ fontSize: '1.35rem', color: '#EF4444' }}>{totalCasesSP.toLocaleString('pt-BR')}</strong>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>SINAN &amp; InfoDengue</span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
              Rede de Saúde Mapeada
            </span>
            <strong style={{ fontSize: '1.35rem', color: '#3B82F6' }}>{ALL_SP_HOSPITALS.length} Unidades</strong>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>CNES / DataSUS</span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
              Qualidade Ambiental
            </span>
            <strong style={{ fontSize: '1.35rem', color: '#10B981' }}>Índice AQI SP</strong>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Estações CETESB</span>
          </div>
        </div>
      </section>

      {/* 2. Monitor Rápido do Bairro (Clean & Direct) */}
      <section style={{
        backgroundColor: '#0F172A',
        borderRadius: '18px',
        padding: '24px',
        border: '1px solid #1E293B',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>📍</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Situação Sanitária do Seu Bairro
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '2px 0 0' }}>
              Selecione qualquer bairro para ver as condições epidemiológicas instantâneas.
            </p>
          </div>

          <div style={{ minWidth: '280px' }}>
            <SearchableDistrictSelect
              value={selectedQuickRegion.id}
              onChange={(_, dist) => {
                if (dist) setSelectedQuickRegion(dist);
              }}
              buttonStyle={{ padding: '10px 14px', borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* Selected District Info Bar */}
        <div style={{
          backgroundColor: '#070B14',
          borderRadius: '14px',
          padding: '18px 22px',
          border: '1px solid #1E293B',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
              {selectedQuickRegion.zone}
            </span>
            <strong style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>{selectedQuickRegion.name}</strong>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>
              População: {selectedQuickRegion.population}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
              Nível de Risco Sanitário
            </span>
            <span style={{
              display: 'inline-block',
              marginTop: '4px',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: currentDistrictBadge.bg,
              color: currentDistrictBadge.text,
              border: `1px solid ${currentDistrictBadge.border}`
            }}>
              ● Risco {selectedQuickRegion.risk}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#CBD5E1', display: 'block', marginTop: '4px' }}>
              Foco: <strong style={{ color: '#FCD34D' }}>{selectedQuickRegion.disease}</strong>
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
              Indicadores Locais
            </span>
            <div style={{ display: 'flex', gap: '14px', marginTop: '4px' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748B', display: 'block' }}>Casos 14d</span>
                <strong style={{ fontSize: '1rem', color: '#EF4444' }}>{selectedQuickRegion.cases}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748B', display: 'block' }}>Ar (AQI)</span>
                <strong style={{ fontSize: '1rem', color: '#F8FAFC' }}>{selectedQuickRegion.aqi}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748B', display: 'block' }}>Limpeza</span>
                <strong style={{ fontSize: '1rem', color: '#10B981' }}>{selectedQuickRegion.cleanliness}/5 ⭐</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate(`/map?districtId=${selectedQuickRegion.id}`)}
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.85rem', borderRadius: '10px', whiteSpace: 'nowrap' }}
            >
              🗺️ Ver {selectedQuickRegion.name} no Mapa
            </button>
          </div>
        </div>
      </section>

      {/* 3. Clean Services Grid */}
      <section>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px' }}>
            Serviços &amp; Ferramentas do HealthCore
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', margin: 0 }}>
            Acesse as ferramentas de inteligência sanitária, busca hospitalar e capacitação.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {services.map((item, index) => (
            <div
              key={index}
              className="hud-card hud-card-interactive"
              onClick={() => navigate(item.route)}
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: `${item.color}18`,
                  border: `1px solid ${item.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px'
                }}>
                  {item.icon}
                </div>
                <span style={{
                  backgroundColor: `${item.color}15`,
                  color: item.color,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '14px'
                }}>
                  {item.tag}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 4px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>
                  {item.desc}
                </p>
              </div>

              <div style={{
                marginTop: 'auto',
                paddingTop: '10px',
                borderTop: '1px solid #1E293B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: item.color,
                fontWeight: 800,
                fontSize: '0.85rem'
              }}>
                <span>{item.actionText}</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
