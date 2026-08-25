import React, { useState } from 'react';

export default function ProfilePage() {
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const emojis = ['😢', '😐', '😊', '😄', '🤩'];
  const labels = ['Péssima', 'Ruim', 'Ok', 'Boa', 'Excelente'];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '430px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
        <h1 style={{ color: '#0047AB', fontSize: '1.8rem', margin: '0 0 0.5rem' }}>Sua opinião salva vidas.</h1>
        <p style={{ color: '#666', fontSize: '0.95rem', margin: 0, padding: '0 1rem' }}>
          Juntos, construímos uma São Paulo mais saudável e preparada.
        </p>
      </header>

      <section style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem', color: '#333', textAlign: 'center' }}>Como está sua experiência hoje?</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem' }}>
          {emojis.map((emoji, index) => (
            <div 
              key={index}
              onClick={() => setSelectedEmoji(index)}
              style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                cursor: 'pointer', transition: 'transform 0.2s'
              }}
            >
              <div style={{ 
                fontSize: '2rem', 
                width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', backgroundColor: selectedEmoji === index ? '#E6F0FA' : 'transparent',
                border: selectedEmoji === index ? '2px solid #0047AB' : '2px solid transparent'
              }}>
                {emoji}
              </div>
              <span style={{ fontSize: '0.7rem', color: selectedEmoji === index ? '#0047AB' : '#888', fontWeight: selectedEmoji === index ? 'bold' : 'normal' }}>
                {labels[index]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#333' }}>Sugira uma funcionalidade</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 1rem' }}>O que falta no HealthCore.AI para facilitar sua rotina de monitoramento?</p>
        <textarea 
          placeholder="Escreva sua ideia genial aqui..."
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px', marginBottom: '1rem', boxSizing: 'border-box' }}
        />
        <button style={{ width: '100%', padding: '14px', backgroundColor: '#34C759', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
          Enviar Sugestão ▶
        </button>
      </section>

      <section style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #FFE5E5', boxShadow: '0 2px 8px rgba(255,59,48,0.1)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#333' }}>Relatar um erro</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 1rem' }}>Encontrou algum problema técnico? Informe-nos para corrigirmos rápido.</p>
        <input 
          type="text" 
          placeholder="Onde ocorreu o erro?" 
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1rem', boxSizing: 'border-box' }}
        />
        <textarea 
          placeholder="Descreva o que aconteceu..."
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px', marginBottom: '1rem', boxSizing: 'border-box' }}
        />
        <button style={{ width: '100%', padding: '14px', backgroundColor: 'transparent', color: '#FF3B30', border: '2px solid #FF3B30', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
          Comunicar Erro
        </button>
      </section>

      <section style={{ background: 'linear-gradient(135deg, #34C759 0%, #28a745 100%)', padding: '1.5rem', borderRadius: '16px', color: 'white', textAlign: 'center', boxShadow: '0 4px 15px rgba(52,199,89,0.3)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🤝💚</div>
        <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem' }}>Obrigado por sua contribuição!</h2>
        <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.9 }}>
          Seus feedbacks ajudam a criar uma cidade mais saudável e resiliente para todos.
        </p>
      </section>

    </div>
  );
}
