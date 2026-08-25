import React, { useState } from 'react';

export default function GamePage() {
  const [mode, setMode] = useState<'quiz' | 'results'>('quiz');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const questions = [
    {
      text: "Qual é a principal medida para evitar a proliferação do mosquito da dengue?",
      options: [
        { id: 'A', text: 'Usar repelente diariamente' },
        { id: 'B', text: 'Evitar água parada em recipientes' },
        { id: 'C', text: 'Tomar vacina anualmente' },
        { id: 'D', text: 'Manter janelas fechadas' }
      ]
    }
  ];

  const handleNext = () => {
    setMode('results');
  };

  const handleReset = () => {
    setMode('quiz');
    setSelectedOption(null);
    setCurrentQuestion(0);
  };

  if (mode === 'results') {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '430px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <header style={{ textAlign: 'center', paddingTop: '1rem' }}>
          <h1 style={{ color: '#0047AB', fontSize: '1.8rem', margin: '0 0 0.5rem' }}>Olá, Agente!</h1>
          <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>
            Sua contribuição está moldando uma São Paulo mais saudável.
          </p>
        </header>

        <section style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'conic-gradient(#34C759 85%, #eee 0)', marginBottom: '1rem' }}>
            <div style={{ width: '100px', height: '100px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>850</span>
              <span style={{ fontSize: '0.7rem', color: '#888' }}>pts</span>
            </div>
          </div>
          
          <div style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Missão Concluída
          </div>
          
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: '#333' }}>Guardião da Saúde Urbana</h2>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Você identificou corretamente os principais riscos na sua região.</p>
        </section>

        <section style={{ backgroundColor: '#0047AB', color: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,71,171,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>💡</span>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Dica de Prevenção</h3>
          </div>
          <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.9, lineHeight: '1.4' }}>
            A umidade atual favorece a proliferação de mosquitos. Verifique pratos de plantas e calhas na sua residência hoje.
          </p>
        </section>

        <section style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#333' }}>Seu Perfil de Saúde Urbana</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
              <span style={{ color: '#555' }}>Índice de Exposição Local</span>
              <span style={{ fontWeight: 'bold', color: '#F5A623' }}>Médio</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px' }}>
              <div style={{ width: '45%', height: '100%', backgroundColor: '#F5A623', borderRadius: '4px' }}></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>Qualidade do Ar</div>
              <div style={{ fontWeight: 'bold', color: '#34C759' }}>Boa</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>Risco Dengue</div>
              <div style={{ fontWeight: 'bold', color: '#F5A623' }}>Moderado</div>
            </div>
          </div>
          
          <ul style={{ margin: '1rem 0 0', paddingLeft: '1rem', fontSize: '0.85rem', color: '#555', lineHeight: '1.5' }}>
            <li><span style={{ color: '#34C759' }}>●</span> Pratique exercícios em parques locais no fim de tarde.</li>
            <li><span style={{ color: '#34C759' }}>●</span> Mantenha a vacinação em dia.</li>
          </ul>
        </section>

        <section style={{ backgroundColor: '#FFF5F5', border: '1px solid #FFE5E5', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ fontSize: '1.5rem', animation: 'pulse 2s infinite' }}>🔴</div>
          <div>
            <h4 style={{ margin: '0 0 4px', color: '#FF3B30', fontSize: '0.9rem' }}>AO VIVO: PRAÇA DA SÉ</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Alerta de foco de dengue reportado por 3 agentes nas últimas 2 horas. Evite áreas com água parada.</p>
          </div>
        </section>

        <button 
          onClick={handleReset}
          style={{ width: '100%', padding: '16px', backgroundColor: 'transparent', color: '#0047AB', border: '2px solid #0047AB', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginBottom: '2rem' }}
        >
          Jogar Novamente
        </button>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '430px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#0047AB', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Missão Agente de Saúde</h1>
        <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.4' }}>
          Teste seus conhecimentos sobre saúde urbana e ajude a proteger sua comunidade.
        </p>
      </header>

      <div style={{ marginBottom: '1.5rem' }}>
        <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' }}>
          <option>Sé, São Paulo</option>
          <option>Pinheiros, São Paulo</option>
        </select>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontWeight: 'bold', color: '#333' }}>Questão {currentQuestion + 1} de 10</span>
          <span style={{ fontSize: '0.8rem', color: '#888', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '12px' }}>00:45</span>
        </div>
        
        <h2 style={{ fontSize: '1.1rem', color: '#333', lineHeight: '1.4', marginBottom: '1.5rem' }}>
          {q.text}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {q.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOption(opt.id)}
              style={{
                padding: '16px', borderRadius: '12px', textAlign: 'left', fontSize: '0.95rem',
                display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer',
                backgroundColor: selectedOption === opt.id ? '#E6F0FA' : '#fff',
                border: selectedOption === opt.id ? '2px solid #0047AB' : '1px solid #ddd',
                color: selectedOption === opt.id ? '#0047AB' : '#444'
              }}
            >
              <div style={{ 
                width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                backgroundColor: selectedOption === opt.id ? '#0047AB' : '#f0f0f0',
                color: selectedOption === opt.id ? 'white' : '#666'
              }}>
                {opt.id}
              </div>
              {opt.text}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button 
          onClick={handleNext}
          disabled={!selectedOption}
          style={{ width: '100%', padding: '16px', backgroundColor: '#0047AB', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: selectedOption ? 'pointer' : 'not-allowed', opacity: selectedOption ? 1 : 0.5 }}
        >
          Confirmar Resposta
        </button>
      </div>
    </div>
  );
}
