import React, { useState } from 'react';
import { api } from '../api/client';

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
    bairro: '',
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

  const bairros = ['Pinheiros', 'Bela Vista', 'Moema', 'Sé', 'Vila Mariana'];

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
    try {
      // const res = await api.post('/api/predisposition/calculate', data);
      // Simulate API response for now
      setTimeout(() => {
        setResults([
          { name: 'Doença Cardiovascular', risk: 'Alto', score: 75, color: '#FF3B30', factors: ['Histórico Familiar', 'Tabagismo'], recs: 'Agende um cardiologista.' },
          { name: 'Diabetes Tipo 2', risk: 'Moderado', score: 45, color: '#F5A623', factors: ['Alimentação irregular'], recs: 'Melhore a dieta.' }
        ]);
        setLoading(false);
      }, 1500);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (results) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '430px', margin: '0 auto' }}>
        <h1 style={{ color: '#0047AB', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Resultados da Análise</h1>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem' }}>Perfil de saúde mapeado com sucesso.</p>
        
        {results.map((res: any, i: number) => (
          <div key={i} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#333' }}>{res.name}</h3>
              <span style={{ backgroundColor: res.color, color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Risco {res.risk}</span>
            </div>
            
            <div style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px', marginBottom: '1rem' }}>
              <div style={{ width: `${res.score}%`, height: '100%', backgroundColor: res.color, borderRadius: '4px' }}></div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#555' }}>Fatores de Risco:</strong>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#666' }}>
                {res.factors.map((f: string, j: number) => <li key={j}>{f}</li>)}
              </ul>
            </div>
            
            <div style={{ backgroundColor: '#f0f8ff', padding: '1rem', borderRadius: '8px' }}>
              <strong style={{ fontSize: '0.85rem', color: '#0047AB' }}>Recomendação:</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#444' }}>{res.recs}</p>
            </div>
          </div>
        ))}

        <div style={{ fontSize: '0.75rem', color: '#888', textAlign: 'center', marginTop: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          Seus dados são processados de forma anônima e utilizados apenas para gerar indicadores de saúde pública regional em conformidade com a LGPD.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '430px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#0047AB', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Análise de Predisposição</h1>
        <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.4' }}>
          Responda algumas perguntas para mapearmos seu perfil de saúde institucional.
        </p>
      </header>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#0047AB', marginBottom: '0.5rem' }}>
          <span>PASSO {step} DE 4</span>
          <span>{step * 25}%</span>
        </div>
        <div style={{ width: '100%', height: '6px', backgroundColor: '#eee', borderRadius: '3px' }}>
          <div style={{ width: `${step * 25}%`, height: '100%', backgroundColor: '#0047AB', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {step === 1 && (
          <div className="step-content">
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333' }}>Onde você mora?</h2>
            <input 
              type="text" 
              placeholder="Ex: Pinheiros, São Paulo" 
              value={data.bairro}
              onChange={e => setData({...data, bairro: e.target.value})}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', marginBottom: '1rem', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {bairros.map(b => (
                <span 
                  key={b} 
                  onClick={() => setData({...data, bairro: b})}
                  style={{ 
                    padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', cursor: 'pointer',
                    backgroundColor: data.bairro === b ? '#0047AB' : '#f0f0f0',
                    color: data.bairro === b ? 'white' : '#555'
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#333' }}>Hábitos de Saúde</h2>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Pratica exercícios regularmente?</label>
              <select value={data.exercicio} onChange={e => setData({...data, exercicio: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <option value="">Selecione...</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Horas de sono por noite</label>
              <select value={data.sono} onChange={e => setData({...data, sono: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <option value="">Selecione...</option>
                <option value="<5h">&lt; 5h</option>
                <option value="5-6h">5-6h</option>
                <option value="7-8h">7-8h</option>
                <option value="8+h">8+h</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#333' }}>Histórico Familiar</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Diabetes', 'Doenças Cardíacas', 'Câncer', 'Hipertensão', 'Doenças Respiratórias'].map(cond => (
                <label key={cond} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: data.historicoFamiliar.includes(cond) ? '2px solid #0047AB' : '2px solid transparent' }}>
                  <input 
                    type="checkbox" 
                    checked={data.historicoFamiliar.includes(cond)}
                    onChange={() => toggleArrayItem('historicoFamiliar', cond)}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span style={{ fontWeight: 500 }}>{cond}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content">
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#333' }}>Condições Crônicas Existentes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Diabetes', 'Hipertensão', 'Obesidade', 'Asma', 'Doença Cardíaca', 'Nenhuma'].map(cond => (
                <label key={cond} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: data.condicoesCronicas.includes(cond) ? '2px solid #0047AB' : '2px solid transparent' }}>
                  <input 
                    type="checkbox" 
                    checked={data.condicoesCronicas.includes(cond)}
                    onChange={() => toggleArrayItem('condicoesCronicas', cond)}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span style={{ fontWeight: 500 }}>{cond}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
        {step > 1 && (
          <button onClick={handlePrev} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f0f0f0', border: 'none', color: '#333', fontWeight: 600, flex: 1, cursor: 'pointer' }}>
            &lt; Voltar
          </button>
        )}
        {step < 4 ? (
          <button onClick={handleNext} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#0047AB', border: 'none', color: 'white', fontWeight: 600, flex: 2, cursor: 'pointer' }}>
            Próximo &gt;
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#34C759', border: 'none', color: 'white', fontWeight: 600, flex: 2, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Processando...' : 'Finalizar Análise'}
          </button>
        )}
      </div>
    </div>
  );
}
