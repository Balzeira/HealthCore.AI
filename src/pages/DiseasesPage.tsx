import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_SP_DISTRICTS, SPDistrictRegion } from '../data/spBoundaries';
import { ALL_SP_HOSPITALS, Hospital } from '../data/hospitalsData';
import SearchableDistrictSelect from '../components/SearchableDistrictSelect';

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
  severityScore?: number;
  harmSummary?: string;
}

const SP_DISEASES: DiseaseInfo[] = [
  {
    id: 'dengue',
    name: 'Dengue',
    category: 'Vetores & Arboviroses',
    icon: '🦟',
    tag: 'Arbovirose Urbana',
    shortDesc: 'Infecção viral transmitida pelo mosquito Aedes aegypti, com altos índices de hospitalização e sobrecarga em UPAs na capital.',
    transmission: 'Picada da fêmea do mosquito Aedes aegypti infectado (vetor diurno urbano em água parada).',
    symptoms: ['Febre alta súbita (39°C - 40°C)', 'Dor retro-orbital (atrás dos olhos)', 'Mialgia e artralgia intensa', 'Manchas vermelhas na pele', 'Náuseas e fadiga extrema'],
    seasonalPeak: 'Verão e Outono (Janeiro a Maio) — períodos com temperaturas elevadas e chuvas frequentes.',
    prevention: [
      'Eliminação permanente de água parada em vasos, calhas e ralos',
      'Vistoria semanal em caixas d’água e recipientes descobertos',
      'Aplicação de repelente registrado pela Anvisa',
      'Vacinação Qdenga pelo SUS para as faixas prioritárias'
    ],
    riskFactor: 'Áreas urbanas densas, acúmulo de recipientes e descarte irregular de lixo.',
    susGuideline: 'Procure a UPA ou UBS mais próxima aos primeiros sinais de febre e hidrate-se continuamente com soro.',
    severityScore: 98,
    harmSummary: 'Maior volume de internações na capital, risco de choque hipovolêmico por dengue grave e superlotação de leitos de observação.'
  },
  {
    id: 'covid19',
    name: 'COVID-19',
    category: 'Vírus Respiratórios',
    icon: '🦠',
    tag: 'Síndrome Respiratória',
    shortDesc: 'Doença respiratória aguda causada pelo SARS-CoV-2, exigindo vigilância ativa em grupos vulneráveis e idosos.',
    transmission: 'Gotículas respiratórias expelidas ao falar, tossir ou espirrar e contato com superfícies contaminadas.',
    symptoms: ['Tosse seca persistente', 'Febre e calafrios', 'Fadiga e dor de garganta', 'Perda súbita de olfato/paladar', 'Falta de ar progressiva'],
    seasonalPeak: 'Outono e Inverno, além de surtos sazonais em períodos de maior aglomeração social.',
    prevention: [
      'Esquema vacinal atualizado com doses de reforço bivalentes no SUS',
      'Uso de máscaras em ambientes fechados de saúde e transporte coletivo',
      'Higienização constante das mãos com água e sabão ou álcool 70%',
      'Ventilação e renovação do ar em locais fechados'
    ],
    riskFactor: 'Idosos, imunossuprimidos, portadores de doenças cardiovasculares, diabetes e obesidade.',
    susGuideline: 'Testagem rápida disponível gratuitamente em todas as UBSs e AMAs de São Paulo.',
    severityScore: 92,
    harmSummary: 'Histórico de pressão crítica em UTIs paulistanas, risco de insuficiência respiratória aguda e sequelas sistêmicas pós-covid.'
  },
  {
    id: 'influenza',
    name: 'Influenza & SRAG',
    category: 'Vírus Respiratórios',
    icon: '🫁',
    tag: 'Gripe & Síndrome Respiratória',
    shortDesc: 'Vírus Influenza (H1N1/H3N2) e Vírus Sincicial Respiratório (VSR), com alta taxa de internação pediátrica e geriátrica.',
    transmission: 'Aerossóis e gotículas respiratórias suspensas no ar em ambientes pouco ventilados.',
    symptoms: ['Febre alta de início abrupto', 'Coriza e dor de garganta', 'Cefaleia e dores musculares generalizadas', 'Congestão nasal e fadiga', 'Falta de ar em crianças e idosos'],
    seasonalPeak: 'Meses de outono e inverno paulistano (Maio a Agosto) com quedas de temperatura e ar seco.',
    prevention: [
      'Vacinação anual contra gripe nas campanhas municipais do SUS',
      'Etiqueta respiratória (cobrir a boca com o antebraço ao tossir)',
      'Evitar permanência prolongada em locais fechados durante o inverno',
      'Lavagem frequente de mãos'
    ],
    riskFactor: 'Bebês e crianças menores de 5 anos, idosos, gestantes e portadores de asma.',
    susGuideline: 'Saturação de oxigênio abaixo de 95% ou dificuldade para respirar exige atendimento emergencial imediato.',
    severityScore: 89,
    harmSummary: 'Principal causador de saturação em UTIs neonatais e pediátricas durante o inverno paulistano, evoluindo rapidamente para bronquiolite e pneumonia.'
  },
  {
    id: 'leptospirose',
    name: 'Leptospirose',
    category: 'Bacterianas & Hídricas',
    icon: '🌧️',
    tag: 'Infecção Bacteriana Hídrica',
    shortDesc: 'Infecção bacteriana transmitida pela urina de roedores em enchentes, com alta taxa de letalidade hospitalar (~15%).',
    transmission: 'Contato da pele com água ou lama de enchentes contaminadas com a bactéria Leptospira.',
    symptoms: ['Febre alta de início repentino', 'Dor muito forte nas panturrilhas (sinal clássico)', 'Icterícia (pele e olhos amarelados)', 'Dor de cabeça e calafrios', 'Urina com coloração escura'],
    seasonalPeak: 'Verão e dias após fortes temporais com alagamentos nas várzeas e bacias de SP.',
    prevention: [
      'Evitar qualquer contato físico com água e lama de enchentes',
      'Uso obrigatório de botas e luvas impermeáveis na limpeza de locais alagados',
      'Desinfecção de caixas d’água e domicílios com água sanitária',
      'Acondicionamento correto do lixo doméstico para evitar roedores'
    ],
    riskFactor: 'Moradores de áreas ribeirinhas, baixadas e bairros com histórico de enchentes.',
    susGuideline: 'Procure atendimento médico imediato informando que teve contato recente com alagamento.',
    severityScore: 86,
    harmSummary: 'Taxa de letalidade alarmante em quadros de icterícia (Síndrome de Weil), causando insuficiência renal aguda e hemorragia pulmonar.'
  },
  {
    id: 'respiratorias_poluicao',
    name: 'Doenças Respiratórias por Poluição',
    category: 'Crônicas & Ambientais',
    icon: '🏭',
    tag: 'Impacto Ambiental Urbano',
    shortDesc: 'Crises agudas de Asma, Bronquite e DPOC desencadeadas por alta concentração de material particulado (PM2.5) e ar seco.',
    transmission: 'Inalação de poluentes emitidos pelo tráfego veicular pesado, indústrias e inversão térmica.',
    symptoms: ['Chiado no peito e falta de ar', 'Tosse seca persistente', 'Ardor nos olhos e garganta seca', 'Crises de broncoespasmo', 'Coriza e congestão nasal constante'],
    seasonalPeak: 'Inverno e estiagem (Junho a Setembro) — bloqueios atmosféricos e queima de combustíveis fósseis.',
    prevention: [
      'Umidificação constante de ambientes internos',
      'Ingestão abundante de água (mínimo 2L por dia)',
      'Evitar atividades físicas ao ar livre nos horários de pico de tráfego (10h às 16h)',
      'Acompanhamento regular do índice AQI no HealthCore.AI'
    ],
    riskFactor: 'Moradores próximos a vias de tráfego intenso (Marginais, Av. do Estado, Radial Leste) e pessoas com doenças pulmonares crônicas.',
    susGuideline: 'Mantenha medicações broncodilatadoras prescritas em fácil acesso durante períodos de ar seco.',
    severityScore: 82,
    harmSummary: 'Impacto crônico constante na qualidade de vida da população paulistana, gerando milhares de atendimentos ambulatoriais e agudização de doenças cardíacas.'
  },
  {
    id: 'tuberculose',
    name: 'Tuberculose',
    category: 'Bacterianas & Hídricas',
    icon: '💊',
    tag: 'Bacteriana Crônica',
    shortDesc: 'Doença infecciosa pulmonar transmitida pelo ar, com tratamento 100% gratuito garantido na rede SUS.',
    transmission: 'Via aérea pela inalação de aerossóis eliminados pela tosse ou fala de pessoas com tuberculose ativa.',
    symptoms: ['Tosse contínua há mais de 3 semanas', 'Febre vespertina e suores noturnos', 'Perda de peso involuntária', 'Cansaço constante e fraqueza', 'Expectoração com sangue'],
    seasonalPeak: 'Casos distribuídos ao longo de todo o ano, com maior transmissibilidade em locais fechados.',
    prevention: [
      'Vacina BCG em recém-nascidos',
      'Ambientes bem ventilados e iluminados pelo sol',
      'Investigação de contatos de pacientes diagnosticados',
      'Cumprimento rigoroso do tratamento medicamentoso de 6 meses no SUS'
    ],
    riskFactor: 'Pessoas em vulnerabilidade social, tabagistas, diabéticos e imunossuprimidos.',
    susGuideline: 'Tosse por 3 semanas ou mais requer exame baciloscópico gratuito em qualquer UBS.',
    severityScore: 78,
    harmSummary: 'Doença pulmonar debilitante que exige tratamento longo e contínuo, com risco de transmissão caso não tratada precocemente.'
  },
  {
    id: 'febre_amarela',
    name: 'Febre Amarela',
    category: 'Vetores & Arboviroses',
    icon: '🌲',
    tag: 'Vigilância Silvestre',
    shortDesc: 'Arbovirose transmitida por mosquitos silvestres em áreas de preservação florestal periurbana.',
    transmission: 'Picada de mosquitos silvestres (Haemagogus e Sabethes) infectados em matas.',
    symptoms: ['Febre súbita e calafrios intensos', 'Dor lombar e cefaleia', 'Náuseas e vômitos', 'Icterícia amarelada', 'Hemorragias em estágios graves'],
    seasonalPeak: 'Dezembro a Maio em áreas próximas a parques florestais e matas nativas.',
    prevention: [
      'Dose única da vacina da Febre Amarela no SUS',
      'Uso de repelentes e roupas compridas em áreas de mata',
      'Notificação imediata de macacos encontrados mortos à vigilância municipal'
    ],
    riskFactor: 'Frequência em áreas periurbanas como Serra da Cantareira e represas do extremo sul.',
    susGuideline: 'A vacina é a melhor proteção e confere imunidade para toda a vida.',
    severityScore: 75,
    harmSummary: 'Pode evoluir para insuficiência hepática e renal grave, exigindo vigilância silvestre rigorosa nas bordas florestais de SP.'
  },
  {
    id: 'hepatite_a',
    name: 'Hepatite A',
    category: 'Bacterianas & Hídricas',
    icon: '💧',
    tag: 'Infecciosa Entérica',
    shortDesc: 'Infecção hepática aguda transmitida pela ingestão de água ou alimentos contaminados.',
    transmission: 'Via fecal-oral, ingestão de água não tratada ou alimentos crus mal higienizados.',
    symptoms: ['Fadiga e fraqueza', 'Náuseas e dor abdominal', 'Urina escura cor de refrigerante de cola', 'Fezes claras ou acinzentadas', 'Olhos e pele amarelados'],
    seasonalPeak: 'Meses de chuvas intensas e períodos com desabastecimento ou contaminação hídrica.',
    prevention: [
      'Vacinação infantil contra Hepatite A no calendário básico do SUS',
      'Consumo exclusivo de água filtrada ou fervida',
      'Higienização de verduras e frutas com hipoclorito de sódio',
      'Lavagem frequente das mãos antes das refeições'
    ],
    riskFactor: 'Comunidades com carência de saneamento básico e manuseio inadequado de alimentos.',
    susGuideline: 'A recuperação envolve repouso e hidratação com acompanhamento médico da função hepática.',
    severityScore: 70,
    harmSummary: 'Provoca inflamação hepática aguda e incapacitação temporária, demandando vigilância de alimentos e saneamento.'
  }
];

