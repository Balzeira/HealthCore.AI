import { SUSEpidemiologicalRecord } from './susService.js';

export interface MonthlyAggregation {
  mes_chave: string; // "2025-05"
  mes_rotulo: string; // "Maio/2025"
  ano: number;
  mes: number;
  total_casos: number;
  media_semanal: number;
  total_provaveis: number;
  incidencia_media_100k: number;
  nivel_alerta_max: number;
  variacao_anterior_percent?: number;
}

export interface TemporalAnalysisResult {
  fonte_oficial: string;
  intervalo_analisado: {
    inicio: string;
    fim: string;
    total_semanas: number;
    total_meses: number;
  };
  totais_periodo: {
    total_casos_notificados: number;
    total_casos_provaveis: number;
    media_casos_por_mes: number;
    incidencia_media_100k: number;
  };
  extremos: {
    periodo_maior_ocorrencia: {
      tipo: 'mes';
      rotulo: string;
      total_casos: number;
      participacao_percentual: number;
    };
    periodo_menor_ocorrencia: {
      tipo: 'mes';
      rotulo: string;
      total_casos: number;
      participacao_percentual: number;
    };
    semana_pico: {
      semana_epidemiologica: number;
      data_inicio: string;
      casos: number;
    };
    semana_minima: {
      semana_epidemiologica: number;
      data_inicio: string;
      casos: number;
    };
  };
  comparacao_periodo_anterior: {
    casos_periodo_atual: number;
    casos_periodo_anterior: number;
    variacao_absoluta: number;
    variacao_percentual: number;
    tendencia: 'crescimento' | 'queda' | 'estavel';
    texto_comparativo: string;
  };
  sintese_automatica: {
    destaque_maior_periodo: string;
    destaque_menor_periodo: string;
    destaque_variacao_recente: string;
  };
  serie_mensal: MonthlyAggregation[];
  serie_semanal: Array<{
    data_inicio: string;
    semana_epidemiologica: number;
    casos: number;
    incidencia_100k: number;
    nivel_alerta: number;
  }>;
}

