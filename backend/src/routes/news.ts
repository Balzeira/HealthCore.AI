import { Router, Request, Response } from 'express';

export function newsRouter() {
  const router = Router();

  const NEWS_ITEMS = [
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
    },
    {
      id: 4,
      category: 'Vigilância Sanitária',
      category_color: '#0047AB',
      title: 'Operação VigiAr inspeciona sistemas de climatização em hospitais da Consolação',
      summary: 'Ação preventiva visa reduzir riscos de infecções respiratórias em áreas hospitalares de grande circulação.',
      source: 'COVISA - SP',
      minutes_ago: 20,
      read_time: '2 min',
      impact: 'Médio'
    },
    {
      id: 5,
      category: 'Saúde Mental & Comunitária',
      category_color: '#8E44AD',
      title: 'UBS Santa Cecília e Bela Vista iniciam novos grupos de caminhada orientada',
      summary: 'Iniciativa gratuita para hipertensos e diabéticos visa integrar atividade física comunitária com acompanhamento médico.',
      source: 'Rede de Atenção Básica SP',
      minutes_ago: 20,
      read_time: '2 min',
      impact: 'Baixo'
    }
  ];

  router.get('/', (req: Request, res: Response) => {
    const now = new Date();
    // Dynamically calculate formatted time and update cycle
    const updatedNews = NEWS_ITEMS.map((item, index) => {
      // Simulate real-time rotation every 20 minutes
      const dynamicMinutes = (item.minutes_ago + Math.floor((now.getMinutes() % 20))) % 20;
      return {
        ...item,
        minutes_ago: dynamicMinutes === 0 ? 1 : dynamicMinutes,
        timestamp: new Date(now.getTime() - dynamicMinutes * 60000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
    });

    res.json({
      last_updated: now.toISOString(),
      next_refresh_in_seconds: 1200 - (now.getSeconds() + (now.getMinutes() % 20) * 60),
      news: updatedNews
    });
  });

  return router;
}
