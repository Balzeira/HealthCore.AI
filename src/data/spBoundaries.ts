export interface SPDistrictRegion {
  id: number;
  name: string;
  subprefeitura: string;
  zone: 'Centro' | 'Zona Oeste' | 'Zona Sul' | 'Zona Leste' | 'Zona Norte';
  center: [number, number];
  polygon: [number, number][];
  risk: 'Alto' | 'Médio' | 'Baixo';
  aqi: number;
  cases: number;
  disease: string;
  cleanliness: number;
  air: number;
  population: string;
  areaKm2: number;
  hospitalIds: number[];
}

export interface MacroZone {
  id: string;
  name: 'Centro' | 'Zona Oeste' | 'Zona Sul' | 'Zona Leste' | 'Zona Norte';
  label: string;
  color: string;
  center: [number, number];
  zoom: number;
  polygon: [number, number][];
  districtsCount: number;
  hospitalsCount: number;
  avgRisk: 'Alto' | 'Médio' | 'Baixo';
}

// ========================================================================
// 32 SUBPREFEITURAS / DISTRITOS DE SÃO PAULO CAPITAL COM POLÍGONOS CONTÍGUOS
// Cada polígono delimita a área geográfica contígua sem transpassar o vizinho
// ========================================================================
export const ALL_SP_DISTRICTS: SPDistrictRegion[] = [
  // -------------------------------------------------------------
  // CENTRO (Sé, República, Bela Vista, Liberdade, Consolação, Santa Cecília, Bom Retiro, Brás, Cambuci)
  // -------------------------------------------------------------
  {
    id: 1,
    name: 'Sé / Centro Histórico',
    subprefeitura: 'Sé',
    zone: 'Centro',
    center: [-23.5505, -46.6333],
    risk: 'Alto',
    aqi: 118,
    cases: 580,
    disease: 'Dengue & Influenza',
    cleanliness: 2.3,
    air: 2.1,
    population: '27.900 hab',
    areaKm2: 2.1,
    hospitalIds: [101, 108, 110],
    polygon: [
      [-23.5420, -46.6385],
      [-23.5435, -46.6275],
      [-23.5540, -46.6260],
      [-23.5585, -46.6325],
      [-23.5550, -46.6405],
      [-23.5475, -46.6415],
      [-23.5420, -46.6385]
    ]
  },
  {
    id: 2,
    name: 'República / Santa Ifigênia',
    subprefeitura: 'Sé',
    zone: 'Centro',
    center: [-23.5434, -46.6425],
    risk: 'Alto',
    aqi: 112,
    cases: 395,
    disease: 'Dengue & Tuberculose',
    cleanliness: 2.4,
    air: 2.3,
    population: '56.900 hab',
    areaKm2: 2.3,
    hospitalIds: [101, 109, 110],
    polygon: [
      [-23.5350, -46.6460],
      [-23.5360, -46.6370],
      [-23.5420, -46.6385],
      [-23.5475, -46.6415],
      [-23.5485, -46.6495],
      [-23.5410, -46.6515],
      [-23.5350, -46.6460]
    ]
  },
  {
    id: 3,
    name: 'Bela Vista / Bixiga',
    subprefeitura: 'Sé',
    zone: 'Centro',
    center: [-23.5574, -46.6437],
    risk: 'Médio',
    aqi: 76,
    cases: 340,
    disease: 'Gripe (Influenza) e Arboviroses',
    cleanliness: 3.6,
    air: 3.3,
    population: '69.400 hab',
    areaKm2: 2.6,
    hospitalIds: [102, 103, 105, 107],
    polygon: [
      [-23.5550, -46.6405],
      [-23.5585, -46.6325],
      [-23.5680, -46.6380],
      [-23.5715, -46.6465],
      [-23.5650, -46.6540],
      [-23.5570, -46.6510],
      [-23.5550, -46.6405]
    ]
  },
  {
    id: 4,
    name: 'Liberdade / Aclimação',
    subprefeitura: 'Sé',
    zone: 'Centro',
    center: [-23.5677, -46.6368],
    risk: 'Médio',
    aqi: 68,
    cases: 215,
    disease: 'Influenza Sazonal',
    cleanliness: 3.9,
    air: 3.5,
    population: '72.300 hab',
    areaKm2: 3.7,
    hospitalIds: [103, 108, 301],
    polygon: [
      [-23.5585, -46.6325],
      [-23.5540, -46.6260],
      [-23.5660, -46.6190],
      [-23.5780, -46.6280],
      [-23.5740, -46.6380],
      [-23.5680, -46.6380],
      [-23.5585, -46.6325]
    ]
  },
  {
    id: 5,
    name: 'Consolação / Higienópolis',
    subprefeitura: 'Sé',
    zone: 'Centro',
    center: [-23.5501, -46.6575],
    risk: 'Médio',
    aqi: 71,
    cases: 190,
    disease: 'Vigilância Ativa & Síndromes Virais',
    cleanliness: 4.2,
    air: 3.8,
    population: '57.300 hab',
    areaKm2: 3.7,
    hospitalIds: [104, 106, 208],
    polygon: [
      [-23.5410, -46.6515],
      [-23.5485, -46.6495],
      [-23.5570, -46.6510],
      [-23.5650, -46.6540],
      [-23.5610, -46.6660],
      [-23.5490, -46.6640],
      [-23.5410, -46.6515]
    ]
  },
  {
    id: 6,
    name: 'Santa Cecília / Barra Funda Sul',
    subprefeitura: 'Sé',
    zone: 'Centro',
    center: [-23.5385, -46.6504],
    risk: 'Médio',
    aqi: 80,
    cases: 230,
    disease: 'Leptospirose & Arboviroses',
    cleanliness: 3.4,
    air: 3.2,
    population: '61.500 hab',
    areaKm2: 3.9,
    hospitalIds: [101, 109, 208],
    polygon: [
      [-23.5280, -46.6560],
      [-23.5350, -46.6460],
      [-23.5410, -46.6515],
      [-23.5490, -46.6640],
      [-23.5420, -46.6710],
      [-23.5330, -46.6680],
      [-23.5280, -46.6560]
    ]
  },
  {
    id: 7,
    name: 'Bom Retiro / Brás',
    subprefeitura: 'Sé',
    zone: 'Centro',
    center: [-23.5278, -46.6389],
    risk: 'Alto',
    aqi: 104,
    cases: 420,
    disease: 'Dengue Surto & Alergias Respiratórias',
    cleanliness: 2.7,
    air: 2.6,
    population: '33.800 hab',
    areaKm2: 4.0,
    hospitalIds: [101, 109],
    polygon: [
      [-23.5180, -46.6420],
      [-23.5200, -46.6260],
      [-23.5360, -46.6240],
      [-23.5360, -46.6370],
      [-23.5350, -46.6460],
      [-23.5280, -46.6560],
      [-23.5180, -46.6420]
    ]
  },

  // -------------------------------------------------------------
  // ZONA OESTE (Pinheiros, Butantã, Lapa, Perdizes, Vila Madalena, Morumbi, Rio Pequeno, Jaguaré, Raposo Tavares)
  // -------------------------------------------------------------
  {
    id: 8,
    name: 'Pinheiros / Jardins',
    subprefeitura: 'Pinheiros',
    zone: 'Zona Oeste',
    center: [-23.5615, -46.6974],
    risk: 'Baixo',
    aqi: 44,
    cases: 85,
    disease: 'Baixa Incidência Geral',
    cleanliness: 4.8,
    air: 4.6,
    population: '65.300 hab',
    areaKm2: 8.0,
    hospitalIds: [201, 202, 203, 210],
    polygon: [
      [-23.5510, -46.6850],
      [-23.5530, -46.6710],
      [-23.5610, -46.6660],
      [-23.5780, -46.6770],
      [-23.5820, -46.6960],
      [-23.5670, -46.7050],
      [-23.5510, -46.6850]
    ]
  },
  {
    id: 9,
    name: 'Perdizes / Pompeia / Barra Funda',
    subprefeitura: 'Lapa',
    zone: 'Zona Oeste',
    center: [-23.5356, -46.6742],
    risk: 'Baixo',
    aqi: 46,
    cases: 68,
    disease: 'Risco Controlado',
    cleanliness: 4.7,
    air: 4.5,
    population: '111.200 hab',
    areaKm2: 6.1,
    hospitalIds: [207, 208, 101],
    polygon: [
      [-23.5230, -46.6700],
      [-23.5280, -46.6560],
      [-23.5420, -46.6710],
      [-23.5490, -46.6640],
      [-23.5530, -46.6710],
      [-23.5510, -46.6850],
      [-23.5380, -46.6900],
      [-23.5230, -46.6700]
    ]
  },
  {
    id: 10,
    name: 'Lapa / Vila Leopoldina / Jaguaré',
    subprefeitura: 'Lapa',
    zone: 'Zona Oeste',
    center: [-23.5222, -46.7028],
    risk: 'Baixo',
    aqi: 50,
    cases: 98,
    disease: 'Vigilância Sanitária Estável',
    cleanliness: 4.4,
    air: 4.3,
    population: '65.700 hab',
    areaKm2: 10.0,
    hospitalIds: [206, 207],
    polygon: [
      [-23.5080, -46.7120],
      [-23.5150, -46.6880],
      [-23.5230, -46.6700],
      [-23.5380, -46.6900],
      [-23.5430, -46.7180],
      [-23.5280, -46.7320],
      [-23.5080, -46.7120]
    ]
  },
  {
    id: 11,
    name: 'Butantã / Cidade Universitária',
    subprefeitura: 'Butantã',
    zone: 'Zona Oeste',
    center: [-23.5719, -46.7081],
    risk: 'Baixo',
    aqi: 41,
    cases: 60,
    disease: 'Área Arborizada & Excelente Qualidade',
    cleanliness: 4.7,
    air: 4.7,
    population: '54.200 hab',
    areaKm2: 12.5,
    hospitalIds: [204, 205],
    polygon: [
      [-23.5550, -46.7120],
      [-23.5670, -46.7050],
      [-23.5820, -46.6960],
      [-23.5960, -46.7120],
      [-23.5880, -46.7360],
      [-23.5650, -46.7450],
      [-23.5550, -46.7120]
    ]
  },
  {
    id: 12,
    name: 'Morumbi / Vila Sônia / Real Parque',
    subprefeitura: 'Butantã',
    zone: 'Zona Oeste',
    center: [-23.5980, -46.7160],
    risk: 'Baixo',
    aqi: 39,
    cases: 45,
    disease: 'Excelente Controle',
    cleanliness: 4.9,
    air: 4.8,
    population: '46.900 hab',
    areaKm2: 11.4,
    hospitalIds: [204, 209],
    polygon: [
      [-23.5820, -46.6960],
      [-23.5960, -46.6880],
      [-23.6180, -46.7020],
      [-23.6250, -46.7260],
      [-23.6080, -46.7380],
      [-23.5960, -46.7120],
      [-23.5820, -46.6960]
    ]
  },
  {
    id: 13,
    name: 'Rio Pequeno / Raposo Tavares',
    subprefeitura: 'Butantã',
    zone: 'Zona Oeste',
    center: [-23.5780, -46.7580],
    risk: 'Médio',
    aqi: 72,
    cases: 195,
    disease: 'Dengue & Gripe Sazonal',
    cleanliness: 3.8,
    air: 3.9,
    population: '118.400 hab',
    areaKm2: 15.3,
    hospitalIds: [204, 205],
    polygon: [
      [-23.5550, -46.7120],
      [-23.5650, -46.7450],
      [-23.5880, -46.7360],
      [-23.6080, -46.7380],
      [-23.6020, -46.7820],
      [-23.5680, -46.7780],
      [-23.5550, -46.7120]
    ]
  },

  // -------------------------------------------------------------
  // ZONA SUL (Vila Mariana, Moema, Itaim Bibi, Santo Amaro, Jabaquara, Campo Limpo, M'Boi Mirim, Grajaú, Capela do Socorro, Parelheiros, Pedreira)
  // -------------------------------------------------------------
  {
    id: 14,
    name: 'Vila Mariana / Paraíso',
    subprefeitura: 'Vila Mariana',
    zone: 'Zona Sul',
    center: [-23.5898, -46.6341],
    risk: 'Baixo',
    aqi: 42,
    cases: 58,
    disease: 'Baixo Risco • Monitoramento Efetivo',
    cleanliness: 4.8,
    air: 4.7,
    population: '130.400 hab',
    areaKm2: 8.6,
    hospitalIds: [301, 302, 309, 310],
    polygon: [
      [-23.5715, -46.6465],
      [-23.5680, -46.6380],
      [-23.5740, -46.6380],
      [-23.5780, -46.6280],
      [-23.6020, -46.6260],
      [-23.6110, -46.6430],
      [-23.5980, -46.6540],
      [-23.5820, -46.6510],
      [-23.5715, -46.6465]
    ]
  },
  {
    id: 15,
    name: 'Moema / Vila Nova Conceição',
    subprefeitura: 'Vila Mariana',
    zone: 'Zona Sul',
    center: [-23.6006, -46.6631],
    risk: 'Baixo',
    aqi: 38,
    cases: 22,
    disease: 'Risco Controlado • Ótima Limpeza',
    cleanliness: 4.9,
    air: 4.8,
    population: '83.300 hab',
    areaKm2: 9.0,
    hospitalIds: [302, 311, 312, 313],
    polygon: [
      [-23.5820, -46.6510],
      [-23.5980, -46.6540],
      [-23.6110, -46.6430],
      [-23.6260, -46.6610],
      [-23.6140, -46.6780],
      [-23.5920, -46.6690],
      [-23.5820, -46.6510]
    ]
  },
  {
    id: 16,
    name: 'Itaim Bibi / Brooklin / Pinheiros Sul',
    subprefeitura: 'Pinheiros',
    zone: 'Zona Sul',
    center: [-23.5839, -46.6789],
    risk: 'Baixo',
    aqi: 40,
    cases: 30,
    disease: 'Excelente Controle Sanitário',
    cleanliness: 4.9,
    air: 4.7,
    population: '92.700 hab',
    areaKm2: 9.9,
    hospitalIds: [312, 204, 311],
    polygon: [
      [-23.5780, -46.6770],
      [-23.5610, -46.6660],
      [-23.5820, -46.6510],
      [-23.5920, -46.6690],
      [-23.6140, -46.6780],
      [-23.5960, -46.6880],
      [-23.5780, -46.6770]
    ]
  },
  {
    id: 17,
    name: 'Santo Amaro / Granja Julieta',
    subprefeitura: 'Santo Amaro',
    zone: 'Zona Sul',
    center: [-23.6528, -46.7083],
    risk: 'Médio',
    aqi: 75,
    cases: 280,
    disease: 'Influenza Sazonal & Dengue Moderada',
    cleanliness: 3.9,
    air: 3.7,
    population: '71.500 hab',
    areaKm2: 15.6,
    hospitalIds: [308, 304, 305],
    polygon: [
      [-23.6180, -46.7020],
      [-23.5960, -46.6880],
      [-23.6140, -46.6780],
      [-23.6420, -46.6850],
      [-23.6750, -46.7050],
      [-23.6680, -46.7280],
      [-23.6410, -46.7220],
      [-23.6180, -46.7020]
    ]
  },
  {
    id: 18,
    name: 'Jabaquara / Saúde',
    subprefeitura: 'Jabaquara',
    zone: 'Zona Sul',
    center: [-23.6467, -46.6417],
    risk: 'Médio',
    aqi: 83,
    cases: 310,
    disease: 'Dengue & Doenças Respiratórias',
    cleanliness: 3.4,
    air: 3.3,
    population: '223.700 hab',
    areaKm2: 14.1,
    hospitalIds: [304, 301, 308],
    polygon: [
      [-23.6110, -46.6430],
      [-23.6020, -46.6260],
      [-23.6320, -46.6180],
      [-23.6680, -46.6340],
      [-23.6650, -46.6580],
      [-23.6260, -46.6610],
      [-23.6110, -46.6430]
    ]
  },
  {
    id: 19,
    name: 'Campo Limpo / Capão Redondo',
    subprefeitura: 'Campo Limpo',
    zone: 'Zona Sul',
    center: [-23.6339, -46.7583],
    risk: 'Alto',
    aqi: 114,
    cases: 560,
    disease: 'Dengue & Doenças Respiratórias',
    cleanliness: 2.5,
    air: 2.7,
    population: '211.300 hab',
    areaKm2: 12.8,
    hospitalIds: [305, 307],
    polygon: [
      [-23.6250, -46.7260],
      [-23.6410, -46.7220],
      [-23.6650, -46.7450],
      [-23.6820, -46.7720],
      [-23.6550, -46.7890],
      [-23.6280, -46.7620],
      [-23.6250, -46.7260]
    ]
  },
  {
    id: 20,
    name: 'M\'Boi Mirim / Jardim Ângela',
    subprefeitura: 'M\'Boi Mirim',
    zone: 'Zona Sul',
    center: [-23.6931, -46.7794],
    risk: 'Alto',
    aqi: 121,
    cases: 610,
    disease: 'Dengue Surto & Vigilância Epidemiológica',
    cleanliness: 2.3,
    air: 2.5,
    population: '570.000 hab',
    areaKm2: 62.1,
    hospitalIds: [307, 305, 306],
    polygon: [
      [-23.6650, -46.7450],
      [-23.6850, -46.7320],
      [-23.7250, -46.7580],
      [-23.7520, -46.7950],
      [-23.7120, -46.8250],
      [-23.6820, -46.7720],
      [-23.6650, -46.7450]
    ]
  },
  {
    id: 21,
    name: 'Capela do Socorro / Grajaú',
    subprefeitura: 'Capela do Socorro',
    zone: 'Zona Sul',
    center: [-23.7744, -46.6961],
    risk: 'Alto',
    aqi: 126,
    cases: 680,
    disease: 'Dengue, Leptospirose & Arboviroses',
    cleanliness: 2.2,
    air: 2.4,
    population: '590.000 hab',
    areaKm2: 134.2,
    hospitalIds: [306, 308],
    polygon: [
      [-23.6750, -46.7050],
      [-23.6650, -46.6580],
      [-23.7120, -46.6450],
      [-23.7950, -46.6680],
      [-23.8350, -46.7150],
      [-23.7750, -46.7450],
      [-23.7250, -46.7580],
      [-23.6850, -46.7320],
      [-23.6750, -46.7050]
    ]
  },
  {
    id: 22,
    name: 'Parelheiros / Marsilac',
    subprefeitura: 'Parelheiros',
    zone: 'Zona Sul',
    center: [-23.8580, -46.7210],
    risk: 'Médio',
    aqi: 35,
    cases: 140,
    disease: 'Área Ambiental Protegida • Febre Amarela Vigilância',
    cleanliness: 4.1,
    air: 4.9,
    population: '160.000 hab',
    areaKm2: 353.5,
    hospitalIds: [306],
    polygon: [
      [-23.7950, -46.6680],
      [-23.8450, -46.6280],
      [-23.9550, -46.6850],
      [-23.9850, -46.7550],
      [-23.9100, -46.8100],
      [-23.8350, -46.7150],
      [-23.7950, -46.6680]
    ]
  },

  // -------------------------------------------------------------
  // ZONA LESTE (Itaquera, Tatuapé, Mooca, Penha, São Mateus, São Miguel Paulista, Ermelino Matarazzo, Guaianases, Cidade Tiradentes, Vila Prudente, Sapopemba, Belém)
  // -------------------------------------------------------------
  {
    id: 23,
    name: 'Mooca / Belém / Pari',
    subprefeitura: 'Mooca',
    zone: 'Zona Leste',
    center: [-23.5606, -46.5983],
    risk: 'Médio',
    aqi: 79,
    cases: 290,
    disease: 'Infecções Respiratórias & Dengue Moderada',
    cleanliness: 3.7,
    air: 3.5,
    population: '75.000 hab',
    areaKm2: 7.7,
    hospitalIds: [411, 402, 103],
    polygon: [
      [-23.5360, -46.6240],
      [-23.5350, -46.5920],
      [-23.5580, -46.5780],
      [-23.5780, -46.5860],
      [-23.5780, -46.6120],
      [-23.5660, -46.6190],
      [-23.5540, -46.6260],
      [-23.5360, -46.6240]
    ]
  },
  {
    id: 24,
    name: 'Tatuapé / Anália Franco / Água Rasa',
    subprefeitura: 'Mooca',
    zone: 'Zona Leste',
    center: [-23.5403, -46.5764],
    risk: 'Médio',
    aqi: 74,
    cases: 240,
    disease: 'Dengue Moderada & Gripe',
    cleanliness: 4.1,
    air: 3.7,
    population: '91.000 hab',
    areaKm2: 8.2,
    hospitalIds: [402, 407, 411],
    polygon: [
      [-23.5220, -46.5820],
      [-23.5250, -46.5520],
      [-23.5520, -46.5480],
      [-23.5650, -46.5650],
      [-23.5580, -46.5780],
      [-23.5350, -46.5920],
      [-23.5220, -46.5820]
    ]
  },
  {
    id: 25,
    name: 'Penha / Vila Matilde / Cangaíba',
    subprefeitura: 'Penha',
    zone: 'Zona Leste',
    center: [-23.5264, -46.5458],
    risk: 'Alto',
    aqi: 99,
    cases: 430,
    disease: 'Dengue & Doenças Respiratórias',
    cleanliness: 2.9,
    air: 3.0,
    population: '127.800 hab',
    areaKm2: 11.3,
    hospitalIds: [402, 407, 409],
    polygon: [
      [-23.5050, -46.5580],
      [-23.5110, -46.5180],
      [-23.5420, -46.5120],
      [-23.5520, -46.5480],
      [-23.5250, -46.5520],
      [-23.5050, -46.5580]
    ]
  },
  {
    id: 26,
    name: 'Itaquera / Cidade Líder / José Bonifácio',
    subprefeitura: 'Itaquera',
    zone: 'Zona Leste',
    center: [-23.5367, -46.4601],
    risk: 'Alto',
    aqi: 112,
    cases: 540,
    disease: 'Dengue & Doenças Respiratórias Agudas',
    cleanliness: 2.4,
    air: 2.7,
    population: '204.800 hab',
    areaKm2: 14.6,
    hospitalIds: [401, 408, 412],
    polygon: [
      [-23.5180, -46.4850],
      [-23.5220, -46.4350],
      [-23.5620, -46.4310],
      [-23.5780, -46.4720],
      [-23.5550, -46.4950],
      [-23.5180, -46.4850]
    ]
  },
  {
    id: 27,
    name: 'São Mateus / São Rafael / Iguatemi',
    subprefeitura: 'São Mateus',
    zone: 'Zona Leste',
    center: [-23.6128, -46.4714],
    risk: 'Alto',
    aqi: 119,
    cases: 590,
    disease: 'Dengue Surto Leste & Respiratórias',
    cleanliness: 2.2,
    air: 2.5,
    population: '425.000 hab',
    areaKm2: 45.8,
    hospitalIds: [403, 401, 410],
    polygon: [
      [-23.5780, -46.4720],
      [-23.5620, -46.4310],
      [-23.6150, -46.4380],
      [-23.6520, -46.4850],
      [-23.6320, -46.5180],
      [-23.5950, -46.5050],
      [-23.5780, -46.4720]
    ]
  },
  {
    id: 28,
    name: 'São Miguel Paulista / Vila Jacuí',
    subprefeitura: 'São Miguel Paulista',
    zone: 'Zona Leste',
    center: [-23.4938, -46.4429],
    risk: 'Alto',
    aqi: 108,
    cases: 480,
    disease: 'Dengue & Influenza',
    cleanliness: 2.6,
    air: 2.8,
    population: '370.000 hab',
    areaKm2: 24.3,
    hospitalIds: [404, 409, 401],
    polygon: [
      [-23.4720, -46.4650],
      [-23.4810, -46.4150],
      [-23.5220, -46.4350],
      [-23.5180, -46.4850],
      [-23.4920, -46.4820],
      [-23.4720, -46.4650]
    ]
  },
  {
    id: 29,
    name: 'Guaianases / Cidade Tiradentes',
    subprefeitura: 'Guaianases / Cidade Tiradentes',
    zone: 'Zona Leste',
    center: [-23.5680, -46.4100],
    risk: 'Alto',
    aqi: 115,
    cases: 530,
    disease: 'Dengue & Focos de Transmissão',
    cleanliness: 2.3,
    air: 2.6,
    population: '480.000 hab',
    areaKm2: 33.8,
    hospitalIds: [405, 410, 401],
    polygon: [
      [-23.5220, -46.4350],
      [-23.5350, -46.3780],
      [-23.6150, -46.3880],
      [-23.6150, -46.4380],
      [-23.5620, -46.4310],
      [-23.5220, -46.4350]
    ]
  },
  {
    id: 30,
    name: 'Vila Prudente / Sapopemba',
    subprefeitura: 'Vila Prudente / Sapopemba',
    zone: 'Zona Leste',
    center: [-23.5828, -46.5819],
    risk: 'Médio',
    aqi: 78,
    cases: 230,
    disease: 'Gripe Sazonal & Asma',
    cleanliness: 3.5,
    air: 3.4,
    population: '530.000 hab',
    areaKm2: 33.3,
    hospitalIds: [406, 403, 407],
    polygon: [
      [-23.5650, -46.5650],
      [-23.5520, -46.5480],
      [-23.5950, -46.5050],
      [-23.6320, -46.5180],
      [-23.6150, -46.5620],
      [-23.5890, -46.5720],
      [-23.5780, -46.5860],
      [-23.5650, -46.5650]
    ]
  },

  // -------------------------------------------------------------
  // ZONA NORTE (Santana, Tucuruvi, Mandaqui, Casa Verde, Cachoeirinha, Freguesia do Ó, Brasilândia, Pirituba, Jaraguá, Jaçanã, Tremembé, Perus)
  // -------------------------------------------------------------
  {
    id: 31,
    name: 'Santana / Tucuruvi / Mandaqui',
    subprefeitura: 'Santana/Tucuruvi',
    zone: 'Zona Norte',
    center: [-23.5042, -46.6267],
    risk: 'Baixo',
    aqi: 48,
    cases: 88,
    disease: 'Risco Controlado • Baixa Incidência',
    cleanliness: 4.5,
    air: 4.4,
    population: '325.000 hab',
    areaKm2: 34.7,
    hospitalIds: [501, 502, 506, 511],
    polygon: [
      [-23.4650, -46.6380],
      [-23.4680, -46.5980],
      [-23.5020, -46.6020],
      [-23.5180, -46.6180],
      [-23.5180, -46.6420],
      [-23.4980, -46.6480],
      [-23.4650, -46.6380]
    ]
  },
  {
    id: 32,
    name: 'Casa Verde / Cachoeirinha / Limão',
    subprefeitura: 'Casa Verde',
    zone: 'Zona Norte',
    center: [-23.5044, -46.6578],
    risk: 'Médio',
    aqi: 74,
    cases: 195,
    disease: 'Influenza Sazonal & Qualidade do Ar',
    cleanliness: 3.8,
    air: 3.7,
    population: '310.000 hab',
    areaKm2: 26.7,
    hospitalIds: [504, 501, 509],
    polygon: [
      [-23.4620, -46.6720],
      [-23.4650, -46.6380],
      [-23.4980, -46.6480],
      [-23.5180, -46.6420],
      [-23.5280, -46.6560],
      [-23.5230, -46.6700],
      [-23.4950, -46.6850],
      [-23.4620, -46.6720]
    ]
  },
  {
    id: 33,
    name: 'Freguesia do Ó / Brasilândia',
    subprefeitura: 'Freguesia/Brasilândia',
    zone: 'Zona Norte',
    center: [-23.4739, -46.6925],
    risk: 'Alto',
    aqi: 118,
    cases: 605,
    disease: 'Dengue Surto Norte & Síndromes Respiratórias',
    cleanliness: 2.3,
    air: 2.5,
    population: '410.000 hab',
    areaKm2: 31.5,
    hospitalIds: [509, 510, 504],
    polygon: [
      [-23.4380, -46.7020],
      [-23.4620, -46.6720],
      [-23.4950, -46.6850],
      [-23.5150, -46.6880],
      [-23.5080, -46.7120],
      [-23.4720, -46.7180],
      [-23.4380, -46.7020]
    ]
  },
  {
    id: 34,
    name: 'Pirituba / Jaraguá / São Domingos',
    subprefeitura: 'Pirituba/Jaraguá',
    zone: 'Zona Norte',
    center: [-23.4650, -46.7350],
    risk: 'Médio',
    aqi: 77,
    cases: 235,
    disease: 'Dengue Moderada & Preservação Pico do Jaraguá',
    cleanliness: 3.6,
    air: 4.1,
    population: '440.000 hab',
    areaKm2: 54.7,
    hospitalIds: [503, 505],
    polygon: [
      [-23.4180, -46.7550],
      [-23.4380, -46.7020],
      [-23.4720, -46.7180],
      [-23.5080, -46.7120],
      [-23.5280, -46.7320],
      [-23.4950, -46.7720],
      [-23.4520, -46.7780],
      [-23.4180, -46.7550]
    ]
  },
  {
    id: 35,
    name: 'Vila Maria / Vila Guilherme / Medeiros',
    subprefeitura: 'Vila Maria/Vila Guilherme',
    zone: 'Zona Norte',
    center: [-23.5139, -46.6083],
    risk: 'Médio',
    aqi: 73,
    cases: 175,
    disease: 'Gripe Sazonal & Poluição Marginal Tietê',
    cleanliness: 3.7,
    air: 3.5,
    population: '300.000 hab',
    areaKm2: 26.4,
    hospitalIds: [508, 507, 502],
    polygon: [
      [-23.4850, -46.6050],
      [-23.4920, -46.5680],
      [-23.5220, -46.5820],
      [-23.5350, -46.5920],
      [-23.5360, -46.6240],
      [-23.5200, -46.6260],
      [-23.5020, -46.6020],
      [-23.4850, -46.6050]
    ]
  },
  {
    id: 36,
    name: 'Jaçanã / Tremembé / Serra da Cantareira',
    subprefeitura: 'Jaçanã/Tremembé',
    zone: 'Zona Norte',
    center: [-23.4580, -46.5980],
    risk: 'Baixo',
    aqi: 42,
    cases: 75,
    disease: 'Qualidade do Ar Excelente • Proteção Cantareira',
    cleanliness: 4.6,
    air: 4.8,
    population: '295.000 hab',
    areaKm2: 64.1,
    hospitalIds: [501, 502],
    polygon: [
      [-23.3850, -46.6350],
      [-23.4220, -46.5650],
      [-23.4680, -46.5680],
      [-23.4850, -46.6050],
      [-23.4680, -46.5980],
      [-23.4650, -46.6380],
      [-23.3850, -46.6350]
    ]
  },
  {
    id: 37,
    name: 'Perus / Anhanguera',
    subprefeitura: 'Perus',
    zone: 'Zona Norte',
    center: [-23.4020, -46.7580],
    risk: 'Médio',
    aqi: 65,
    cases: 160,
    disease: 'Vigilância Epidemiológica Extremo Noroeste',
    cleanliness: 3.8,
    air: 4.4,
    population: '150.000 hab',
    areaKm2: 57.2,
    hospitalIds: [505, 503],
    polygon: [
      [-23.3550, -46.7850],
      [-23.3750, -46.7250],
      [-23.4180, -46.7550],
      [-23.4520, -46.7780],
      [-23.4280, -46.8250],
      [-23.3550, -46.7850]
    ]
  }
];

