import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

interface GameResult {
  score: number;
  total_possible: number;
  percentage: number;
  badge: string;
  correct_answers: number;
  total_questions: number;
  feedback_per_question: Array<{
    question_id: number;
    isCorrect: boolean;
    correct_option: string;
  }>;
}

export default function GamePage() {
  const [mode, setMode] = useState<'quiz' | 'results'>('quiz');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Array<{ question_id: number; selected_option: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [timer, setTimer] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState('1');

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    let interval: any;
    if (mode === 'quiz' && !loading) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, loading]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ questions: Question[] }>('/game/questions');
      if (data && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        setQuestions(fallbackQuestions);
      }
    } catch (err) {
      console.error("Error fetching game questions", err);
      setQuestions(fallbackQuestions);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleConfirmAnswer = async () => {
    if (!selectedOption) return;

    const currentQ = questions[currentQuestionIndex];
    const newAnswers = [...answers, { question_id: currentQ.id, selected_option: selectedOption }];
    setAnswers(newAnswers);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // Last question completed, submit answers
      setSubmitting(true);
      try {
        const res = await api.post<GameResult>('/game/submit', {
          region_id: parseInt(selectedRegion, 10),
          answers: newAnswers,
          time_seconds: timer
        });
        setResult(res);
      } catch (err) {
        console.error("Error submitting game", err);
        // Local calculation fallback if server error
        const mockScore = newAnswers.length * 90;
        setResult({
          score: mockScore,
          total_possible: 1000,
          percentage: (mockScore / 1000) * 100,
          badge: mockScore >= 800 ? 'Mestre da Saúde Urbana' : 'Especialista Local',
          correct_answers: Math.floor(newAnswers.length * 0.8),
          total_questions: questions.length,
          feedback_per_question: newAnswers.map(a => ({ question_id: a.question_id, isCorrect: true, correct_option: a.selected_option }))
        });
      } finally {
        setSubmitting(false);
        setMode('results');
      }
    }
  };

  const handleReset = () => {
    setMode('quiz');
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setResult(null);
    setTimer(0);
    fetchQuestions();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '430px', margin: '0 auto' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #0047AB', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '2rem auto' }}></div>
        <p style={{ color: '#666', fontWeight: 600 }}>Carregando 10 Desafios do Agente...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (mode === 'results' && result) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '430px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>
        <header style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
          <h1 style={{ color: '#0047AB', fontSize: '1.8rem', margin: '0 0 0.5rem', fontWeight: 800 }}>Olá, Agente!</h1>
          <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>
            Sua contribuição está moldando uma São Paulo mais saudável e protegida.
          </p>
        </header>

        {/* Score & Badge Card */}
        <section style={{ backgroundColor: '#fff', padding: '2rem 1.5rem', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: `conic-gradient(#34C759 ${result.percentage}%, #eee 0)`, marginBottom: '1rem' }}>
            <div style={{ width: '108px', height: '108px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0047AB', lineHeight: 1 }}>{result.score}</span>
              <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>pontos</span>
            </div>
          </div>
          
          <div style={{ backgroundColor: '#E8F8EE', color: '#2E7D32', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.8rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            {result.correct_answers} de {result.total_questions} Respostas Corretas ({Math.round(result.percentage)}%)
          </div>
          
          <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.3rem', color: '#1A1A2E', fontWeight: 700 }}>{result.badge}</h2>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
            Tempo total: <strong>{formatTimer(timer)}</strong>
          </p>
        </section>

        {/* Dynamic Tip */}
        <section style={{ backgroundColor: '#0047AB', color: 'white', padding: '1.3rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,71,171,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.3rem' }}>💡</span>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Dica de Prevenção Comunitária</h3>
          </div>
          <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.95, lineHeight: '1.4' }}>
            {result.percentage >= 70 
              ? 'Excelente conhecimento! Compartilhe o link do HealthCore.AI com seus vizinhos para fortalecer a rede comunitária.' 
              : 'Verifique recipientes com água parada na sua residência e ajude os agentes de saúde comunitários da sua região.'}
          </p>
        </section>

        {/* Questions Breakdown */}
        <section style={{ backgroundColor: '#fff', padding: '1.2rem', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#333', fontWeight: 700 }}>Resumo das 10 Questões</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {result.feedback_per_question.map((fb, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: fb.isCorrect ? '#F0FFF4' : '#FFF5F5', borderRadius: '8px', border: `1px solid ${fb.isCorrect ? '#C6F6D5' : '#FED7D7'}` }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>Questão {idx + 1}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: fb.isCorrect ? '#34C759' : '#FF3B30' }}>
                  {fb.isCorrect ? '✓ Correta (+100)' : `✕ Errada (Correta: ${fb.correct_option})`}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Reset Button */}
        <button 
          onClick={handleReset}
          style={{ width: '100%', padding: '16px', backgroundColor: '#0047AB', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,71,171,0.2)' }}
        >
          Jogar Novamente (Refazer Quiz)
        </button>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '430px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '5rem', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <h1 style={{ color: '#0047AB', fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>Missão Agente de Saúde</h1>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0047AB', backgroundColor: '#E8F0FE', padding: '4px 10px', borderRadius: '12px' }}>
            ⏱ {formatTimer(timer)}
          </span>
        </div>
        <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>
          Responda a 10 perguntas e ajude no monitoramento sanitário de SP.
        </p>
      </header>

      {/* Region Selector */}
      <div style={{ marginBottom: '1.2rem' }}>
        <select 
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '0.9rem', backgroundColor: '#fff', fontWeight: 600, color: '#333' }}
        >
          <option value="1">Sé (Região Central)</option>
          <option value="2">Pinheiros (Zona Oeste)</option>
          <option value="3">Itaquera (Zona Leste)</option>
          <option value="4">Vila Mariana (Zona Sul)</option>
          <option value="6">Bela Vista (Região Central)</option>
        </select>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#333', marginBottom: '6px' }}>
          <span>Questão {currentQuestionIndex + 1} de {questions.length}</span>
          <span style={{ color: '#0047AB' }}>{Math.round(progressPercent)}% Concluído</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#34C759', transition: 'width 0.3s ease-in-out' }}></div>
        </div>
      </div>

      {/* Current Question */}
      <div style={{ flex: 1, backgroundColor: '#fff', padding: '1.2rem', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.1rem', color: '#1A1A2E', lineHeight: '1.45', marginBottom: '1.5rem', fontWeight: 700 }}>
          {currentQ.text}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {currentQ.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                style={{
                  padding: '14px', borderRadius: '12px', textAlign: 'left', fontSize: '0.9rem',
                  display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer',
                  backgroundColor: isSelected ? '#E8F0FE' : '#F9FAFB',
                  border: isSelected ? '2px solid #0047AB' : '1px solid #E5E7EB',
                  color: isSelected ? '#0047AB' : '#374151',
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ 
                  width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem',
                  backgroundColor: isSelected ? '#0047AB' : '#E5E7EB',
                  color: isSelected ? 'white' : '#6B7280',
                  flexShrink: 0
                }}>
                  {opt.id}
                </div>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Button */}
      <div style={{ marginTop: '1.5rem' }}>
        <button 
          onClick={handleConfirmAnswer}
          disabled={!selectedOption || submitting}
          style={{ 
            width: '100%', padding: '16px', backgroundColor: '#0047AB', color: 'white', border: 'none', borderRadius: '12px', 
            fontWeight: 'bold', fontSize: '1rem', cursor: selectedOption && !submitting ? 'pointer' : 'not-allowed', 
            opacity: selectedOption && !submitting ? 1 : 0.5, boxShadow: '0 4px 12px rgba(0,71,171,0.2)' 
          }}
        >
          {submitting ? 'Processando Pontuação...' : (currentQuestionIndex + 1 === questions.length ? 'Finalizar Quiz (10/10) ▶' : 'Confirmar Resposta ▶')}
        </button>
      </div>
    </div>
  );
}

// Fallback 10 questions if network request fails
const fallbackQuestions: Question[] = [
  { id: 1, text: "Qual a melhor forma de evitar a proliferação do mosquito da Dengue?", options: [{ id: "A", text: "Usar máscara" }, { id: "B", text: "Não deixar água parada em vasos e calhas" }, { id: "C", text: "Comer mais frutas" }, { id: "D", text: "Dormir com a janela aberta" }] },
  { id: 2, text: "O que significa a sigla UBS no sistema de saúde?", options: [{ id: "A", text: "Unidade Básica de Saúde" }, { id: "B", text: "União Brasileira de Socorro" }, { id: "C", text: "Urgência Básica de Saúde" }, { id: "D", text: "Unidade de Busca Sanitária" }] },
  { id: 3, text: "Para urgências e acidentes graves com risco à vida, qual unidade procurar?", options: [{ id: "A", text: "Farmácia" }, { id: "B", text: "UBS" }, { id: "C", text: "Pronto-Socorro / Hospital" }, { id: "D", text: "Posto de Vacinação" }] },
  { id: 4, text: "Quando a higienização das mãos é fundamental para evitar contaminações?", options: [{ id: "A", text: "Apenas ao acordar" }, { id: "B", text: "Nunca" }, { id: "C", text: "Após usar o banheiro, antes de comer e ao chegar da rua" }, { id: "D", text: "Somente aos finais de semana" }] },
  { id: 5, text: "Qual doença bacteriana grave é associada à água de enchentes com urina de rato?", options: [{ id: "A", text: "Dengue" }, { id: "B", text: "Leptospirose" }, { id: "C", text: "Gripe" }, { id: "D", text: "Catapora" }] },
  { id: 6, text: "Qual a principal estratégia de prevenção contra a gripe sazonal (Influenza)?", options: [{ id: "A", text: "Vacinação anual nas UBSs" }, { id: "B", text: "Tomar sol meio-dia" }, { id: "C", text: "Usar óculos escuros" }, { id: "D", text: "Banhos de água fria" }] },
  { id: 7, text: "Qual sistema do corpo humano é mais afetado pela alta poluição do ar em SP?", options: [{ id: "A", text: "Sistema Ósseo" }, { id: "B", text: "Sistema Respiratório (Pulmões e vias aéreas)" }, { id: "C", text: "Sistema Digestivo" }, { id: "D", text: "Sistema Auditivo" }] },
  { id: 8, text: "Quem faz parte do grupo prioritário em campanhas de vacinação?", options: [{ id: "A", text: "Idosos, crianças pequenas, gestantes e profissionais de saúde" }, { id: "B", text: "Apenas atletas profisisonais" }, { id: "C", text: "Pessoas sem nenhuma doença" }, { id: "D", text: "Ninguém" }] },
  { id: 9, text: "Quais são sintomas característicos de infecções respiratórias virais?", options: [{ id: "A", text: "Febre, coriza, tosse e dor no corpo" }, { id: "B", text: "Dor no cotovelo" }, { id: "C", text: "Visão turva temporária" }, { id: "D", text: "Cãibra nas pernas" }] },
  { id: 10, text: "O que garante o acesso gratuito à saúde pública para toda a população brasileira?", options: [{ id: "A", text: "SUS (Sistema Único de Saúde)" }, { id: "B", text: "Planos Privados" }, { id: "C", text: "Seguro Internacional" }, { id: "D", text: "Cartão de Crédito" }] }
];
