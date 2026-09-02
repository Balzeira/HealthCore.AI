import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { ALL_SP_DISTRICTS } from '../data/spBoundaries';
import { ALL_SP_HOSPITALS } from '../data/hospitalsData';

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedQuickRegion, setSelectedQuickRegion] = useState(ALL_SP_DISTRICTS[0]);

  // SUS & Temporal Analysis State
  const [periodPreset, setPeriodPreset] = useState<'all' | '2025' | '2026' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('2024-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [statsData, setStatsData] = useState<any>(null);
  const [temporalData, setTemporalData] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);

  useEffect(() => {
    loadStats();
    loadTemporalAnalysis(startDate, endDate);
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.get('/stats');
      setStatsData(data);
    } catch (err) {
      console.warn('Backend stats fallback:', err);
    }
  };

  const loadTemporalAnalysis = async (start?: string, end?: string) => {
    setLoadingAnalysis(true);
    try {
      let query = '';
      if (start && end) query = `?start_date=${start}&end_date=${end}`;
      const data = await api.get(`/stats/temporal-analysis${query}`);
      setTemporalData(data);
    } catch (err) {
      console.warn('Temporal analysis fallback:', err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handlePresetChange = (preset: 'all' | '2025' | '2026' | 'custom') => {
    setPeriodPreset(preset);
    let s = '2024-01-01';
    let e = '2026-12-31';

    if (preset === '2025') {
      s = '2025-01-01';
      e = '2025-12-31';
    } else if (preset === '2026') {
      s = '2026-01-01';
      e = '2026-12-31';
    }

    if (preset !== 'custom') {
      setStartDate(s);
      setEndDate(e);
      loadTemporalAnalysis(s, e);
    }
  };

  const handleApplyCustomDates = () => {
    if (startDate && endDate) {
      loadTemporalAnalysis(startDate, endDate);
    }
  };

  const totalCasesDisplay = temporalData?.totais_periodo?.total_casos_notificados || statsData?.epidemiology?.total_cases_tracked || 449404;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      
      {/* Hero Welcome Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        border: '1px solid #334155',
        borderRadius: '24px',
        padding: '40px 48px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '960px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '8px 18px', borderRadius: '30px', color: '#60A5FA', fontWeight: 800, fontSize: '0.9rem', marginBottom: '16px' }}>
            <span>🏙️</span>
            <span>Sistema Integrado de Saúde da Capital Paulista • Dados Oficiais do SUS</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 12px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            Observatório Epidemiológico & Rede Hospitalar de São Paulo
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#94A3B8', margin: '0 0 28px', lineHeight: 1.6 }}>
            Monitoramento contínuo das 32 subprefeituras da capital com dados públicos e oficiais do <strong>Ministério da Saúde / SUS / CNES</strong>, catalogação completa da rede hospitalar e inteligência epidemiológica com análise histórica por períodos.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/map')} 
              className="btn-primary"
              style={{ fontSize: '1.1rem', padding: '16px 32px' }}
            >
              <span>🗺️</span>
              <span>Abrir Mapa Geográfico de SP</span>
            </button>

            <button 
              onClick={() => navigate('/map/facilities')} 
              className="btn-secondary"
              style={{ fontSize: '1.1rem', padding: '16px 32px' }}
            >
              <span>🏥</span>
              <span>Consultar Todos os Hospitais (45+)</span>
            </button>
          </div>
        </div>

        {/* Live Macro Metrics Ticker with Real SUS Data */}
        <div style={{ marginTop: '36px', paddingTop: '28px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Subprefeituras Monitoradas
            </span>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#F8FAFC' }}>
              32 Regiões
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Casos Reais SUS (Notificados)
            </span>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EF4444' }}>
              {Number(totalCasesDisplay).toLocaleString('pt-BR')}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Hospitais Mapeados (CNES)
            </span>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#3B82F6' }}>
              45+ Unidades
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Fonte Oficial Integrada
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✓ SUS / MS</span>
            </span>
          </div>
        </div>
      </section>

      {/* Temporal Analysis & Historical Date Filter Layer (Análise por Datas Oficial) */}
      <section className="hud-card" style={{ border: '1px solid #334155', backgroundColor: '#0B1120' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>📊</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Análise Temporal de Ocorrências (Série Histórica SUS)
              </h2>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '4px 0 0' }}>
              Identificação automática de picos, meses de maior e menor incidência e evolução temporal calculada a partir de dados reais.
            </p>
          </div>

          {/* Period Selector Pills */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => handlePresetChange('all')}
              style={{
                padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                backgroundColor: periodPreset === 'all' ? '#3B82F6' : '#1E293B',
                color: periodPreset === 'all' ? '#FFF' : '#94A3B8',
                border: periodPreset === 'all' ? '1px solid #3B82F6' : '1px solid #334155'
              }}
            >
              Série Completa
            </button>
            <button
              onClick={() => handlePresetChange('2025')}
              style={{
                padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                backgroundColor: periodPreset === '2025' ? '#3B82F6' : '#1E293B',
                color: periodPreset === '2025' ? '#FFF' : '#94A3B8',
                border: periodPreset === '2025' ? '1px solid #3B82F6' : '1px solid #334155'
              }}
            >
              Ano 2025
            </button>
            <button
              onClick={() => handlePresetChange('2026')}
              style={{
                padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                backgroundColor: periodPreset === '2026' ? '#3B82F6' : '#1E293B',
                color: periodPreset === '2026' ? '#FFF' : '#94A3B8',
                border: periodPreset === '2026' ? '1px solid #3B82F6' : '1px solid #334155'
              }}
            >
              Ano 2026
            </button>
            <button
              onClick={() => handlePresetChange('custom')}
              style={{
                padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                backgroundColor: periodPreset === 'custom' ? '#3B82F6' : '#1E293B',
                color: periodPreset === 'custom' ? '#FFF' : '#94A3B8',
                border: periodPreset === 'custom' ? '1px solid #3B82F6' : '1px solid #334155'
              }}
            >
              Personalizado 📅
            </button>
          </div>
        </div>

        {/* Custom Date Pickers (Shown if 'custom' is selected) */}
        {periodPreset === 'custom' && (
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '16px', backgroundColor: '#070B14', borderRadius: '12px', border: '1px solid #1E293B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94A3B8' }}>Data Inicial:</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{ backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94A3B8' }}>Data Final:</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{ backgroundColor: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
            <button
              onClick={handleApplyCustomDates}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              Aplicar Filtro de Datas ▶
            </button>
          </div>
        )}

        {/* Temporal Analysis Calculated Insights Cards (3 Colunas Exatas) */}
        {temporalData ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            
            {/* Card 1: Maior Ocorrência */}
            <div style={{ backgroundColor: '#070B14', padding: '20px', borderRadius: '14px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F87171', backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '3px 10px', borderRadius: '6px' }}>
                  MAIOR OCORRÊNCIA (PICO)
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700 }}>
                  {temporalData.extremos.periodo_maior_ocorrencia.participacao_percentual}% do total
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px' }}>
                {temporalData.extremos.periodo_maior_ocorrencia.rotulo}
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#EF4444', fontWeight: 800, margin: '0 0 8px' }}>
                {Number(temporalData.extremos.periodo_maior_ocorrencia.total_casos).toLocaleString('pt-BR')} casos notificados
              </p>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                {temporalData.sintese_automatica.destaque_maior_periodo}
              </p>
            </div>

            {/* Card 2: Menor Ocorrência */}
            <div style={{ backgroundColor: '#070B14', padding: '20px', borderRadius: '14px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34D399', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '3px 10px', borderRadius: '6px' }}>
                  MENOR OCORRÊNCIA (MÍNIMO)
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700 }}>
                  {temporalData.extremos.periodo_menor_ocorrencia.participacao_percentual}% do total
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px' }}>
                {temporalData.extremos.periodo_menor_ocorrencia.rotulo}
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#10B981', fontWeight: 800, margin: '0 0 8px' }}>
                {Number(temporalData.extremos.periodo_menor_ocorrencia.total_casos).toLocaleString('pt-BR')} casos notificados
              </p>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                {temporalData.sintese_automatica.destaque_menor_periodo}
              </p>
            </div>

            {/* Card 3: Comparação com Período Anterior */}
            <div style={{ backgroundColor: '#070B14', padding: '20px', borderRadius: '14px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#60A5FA', backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: '3px 10px', borderRadius: '6px' }}>
                  COMPARAÇÃO TEMPORAL
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: temporalData.comparacao_periodo_anterior.variacao_percentual >= 0 ? '#EF4444' : '#10B981' }}>
                  {temporalData.comparacao_periodo_anterior.variacao_percentual >= 0 ? '▲ +' : '▼ '}
                  {temporalData.comparacao_periodo_anterior.variacao_percentual}%
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px' }}>
                Variação Entre Períodos
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#FCD34D', fontWeight: 800, margin: '0 0 8px' }}>
                Tendência: {temporalData.comparacao_periodo_anterior.tendencia === 'crescimento' ? 'Em Crescimento' : temporalData.comparacao_periodo_anterior.tendencia === 'queda' ? 'Em Queda' : 'Estável'}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0, lineHeight: 1.4 }}>
                {temporalData.sintese_automatica.destaque_variacao_recente}
              </p>
            </div>

          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>
            Carregando indicadores temporais do SUS...
          </div>
        )}
      </section>

      {/* Modular Section 1: Executive Functional Modules */}
      <section>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px' }}>
            Serviços & Módulos da Plataforma
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: 0 }}>
            Escolha uma das opções abaixo para acessar ferramentas de localização, diagnóstico e vigilância.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          
          {/* Card 1: Mapa Interativo */}
          <div className="hud-card hud-card-interactive" onClick={() => navigate('/map')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                🗺️
              </div>
              <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', fontSize: '0.85rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px' }}>
                Fronteiras Contíguas
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px' }}>
              Mapa Epidemiológico de SP
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '0 0 20px', lineHeight: 1.5 }}>
              Navegue pelo mapa sem sobreposição das 32 subprefeituras de São Paulo com preenchimento exato de área, níveis de risco e HUD de hospitais dedicados de cada região.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3B82F6', fontWeight: 800, fontSize: '1rem' }}>
              <span>Explorar Mapa Interativo</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 2: Catálogo Geral de Hospitais */}
          <div className="hud-card hud-card-interactive" onClick={() => navigate('/map/facilities')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                🏥
              </div>
              <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontSize: '0.85rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px' }}>
                45+ Hospitais de SP
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px' }}>
              Rede Completa de Hospitais
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '0 0 20px', lineHeight: 1.5 }}>
              Diretório geral de hospitais públicos (SUS) e privados em todas as 5 macrorregiões da capital, com busca por especialidade, plantão 24h, rotas no Google Maps e ligação telefônica.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 800, fontSize: '1rem' }}>
              <span>Acessar Guia de Hospitais</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 3: Avaliação de Região */}
          <div className="hud-card hud-card-interactive" onClick={() => navigate('/form/evaluation')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                📝
              </div>
              <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#FCD34D', fontSize: '0.85rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px' }}>
                Vigilância Cidadã
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px' }}>
              Avaliação Sanitária de Região
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '0 0 20px', lineHeight: 1.5 }}>
              Contribua com dados da sua região informando a limpeza urbana, focos de mosquitos da Dengue, qualidade do ar e atendimento nos postos de saúde.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', fontWeight: 800, fontSize: '1rem' }}>
              <span>Fazer Avaliação de Bairro</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 4: Predisposição Individual */}
          <div className="hud-card hud-card-interactive" onClick={() => navigate('/form/predisposition')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                🩺
              </div>
              <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', fontSize: '0.85rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px' }}>
                Saúde Preventiva
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px' }}>
              Análise de Predisposição
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '0 0 20px', lineHeight: 1.5 }}>
              Calcule seus fatores de vulnerabilidade cardiovascular, respiratória e metabólica cruzando hábitos individuais com os índices da sua subprefeitura.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A855F7', fontWeight: 800, fontSize: '1rem' }}>
              <span>Calcular Indicadores</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 5: Missão Agente de Saúde */}
          <div className="hud-card hud-card-interactive" onClick={() => navigate('/game')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                🎮
              </div>
              <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#F87171', fontSize: '0.85rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px' }}>
                Capacitação
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px' }}>
              Missão Agente Comunitário
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '0 0 20px', lineHeight: 1.5 }}>
              Teste seus conhecimentos em saúde pública de São Paulo com questões interativas, cronômetro de prova e obtenção de certificado do agente.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontWeight: 800, fontSize: '1rem' }}>
              <span>Iniciar Desafio do Agente</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 6: Feedback & Suporte */}
          <div className="hud-card hud-card-interactive" onClick={() => navigate('/profile')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                💬
              </div>
              <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', fontSize: '0.85rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px' }}>
                Participação
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px' }}>
              Feedback & Suporte Técnico
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '0 0 20px', lineHeight: 1.5 }}>
              Envie sugestões de novas funções ou reporte inconsistências de dados sanitários diretamente para a equipe técnica de desenvolvimento.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3B82F6', fontWeight: 800, fontSize: '1rem' }}>
              <span>Enviar Feedback</span>
              <span>→</span>
            </div>
          </div>

        </div>
      </section>

      {/* Modular Section 2: Quick District Overview Inspector */}
      <section className="hud-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 4px' }}>
              Monitor Rápido de Subprefeituras
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: 0 }}>
              Consulte as condições epidemiológicas instantâneas de qualquer região da cidade.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 700 }}>Selecionar Região:</label>
            <select
              value={selectedQuickRegion.id}
              onChange={(e) => {
                const found = ALL_SP_DISTRICTS.find(d => d.id === Number(e.target.value));
                if (found) setSelectedQuickRegion(found);
              }}
              style={{
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '10px 16px',
                fontSize: '0.95rem',
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
        </div>

        {/* Selected Region Detailed Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', backgroundColor: '#070B14', padding: '24px', borderRadius: '16px', border: '1px solid #1E293B' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#3B82F6', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              {selectedQuickRegion.zone}
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px' }}>
              {selectedQuickRegion.name}
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: 0 }}>
              População estimada: <strong>{Number(selectedQuickRegion.population).toLocaleString()} habitantes</strong>
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Nível de Risco Sanitário
            </span>
            <span className={`badge-risk badge-risk-${selectedQuickRegion.risk.toLowerCase().replace('é', 'e')}`}>
              ● Risco {selectedQuickRegion.risk}
            </span>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: '8px 0 0' }}>
              Foco principal: <strong>{selectedQuickRegion.disease}</strong>
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Indicadores Ambientais
            </span>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Qualidade do Ar</span>
                <strong style={{ fontSize: '1.1rem', color: '#F8FAFC' }}>{selectedQuickRegion.aqi} AQI</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Casos 14d</span>
                <strong style={{ fontSize: '1.1rem', color: '#EF4444' }}>{selectedQuickRegion.cases}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Limpeza</span>
                <strong style={{ fontSize: '1.1rem', color: '#10B981' }}>{selectedQuickRegion.cleanliness}/5 ⭐</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/map')}
              className="btn-primary"
              style={{ width: '100%', padding: '12px 20px', fontSize: '0.95rem' }}
            >
              🗺️ Ver {selectedQuickRegion.name} no Mapa
            </button>
          </div>
        </div>
      </section>

      {/* Modular Section 3: Live Epidemiological News */}
      <section>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 4px' }}>
            Alertas & Notícias da Saúde de São Paulo
          </h2>
          <p style={{ fontSize: '1rem', color: '#94A3B8', margin: 0 }}>
            Informativos oficiais do Ministério da Saúde, Secretaria Municipal e CETESB.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          
          <article className="hud-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34D399', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '6px' }}>
                IMUNIZAÇÃO SUS
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Hoje, 11:00</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Campanha contra Influenza e Dengue ampliada em todas as UBSs de SP
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
              Todas as 32 subprefeituras de São Paulo contam com postos abertos aos finais de semana para atendimento e aplicação de vacinas.
            </p>
          </article>

          <article className="hud-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#F87171', backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '4px 10px', borderRadius: '6px' }}>
                VIGILÂNCIA EPIDEMIOLÓGICA
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Ontem, 16:30</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Monitoramento aponta desaceleração gradual de arboviroses na capital
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
              {temporalData ? temporalData.sintese_automatica.destaque_variacao_recente : 'Ações intensivas com aplicação de biolarvicidas e orientações preventivas nos bairros prioritários.'}
            </p>
          </article>

          <article className="hud-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FCD34D', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '4px 10px', borderRadius: '6px' }}>
                MONITORAMENTO DO AR
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Hoje, 09:15</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Qualidade do ar atinge nível favorável após chuvas isoladas na Zona Sul
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
              Estações da Vila Mariana, Moema e Santo Amaro registram índice AQI de 41. Excelente período para atividades físicas ao ar livre.
            </p>
          </article>

        </div>
      </section>

    </div>
  );
}