const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function performTemporalAnalysis(
  fullSeries: SUSEpidemiologicalRecord[],
  startDate?: string,
  endDate?: string
): TemporalAnalysisResult {
  if (!fullSeries || fullSeries.length === 0) {
    throw new Error('Série temporal do SUS indisponível para análise.');
  }

  // Filter series by date if provided
  let filtered = [...fullSeries];
  if (startDate) {
    const startTs = new Date(startDate).getTime();
    if (!isNaN(startTs)) {
      filtered = filtered.filter(item => item.data_iniSE >= startTs);
    }
  }
  if (endDate) {
    const endTs = new Date(endDate).getTime();
    if (!isNaN(endTs)) {
      filtered = filtered.filter(item => item.data_iniSE <= endTs);
    }
  }

  // Fallback to all if filtering left nothing
  if (filtered.length === 0) {
    filtered = [...fullSeries];
  }

  // Aggregate by Month
  const monthlyMap = new Map<string, {
    ano: number;
    mes: number;
    total_casos: number;
    total_provaveis: number;
    incidencias: number[];
    niveis: number[];
    count_semanas: number;
  }>();

  filtered.forEach(item => {
    const mesChave = `${item.ano}-${String(item.mes).padStart(2, '0')}`;
    const current = monthlyMap.get(mesChave) || {
      ano: item.ano,
      mes: item.mes,
      total_casos: 0,
      total_provaveis: 0,
      incidencias: [],
      niveis: [],
      count_semanas: 0
    };

    current.total_casos += item.casos_notificados;
    current.total_provaveis += item.casos_provaveis;
    current.incidencias.push(item.incidencia_100k);
    current.niveis.push(item.nivel_alerta);
    current.count_semanas += 1;
    monthlyMap.set(mesChave, current);
  });

  const monthlyList: MonthlyAggregation[] = [];
  const sortedMonthKeys = Array.from(monthlyMap.keys()).sort();

  sortedMonthKeys.forEach((key, idx) => {
    const item = monthlyMap.get(key)!;
    const avgInc = item.incidencias.length > 0 
      ? item.incidencias.reduce((a, b) => a + b, 0) / item.incidencias.length 
      : 0;
    const maxNivel = item.niveis.length > 0 ? Math.max(...item.niveis) : 1;

    let variacao: number | undefined = undefined;
    if (idx > 0) {
      const prevKey = sortedMonthKeys[idx - 1];
      const prevTotal = monthlyMap.get(prevKey)!.total_casos;
      if (prevTotal > 0) {
        variacao = parseFloat((((item.total_casos - prevTotal) / prevTotal) * 100).toFixed(1));
      }
    }

    monthlyList.push({
      mes_chave: key,
      mes_rotulo: `${NOMES_MESES[item.mes - 1]}/${item.ano}`,
      ano: item.ano,
      mes: item.mes,
      total_casos: item.total_casos,
      media_semanal: Math.round(item.total_casos / Math.max(1, item.count_semanas)),
      total_provaveis: item.total_provaveis,
      incidencia_media_100k: parseFloat(avgInc.toFixed(1)),
      nivel_alerta_max: maxNivel,
      variacao_anterior_percent: variacao
    });
  });

  // Calculate Totals
  const totalCasos = filtered.reduce((acc, item) => acc + item.casos_notificados, 0);
  const totalProvaveis = filtered.reduce((acc, item) => acc + item.casos_provaveis, 0);
  const mediaMensal = monthlyList.length > 0 ? Math.round(totalCasos / monthlyList.length) : 0;
  const mediaIncidencia = filtered.length > 0 
    ? parseFloat((filtered.reduce((acc, item) => acc + item.incidencia_100k, 0) / filtered.length).toFixed(1)) 
    : 0;

  // Identify Max and Min Month
  let maxMonth = monthlyList[0];
  let minMonth = monthlyList[0];

  monthlyList.forEach(m => {
    if (m.total_casos > maxMonth.total_casos) maxMonth = m;
    if (m.total_casos < minMonth.total_casos) minMonth = m;
  });

  // Identify Peak Week and Min Week
  let maxWeek = filtered[0];
  let minWeek = filtered[0];

  filtered.forEach(w => {
    if (w.casos_notificados > maxWeek.casos_notificados) maxWeek = w;
    if (w.casos_notificados < minWeek.casos_notificados) minWeek = w;
  });

  // Comparison with Previous Period
  const halfLen = Math.floor(filtered.length / 2);
  let casosRecentes = 0;
  let casosAnteriores = 0;

  if (halfLen > 0) {
    const periodoAnterior = filtered.slice(0, halfLen);
    const periodoAtual = filtered.slice(halfLen);
    casosAnteriores = periodoAnterior.reduce((acc, i) => acc + i.casos_notificados, 0);
    casosRecentes = periodoAtual.reduce((acc, i) => acc + i.casos_notificados, 0);
  } else {
    casosRecentes = totalCasos;
    casosAnteriores = totalCasos;
  }

  const variacaoAbs = casosRecentes - casosAnteriores;
  const variacaoPerc = casosAnteriores > 0 
    ? parseFloat(((variacaoAbs / casosAnteriores) * 100).toFixed(1)) 
    : 0;

  const tendencia: 'crescimento' | 'queda' | 'estavel' = 
    variacaoPerc > 2 ? 'crescimento' : variacaoPerc < -2 ? 'queda' : 'estavel';

  const textoComparativo = tendencia === 'crescimento'
    ? `Em relação ao período anterior, houve aumento de ${Math.abs(variacaoPerc)}% nas ocorrências notificadas.`
    : tendencia === 'queda'
    ? `Em relação ao período anterior, houve redução de ${Math.abs(variacaoPerc)}% nas ocorrências notificadas.`
    : `Ocorrências mantiveram-se estáveis em relação ao período anterior (variação de ${variacaoPerc}%).`;

  const partMax = totalCasos > 0 ? parseFloat(((maxMonth.total_casos / totalCasos) * 100).toFixed(1)) : 0;
  const partMin = totalCasos > 0 ? parseFloat(((minMonth.total_casos / totalCasos) * 100).toFixed(1)) : 0;

  return {
    fonte_oficial: 'Ministério da Saúde / SUS / InfoDengue - São Paulo (IBGE 3550308)',
    intervalo_analisado: {
      inicio: filtered[0].data_iso,
      fim: filtered[filtered.length - 1].data_iso,
      total_semanas: filtered.length,
      total_meses: monthlyList.length
    },
    totais_periodo: {
      total_casos_notificados: totalCasos,
      total_casos_provaveis: totalProvaveis,
      media_casos_por_mes: mediaMensal,
      incidencia_media_100k: mediaIncidencia
    },
    extremos: {
      periodo_maior_ocorrencia: {
        tipo: 'mes',
        rotulo: maxMonth.mes_rotulo,
        total_casos: maxMonth.total_casos,
        participacao_percentual: partMax
      },
      periodo_menor_ocorrencia: {
        tipo: 'mes',
        rotulo: minMonth.mes_rotulo,
        total_casos: minMonth.total_casos,
        participacao_percentual: partMin
      },
      semana_pico: {
        semana_epidemiologica: maxWeek.semana_epidemiologica,
        data_inicio: maxWeek.data_iso,
        casos: maxWeek.casos_notificados
      },
      semana_minima: {
        semana_epidemiologica: minWeek.semana_epidemiologica,
        data_inicio: minWeek.data_iso,
        casos: minWeek.casos_notificados
      }
    },
    comparacao_periodo_anterior: {
      casos_periodo_atual: casosRecentes,
      casos_periodo_anterior: casosAnteriores,
      variacao_absoluta: variacaoAbs,
      variacao_percentual: variacaoPerc,
      tendencia,
      texto_comparativo: textoComparativo
    },
    sintese_automatica: {
      destaque_maior_periodo: `${maxMonth.mes_rotulo} apresentou o maior número de ocorrências no período analisado (${maxMonth.total_casos.toLocaleString('pt-BR')} casos).`,
      destaque_menor_periodo: `${minMonth.mes_rotulo} registrou o menor volume de ocorrências (${minMonth.total_casos.toLocaleString('pt-BR')} casos).`,
      destaque_variacao_recente: textoComparativo
    },
    serie_mensal: monthlyList,
    serie_semanal: filtered.map(item => ({
      data_inicio: item.data_iso,
      semana_epidemiologica: item.semana_epidemiologica,
      casos: item.casos_notificados,
      incidencia_100k: item.incidencia_100k,
      nivel_alerta: item.nivel_alerta
    }))
  };
}
