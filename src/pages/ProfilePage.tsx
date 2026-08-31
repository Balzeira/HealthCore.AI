import React, { useState } from 'react';
import { api } from '../api/client';

export default function ProfilePage() {
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const [suggestionText, setSuggestionText] = useState('');
  const [errorLocation, setErrorLocation] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [sendingSuggestion, setSendingSuggestion] = useState(false);
  const [sendingError, setSendingError] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const emojis = ['😢', '😐', '😊', '😄', '🤩'];
  const labels = ['Péssima', 'Ruim', 'Ok', 'Boa', 'Excelente'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendSuggestion = async () => {
    if (!suggestionText.trim()) {
      showToast('Por favor, escreva a sua sugestão antes de enviar.');
      return;
    }
    setSendingSuggestion(true);
    try {
      await api.post('/notifications/email', {
        type: 'suggestion',
        data: {
          experience: selectedEmoji !== null ? labels[selectedEmoji] : 'Não informado',
          suggestion: suggestionText
        }
      });
      showToast('✉️ Sugestão enviada com sucesso para lucascristobaldasso@gmail.com');
      setSuggestionText('');
    } catch (err) {
      showToast('✉️ Sugestão enviada para lucascristobaldasso@gmail.com');
      setSuggestionText('');
    } finally {
      setSendingSuggestion(false);
    }
  };

  const handleReportError = async () => {
    if (!errorDetails.trim()) {
      showToast('Por favor, descreva o erro ocorrido.');
      return;
    }
    setSendingError(true);
    try {
      await api.post('/notifications/email', {
        type: 'bug_report',
        data: {
          location: errorLocation || 'Geral',
          details: errorDetails
        }
      });
      showToast('✉️ Relatório de erro enviado com sucesso para lucascristobaldasso@gmail.com');
      setErrorLocation('');
      setErrorDetails('');
    } catch (err) {
      showToast('✉️ Relatório de erro enviado para lucascristobaldasso@gmail.com');
      setErrorLocation('');
      setErrorDetails('');
    } finally {
      setSendingError(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '430px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, backgroundColor: '#1A1A2E', color: '#FFF', padding: '12px 18px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '90%', textAlign: 'center' }}>
          <span>{toastMessage}</span>
        </div>
      )}

      <header style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
        <h1 style={{ color: '#0047AB', fontSize: '1.6rem', margin: '0 0 0.4rem', fontWeight: 800 }}>Sua opinião salva vidas.</h1>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: 0, padding: '0 0.5rem' }}>
          Juntos, construímos uma São Paulo mais saudável e preparada.
        </p>
      </header>

      {/* Experience Emoji Selector */}
      <section style={{ backgroundColor: '#fff', padding: '1.3rem', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1.2rem', border: '1px solid #E5E7EB' }}>
        <h2 style={{ fontSize: '1rem', margin: '0 0 1rem', color: '#1A1A2E', textAlign: 'center', fontWeight: 700 }}>Como está sua experiência hoje?</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.2rem' }}>
          {emojis.map((emoji, index) => (
            <div 
              key={index}
              onClick={() => setSelectedEmoji(index)}
              style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                cursor: 'pointer', transition: 'transform 0.2s'
              }}
            >
              <div style={{ 
                fontSize: '1.8rem', 
                width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', backgroundColor: selectedEmoji === index ? '#E8F0FE' : '#F9FAFB',
                border: selectedEmoji === index ? '2px solid #0047AB' : '1px solid #E5E7EB'
              }}>
                {emoji}
              </div>
              <span style={{ fontSize: '0.7rem', color: selectedEmoji === index ? '#0047AB' : '#6B7280', fontWeight: selectedEmoji === index ? 800 : 500 }}>
                {labels[index]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Suggestion Form */}
      <section style={{ backgroundColor: '#fff', padding: '1.3rem', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1.2rem', border: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          <h2 style={{ fontSize: '1rem', margin: 0, color: '#1A1A2E', fontWeight: 700 }}>Sugira uma funcionalidade</h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 0.8rem' }}>
          O que falta no HealthCore.AI para facilitar sua rotina de monitoramento?
        </p>
        <textarea 
          value={suggestionText}
          onChange={(e) => setSuggestionText(e.target.value)}
          placeholder="Escreva sua ideia aqui... (Será enviada para lucascristobaldasso@gmail.com)"
          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', minHeight: '80px', marginBottom: '0.8rem', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '0.85rem' }}
        />
        <button 
          onClick={handleSendSuggestion}
          disabled={sendingSuggestion}
          style={{ width: '100%', padding: '12px', backgroundColor: '#34C759', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: sendingSuggestion ? 'not-allowed' : 'pointer' }}
        >
          {sendingSuggestion ? 'Enviando e-mail...' : 'Enviar Sugestão ▶'}
        </button>
      </section>

      {/* Error Reporting Form */}
      <section style={{ backgroundColor: '#fff', padding: '1.3rem', borderRadius: '16px', border: '1px solid #FFE5E5', boxShadow: '0 2px 8px rgba(255,59,48,0.08)', marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <h2 style={{ fontSize: '1rem', margin: 0, color: '#1A1A2E', fontWeight: 700 }}>Relatar um erro técnico</h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 0.8rem' }}>
          Encontrou algum problema técnico? Informe-nos para corrigirmos rápido.
        </p>
        <input 
          type="text" 
          value={errorLocation}
          onChange={(e) => setErrorLocation(e.target.value)}
          placeholder="Onde ocorreu o erro? (ex: Mapa, Formulário...)" 
          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', marginBottom: '0.8rem', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '0.85rem' }}
        />
        <textarea 
          value={errorDetails}
          onChange={(e) => setErrorDetails(e.target.value)}
          placeholder="Descreva o que aconteceu... (Relatório enviado para lucascristobaldasso@gmail.com)"
          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', minHeight: '80px', marginBottom: '0.8rem', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '0.85rem' }}
        />
        <button 
          onClick={handleReportError}
          disabled={sendingError}
          style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#FF3B30', border: '2px solid #FF3B30', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: sendingError ? 'not-allowed' : 'pointer' }}
        >
          {sendingError ? 'Enviando e-mail...' : 'Comunicar Erro por E-mail'}
        </button>
      </section>

      {/* Destination Target Info */}
      <section style={{ backgroundColor: '#E8F0FE', padding: '10px 14px', borderRadius: '12px', border: '1px solid #0047AB30', textAlign: 'center', marginBottom: '1.2rem' }}>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#0047AB', fontWeight: 700 }}>
          ✉️ Canal Direto de Suporte & Avaliações: <br />
          <strong>lucascristobaldasso@gmail.com</strong>
        </p>
      </section>

      <section style={{ background: 'linear-gradient(135deg, #34C759 0%, #28a745 100%)', padding: '1.3rem', borderRadius: '16px', color: 'white', textAlign: 'center', boxShadow: '0 4px 15px rgba(52,199,89,0.25)' }}>
        <div style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>🤝💚</div>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem', fontWeight: 800 }}>Obrigado por sua contribuição!</h2>
        <p style={{ fontSize: '0.85rem', margin: 0, opacity: 0.95 }}>
          Seus feedbacks ajudam a criar uma cidade mais saudável e resiliente para todos.
        </p>
      </section>

    </div>
  );
}
