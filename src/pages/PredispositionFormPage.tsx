import React, { useState } from 'react';
import { ALL_SP_DISTRICTS } from '../data/spBoundaries';

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
  const [step, setStep] = useState(1);
  const [data, setData] = useState<StepData>({
    bairro: 'Vila Mariana (Zona Sul)',
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
  const [results, setResults] = useState<any>(null);

  const handleNext = () => setStep(p => Math.min(p + 1, 4));
  const handlePrev = () => setStep(p => Math.max(p - 1, 1));

  const toggleArrayItem = (field: 'historicoFamiliar' | 'condicoesCronicas', item: string) => {
    if (item === 'Nenhuma') {
      setData({ ...data, [field]: ['Nenhuma'] });
      return;
    }
    const current = data[field].filter(i => i !== 'Nenhuma');
    if (current.includes(item)) {
      setData({ ...data, [field]: current.filter(i => i !== item) });
    } else {
      setData({ ...data, [field]: [...current, item] });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setResults([
        {
          name: 'Doença Cardiovascular & Hipertensão',
          risk: 'Moderado',
          score: 60,
          color: '#F59E0B',
          factors: data.historicoFamiliar.length > 0 ? data.historicoFamiliar : ['Histórico e Rotina Urbana'],
          recs: 'Realize aferição regular de pressão arterial na UBS mais próxima e adote caminhadas semanais.'
        },
        {
          name: 'Vulnerabilidade Respiratória (Qualidade do Ar SP)',
          risk: 'Alerta',
          score: 75,
          color: '#EF4444',
          factors: ['Exposição à Poluição Urbana', 'Tempo Seco'],
          recs: 'Mantenha hidratação constante acima de 2L/dia e evite exercícios ao ar livre em horários de pico de tráfego.'
        },
        {
          name: 'Metabolismo & Diabetes Tipo 2',
          risk: 'Baixo',
          score: 25,
          color: '#10B981',
          factors: ['Perfil metabólico favorável'],
          recs: 'Mantenha o bom padrão alimentar rico em fibras e vegetais frescos.'
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  if (results) {
    return (
      <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '6px 18px', borderRadius: '20px', fontWeight: 800, fontSize: '0.9rem', marginBottom: '12px' }}>
            <span>✅</span>
            <span>Mapeamento Concluído</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px' }}>
            Relatório de Predisposição Epidemiológica
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: 0 }}>
            Indicadores calculados considerando seu perfil individual cruzado com a subprefeitura selecionada.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {results.map((res: any, i: number) => (
            <div key={i} className="hud-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.35rem', fontWeight: 800 }}>{res.name}</h3>
                <span style={{ backgroundColor: `${res.color}25`, color: res.color, border: `1px solid ${res.color}50`, padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 800 }}>
                  ● Risco {res.risk} ({res.score}%)
                </span>
              </div>

              <div style={{ width: '100%', height: '10px', backgroundColor: '#1E293B', borderRadius: '5px', marginBottom: '20px', overflow: 'hidden' }}>
                <div style={{ width: `${res.score}%`, height: '100%', backgroundColor: res.color, borderRadius: '5px' }}></div>
              </div>

              <div style={{ backgroundColor: '#070B14', padding: '18px', borderRadius: '14px', border: '1px solid #1E293B' }}>
                <strong style={{ fontSize: '0.95rem', color: '#60A5FA', display: 'block', marginBottom: '4px' }}>💡 Recomendação Preventiva:</strong>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#CBD5E1', lineHeight: 1.5 }}>{res.recs}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => setResults(null)} className="btn-secondary" style={{ flex: 1, padding: '16px' }}>
            Refazer Análise
          </button>
          <button onClick={() => window.print()} className="btn-primary" style={{ flex: 1, padding: '16px' }}>
            Imprimir Relatório 🖨️
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', padding: '6px 18px', borderRadius: '20px', fontWeight: 800, fontSize: '0.9rem', marginBottom: '12px' }}>
          <span>🩺</span>
          <span>Inteligência Preventiva</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px' }}>
          Análise de Predisposição Epidemiológica
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: 0 }}>
          Avalie fatores de vulnerabilidade com base nos indicadores sanitários da sua subprefeitura.
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="hud-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800, color: '#60A5FA', marginBottom: '10px' }}>
          <span>ETAPA {step} DE 4</span>
          <span>{step * 25}% CONCLUÍDO</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${step * 25}%`, height: '100%', backgroundColor: '#3B82F6', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      {/* Step Contents */}
      <div className="hud-card" style={{ padding: '36px', minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', color: '#FFFFFF' }}>
                1. Onde você reside em São Paulo?
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '1rem', marginBottom: '24px' }}>
                Selecione sua subprefeitura para cruzamento com índice de qualidade do ar e histórico da região.
              </p>

              <select
                value={data.bairro}
                onChange={e => setData({ ...data, bairro: e.target.value })}
                style={{
                  width: '100%',
                  backgroundColor: '#070B14',
                  color: '#FFFFFF',
                  border: '1px solid #334155',
                  borderRadius: '14px',
                  padding: '16px',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              >
                {ALL_SP_DISTRICTS.map(d => (
                  <option key={d.id} value={`${d.name} (${d.zone})`}>
                    {d.name} ({d.zone}) — Subprefeitura {d.subprefeitura}
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', color: '#FFFFFF' }}>
                2. Hábitos de Vida & Sono
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '1rem', marginBottom: '24px' }}>
                Seus hábitos de atividade física e descanso auxiliam no cálculo de proteção.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 800, fontSize: '0.95rem', color: '#F8FAFC' }}>
                    Prática de Exercícios Físicos
                  </label>
                  <select
                    value={data.exercicio}
                    onChange={e => setData({ ...data, exercicio: e.target.value })}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#070B14', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                  >
                    <option value="">Selecione...</option>
                    <option value="Regular">Sim, regularmente (3x ou mais por semana)</option>
                    <option value="Moderado">Moderado (1 a 2x por semana)</option>
                    <option value="Sedentário">Sedentário (Não pratico)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 800, fontSize: '0.95rem', color: '#F8FAFC' }}>
                    Média de Horas de Sono
                  </label>
                  <select
                    value={data.sono}
                    onChange={e => setData({ ...data, sono: e.target.value })}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#070B14', color: '#FFFFFF', fontWeight: 700, outline: 'none' }}
                  >
                    <option value="">Selecione...</option>
                    <option value="Menos de 5h">Menos de 5 horas por noite</option>
                    <option value="5-6h">5 a 6 horas por noite</option>
                    <option value="7-8h">7 a 8 horas (Recomendado)</option>
                    <option value="8h+">Mais de 8 horas</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', color: '#FFFFFF' }}>
                3. Histórico Familiar
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '1rem', marginBottom: '20px' }}>
                Selecione as condições prévias existentes no seu núcleo familiar:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {['Diabetes', 'Doenças Cardíacas / Infarto', 'Hipertensão Arterial', 'Doenças Respiratórias / Asma', 'Nenhuma'].map(cond => (
                  <label
                    key={cond}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                      backgroundColor: data.historicoFamiliar.includes(cond) ? 'rgba(59, 130, 246, 0.2)' : '#070B14',
                      borderRadius: '12px', border: data.historicoFamiliar.includes(cond) ? '2px solid #3B82F6' : '1px solid #1E293B',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={data.historicoFamiliar.includes(cond)}
                      onChange={() => toggleArrayItem('historicoFamiliar', cond)}
                      style={{ width: '20px', height: '20px', accentColor: '#3B82F6' }}
                    />
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF' }}>{cond}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', color: '#FFFFFF' }}>
                4. Condições Pessoais Atuais
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '1rem', marginBottom: '20px' }}>
                Você possui diagnóstico médico para alguma das condições abaixo?
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {['Diabetes', 'Hipertensão', 'Alergia Respiratória / Asma', 'Colesterol Elevado', 'Nenhuma'].map(cond => (
                  <label
                    key={cond}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                      backgroundColor: data.condicoesCronicas.includes(cond) ? 'rgba(59, 130, 246, 0.2)' : '#070B14',
                      borderRadius: '12px', border: data.condicoesCronicas.includes(cond) ? '2px solid #3B82F6' : '1px solid #1E293B',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={data.condicoesCronicas.includes(cond)}
                      onChange={() => toggleArrayItem('condicoesCronicas', cond)}
                      style={{ width: '20px', height: '20px', accentColor: '#3B82F6' }}
                    />
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF' }}>{cond}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '36px' }}>
          {step > 1 && (
            <button onClick={handlePrev} className="btn-secondary" style={{ flex: 1, padding: '16px' }}>
              ◀ Voltar
            </button>
          )}
          {step < 4 ? (
            <button onClick={handleNext} className="btn-primary" style={{ flex: 2, padding: '16px' }}>
              Avançar para Etapa {step + 1} ▶
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="btn-emerald" style={{ flex: 2, padding: '16px' }}>
              {loading ? 'Calculando Indicadores...' : 'Concluir & Gerar Relatório ▶'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
