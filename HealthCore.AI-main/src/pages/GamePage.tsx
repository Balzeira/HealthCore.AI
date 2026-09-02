import React, { useState, useEffect } from 'react';
import { ALL_SP_DISTRICTS } from '../data/spBoundaries';

interface Question {
  id: number;
  text: string;
  options: Array<{ id: string; text: string }>;
}

export default function GamePage() {
  const [mode, setMode] = useState<'quiz' | 'results'>('quiz');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Array<{ question_id: number; selected_option: string }>>([]);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let interval: any;
    if (mode === 'quiz') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [mode]);

  const questions: Question[] = [
    { id: 1, text: "Qual a melhor forma de evitar a proliferação do mosquito Aedes aegypti transmissor da Dengue?", options: [{ id: "A", text: "Usar máscara cirúrgica em locais públicos" }, { id: "B", text: "Eliminar recipientes com água parada em vasos, calhas e garrafas" }, { id: "C", text: "Aumentar o consumo de frutas cítricas" }, { id: "D", text: "Dormir com as janelas abertas" }] },
    { id: 2, text: "O que significa a sigla UBS no sistema público de saúde de São Paulo?", options: [{ id: "A", text: "Unidade Básica de Saúde" }, { id: "B", text: "União Brasileira de Socorro" }, { id: "C", text: "Urgência Básica Sanitária" }, { id: "D", text: "Unidade de Busca Sanitária" }] },
    { id: 3, text: "Para situações de infarto, acidentes graves e risco iminente de vida, onde procurar atendimento imediato?", options: [{ id: "A", text: "Farmácia Comunitária" }, { id: "B", text: "Unidade Básica de Saúde (UBS)" }, { id: "C", text: "Pronto-Socorro Hospitalar / UPA 24h" }, { id: "D", text: "Laboratório de Análises" }] },
    { id: 4, text: "Qual doença bacteriana grave está associada ao contato com águas de enchentes contaminadas por urina de roedores?", options: [{ id: "A", text: "Dengue" }, { id: "B", text: "Leptospirose" }, { id: "C", text: "Catapora" }, { id: "D", text: "Sarampo" }] },
    { id: 5, text: "Qual a principal medida preventiva contra surtos de Influenza (Gripe) na capital paulista?", options: [{ id: "A", text: "Vacinação anual nas Unidades Básicas de Saúde (UBS)" }, { id: "B", text: "Exposição ao sol ao meio-dia" }, { id: "C", text: "Uso de óculos escuros" }, { id: "D", text: "Uso de calçados impermeáveis" }] }
  ];

  const handleConfirmAnswer = () => {
    if (!selectedOption) return;

    const newAnswers = [...answers, { question_id: questions[currentIdx].id, selected_option: selectedOption }];
    setAnswers(newAnswers);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
    } else {
      const calculatedScore = newAnswers.length * 200;
      setScore(calculatedScore);
      setMode('results');
    }
  };

  const handleReset = () => {
    setMode('quiz');
    setCurrentIdx(0);
    setSelectedOption(null);
    setAnswers([]);
    setTimer(0);
    setScore(0);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (mode === 'results') {
    return (
      <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#FFFFFF', fontSize: '2.2rem', margin: '0 0 8px', fontWeight: 900 }}>
            Missão Concluída com Êxito! 🎖️
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0 }}>
            Sua capacitação apoia a conscientização comunitária na cidade de São Paulo.
          </p>
        </div>

        <div className="hud-card" style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: `conic-gradient(#10B981 100%, #1E293B 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ width: '110px', height: '110px', backgroundColor: '#070B14', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#3B82F6' }}>{score}</span>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 800 }}>PONTOS</span>
            </div>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px' }}>
            Especialista em Vigilância Sanitária SP
          </h2>
          <p style={{ fontSize: '1rem', color: '#94A3B8', margin: 0 }}>
            Tempo de prova: <strong>{formatTimer(timer)}</strong> • 100% de precisão
          </p>
        </div>

        <button onClick={handleReset} className="btn-primary" style={{ padding: '16px', fontSize: '1.05rem' }}>
          🔄 Realizar Nova Missão
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#FFFFFF', fontSize: '2rem', margin: 0, fontWeight: 900 }}>
            Missão do Agente de Saúde
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem', margin: '4px 0 0' }}>
            Desafio prático de saúde pública e primeiros socorros da capital paulista.
          </p>
        </div>

        <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', padding: '8px 18px', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
          ⏱ Tempo: {formatTimer(timer)}
        </span>
      </div>

      {/* Progress */}
      <div className="hud-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '10px' }}>
          <span>Questão {currentIdx + 1} de {questions.length}</span>
          <span style={{ color: '#3B82F6' }}>{Math.round(progress)}% Concluído</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#10B981', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="hud-card" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', lineHeight: 1.4, margin: 0, fontWeight: 800 }}>
          {currentQ.text}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQ.options.map(opt => {
            const isSelected = selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                style={{
                  padding: '18px 22px', borderRadius: '14px', textAlign: 'left', fontSize: '1rem',
                  display: 'flex', gap: '14px', alignItems: 'center', cursor: 'pointer',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : '#070B14',
                  border: isSelected ? '2px solid #3B82F6' : '1px solid #1E293B',
                  color: isSelected ? '#FFFFFF' : '#CBD5E1',
                  fontWeight: isSelected ? 800 : 600,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem',
                  backgroundColor: isSelected ? '#3B82F6' : '#1E293B',
                  color: '#FFFFFF', flexShrink: 0
                }}>
                  {opt.id}
                </div>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleConfirmAnswer}
          disabled={!selectedOption}
          className="btn-primary"
          style={{ width: '100%', padding: '18px', fontSize: '1.05rem', opacity: selectedOption ? 1 : 0.4, cursor: selectedOption ? 'pointer' : 'not-allowed' }}
        >
          {currentIdx + 1 === questions.length ? 'Finalizar Missão ▶' : 'Confirmar Resposta & Avançar ▶'}
        </button>
      </div>

    </div>
  );
}
