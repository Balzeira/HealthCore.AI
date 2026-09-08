import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_SP_DISTRICTS, SPDistrictRegion } from '../data/spBoundaries';
import { ALL_SP_HOSPITALS } from '../data/hospitalsData';

interface DiseaseInfo {
  id: string;
  name: string;
  category: 'Vetores & Arboviroses' | 'Vírus Respiratórios' | 'Bacterianas & Hídricas' | 'Crônicas & Ambientais';
  icon: string;
  tag: string;
  shortDesc: string;
  transmission: string;
  symptoms: string[];
  seasonalPeak: string;
  prevention: string[];
  riskFactor: string;
  susGuideline: string;
}

const SP_DISEASES: DiseaseInfo[] = [
  {
    id: 'dengue',
    name: 'Dengue',
    category: 'Vetores & Arboviroses',
    icon: '🦟',
    tag: 'Arbovirose Urbana',
    shortDesc: 'Infecção viral transmitida pela picada da fêmea do mosquito Aedes aegypti, com ciclos sazonais acentuados na capital.',
    transmission: 'Picada do mosquito Aedes aegypti infectado (vetor diurno urbano).',
    symptoms: ['Febre alta súbita (39°C - 40°C)', 'Dor retro-orbital (atrás dos olhos)', 'Mialgia e artralgia intensa', 'Manchas vermelhas na pele', 'Náuseas e fadiga extrema'],
    seasonalPeak: 'Verão e Outono (Janeiro a Maio) — períodos de calor intenso e chuvas frequentes.',
    prevention: [
      'Eliminação permanente de água parada em pratos de plantas e calhas',
      'Vistoria semanal em caixas d’água e ralos externos',
      'Aplicação de repelente registrado pela Anvisa',
      'Adesão à vacina Qdenga disponível no SUS para faixas etárias prioritárias'
    ],
    riskFactor: 'Áreas com alta densidade urbana, recipientes descobertos e acúmulo de entulho.',
    susGuideline: 'Procure a UPA ou UBS mais próxima aos primeiros sinais de febre e hidrate-se com soro caseiro.'
  },
  {
    id: 'covid19',
    name: 'COVID-19',
    category: 'Vírus Respiratórios',
    icon: '🦠',
    tag: 'Síndrome Respiratória',
    shortDesc: 'Doença respiratória aguda causada pelo coronavírus SARS-CoV-2, monitorada continuamente pelo sistema epidemiológico municipal.',
    transmission: 'Gotículas respiratórias expelidas ao falar, tossir ou espirrar e contato com superfícies contaminadas.',
    symptoms: ['Tosse seca persistente', 'Febre e calafrios', 'Fadiga e dor de garganta', 'Perda súbita de olfato/paladar', 'Dificuldade para respirar (sinal de alerta)'],
    seasonalPeak: 'Outono e Inverno, além de ondas sazonais em períodos de aglomeração.',
    prevention: [
      'Manter o esquema vacinal com doses de reforço bivalentes em dia',
      'Uso de máscaras em ambientes fechados de saúde ou transporte coletivo',
      'Higienização constante das mãos com água e sabão ou álcool em gel 70%',
      'Ventilação adequada de ambientes fechados'
    ],
    riskFactor: 'Idosos, imunossuprimidos, portadores de comorbidades cardiovasculares e metabólicas.',
    susGuideline: 'Testagem rápida disponível gratuitamente em todas as UBSs e AMAs da capital.'
  },
  {
    id: 'influenza',
    name: 'Influenza & SRAG',
    category: 'Vírus Respiratórios',
    icon: '🫁',
    tag: 'Gripe & Síndrome Respiratória',
    shortDesc: 'Vírus da Gripe (H1N1, H3N2 e Vírus Sincicial Respiratório - VSR) que causam inflamações pulmonares agudas na população infantil e idosa.',
    transmission: 'Aerossóis e gotículas respiratórias transmitidas pelo ar em ambientes pouco ventilados.',
    symptoms: ['Febre alta de início abrupto', 'Coriza e dor de garganta', 'Cefaleia e dores musculares', 'Congestão nasal e fadiga', 'Falta de ar progressiva'],
    seasonalPeak: 'Meses de outono e inverno paulistano (Maio a Agosto) com quedas bruscas de temperatura.',
    prevention: [
      'Vacinação anual contra gripe na campanha municipal do SUS',
      'Etiqueta respiratória (proteger a boca com o antebraço ao tossir)',
      'Evitar aglomerações em recintos fechados durante o inverno',
      'Lavagem frequente de mãos'
    ],
    riskFactor: 'Crianças menores de 5 anos, gestantes, idosos e pessoas com doenças respiratórias crônicas.',
    susGuideline: 'Casos com saturação de oxigênio abaixo de 95% devem ser encaminhados com urgência a Prontos-Socorros.'
  },
  {
    id: 'leptospirose',
    name: 'Leptospirose',
    category: 'Bacterianas & Hídricas',
    icon: '🌧️',
    tag: 'Infecção Bacteriana Hídrica',
    shortDesc: 'Doença bacteriana aguda causada pela Leptospira, transmitida principalmente através do contato com águas de enchentes contaminadas.',
    transmission: 'Contato direto da pele lesionada ou mucosas com água ou lama de enchentes contaminadas com urina de roedores.',
    symptoms: ['Febre alta súbita', 'Dor intensa nas panturrilhas (sinal clássico)', 'Icterícia (pele e olhos amarelados)', 'Dor de cabeça e calafrios', 'Alterações na cor da urina'],
    seasonalPeak: 'Verão e dias posteriores a fortes tempestades com alagamentos nas bacias fluviais de SP.',
    prevention: [
      'Evitar entrar em contato com água e lama de enchentes',
      'Uso de botas e luvas de borracha durante a limpeza de imóveis alagados',
      'Desinfecção de caixas d’água e superfícies com água sanitária (1 copo para 20L de água)',
      'Manter alimentos bem protegidos de roedores'
    ],
    riskFactor: 'Moradores de áreas ribeirinhas, baixadas e regiões sujeitas a transbordamento de córregos.',
    susGuideline: 'Procure atendimento imediato informando se teve contato recente com água de enchente.'
  },
  {
    id: 'respiratorias_poluicao',
    name: 'Doenças Respiratórias por Poluição',
    category: 'Crônicas & Ambientais',
    icon: '🏭',
    tag: 'Impacto Ambiental Urbano',
    shortDesc: 'Agravamento de Asma, Bronquite e Rinite alérgica decorrente do acúmulo de material particulado (PM2.5) e baixa umidade do ar na capital.',
    transmission: 'Inalação de poluentes atmosféricos gerados por tráfego veicular intenso e queimadas regionais.',
    symptoms: ['Chiado no peito e falta de ar', 'Tosse seca irritativa', 'Ardor nos olhos e garganta seca', 'Crises agudas de broncoespasmo', 'Coriza e congestão constante'],
    seasonalPeak: 'Inverno e início da primavera (Junho a Setembro) — período de estiagem e inversão térmica.',
    prevention: [
      'Umidificação de ambientes internos com toalhas úmidas ou vaporizadores',
      'Consumo elevado de água ao longo do dia (mínimo 2 litros)',
      'Evitar exercícios físicos ao ar livre entre 10h e 16h em dias de ar crítico',
      'Monitoramento constante do índice AQI no mapa do HealthCore.AI'
    ],
    riskFactor: 'População de corredores de tráfego pesado (Marginais, Av. do Estado e Radial Leste).',
    susGuideline: 'Pacientes com asma devem manter seus medicamentos inalatórios (bombinhas) em mãos.'
  },
  {
    id: 'tuberculose',
    name: 'Tuberculose',
    category: 'Bacterianas & Hídricas',
    icon: '💊',
    tag: 'Bacteriana Crônica',
    shortDesc: 'Doença infecciosa pulmonar crônica causada pelo bacilo de Koch, de tratamento 100% gratuito e garantido pelo SUS.',
    transmission: 'Via aérea pela inalação de gotículas expelidas pela tosse de pessoas com tuberculose pulmonar ativa.',
    symptoms: ['Tosse contínua por mais de 3 semanas', 'Febre vespertina e suores noturnos', 'Emagrecimento involuntário', 'Cansaço fácil e fraqueza', 'Expectoração com sangue'],
    seasonalPeak: 'Incidência contínua durante todo o ano, agravada pela aglomeração e má ventilação.',
    prevention: [
      'Vacinação BCG em recém-nascidos',
      'Investigação de contatos domiciliares de casos confirmados',
      'Ambientes bem ventilados e com incidência de luz solar',
      'Conclusão rigorosa dos 6 meses de tratamento antibiótico pelo SUS'
    ],
    riskFactor: 'População em vulnerabilidade social, pessoas privadas de liberdade e indivíduos imunodeprimidos.',
    susGuideline: 'Tosse por 3 semanas ou mais requer exame de escarro imediato e gratuito na UBS mais próxima.'
  },
  {
    id: 'febre_amarela',
    name: 'Febre Amarela',
    category: 'Vetores & Arboviroses',
    icon: '🌲',
    tag: 'Vigilância Silvestre',
    shortDesc: 'Doença viral transmitida por mosquitos silvestres em áreas de mata periurbana nos extremos norte e sul da capital.',
    transmission: 'Picada de mosquitos silvestres dos gêneros Haemagogus e Sabethes infectados em áreas florestais.',
    symptoms: ['Febre súbita e calafrios intensos', 'Dor de cabeça e lombar', 'Náuseas e vômitos', 'Icterícia amarelada', 'Hemorragias em fases graves'],
    seasonalPeak: 'Dezembro a Maio em áreas periurbanas de mata.',
    prevention: [
      'Dose única da vacina da Febre Amarela disponível gratuitamente no SUS',
      'Uso de repelentes e roupas compridas ao frequentar parques naturais ou áreas de mata',
      'Notificação imediata de macacos encontrados mortos à vigilância municipal'
    ],
    riskFactor: 'Moradores e visitantes de regiões próximas à Serra da Cantareira e represas do Extremo Sul.',
    susGuideline: 'A vacina é a forma mais eficaz e segura de proteção para toda a vida.'
  },
  {
    id: 'hepatite_a',
    name: 'Hepatite A',
    category: 'Bacterianas & Hídricas',
    icon: '💧',
    tag: 'Infecciosa Entérica',
    shortDesc: 'Infecção hepática aguda transmitida pela ingestão de água ou alimentos contaminados com o vírus da Hepatite A.',
    transmission: 'Via fecal-oral, através de água não tratada, alimentos mal lavados ou contato interpessoal.',
    symptoms: ['Fadiga excessiva', 'Náuseas, vômitos e desconforto abdominal', 'Urina escura (cor de refrigerante de cola)', 'Fezes claras ou esbranquiçadas', 'Olhos e pele amarelados'],
    seasonalPeak: 'Maior ocorrência em períodos de chuvas fortes e falhas em redes de distribuição de água.',
    prevention: [
      'Vacinação infantil contra Hepatite A no calendário básico do SUS',
      'Consumo exclusivo de água filtrada ou fervida',
      'Higienização cuidadosa de frutas, verduras e legumes com solução de hipoclorito',
      'Lavagem rigorosa das mãos antes de preparar ou consumir alimentos'
    ],
    riskFactor: 'Locais com saneamento básico precário e manuseio inadequado de alimentos.',
    susGuideline: 'A recuperação envolve repouso e hidratação com acompanhamento médico da função hepática.'
  }
];

