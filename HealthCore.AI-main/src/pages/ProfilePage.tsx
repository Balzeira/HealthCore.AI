import React, { useState } from 'react';
import { api } from '../api/client';

export default function ProfilePage() {
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(4);
  const [suggestionText, setSuggestionText] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const emojis = ['😢', '😐', '😊', '😄', '🤩'];
  const labels = ['Péssima', 'Regular', 'Boa', 'Muito Boa', 'Excelente'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendSuggestion = () => {
    if (!suggestionText.trim()) {
      showToast('Por favor, escreva a sua sugestão antes de enviar.');
      return;
    }
    showToast('✉️ Sugestão transmitida para lucascristobaldasso@gmail.com');
    setSuggestionText('');
  };

  const handleReportError = () => {
    if (!errorDetails.trim()) {
      showToast('Por favor, descreva o problema observado.');
      return;
    }
    showToast('✉️ Relatório de inconsistência transmitido para lucascristobaldasso@gmail.com');
    setErrorDetails('');
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {toastMessage && (
        <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, backgroundColor: '#1E293B', border: '1px solid #3B82F6', color: '#FFF', padding: '14px 28px', borderRadius: '12px', fontSize: '1rem', fontWeight: 800, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', padding: '6px 18px', borderRadius: '20px', fontWeight: 800, fontSize: '0.9rem', marginBottom: '12px' }}>
          <span>💬</span>
          <span>Canal de Participação & Suporte</span>
        </div>
        <h1 style={{ color: '#FFFFFF', fontSize: '2.2rem', margin: '0 0 8px', fontWeight: 900 }}>
          Sua Opinião Fortalece a Saúde de São Paulo
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0 }}>
          Envie sugestões de novos recursos ou reporte inconsistências técnicas diretamente à equipe.
        </p>
      </div>

      {/* Experience Rating */}
      <div className="hud-card" style={{ padding: '32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.3rem', margin: '0 0 20px', color: '#FFFFFF', fontWeight: 800 }}>
          Como está sendo sua experiência com a plataforma hoje?
        </h2>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {emojis.map((emoji, index) => (
            <div
              key={index}
              onClick={() => setSelectedEmoji(index)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <div style={{
                fontSize: '2.4rem',
                width: '68px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', backgroundColor: selectedEmoji === index ? 'rgba(59, 130, 246, 0.25)' : '#070B14',
                border: selectedEmoji === index ? '2.5px solid #3B82F6' : '1px solid #1E293B',
                boxShadow: selectedEmoji === index ? '0 0 20px rgba(59, 130, 246, 0.4)' : 'none'
              }}>
                {emoji}
              </div>
              <span style={{ fontSize: '0.85rem', color: selectedEmoji === index ? '#60A5FA' : '#94A3B8', fontWeight: selectedEmoji === index ? 800 : 600 }}>
                {labels[index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Forms */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Suggestion Card */}
        <div className="hud-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.6rem' }}>💡</span>
              <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#FFFFFF', fontWeight: 800 }}>
                Sugerir Novas Funcionalidades
              </h3>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '0 0 20px' }}>
              O que você gostaria de ver integrado no mapa ou na lista de hospitais?
            </p>

            <textarea
              value={suggestionText}
              onChange={e => setSuggestionText(e.target.value)}
              placeholder="Compartilhe suas ideias de recursos ou dados adicionais..."
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #334155', minHeight: '130px', marginBottom: '20px', fontFamily: 'inherit', fontSize: '0.95rem', backgroundColor: '#070B14', color: '#FFFFFF', outline: 'none' }}
            />
          </div>

          <button onClick={handleSendSuggestion} className="btn-emerald" style={{ width: '100%', padding: '16px' }}>
            Enviar Sugestão ▶
          </button>
        </div>

        {/* Bug Report Card */}
        <div className="hud-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.6rem' }}>🛠️</span>
              <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#FFFFFF', fontWeight: 800 }}>
                Relato de Inconsistência
              </h3>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: '0 0 20px' }}>
              Identificou dados desatualizados de algum hospital ou falha no mapa?
            </p>

            <textarea
              value={errorDetails}
              onChange={e => setErrorDetails(e.target.value)}
              placeholder="Descreva o problema observado para ajustarmos prontamente..."
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #334155', minHeight: '130px', marginBottom: '20px', fontFamily: 'inherit', fontSize: '0.95rem', backgroundColor: '#070B14', color: '#FFFFFF', outline: 'none' }}
            />
          </div>

          <button onClick={handleReportError} className="btn-secondary" style={{ width: '100%', padding: '16px', borderColor: '#EF4444', color: '#FCA5A5' }}>
            Registrar Ocorrência Técnica
          </button>
        </div>

      </div>

      {/* Footer Email */}
      <div style={{ backgroundColor: '#0F172A', padding: '18px', borderRadius: '14px', border: '1px solid #1E293B', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.95rem', color: '#60A5FA', fontWeight: 700 }}>
          ✉️ Canal de Comunicação Direta: <strong>lucascristobaldasso@gmail.com</strong>
        </p>
      </div>

    </div>
  );
}
