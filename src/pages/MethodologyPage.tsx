import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_SP_DISTRICTS } from '../data/spBoundaries';
import { ALL_SP_HOSPITALS } from '../data/hospitalsData';

export default function MethodologyPage() {
  const navigate = useNavigate();

  const dataSources = [
    {
      name: 'GeoSampa • Prefeitura de São Paulo',
      type: 'Base Cartográfica & Limites Territoriais',
      coverage: '100% do município de São Paulo (96 distritos e 32 subprefeituras)',
      description: 'Polígonos vetoriais contíguos no sistema de referência WGS84, permitindo renderização espacial precisa sem sobreposições ou distorções de fronteira.',
      updateFrequency: 'Anual / Semestral',
      status: 'Oficial Público'
    },
    {
      name: 'CNES / DataSUS • Ministério da Saúde',
      type: 'Cadastro Nacional de Estabelecimentos de Saúde',
      coverage: `${ALL_SP_HOSPITALS.length} unidades cadastradas e georreferenciadas na capital`,
      description: 'Diretório de hospitais gerais, especializados, UPAs 24h, prontos-socorros e AMAs com classificação por rede (SUS, Filantrópico e Privado), especialidades e plantão.',
      updateFrequency: 'Mensal',
      status: 'Oficial Público'
    },
    {
      name: 'SINAN / InfoDengue / SMS-SP',
      type: 'Sistemas de Vigilância Epidemiológica',
      coverage: 'Notificações de casos de Dengue, COVID-19, SRAG, Influenza e Leptospirose',
      description: 'Séries temporais e contagens de casos notificados agregadas por distrito paulistano para identificação de focos sanitários e tendências de incidência.',
      updateFrequency: 'Semanal / Periódica',
      status: 'Oficial Público'
    },
    {
      name: 'Cetesb • Qualidade do Ar',
      type: 'Estações Meteorológicas & Poluentes Atmosféricos',
      coverage: 'Índices de Material Particulado (PM2.5 / PM10) e Qualidade do Ar (AQI)',
      description: 'Medição de concentração de poluentes e condições climáticas que influenciam afecções respiratórias na capital paulista.',
      updateFrequency: 'Diária',
      status: 'Oficial Público'
    },
    {
      name: 'Vigilância Cidadã Comunitária',
      type: 'Percepção Amostral Popular',
      coverage: 'Relatos voluntários de moradores via formulário de Avaliação',
      description: 'Avaliações comunitárias sobre percepção de limpeza urbana, acúmulo de entulho e tempo de espera. Não constituem dados oficiais do poder público.',
      updateFrequency: 'Tempo Real (Amostral)',
      status: 'Comunitário Colaborativo'
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '50px' }}>
      
      {/* Header */}
      <div style={{
        backgroundColor: '#0F172A',
        borderRadius: '20px',
        padding: '32px 36px',
        border: '1px solid #1E293B',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '6px 14px', borderRadius: '100px', color: '#60A5FA', fontSize: '0.8rem', fontWeight: 800, marginBottom: '12px' }}>
            <span>📚</span>
            <span>Transparência Científica &amp; Metodologia</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Fontes de Dados &amp; Metodologia
          </h1>
          <p style={{ fontSize: '1rem', color: '#94A3B8', margin: 0, maxWidth: '780px' }}>
            O HealthCore.AI é uma plataforma independente que organiza dados públicos e comunitários para democratizar o acesso à inteligência em saúde urbana.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/map')}
          className="btn-primary"
          style={{ padding: '12px 20px', fontSize: '0.9rem', borderRadius: '10px' }}
        >
          <span>🗺️</span>
          <span>Ver Dados no Mapa</span>
        </button>
      </div>

      {/* 1. Declaração de Independência & Não-Vínculo Governamental */}
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px'
      }}>
        <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>🛡️</span>
        <div>
          <h2 style={{ fontSize: '1.15rem', color: '#FFFFFF', margin: '0 0 6px', fontWeight: 800 }}>
            Posicionamento Independente &amp; Isenção de Vínculo
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#CBD5E1', margin: 0, lineHeight: 1.6 }}>
            O <strong>HealthCore.AI</strong> não é um órgão público, não pertence à Prefeitura de São Paulo, à Secretaria Municipal de Saúde nem ao Ministério da Saúde. Somos uma iniciativa independente de tecnologia cívica e saúde pública que coleta, processa e visualiza bases públicas oficiais abertas sob a Lei de Acesso à Informação (LAI).
          </p>
        </div>
      </div>

      {/* 2. Tabela de Fontes de Dados Públicas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px' }}>
            Catálogo de Fontes de Dados Integradas
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', margin: 0 }}>
            Todas as fontes públicas utilizadas na plataforma com seus respectivos escopos e frequências de atualização.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {dataSources.map((source, idx) => (
            <div
              key={idx}
              className="hud-card"
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <strong style={{ fontSize: '1.05rem', color: '#FFFFFF' }}>{source.name}</strong>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: source.status.includes('Oficial') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: source.status.includes('Oficial') ? '#34D399' : '#FCD34D',
                  border: `1px solid ${source.status.includes('Oficial') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                }}>
                  {source.status}
                </span>
              </div>

              <span style={{ fontSize: '0.8rem', color: '#60A5FA', fontWeight: 700 }}>
                {source.type}
              </span>

              <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                {source.description}
              </p>

              <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B' }}>
                <span>Cobertura: <strong style={{ color: '#CBD5E1' }}>{source.coverage.split('(')[0]}</strong></span>
                <span>Frequência: <strong style={{ color: '#CBD5E1' }}>{source.updateFrequency}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Como os Indicadores São Calculados */}
      <div className="hud-card" style={{ padding: '28px', backgroundColor: '#0F172A', border: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
          Como os Indicadores São Calculados
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: '#070B14', padding: '16px', borderRadius: '12px', border: '1px solid #1E293B' }}>
            <strong style={{ color: '#38BDF8', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>
              1. Nível de Risco Territorial (Baixo, Médio, Alto)
            </strong>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
              Calculado a partir da densidade de casos notificados nos últimos 14 dias normalizada pela população do distrito, associada a fatores ambientais (AQI e focos de vetores).
            </p>
          </div>

          <div style={{ backgroundColor: '#070B14', padding: '16px', borderRadius: '12px', border: '1px solid #1E293B' }}>
            <strong style={{ color: '#A855F7', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>
              2. Fatores de Risco de Hábitos (Qualitativo)
            </strong>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
              Modelo heurístico que pondera hábitos informados (sedentarismo, tabagismo, alimentação e sono) com o histórico familiar e o contexto territorial, categorizando em Baixo, Moderado ou Elevado.
            </p>
          </div>

          <div style={{ backgroundColor: '#070B14', padding: '16px', borderRadius: '12px', border: '1px solid #1E293B' }}>
            <strong style={{ color: '#10B981', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>
              3. TOP 5 Doenças em Tempo Real
            </strong>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
              Agregação contínua da soma de casos notificados e distritos sob alerta em todos os 96 distritos de São Paulo, ordenando as patologias de maior impacto comunitário.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Limitações Conhecidas & Isenção Médica */}
      <div style={{
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.3rem' }}>⚠️</span>
          <h3 style={{ fontSize: '1.15rem', color: '#F87171', margin: 0, fontWeight: 800 }}>
            Limitações do Modelo &amp; Termo de Uso em Saúde
          </h3>
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#CBD5E1', fontSize: '0.88rem', lineHeight: 1.6 }}>
          <li>
            <strong>Defasagem de Notificação:</strong> Os dados de sistemas públicos podem apresentar atraso entre a data do atendimento clínico e o registro consolidado no banco de dados.
          </li>
          <li>
            <strong>Fins Exclusivamente Informativos:</strong> As informações e ferramentas desta plataforma não configuram diagnóstico médico, prognóstico clínico, triagem hospitalar ou prescrição terapêutica.
          </li>
          <li>
            <strong>Orientação Profissional:</strong> Em caso de sintomas, agravamento de saúde ou suspeita de doença grave, procure imediatamente uma unidade de saúde presencial ou médico habilitado.
          </li>
        </ul>
      </div>

    </div>
  );
}
