import https from 'https';

export interface SUSEstabelecimentoCNES {
  codigo_cnes: number;
  nome_razao_social: string;
  nome_fantasia: string;
  tipo_gestao: string;
  descricao_esfera_administrativa: string;
  codigo_tipo_unidade: number;
  endereco_estabelecimento: string;
  numero_estabelecimento: string;
  bairro_estabelecimento: string;
  numero_telefone_estabelecimento: string;
  latitude_estabelecimento_decimo_grau?: number;
  longitude_estabelecimento_decimo_grau?: number;
  estabelecimento_faz_atendimento_ambulatorial_sus: string;
  estabelecimento_possui_atendimento_hospitalar: number;
  estabelecimento_possui_centro_cirurgico: number;
  data_atualizacao: string;
}

export interface SUSEpidemiologicalRecord {
  data_iniSE: number;
  data_iso: string;
  ano: number;
  mes: number; // 1-12
  mes_nome: string;
  semana_epidemiologica: number;
  casos_notificados: number;
  casos_provaveis: number;
  incidencia_100k: number;
  nivel_alerta: number; // 1-4
  rt: number;
  temperatura_media?: number;
  umidade_media?: number;
}

interface SUSCache {
  cnesEstabelecimentos: SUSEstabelecimentoCNES[];
  epidemiologicalSeries: SUSEpidemiologicalRecord[];
  lastFetch: number;
}

const cache: SUSCache = {
  cnesEstabelecimentos: [],
  epidemiologicalSeries: [],
  lastFetch: 0
};

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Helper for HTTPS GET with ICP-Brasil SSL handling
function fetchJson<T>(url: string, timeoutMs = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      agent: httpsAgent,
      headers: {
        'User-Agent': 'HealthCore.AI-SUS-Connector/1.0',
        'Accept': 'application/json'
      }
    }, (res) => {
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        reject(new Error(`HTTP status ${res.statusCode} from ${url}`));
        res.resume();
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data) as T);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export async function fetchSUSCNESEstabelecimentos(): Promise<SUSEstabelecimentoCNES[]> {
  const now = Date.now();
  if (cache.cnesEstabelecimentos.length > 0 && (now - cache.lastFetch) < 3600000) {
    return cache.cnesEstabelecimentos;
  }

  try {
    // Official DEMAS Ministério da Saúde CNES endpoint for São Paulo (IBGE 355030)
    const url = 'https://apidadosabertos.saude.gov.br/cnes/estabelecimentos?codigo_municipio=355030&limit=100';
    const res = await fetchJson<{ estabelecimentos: SUSEstabelecimentoCNES[] }>(url);
    if (res && res.estabelecimentos && res.estabelecimentos.length > 0) {
      cache.cnesEstabelecimentos = res.estabelecimentos;
      return res.estabelecimentos;
    }
  } catch (err) {
    console.warn('[SUS Service] Aviso na chamada CNES:', (err as any).message);
  }

  return cache.cnesEstabelecimentos;
}

export async function fetchSUSEpidemiologicalSeries(): Promise<SUSEpidemiologicalRecord[]> {
  const now = Date.now();
  if (cache.epidemiologicalSeries.length > 0 && (now - cache.lastFetch) < 1800000) {
    return cache.epidemiologicalSeries;
  }

  try {
    // Official open data surveillance endpoint for São Paulo (Geocode 3550308)
    // Used by Ministério da Saúde, Fiocruz / InfoDengue
    const url = 'https://info.dengue.mat.br/api/alertcity?geocode=3550308&disease=dengue&format=json&ew_start=1&ew_end=52&ey_start=2024&ey_end=2026';
    const rawData = await fetchJson<any[]>(url);

    if (Array.isArray(rawData) && rawData.length > 0) {
      const records: SUSEpidemiologicalRecord[] = rawData.map(item => {
        const dateObj = new Date(Number(item.data_iniSE));
        const ano = dateObj.getFullYear();
        const mes = dateObj.getMonth() + 1;
        const casos = Number(item.casos) || Number(item.casos_est) || 0;
        const casosProv = Number(item.casprov) || 0;
        const inc = typeof item.p_inc100k === 'string' 
          ? parseFloat(item.p_inc100k.replace(',', '.')) 
          : Number(item.p_inc100k) || 0;

        return {
          data_iniSE: Number(item.data_iniSE),
          data_iso: dateObj.toISOString().split('T')[0],
          ano,
          mes,
          mes_nome: `${MESES[mes - 1]}/${ano}`,
          semana_epidemiologica: Number(item.SE),
          casos_notificados: casos,
          casos_provaveis: casosProv,
          incidencia_100k: parseFloat(inc.toFixed(2)),
          nivel_alerta: Number(item.nivel) || 2,
          rt: typeof item.Rt === 'string' ? parseFloat(item.Rt.replace(',', '.')) : Number(item.Rt) || 1.0,
          temperatura_media: Number(item.tempmed) || undefined,
          umidade_media: Number(item.umidmed) || undefined
        };
      });

      // Sort chronologically ascending
      records.sort((a, b) => a.data_iniSE - b.data_iniSE);
      cache.epidemiologicalSeries = records;
      cache.lastFetch = now;
      return records;
    }
  } catch (err) {
    console.warn('[SUS Service] Aviso na chamada epidemiológica:', (err as any).message);
  }

  return cache.epidemiologicalSeries;
}