// ========================================================================
// 5 MACRORREGIÕES DE SÃO PAULO COM COORDENADAS DE FRONTEIRA INTEGRADAS
// ========================================================================
export const SP_MACRO_ZONES: MacroZone[] = [
  {
    id: 'centro',
    name: 'Centro',
    label: 'Região Central',
    color: '#E11D48', // Rosa escuro / Vermelho
    center: [-23.5505, -46.6433],
    zoom: 13,
    districtsCount: 7,
    hospitalsCount: 10,
    avgRisk: 'Alto',
    polygon: [
      [-23.5180, -46.6420],
      [-23.5200, -46.6260],
      [-23.5360, -46.6240],
      [-23.5540, -46.6260],
      [-23.5660, -46.6190],
      [-23.5780, -46.6280],
      [-23.5740, -46.6380],
      [-23.5715, -46.6465],
      [-23.5650, -46.6540],
      [-23.5610, -46.6660],
      [-23.5490, -46.6640],
      [-23.5420, -46.6710],
      [-23.5280, -46.6560],
      [-23.5180, -46.6420]
    ]
  },
  {
    id: 'oeste',
    name: 'Zona Oeste',
    label: 'Zona Oeste',
    color: '#0284C7', // Azul Sky
    center: [-23.5580, -46.7150],
    zoom: 12,
    districtsCount: 6,
    hospitalsCount: 10,
    avgRisk: 'Baixo',
    polygon: [
      [-23.5080, -46.7120],
      [-23.5150, -46.6880],
      [-23.5230, -46.6700],
      [-23.5280, -46.6560],
      [-23.5420, -46.6710],
      [-23.5490, -46.6640],
      [-23.5610, -46.6660],
      [-23.5780, -46.6770],
      [-23.5820, -46.6960],
      [-23.5960, -46.6880],
      [-23.6180, -46.7020],
      [-23.6250, -46.7260],
      [-23.6080, -46.7380],
      [-23.6020, -46.7820],
      [-23.5680, -46.7780],
      [-23.5280, -46.7320],
      [-23.5080, -46.7120]
    ]
  },
  {
    id: 'sul',
    name: 'Zona Sul',
    label: 'Zona Sul',
    color: '#10B981', // Verde Esmeralda
    center: [-23.6750, -46.6850],
    zoom: 11,
    districtsCount: 9,
    hospitalsCount: 13,
    avgRisk: 'Médio',
    polygon: [
      [-23.5715, -46.6465],
      [-23.5680, -46.6380],
      [-23.5780, -46.6280],
      [-23.6020, -46.6260],
      [-23.6320, -46.6180],
      [-23.6680, -46.6340],
      [-23.7120, -46.6450],
      [-23.7950, -46.6680],
      [-23.8450, -46.6280],
      [-23.9550, -46.6850],
      [-23.9850, -46.7550],
      [-23.9100, -46.8100],
      [-23.8350, -46.7150],
      [-23.7750, -46.7450],
      [-23.7520, -46.7950],
      [-23.7120, -46.8250],
      [-23.6820, -46.7720],
      [-23.6550, -46.7890],
      [-23.6280, -46.7620],
      [-23.6250, -46.7260],
      [-23.6180, -46.7020],
      [-23.5960, -46.6880],
      [-23.5780, -46.6770],
      [-23.5610, -46.6660],
      [-23.5650, -46.6540],
      [-23.5715, -46.6465]
    ]
  },
  {
    id: 'leste',
    name: 'Zona Leste',
    label: 'Zona Leste',
    color: '#8B5CF6', // Roxo / Violeta
    center: [-23.5550, -46.4950],
    zoom: 11,
    districtsCount: 8,
    hospitalsCount: 12,
    avgRisk: 'Alto',
    polygon: [
      [-23.4720, -46.4650],
      [-23.4810, -46.4150],
      [-23.5350, -46.3780],
      [-23.6150, -46.3880],
      [-23.6520, -46.4850],
      [-23.6320, -46.5180],
      [-23.6150, -46.5620],
      [-23.5890, -46.5720],
      [-23.5780, -46.6120],
      [-23.5660, -46.6190],
      [-23.5540, -46.6260],
      [-23.5360, -46.6240],
      [-23.5350, -46.5920],
      [-23.5220, -46.5820],
      [-23.5050, -46.5580],
      [-23.5110, -46.5180],
      [-23.4720, -46.4650]
    ]
  },
  {
    id: 'norte',
    name: 'Zona Norte',
    label: 'Zona Norte',
    color: '#F59E0B', // Âmbar / Laranja
    center: [-23.4750, -46.6450],
    zoom: 11,
    districtsCount: 7,
    hospitalsCount: 11,
    avgRisk: 'Médio',
    polygon: [
      [-23.3550, -46.7850],
      [-23.3850, -46.6350],
      [-23.4220, -46.5650],
      [-23.4680, -46.5680],
      [-23.4920, -46.5680],
      [-23.5220, -46.5820],
      [-23.5350, -46.5920],
      [-23.5360, -46.6240],
      [-23.5200, -46.6260],
      [-23.5180, -46.6420],
      [-23.5280, -46.6560],
      [-23.5230, -46.6700],
      [-23.5150, -46.6880],
      [-23.5080, -46.7120],
      [-23.5280, -46.7320],
      [-23.4950, -46.7720],
      [-23.4520, -46.7780],
      [-23.4280, -46.8250],
      [-23.3550, -46.7850]
    ]
  }
];