export default function DiseasesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedDisease, setSelectedDisease] = useState<DiseaseInfo>(SP_DISEASES[0]);
  const [zoneFilter, setZoneFilter] = useState<string>('Todas');

  const categories = [
    'Todas',
    'Vetores & Arboviroses',
    'Vírus Respiratórios',
    'Bacterianas & Hídricas',
    'Crônicas & Ambientais'
  ];

  const zones = ['Todas', 'Centro', 'Zona Oeste', 'Zona Sul', 'Zona Leste', 'Zona Norte'];

  // Filter diseases by search and category
  const filteredDiseases = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return SP_DISEASES.filter(d => {
      const matchCat = selectedCategory === 'Todas' || d.category === selectedCategory;
      const matchSearch = !q || 
        d.name.toLowerCase().includes(q) || 
        d.tag.toLowerCase().includes(q) ||
        d.shortDesc.toLowerCase().includes(q) ||
        d.symptoms.some(s => s.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [searchTerm, selectedCategory]);

  // Find districts impacted by the currently selected disease
  const impactedDistricts = useMemo(() => {
    const targetName = selectedDisease.name.toLowerCase();
    return ALL_SP_DISTRICTS.filter(dist => {
      const matchZone = zoneFilter === 'Todas' || dist.zone.toLowerCase() === zoneFilter.toLowerCase();
      
      // Match by disease name, tag or related risk patterns
      const distDisease = (dist.disease || '').toLowerCase();
      const isDirectMatch = distDisease.includes(targetName) || 
        targetName.includes(distDisease) ||
        (selectedDisease.id === 'dengue' && distDisease.includes('dengue')) ||
        (selectedDisease.id === 'covid19' && (distDisease.includes('covid') || distDisease.includes('respirat'))) ||
        (selectedDisease.id === 'influenza' && (distDisease.includes('srag') || distDisease.includes('gripe') || distDisease.includes('respirat'))) ||
        (selectedDisease.id === 'leptospirose' && (distDisease.includes('lepto') || dist.cleanliness <= 3)) ||
        (selectedDisease.id === 'respiratorias_poluicao' && (dist.aqi >= 80 || distDisease.includes('respirat'))) ||
        (selectedDisease.id === 'tuberculose' && (dist.risk === 'Alto' || dist.risk === 'Médio')) ||
        (selectedDisease.id === 'febre_amarela' && (dist.zone === 'Zona Norte' || dist.zone === 'Zona Sul')) ||
        (selectedDisease.id === 'hepatite_a' && dist.cleanliness <= 3.5);

      return matchZone && isDirectMatch;
    }).sort((a, b) => b.cases - a.cases);
  }, [selectedDisease, zoneFilter]);

  // Find reference hospitals for the selected disease in SP
  const referenceHospitals = useMemo(() => {
    return ALL_SP_HOSPITALS.filter(h => {
      if (selectedDisease.id === 'dengue' || selectedDisease.id === 'febre_amarela') {
        return h.is_emergency || h.type === 'Pronto-Socorro' || h.name.includes('Emílio Ribas');
      }
      if (selectedDisease.id === 'influenza' || selectedDisease.id === 'respiratorias_poluicao') {
        return h.specialties.toLowerCase().includes('respirat') || h.specialties.toLowerCase().includes('uti') || h.type === 'Hospital';
      }
      return h.is_public;
    }).slice(0, 4);
  }, [selectedDisease]);

  const getRiskBadgeColor = (risk: string) => {
    const r = (risk || '').toLowerCase();
    if (r === 'alto') return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#F87171' };
    if (r === 'médio' || r === 'medio') return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#FCD34D' };
    return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#34D399' };
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* 1. Header Section */}
      <div style={{
        backgroundColor: '#0F172A',
        borderRadius: '20px',
        padding: '24px 28px',
        border: '1px solid #1E293B',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '4px 10px', borderRadius: '20px', color: '#60A5FA', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px' }}>
            <span>📊</span>
            <span>Vigilância Epidemiológica Municipal • São Paulo</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            Doenças Mais Recorrentes na Capital
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: 0 }}>
            Pesquise por patologias, sintomas e identifique os distritos paulistanos sob impacto direto.
          </p>
        </div>

        {/* Quick Back to Map Action */}
        <button
          type="button"
          onClick={() => navigate('/map')}
          className="btn-primary"
          style={{ padding: '10px 18px', fontSize: '0.9rem', borderRadius: '10px' }}
        >
          <span>🗺️</span>
          <span>Abrir Mapa Geral SP</span>
        </button>
      </div>

      {/* 2. Search & Category Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', color: '#64748B' }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Pesquisar por doença, patologia, sintomas ou formas de transmissão (ex: Dengue, Febre, COVID, Asma)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: '1px solid #334155',
              borderRadius: '14px',
              padding: '14px 16px 14px 46px',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: '4px'
              }}
            >
              ✕ Limpar
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
          {categories.map(cat => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: active ? '#2563EB' : '#1E293B',
                  color: active ? '#FFFFFF' : '#94A3B8',
                  border: active ? '1px solid #3B82F6' : '1px solid #334155',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Diseases Cards Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
            Catálogo Epidemiológico ({filteredDiseases.length})
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Clique em uma doença para inspecionar os bairros impactados
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px'
        }}>
          {filteredDiseases.map(disease => {
            const isSelected = selectedDisease.id === disease.id;
            return (
              <div
                key={disease.id}
                onClick={() => setSelectedDisease(disease)}
                style={{
                  backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.15)' : '#0F172A',
                  border: isSelected ? '2px solid #3B82F6' : '1px solid #1E293B',
                  borderRadius: '14px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 20px rgba(59, 130, 246, 0.25)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{disease.icon}</span>
                    <strong style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>{disease.name}</strong>
                  </div>
                  <span style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: '#60A5FA',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    {disease.tag}
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                  {disease.shortDesc}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748B' }}>
                  <span>Pico: <strong style={{ color: '#F8FAFC' }}>{disease.seasonalPeak.split('(')[0]}</strong></span>
                  <span style={{ color: isSelected ? '#38BDF8' : '#64748B', fontWeight: 800 }}>
                    {isSelected ? '● Selecionada' : 'Ver Bairros →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Selected Disease Detailed Inspector & Impacted Districts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Technical Sheet & Clinical Guidance */}
        <div style={{
          backgroundColor: '#0F172A',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #1E293B',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2rem' }}>{selectedDisease.icon}</span>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                {selectedDisease.name}
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#60A5FA', fontWeight: 700 }}>
                {selectedDisease.category} • {selectedDisease.tag}
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1E293B', paddingTop: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
              Forma de Transmissão
            </span>
            <p style={{ fontSize: '0.9rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
              {selectedDisease.transmission}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
              Principais Sintomas Clínicos
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedDisease.symptoms.map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#FCA5A5',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}
                >
                  • {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
              Diretrizes de Prevenção Sanitária
            </span>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.6 }}>
              {selectedDisease.prevention.map((p, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>
                  <span style={{ color: '#E2E8F0' }}>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '12px 16px' }}>
            <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
              Orientação Oficial SUS São Paulo
            </span>
            <p style={{ fontSize: '0.85rem', color: '#A7F3D0', margin: 0, lineHeight: 1.4 }}>
              {selectedDisease.susGuideline}
            </p>
          </div>

          {/* Reference Hospitals */}
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
              Unidades Hospitalares & UPAs de Referência em SP
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {referenceHospitals.map(h => (
                <div
                  key={h.id}
                  style={{
                    backgroundColor: '#070B14',
                    border: '1px solid #1E293B',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem'
                  }}
                >
                  <div>
                    <strong style={{ color: '#FFFFFF', display: 'block' }}>{h.name}</strong>
                    <span style={{ color: '#64748B', fontSize: '0.72rem' }}>{h.district} ({h.zone})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/map/facilities')}
                    style={{
                      background: 'none',
                      border: '1px solid #3B82F6',
                      color: '#60A5FA',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Ver Detalhes
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Impacted Districts List */}
        <div style={{
          backgroundColor: '#0F172A',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #1E293B',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                📍 Bairros & Distritos Impactados
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '2px 0 0' }}>
                {impactedDistricts.length} regiões paulistanas em alerta para <strong>{selectedDisease.name}</strong>
              </p>
            </div>

            {/* Zone Filter */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {zones.slice(0, 4).map(z => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZoneFilter(z)}
                  style={{
                    backgroundColor: zoneFilter === z ? '#2563EB' : '#1E293B',
                    color: zoneFilter === z ? '#FFFFFF' : '#94A3B8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* List of Districts */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '520px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}>
            {impactedDistricts.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748B', fontSize: '0.9rem' }}>
                Nenhum distrito sob alerta crítico para esta zona no momento.
              </div>
            ) : (
              impactedDistricts.map(dist => {
                const badge = getRiskBadgeColor(dist.risk);
                return (
                  <div
                    key={dist.id}
                    style={{
                      backgroundColor: '#070B14',
                      border: '1px solid #1E293B',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>{dist.name}</strong>
                        <span style={{
                          backgroundColor: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.text,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 800
                        }}>
                          ● Risco {dist.risk}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '2px' }}>
                        {dist.zone} • Subprefeitura {dist.subprefeitura} • Pop: {dist.population}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>Casos 14d</span>
                        <strong style={{ fontSize: '0.95rem', color: '#EF4444' }}>{dist.cases}</strong>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/map?districtId=${dist.id}`)}
                        style={{
                          backgroundColor: '#1E293B',
                          color: '#60A5FA',
                          border: '1px solid #3B82F6',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'background-color 0.15s'
                        }}
                      >
                        🗺️ Ver no Mapa
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
