import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const data = await api.get<any[]>('/regions');
        setRegions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load regions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegions();
  }, []);

  return (
    <div className="home-page" style={{ padding: '20px', maxWidth: '430px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0047AB', marginBottom: '8px' }}>Observatório de Saúde Urbana</h1>
        <p style={{ fontSize: '14px', color: '#666' }}>Acompanhamento em tempo real - São Paulo</p>
      </header>

      {/* Current Neighborhood Card */}
      <section style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Vila Mariana</h2>
          <span style={{ backgroundColor: '#34C759', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>Risco Baixo</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>Qualidade do Ar (AQI)</p>
            <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#34C759' }}>42 - Bom</p>
          </div>
          <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>Umidade Relativa</p>
            <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#0047AB' }}>65%</p>
          </div>
          <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '8px', gridColumn: 'span 2' }}>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>Incidência Arbovirose</p>
            <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#F5A623' }}>Média (32 casos/100k)</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/map')}
          style={{ width: '100%', padding: '12px', backgroundColor: '#f0f4f8', color: '#0047AB', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Explorar Detalhes do Bairro
        </button>
        <p style={{ fontSize: '10px', color: '#999', textAlign: 'center', marginTop: '8px', marginBottom: 0 }}>Atualizado hoje às 14:30</p>
      </section>

      {/* Quick Access */}
      <section style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/map')}
          style={{ flex: 1, padding: '14px', backgroundColor: '#0047AB', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
          Explorar Mapa
        </button>
        <button 
          onClick={() => navigate('/game')}
          style={{ flex: 1, padding: '14px', backgroundColor: '#fff', color: '#0047AB', border: '2px solid #0047AB', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Iniciar Missão Agente
        </button>
      </section>

      {/* Agent Status */}
      <section style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e0e0e0', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>Equipe ativa</p>
          <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: '#333', lineHeight: '1.4' }}>Você possui 3 missões pendentes na região sul</p>
        </div>
        <div style={{ display: 'flex', marginLeft: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: ['#0047AB', '#34C759', '#F5A623'][i-1], border: '2px solid #fff', marginLeft: '-10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>
              A{i}
            </div>
          ))}
        </div>
      </section>

      {/* Destaques do Dia */}
      <section>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px 0', color: '#333' }}>Destaques do Dia</h3>
        
        {loading ? (
          <div style={{ padding: '16px', backgroundColor: '#f0f0f0', borderRadius: '12px', height: '100px', animation: 'pulse 1.5s infinite' }}></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', backgroundColor: '#fff', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: 'linear-gradient(135deg, #34C759 0%, #28a745 100%)' }}></div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#34C759', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vacinação</span>
                  <h4 style={{ fontSize: '14px', margin: '4px 0', color: '#333' }}>Campanha contra Influenza atinge 70% da meta na capital</h4>
                </div>
                <span style={{ fontSize: '11px', color: '#999' }}>Há 2 horas</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', backgroundColor: '#fff', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: 'linear-gradient(135deg, #F5A623 0%, #fd7e14 100%)' }}></div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#F5A623', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ar & Ambiente</span>
                  <h4 style={{ fontSize: '14px', margin: '4px 0', color: '#333' }}>Frente fria melhora qualidade do ar na região metropolitana</h4>
                </div>
                <span style={{ fontSize: '11px', color: '#999' }}>Há 5 horas</span>
              </div>
            </div>
          </div>
        )}
      </section>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
