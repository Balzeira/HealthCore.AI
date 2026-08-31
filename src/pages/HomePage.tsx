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
  const [cityStats, setCityStats] = useState<any>(null);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<number>(4); // Vila Mariana default
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [newsFilter, setNewsFilter] = useState<string>('Todos');
  const [newsSearch, setNewsSearch] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(1200); // 20 minutes = 1200s

  useEffect(() => {
    fetchRegions();
    fetchCityStats();
    fetchNews();
  }, []);

  // Timer countdown for 20-minute auto refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchNews();
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

  const fetchCityStats = async () => {
    try {
      const data = await api.get<any>('/stats');
      if (data) setCityStats(data);
    } catch (err) {
      console.error("Failed to load city stats", err);
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

  // Mock neighborhood metrics for interactive selector
  const neighborhoodPresets: Record<number, any> = {
    1: { name: 'Sé', risk: 'Alto', riskColor: '#FF3B30', riskBg: '#FFE5E3', aqi: '120 • Ruim', humidity: '52%', dengue: 'Alta (120 casos/100k)', area: 'Região Central' },
    2: { name: 'Pinheiros', risk: 'Baixo', riskColor: '#34C759', riskBg: '#E8F8EE', aqi: '45 • Excelente', humidity: '62%', dengue: 'Baixa (15 casos/100k)', area: 'Zona Oeste' },
    3: { name: 'Itaquera', risk: 'Alto', riskColor: '#FF3B30', riskBg: '#FFE5E3', aqi: '110 • Moderado', humidity: '58%', dengue: 'Alta (300 casos/100k)', area: 'Zona Leste' },
    4: { name: 'Vila Mariana', risk: 'Baixo', riskColor: '#34C759', riskBg: '#E8F8EE', aqi: '42 • Excelente', humidity: '65%', dengue: 'Nula / Baixa (32 casos/100k)', area: 'Zona Sul' },
    5: { name: 'Moema', risk: 'Baixo', riskColor: '#34C759', riskBg: '#E8F8EE', aqi: '38 • Ótima', humidity: '68%', dengue: 'Controlada (12 casos/100k)', area: 'Zona Sul' },
    6: { name: 'Bela Vista', risk: 'Médio', riskColor: '#F5A623', riskBg: '#FFF3E0', aqi: '78 • Moderado', humidity: '56%', dengue: 'Média (90 casos/100k)', area: 'Região Central' }
  };

  const currentMetrics = neighborhoodPresets[selectedNeighborhoodId] || neighborhoodPresets[4];

  const filteredNews = newsList.filter(item => {
    const matchesCat = newsFilter === 'Todos' || item.category.toLowerCase().includes(newsFilter.toLowerCase());
    const matchesSearch = item.title.toLowerCase().includes(newsSearch.toLowerCase()) || item.summary.toLowerCase().includes(newsSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="home-page" style={{ padding: '20px', maxWidth: '430px', margin: '0 auto', fontFamily: 'Inter, sans-serif', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0047AB', margin: 0, letterSpacing: '-0.5px' }}>Observatório de Saúde Urbana</h1>
          <span style={{ backgroundColor: '#E8F8EE', color: '#2E7D32', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 6px rgba(52,199,89,0.2)' }}>
            <span style={{ width: '7px', height: '7px', backgroundColor: '#34C759', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
            Ao Vivo
          </span>
        </div>
        <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>São Paulo • Monitoramento Epidemiológico Inteligente</p>
      </header>

      {/* City Overview Live Stats Bar */}
      <section style={{ backgroundColor: 'linear-gradient(135deg, #0047AB 0%, #002D62 100%)', background: '#0047AB', borderRadius: '16px', padding: '14px', color: '#fff', marginBottom: '20px', boxShadow: '0 4px 16px rgba(0,71,171,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>Panorama da Capital</span>
          <span style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>10 Bairros Ativos</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', padding: '8px 4px', borderRadius: '10px', backdropFilter: 'blur(4px)' }}>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>{cityStats ? cityStats.risk_summary.high : 3}</div>
            <div style={{ fontSize: '10px', opacity: 0.85 }}>Em Alerta 🔴</div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', padding: '8px 4px', borderRadius: '10px', backdropFilter: 'blur(4px)' }}>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>{cityStats ? `${cityStats.air_quality.avg_aqi} AQI` : '64 AQI'}</div>
            <div style={{ fontSize: '10px', opacity: 0.85 }}>Média Ar 🌬️</div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', padding: '8px 4px', borderRadius: '10px', backdropFilter: 'blur(4px)' }}>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>{cityStats ? cityStats.community.active_agents_online : 184}</div>
            <div style={{ fontSize: '10px', opacity: 0.85 }}>Agentes Online 👥</div>
          </div>
        </div>
      </section>

      {/* Current Neighborhood Card with Selector */}
      <section style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '20px', border: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, display: 'block', marginBottom: '2px' }}>SELECIONE O BAIRRO</label>
            <select 
              value={selectedNeighborhoodId}
              onChange={(e) => setSelectedNeighborhoodId(Number(e.target.value))}
              style={{ fontSize: '16px', fontWeight: 800, border: 'none', background: 'transparent', color: '#1A1A2E', outline: 'none', cursor: 'pointer', padding: 0 }}
            >
              <option value={4}>Vila Mariana (Zona Sul)</option>
              <option value={1}>Sé (Região Central)</option>
              <option value={2}>Pinheiros (Zona Oeste)</option>
              <option value={3}>Itaquera (Zona Leste)</option>
              <option value={5}>Moema (Zona Sul)</option>
              <option value={6}>Bela Vista (Região Central)</option>
            </select>
          </div>
          <span style={{ backgroundColor: currentMetrics.riskBg, color: currentMetrics.riskColor, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, border: `1px solid ${currentMetrics.riskColor}40` }}>
            ● Risco {currentMetrics.risk}
          </span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
            <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px 0', fontWeight: 600 }}>Qualidade do Ar (AQI)</p>
            <p style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#34C759' }}>{currentMetrics.aqi}</p>
          </div>
          <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
            <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px 0', fontWeight: 600 }}>Umidade Relativa</p>
            <p style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0047AB' }}>{currentMetrics.humidity}</p>
          </div>
          <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '12px', border: '1px solid #F3F4F6', gridColumn: 'span 2' }}>
            <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px 0', fontWeight: 600 }}>Incidência Arbovirose</p>
            <p style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: currentMetrics.riskColor }}>{currentMetrics.dengue}</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/map')}
          style={{ width: '100%', padding: '12px', backgroundColor: '#0047AB', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,71,171,0.2)' }}
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

      {/* Live News Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
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
            🔄 {newsLoading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>

        {/* News Filters & Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          <input 
            type="text" 
            placeholder="Pesquisar notícias..." 
            value={newsSearch}
            onChange={(e) => setNewsSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '12px', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {['Todos', 'Vacinação', 'Arboviroses', 'Ar & Ambiente', 'Vigilância'].map(cat => (
              <button
                key={cat}
                onClick={() => setNewsFilter(cat)}
                style={{
                  padding: '5px 10px', borderRadius: '14px', fontSize: '11px', fontWeight: 700, border: 'none',
                  backgroundColor: newsFilter === cat ? '#0047AB' : '#F3F4F6',
                  color: newsFilter === cat ? '#FFF' : '#4B5563', cursor: 'pointer', whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {newsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((n) => (
              <div key={n} style={{ padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '12px', height: '80px', animation: 'pulse 1.5s infinite' }}></div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredNews.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>Nenhuma notícia encontrada para esta busca.</p>
            ) : (
              filteredNews.map((item) => (
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
              ))
            )}
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
