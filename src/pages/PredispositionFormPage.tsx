import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { ALL_SP_DISTRICTS } from '../data/spBoundaries';
import SearchableDistrictSelect from '../components/SearchableDistrictSelect';

type StepData = {
  bairro: string;
  exercicio: string;
  freqExercicio: string;
  tabagismo: string;
  alimentacao: string;
  sono: string;
  alcool: string;
  historicoFamiliar: string[];
  condicoesCronicas: string[];
};

export default function PredispositionFormPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<StepData>({
    bairro: 'Sé (Centro)',
    exercicio: '',
    freqExercicio: '',
    tabagismo: '',
    alimentacao: '',
    sono: '',
    alcool: '',
    historicoFamiliar: [],
    condicoesCronicas: []
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  const handleNext = () => setStep(p => Math.min(p + 1, 4));
  const handlePrev = () => setStep(p => Math.max(p - 1, 1));

  const toggleArrayItem = (field: 'historicoFamiliar' | 'condicoesCronicas', item: string) => {
    if (item === 'Nenhuma') {
      setData(prev => ({ ...prev, [field]: ['Nenhuma'] }));
      return;
    }
    const current = data[field].filter(i => i !== 'Nenhuma');
    if (current.includes(item)) {
      setData(prev => ({ ...prev, [field]: current.filter(i => i !== item) }));
    } else {
      setData(prev => ({ ...prev, [field]: [...current, item] }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        district_name: data.bairro,
        habits: {
          exercicio: data.exercicio,
          freqExercicio: data.freqExercicio,
          tabagismo: data.tabagismo,
          alimentacao: data.alimentacao,
          sono: data.sono,
          alcool: data.alcool
        },
        family_history: data.historicoFamiliar,
        chronic_conditions: data.condicoesCronicas
      };

      const response = await api.post<any>('/predisposition/calculate', payload);
      if (response && response.results) {
        setReportData(response);
      } else {
        throw new Error('Formato de resposta inesperado do servidor.');
      }
    } catch (err: any) {
      console.warn('API error, executing fallback deterministic calculation:', err);
      // Deterministic fallback matching backend heuristic if offline
      const isSmoker = data.tabagismo.includes('Fumo');
      const isSedentary = data.exercicio === 'Não' || data.freqExercicio.includes('Raramente');
      const hasFamily = data.historicoFamiliar.some(f => f !== 'Nenhuma');
      const hasChronic = data.condicoesCronicas.some(c => c !== 'Nenhuma');

      setReportData({
        success: true,
        district: data.bairro,
        disclaimer: 'Este indicador é exclusivamente educativo e informativo, não constitui diagnóstico médico e não substitui a avaliação de um profissional de saúde.',
        methodology: 'Modelo heurístico baseado em fatores de risco de saúde pública da OMS e dados territoriais de São Paulo.',
        evaluated_at: new Date().toISOString(),
        results: [
          {
            dimension: 'Saúde Cardiovascular & Metabólica',
            risk_level: (isSmoker && isSedentary) || hasChronic ? 'Elevado' : (isSmoker || isSedentary || hasFamily) ? 'Moderado' : 'Baixo',
            factors: [
              ...(isSmoker ? ['Tabagismo ativo informado'] : []),
              ...(isSedentary ? ['Sedentarismo / baixa frequência de exercícios'] : []),
              ...(hasFamily ? ['Histórico familiar registrado'] : []),
              ...(hasChronic ? ['Condição metabólica ou pressórica preexistente'] : []),
              ...(!isSmoker && !isSedentary && !hasFamily && !hasChronic ? ['Hábitos e histórico favoráveis'] : [])
            ],
            recommendations: 'Monitore periodicamente sua pressão arterial e glicemia na UBS/clínica e priorize caminhadas regulares.'
          },
          {
            dimension: 'Vulnerabilidade Respiratória & Ambiente',
            risk_level: isSmoker || data.condicoesCronicas.some(c => c.includes('Asma') || c.includes('Bronquite')) ? 'Elevado' : 'Moderado',
            factors: [
              ...(isSmoker ? ['Inalação de fumaça de tabaco'] : []),
              'Exposição ao material particulado atmosférico da capital paulista',
              ...(data.condicoesCronicas.some(c => c.includes('Asma') || c.includes('Bronquite')) ? ['Histórico respiratório prévio'] : [])
            ],
            recommendations: 'Mantenha hidratação diária (mínimo 2 litros de água) e evite exercícios ao ar livre em dias de ar seco.'
          },
          {
            dimension: 'Exposição Ambiental a Vetores Urbanos',
            risk_level: 'Moderado',
            factors: [
              `Região de monitoramento: ${data.bairro}`,
              'Sazonalidade urbana favorável à proliferação de vetores em água parada'
            ],
            recommendations: 'Realize vistoria semanal no domicílio eliminando água acumulada em vasos e calhas.'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
    const l = (level || '').toLowerCase();
    if (l === 'elevado' || l === 'alto') {
      return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#F87171', label: 'Nível Elevado' };
    }
    if (l === 'moderado' || l === 'médio') {
      return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#FCD34D', label: 'Nível Moderado' };
    }
    return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#34D399', label: 'Nível Baixo' };
  };

  if (reportData) {
    return (
      <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', padding: '6px 18px', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem', marginBottom: '12px' }}>
            <span>🩺</span>
            <span>Avaliação Informativa Concluída</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px' }}>
            Indicador Informativo de Fatores de Risco
          </h1>
          <p style={{ fontSize: '1rem', color: '#94A3B8', margin: 0 }}>
            Análise exploratória combinando seus hábitos e histórico com o contexto urbano de <strong>{reportData.district}</strong>.
          </p>
        </div>

        {/* Mandatory Medical Disclaimer Alert Box */}
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>⚠️</span>
          <div>
            <strong style={{ fontSize: '0.9rem', color: '#FCD34D', display: 'block', marginBottom: '4px' }}>
              Aviso Importante de Responsabilidade Médica
            </strong>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
              {reportData.disclaimer || 'Este indicador é exclusivamente educativo e informativo, não constitui diagnóstico médico e não substitui a avaliação de um profissional de saúde.'}
            </p>
          </div>
        </div>

        {/* Results Dimensions Cards (No fake percentages, strictly qualitative) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reportData.results.map((res: any, i: number) => {
            const badge = getRiskBadge(res.risk_level);
            return (
              <div key={i} className="hud-card" style={{ padding: '24px', backgroundColor: '#0F172A', border: '1px solid #1E293B' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 800 }}>
                    {res.dimension}
                  </h3>
                  <span style={{
                    backgroundColor: badge.bg,
                    color: badge.text,
                    border: `1px solid ${badge.border}`,
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 800
                  }}>
                    ● {badge.label}
                  </span>
                </div>

                {/* Factors list */}
                <div style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                    Fatores Identificados
                  </span>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#CBD5E1', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    {res.factors.map((f: string, fIdx: number) => (
                      <li key={fIdx} style={{ marginBottom: '3px' }}>{f}</li>
                    ))}
                  </ul>
                </div>

                {/* Prevention guidance */}
                <div style={{ backgroundColor: '#070B14', padding: '14px 18px', borderRadius: '10px', border: '1px solid #1E293B' }}>
                  <strong style={{ fontSize: '0.8rem', color: '#60A5FA', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                    💡 Orientação Preventiva de Estilo de Vida
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                    {res.recommendations}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setReportData(null)}
            style={{
              backgroundColor: '#1E293B',
              color: '#FFFFFF',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            🔄 Recalcular Indicador
          </button>

          <button
            onClick={() => navigate('/methodology')}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.95rem', borderRadius: '12px' }}
          >
            📚 Entender a Metodologia
          </button>
        </div>

      </div>
    );
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', padding: '6px 18px', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem', marginBottom: '12px' }}>
          <span>🩺</span>
          <span>Saúde Preventiva & Hábitos</span>
        </div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px' }}>
          Indicador de Fatores de Risco
        </h1>
        <p style={{ fontSize: '1rem', color: '#94A3B8', margin: 0 }}>
          Mapeie como seus hábitos diários e histórico interagem com o ambiente urbano do seu bairro.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="hud-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {[
          { num: 1, label: 'Região' },
          { num: 2, label: 'Estilo de Vida' },
          { num: 3, label: 'Histórico Familiar' },
          { num: 4, label: 'Saúde Pessoal' }
        ].map(s => {
          const isCurrent = step === s.num;
          const isDone = step > s.num;
          return (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 800,
                backgroundColor: isCurrent ? '#A855F7' : isDone ? '#10B981' : '#1E293B',
                color: '#FFFFFF'
              }}>
                {isDone ? '✓' : s.num}
              </div>
              <span style={{ fontSize: '0.8rem', color: isCurrent ? '#FFFFFF' : '#64748B', fontWeight: isCurrent ? 800 : 600 }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form Container */}
      <div className="hud-card" style={{ padding: '32px', backgroundColor: '#0F172A', border: '1px solid #1E293B' }}>
        
        {/* Step 1: Bairro */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF', margin: '0 0 6px', fontWeight: 800 }}>
                1. Onde você reside ou passa a maior parte do tempo?
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#94A3B8', margin: 0 }}>
                O contexto territorial (qualidade do ar e focos sanitários) é considerado na análise.
              </p>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#CBD5E1', display: 'block', marginBottom: '8px' }}>
                Selecione sua Subprefeitura / Bairro:
              </label>
              <SearchableDistrictSelect
                value={data.bairro}
                onChange={(val) => setData({ ...data, bairro: val })}
                buttonStyle={{ padding: '14px', borderRadius: '12px' }}
              />
            </div>
          </div>
        )}

        {/* Step 2: Hábitos de Vida */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF', margin: '0 0 6px', fontWeight: 800 }}>
                2. Hábitos de Vida &amp; Atividade
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#94A3B8', margin: 0 }}>
                Informe sua rotina para estimarmos os fatores metabólicos e cardiovasculares.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                  Frequência de Exercício Físico:
                </label>
                <select
                  value={data.freqExercicio}
                  onChange={(e) => setData({ ...data, freqExercicio: e.target.value, exercicio: e.target.value.includes('Raramente') ? 'Não' : 'Sim' })}
                  style={{ width: '100%', backgroundColor: '#070B14', color: '#FFFFFF', border: '1px solid #334155', borderRadius: '10px', padding: '12px', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="">Selecione...</option>
                  <option value="3 ou mais vezes por semana">3 ou mais vezes por semana (Ativo)</option>
                  <option value="1 a 2 vezes por semana">1 a 2 vezes por semana (Moderado)</option>
                  <option value="Raramente ou nunca">Raramente ou nunca (Sedentário)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                  Uso de Tabaco / Cigarro:
                </label>
                <select
                  value={data.tabagismo}
                  onChange={(e) => setData({ ...data, tabagismo: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#070B14', color: '#FFFFFF', border: '1px solid #334155', borderRadius: '10px', padding: '12px', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="">Selecione...</option>
                  <option value="Não fumo">Não fumo</option>
                  <option value="Ex-fumante">Ex-fumante</option>
                  <option value="Fumo ocasionalmente">Fumo ocasionalmente / cigarro eletrônico</option>
                  <option value="Fumo diariamente">Fumo diariamente</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                  Padrão Alimentar Predominante:
                </label>
                <select
                  value={data.alimentacao}
                  onChange={(e) => setData({ ...data, alimentacao: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#070B14', color: '#FFFFFF', border: '1px solid #334155', borderRadius: '10px', padding: '12px', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="">Selecione...</option>
                  <option value="Equilibrada com vegetais e frutas">Equilibrada (vegetais, frutas e proteínas)</option>
                  <option value="Mista com consumo moderado de doces">Mista com consumo moderado de açúcar</option>
                  <option value="Ultraprocessados e fast-food">Predominância de ultraprocessados / fast-food</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                  Qualidade do Sono:
                </label>
                <select
                  value={data.sono}
                  onChange={(e) => setData({ ...data, sono: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#070B14', color: '#FFFFFF', border: '1px solid #334155', borderRadius: '10px', padding: '12px', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="">Selecione...</option>
                  <option value="7 a 8 horas reparadoras">7 a 8 horas (Sono reparador)</option>
                  <option value="5 a 6 horas irregulares">5 a 6 horas irregulares</option>
                  <option value="Menos de 5 horas">Menos de 5 horas (Insônia / privação crônica)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Histórico Familiar */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF', margin: '0 0 6px', fontWeight: 800 }}>
                3. Histórico Familiar (Pais, Irmãos e Avós)
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#94A3B8', margin: 0 }}>
                Selecione as condições presentes em familiares diretos:
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {[
                'Hipertensão Arterial',
                'Diabetes Tipo 2',
                'Infarto / Doença Cardíaca',
                'Asma ou Alergias Respiratórias',
                'Nenhuma'
              ].map(item => {
                const isSelected = data.historicoFamiliar.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleArrayItem('historicoFamiliar', item)}
                    style={{
                      padding: '12px 16px', borderRadius: '10px', textAlign: 'left', fontSize: '0.88rem',
                      backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.2)' : '#070B14',
                      border: isSelected ? '1.5px solid #A855F7' : '1px solid #1E293B',
                      color: isSelected ? '#FFFFFF' : '#CBD5E1',
                      fontWeight: isSelected ? 800 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '} {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Saúde Pessoal */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF', margin: '0 0 6px', fontWeight: 800 }}>
                4. Condições de Saúde Pessoais
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#94A3B8', margin: 0 }}>
                Você possui diagnóstico médico prévio de alguma das condições abaixo?
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {[
                'Hipertensão Diagnosticada',
                'Diabetes / Pré-Diabetes',
                'Asma ou Bronquite Crônica',
                'Colesterol Elevado',
                'Nenhuma'
              ].map(item => {
                const isSelected = data.condicoesCronicas.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleArrayItem('condicoesCronicas', item)}
                    style={{
                      padding: '12px 16px', borderRadius: '10px', textAlign: 'left', fontSize: '0.88rem',
                      backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.2)' : '#070B14',
                      border: isSelected ? '1.5px solid #A855F7' : '1px solid #1E293B',
                      color: isSelected ? '#FFFFFF' : '#CBD5E1',
                      fontWeight: isSelected ? 800 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '} {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #1E293B' }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              style={{ backgroundColor: '#1E293B', color: '#CBD5E1', border: '1px solid #334155', borderRadius: '10px', padding: '10px 20px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
            >
              ‹ Voltar
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.9rem', borderRadius: '10px' }}
            >
              Avançar ›
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '0.95rem', borderRadius: '10px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Calculando Indicadores...' : 'Calcular Indicadores de Risco 🩺'}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