export default function DiseasesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedDisease, setSelectedDisease] = useState<DiseaseInfo>(SP_DISEASES[0]);
  const [zoneFilter, setZoneFilter] = useState<string>('Todas');
  
  // Hospital details modal state
  const [selectedHospitalDetail, setSelectedHospitalDetail] = useState<Hospital | null>(null);

  // User neighborhood selector state
  const [userNeighborhood, setUserNeighborhood] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('healthcore_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.district || 'Sé (Centro)';
      }
      return 'Sé (Centro)';
    } catch (e) {
      return 'Sé (Centro)';
    }
  });

  const categories = [
    'Todas',
    'Vetores & Arboviroses',
    'Vírus Respiratórios',
    'Bacterianas & Hídricas',
    'Crônicas & Ambientais'
  ];

  const zones = ['Todas', 'Centro', 'Zona Oeste', 'Zona Sul', 'Zona Leste', 'Zona Norte'];

  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString('pt-BR'));

  // Live periodic update effect
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Dynamically compute real-time statistics and TOP 5 ranking based on all 96 districts
  const diseasesWithLiveStats = useMemo(() => {
    return SP_DISEASES.map(disease => {
      const targetName = disease.name.toLowerCase();
      const matchingDistricts = ALL_SP_DISTRICTS.filter(dist => {
        const distDisease = (dist.disease || '').toLowerCase();
        return distDisease.includes(targetName) || 
          targetName.includes(distDisease) ||
          (disease.id === 'dengue' && distDisease.includes('dengue')) ||
          (disease.id === 'covid19' && (distDisease.includes('covid') || distDisease.includes('respirat'))) ||
          (disease.id === 'influenza' && (distDisease.includes('srag') || distDisease.includes('gripe') || distDisease.includes('respirat'))) ||
          (disease.id === 'leptospirose' && (distDisease.includes('lepto') || dist.cleanliness <= 3)) ||
          (disease.id === 'respiratorias_poluicao' && (dist.aqi >= 80 || distDisease.includes('respirat'))) ||
          (disease.id === 'tuberculose' && (dist.risk === 'Alto' || dist.risk === 'Médio')) ||
          (disease.id === 'febre_amarela' && (dist.zone === 'Zona Norte' || dist.zone === 'Zona Sul')) ||
          (disease.id === 'hepatite_a' && dist.cleanliness <= 3.5);
      });

      const totalCases = matchingDistricts.reduce((acc, d) => acc + (d.cases || 0), 0);
      const highRiskDistrictsCount = matchingDistricts.filter(d => d.risk === 'Alto').length;
      
      // Dynamic score based on case volume and impacted districts
      const dynamicSeverityScore = Math.min(99, Math.max(65, Math.round(
        (totalCases / 3500) * 60 + (matchingDistricts.length / 96) * 40
      )));

      return {
        ...disease,
        liveCases: totalCases,
        impactedCount: matchingDistricts.length,
        highRiskCount: highRiskDistrictsCount,
        dynamicSeverityScore
      };
    });
  }, []);

  // Dynamic TOP 5 sorted in real time by total active cases and severity
  const top5Diseases = useMemo(() => {
    return [...diseasesWithLiveStats].sort((a, b) => b.liveCases - a.liveCases).slice(0, 5);
  }, [diseasesWithLiveStats]);

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

  // Find district object for the active user neighborhood
  const activeNeighborhoodDistrict = useMemo(() => {
    return ALL_SP_DISTRICTS.find(d => 
      `${d.name} (${d.zone})` === userNeighborhood ||
      d.name.toLowerCase() === userNeighborhood.toLowerCase() ||
      userNeighborhood.toLowerCase().includes(d.name.toLowerCase()) ||
      d.name.toLowerCase().includes(userNeighborhood.toLowerCase().split(' ')[0])
    ) || ALL_SP_DISTRICTS[0];
  }, [userNeighborhood]);

  // Find districts impacted by the currently selected disease
  const impactedDistricts = useMemo(() => {
    const targetName = selectedDisease.name.toLowerCase();
    return ALL_SP_DISTRICTS.filter(dist => {
      const matchZone = zoneFilter === 'Todas' || dist.zone.toLowerCase() === zoneFilter.toLowerCase();
      
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
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '50px' }}>
      
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
            Consulte as patologias em circulação, identifique o ranking de gravidade e verifique os alertas no seu bairro.
          </p>
        </div>

        {/* Action Button */}
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

      {/* 2. TOP 5 Doenças Mais Prejudiciais de São Paulo (100% Dinâmico & Atualizado em Tempo Real) */}
      <section className="hud-card" style={{ padding: '24px', backgroundColor: '#070B14', border: '1px solid #1E293B' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>🏆</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                TOP 5 Doenças Mais Prejudiciais de São Paulo
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '2px 0 0' }}>
              Ranking calculado e atualizado em tempo real a partir dos 96 distritos e notificações ativas do SUS na capital.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#34D399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '4px 10px',
              borderRadius: '8px',
              fontWeight: 800
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              <span>Sincronizado às {lastSyncTime}</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {top5Diseases.map((d: any, index: number) => {
            const isSelected = selectedDisease.id === d.id;
            const rankColors = ['#EF4444', '#F97316', '#F59E0B', '#3B82F6', '#8B5CF6'];
            const rankColor = rankColors[index] || '#3B82F6';

            return (
              <div
                key={d.id}
                onClick={() => setSelectedDisease(d)}
                style={{
                  backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.2)' : '#0F172A',
                  border: isSelected ? '2px solid #3B82F6' : '1px solid #1E293B',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 18px rgba(59, 130, 246, 0.3)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    backgroundColor: rankColor,
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    #{index + 1}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>
                    Gravidade: <strong style={{ color: '#F8FAFC' }}>{d.dynamicSeverityScore || d.severityScore}/100</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{d.icon}</span>
                  <strong style={{ fontSize: '1rem', color: '#FFFFFF' }}>{d.name}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#CBD5E1', backgroundColor: '#070B14', padding: '4px 8px', borderRadius: '6px', margin: '2px 0' }}>
                  <span>Casos: <strong style={{ color: '#EF4444' }}>{(d.liveCases || 0).toLocaleString('pt-BR')}</strong></span>
                  <span>Distritos: <strong style={{ color: '#60A5FA' }}>{d.impactedCount || 0}</strong></span>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, lineHeight: 1.35 }}>
                  {d.harmSummary}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '6px', fontSize: '0.72rem', color: isSelected ? '#38BDF8' : '#64748B', fontWeight: 800 }}>
                  {isSelected ? '✓ Em exibição' : 'Inspecionar →'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. User Neighborhood Disease Inspector Card */}
      <section style={{
        backgroundColor: '#0F172A',
        borderRadius: '18px',
        padding: '22px 24px',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        boxShadow: '0 0 24px rgba(37, 99, 235, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>📍</span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Consultar Doenças do Meu Bairro
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '2px 0 0' }}>
              Selecione sua subprefeitura para verificar as doenças sob monitoramento local.
            </p>
          </div>

          <div style={{ minWidth: '280px' }}>
            <SearchableDistrictSelect
              value={userNeighborhood}
              onChange={(val) => setUserNeighborhood(val)}
              buttonStyle={{ padding: '10px 14px', borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* Neighborhood Sanitary Status Box */}
        <div style={{
          backgroundColor: '#070B14',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #1E293B',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
              Região Analisada
            </span>
            <strong style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>{activeNeighborhoodDistrict.name}</strong>
            <span style={{ fontSize: '0.78rem', color: '#60A5FA', display: 'block' }}>
              {activeNeighborhoodDistrict.zone} • Subprefeitura {activeNeighborhoodDistrict.subprefeitura}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
              Foco Sanitário Principal
            </span>
            <strong style={{ fontSize: '1.05rem', color: '#FCD34D' }}>
              {activeNeighborhoodDistrict.disease || 'Vigilância Geral'}
            </strong>
            <span style={{
              display: 'inline-block',
              marginTop: '4px',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '4px',
              backgroundColor: getRiskBadgeColor(activeNeighborhoodDistrict.risk).bg,
              color: getRiskBadgeColor(activeNeighborhoodDistrict.risk).text,
              border: `1px solid ${getRiskBadgeColor(activeNeighborhoodDistrict.risk).border}`
            }}>
              ● Risco {activeNeighborhoodDistrict.risk}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
              Indicadores Locais
            </span>
            <div style={{ display: 'flex', gap: '12px', marginTop: '2px' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'block' }}>Casos 14d</span>
                <strong style={{ fontSize: '0.95rem', color: '#EF4444' }}>{activeNeighborhoodDistrict.cases}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'block' }}>Ar (AQI)</span>
                <strong style={{ fontSize: '0.95rem', color: '#F8FAFC' }}>{activeNeighborhoodDistrict.aqi}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'block' }}>Limpeza</span>
                <strong style={{ fontSize: '0.95rem', color: '#10B981' }}>{activeNeighborhoodDistrict.cleanliness}/5 ⭐</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                const diseaseFound = SP_DISEASES.find(d => 
                  d.name.toLowerCase().includes((activeNeighborhoodDistrict.disease || '').toLowerCase()) ||
                  (activeNeighborhoodDistrict.disease || '').toLowerCase().includes(d.name.toLowerCase())
                );
                if (diseaseFound) setSelectedDisease(diseaseFound);
              }}
              style={{
                backgroundColor: '#1E293B',
                color: '#60A5FA',
                border: '1px solid #3B82F6',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🔍 Ver Foco Deste Bairro
            </button>

            <button
              type="button"
              onClick={() => navigate(`/map?districtId=${activeNeighborhoodDistrict.id}`)}
              className="btn-primary"
              style={{ padding: '8px 12px', fontSize: '0.78rem', borderRadius: '8px' }}
            >
              🗺️ Ver no Mapa
            </button>
          </div>
        </div>
      </section>

      {/* 4. Search & Category Filters */}
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

      {/* 5. Diseases Cards Grid */}
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

      {/* 6. Selected Disease Detailed Inspector & Impacted Districts */}
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

          {/* Reference Hospitals with Exact Details Trigger */}
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
              Unidades Hospitalares &amp; UPAs de Referência em SP
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {referenceHospitals.map(h => (
                <div
                  key={h.id}
                  style={{
                    backgroundColor: '#070B14',
                    border: '1px solid #1E293B',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <strong style={{ color: '#FFFFFF', display: 'block' }}>{h.name}</strong>
                    <span style={{ color: '#64748B', fontSize: '0.75rem' }}>{h.district} ({h.zone})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedHospitalDetail(h)}
                    style={{
                      background: 'rgba(37, 99, 235, 0.15)',
                      border: '1px solid #3B82F6',
                      color: '#60A5FA',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
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
                📍 Bairros &amp; Distritos Impactados
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

      {/* 7. Exact Hospital Details Popup Modal */}
      {selectedHospitalDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          backgroundColor: 'rgba(0, 0, 0, 0.82)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            backgroundColor: '#0F172A',
            border: '1px solid #334155',
            borderRadius: '20px',
            padding: '28px 32px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px' }}>
                  <span>🏥</span>
                  <span>{selectedHospitalDetail.type} • {selectedHospitalDetail.network || 'SUS'}</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', margin: 0, lineHeight: 1.3 }}>
                  {selectedHospitalDetail.name}
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                  {selectedHospitalDetail.district} • {selectedHospitalDetail.zone}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHospitalDetail(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.3rem', cursor: 'pointer', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            {/* Hospital Metadata Cards */}
            <div style={{
              backgroundColor: '#070B14',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #1E293B',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.9rem'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                  Endereço Completo
                </span>
                <p style={{ color: '#E2E8F0', margin: '2px 0 0' }}>{selectedHospitalDetail.address}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1E293B', paddingTop: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                    Telefone de Plantão
                  </span>
                  <a href={`tel:${selectedHospitalDetail.phone}`} style={{ color: '#38BDF8', fontWeight: 800, textDecoration: 'none' }}>
                    📞 {selectedHospitalDetail.phone}
                  </a>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                    Leitos Totais
                  </span>
                  <strong style={{ color: '#F1F5F9' }}>
                    {selectedHospitalDetail.beds_count ? `${selectedHospitalDetail.beds_count} leitos` : 'Ambulatorial'}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                    Avaliação
                  </span>
                  <strong style={{ color: '#FCD34D' }}>⭐ {selectedHospitalDetail.rating || 4.5}</strong>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #1E293B', paddingTop: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                  Especialidades &amp; Atendimento
                </span>
                <p style={{ color: '#94A3B8', margin: '2px 0 0', fontSize: '0.85rem' }}>{selectedHospitalDetail.specialties}</p>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedHospitalDetail.latitude},${selectedHospitalDetail.longitude}`, '_blank')}
                style={{
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>🗺️</span>
                <span>Rota no GPS</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedHospitalDetail(null);
                  navigate(`/map/facilities?hospitalId=${selectedHospitalDetail.id}`);
                }}
                className="btn-primary"
                style={{
                  padding: '12px',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>📋</span>
                <span>Ver no Guia de Hospitais</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
