import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

interface NewsItem {
  id: number;
  category: string;
  category_color: string;
  title: string;
  summary: string;
  source: string;
  minutes_ago: number;
  read_time: string;
  impact: string;
  timestamp?: string;
}

interface NewsResponse {
  last_updated: string;
  next_refresh_in_seconds: number;
  news: NewsItem[];
}

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [regions, setRegions] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(1200); // 20 minutes = 1200s

  useEffect(() => {
    fetchRegions();
    fetchNews();
  }, []);

  // Timer countdown for 20-minute auto refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchNews(); // Auto-refresh every 20 min
          return 1200;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const data = await api.get<NewsResponse>('/news');
      if (data && data.news) {
        setNewsList(data.news);
        setLastUpdated(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        if (data.next_refresh_in_seconds) {
          setCountdown(data.next_refresh_in_seconds);
        }
      } else {
        setNewsList(fallbackNews);
      }
    } catch (err) {
      console.error("Failed to fetch live news", err);
      setNewsList(fallbackNews);
      setLastUpdated(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } finally {
      setNewsLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="home-page" style={{ padding: '20px', maxWidth: '430px', margin: '0 auto', fontFamily: 'Inter, sans-serif', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0047AB', margin: 0 }}>Observatório de Saúde Urbana</h1>
          <span style={{ backgroundColor: '#E8F8EE', color: '#2E7D32', fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: '#34C759', borderRadius: '50%', display: 'inline-block' }}></span>
            Ao Vivo
          </span>
        </div>
        <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Monitoramento em tempo real • São Paulo</p>
      </header>

      {/* Current Neighborhood Card */}
      <section style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '20px', border: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#1A1A2E' }}>Vila Mariana</h2>
            <span style={{ fontSize: '11px', color: '#6B7280' }}>Zona Sul • São Paulo</span>
          </div>
          <span style={{ backgroundColor: '#E8F8EE', color: '#2E7D32', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
            ● Risco Baixo
          </span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
            <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px 0', fontWeight: 600 }}>Qualidade do Ar (AQI)</p>
            <p style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#34C759' }}>42 • Excelente</p>
          </div>
          <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
            <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px 0', fontWeight: 600 }}>Umidade Relativa</p>
            <p style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0047AB' }}>65% • Ideal</p>
          </div>
          <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '12px', border: '1px solid #F3F4F6', gridColumn: 'span 2' }}>
            <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px 0', fontWeight: 600 }}>Incidência Arbovirose (Últimos 14 dias)</p>
            <p style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#F5A623' }}>Nula / Baixa (32 casos/100k hab)</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/map')}
          style={{ width: '100%', padding: '12px', backgroundColor: '#0047AB', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          Explorar Detalhes no Mapa ▶
        </button>
        <p style={{ fontSize: '10px', color: '#9CA3AF', textAlign: 'center', marginTop: '8px', marginBottom: 0 }}>
          Última atualização: Hoje às {lastUpdated || '14:30'}
        </p>
      </section>

      {/* Quick Access */}
      <section style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/map')}
          style={{ flex: 1, padding: '14px', backgroundColor: '#0047AB', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,71,171,0.2)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
          Explorar Mapa
        </button>
        <button 
          onClick={() => navigate('/game')}
          style={{ flex: 1, padding: '14px', backgroundColor: '#fff', color: '#0047AB', border: '2px solid #0047AB', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Iniciar Missão Agente
        </button>
      </section>

      {/* Agent Status */}
      <section style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '14px 16px', border: '1px solid #E5E7EB', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '11px', color: '#0047AB', fontWeight: 700, textTransform: 'uppercase' }}>Status do Agente</span>
          <p style={{ fontSize: '13px', fontWeight: 700, margin: '2px 0 0 0', color: '#1A1A2E' }}>Você possui 3 missões pendentes na região sul</p>
        </div>
        <div style={{ display: 'flex', marginLeft: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: ['#0047AB', '#34C759', '#F5A623'][i-1], border: '2px solid #fff', marginLeft: '-10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>
              A{i}
            </div>
          ))}
        </div>
      </section>

      {/* Live News Section (Requirement 3: Updated every 20 minutes) */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#1A1A2E' }}>Notícias em Tempo Real</h3>
            <span style={{ fontSize: '11px', color: '#6B7280' }}>
              Próxima atualização em: <strong style={{ color: '#0047AB' }}>{formatCountdown(countdown)}</strong>
            </span>
          </div>
          <button 
            onClick={fetchNews}
            disabled={newsLoading}
            style={{ backgroundColor: '#F3F4F6', color: '#374151', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            🔄 {newsLoading ? 'Atualizando...' : 'Atualizar Agora'}
          </button>
        </div>
        
        {newsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((n) => (
              <div key={n} style={{ padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '12px', height: '80px', animation: 'pulse 1.5s infinite' }}></div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {newsList.map((item) => (
              <article key={item.id} style={{ backgroundColor: '#fff', padding: '14px', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: item.category_color, backgroundColor: `${item.category_color}15`, padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>
                    ⏱ Há {item.minutes_ago} min • {item.read_time}
                  </span>
                </div>
                
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: '1.4' }}>
                  {item.title}
                </h4>

                <p style={{ fontSize: '12px', color: '#4B5563', margin: 0, lineHeight: '1.45' }}>
                  {item.summary}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 600 }}>Fonte: {item.source}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#0047AB' }}>Ver detalhes ▶</span>
                </div>
              </article>
            ))}
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

const fallbackNews: NewsItem[] = [
  {
    id: 1,
    category: 'Vacinação',
    category_color: '#34C759',
    title: 'Campanha de Vacinação contra Influenza é ampliada em todos os postos de SP',
    summary: 'SMS-SP reforça imunização para todas as idades. Unidades Básicas de Saúde da Sé, Pinheiros e Itaquera abrem aos sábados.',
    source: 'Secretaria Municipal da Saúde - SP',
    minutes_ago: 5,
    read_time: '2 min',
    impact: 'Alto'
  },
  {
    id: 2,
    category: 'Arboviroses',
    category_color: '#FF3B30',
    title: 'Mutirão de combate à Dengue elimina mais de 1.200 focos no Centro e Zona Leste',
    summary: 'Agentes de saúde urbana aplicam biolarvicidas e orientam moradores nos bairros da Sé, República e Itaquera.',
    source: 'Observatório de Saúde Urbana',
    minutes_ago: 12,
    read_time: '3 min',
    impact: 'Crítico'
  },
  {
    id: 3,
    category: 'Ar & Ambiente',
    category_color: '#F5A623',
    title: 'Qualidade do ar atinge nível "Bom" após chuvas isoladas na região sul',
    summary: 'Estações de monitoramento na Vila Mariana e Moema registram índice AQI de 42. Recomenda-se prática de atividades ao ar livre.',
    source: 'CETESB / HealthCore.AI',
    minutes_ago: 18,
    read_time: '1 min',
    impact: 'Médio'
  }
];
