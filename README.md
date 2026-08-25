# 🏙️ HealthCore.AI — Observatório de Saúde Urbana de São Paulo

<p align="center">
  <img src="assets/mockups/03_logo_healthcore.png" width="160" alt="HealthCore.AI Logo" />
</p>

Plataforma inteligente de monitoramento epidemiológico e prevenção de riscos sanitários urbanos em tempo real para a cidade de São Paulo. Integrando dados comunitários, inteligência preditiva e mapas interativos de risco.

---

## 📱 Visualização das Telas (Mockups)

| Tela | Descrição | Imagem |
|------|-----------|--------|
| **Home Dashboard** | Visão geral da saúde urbana, qualidade do ar, arboviroses e notícias | `assets/mockups/06_home_dashboard.png` |
| **Mapa Principal** | Zonas de risco em tempo real em mapa Dark Mode com filtro temporal | `assets/mockups/05_mapa_principal.png` |
| **Hospitais Próximos** | Busca por localização de UBSs e Hospitais com cálculo de distância | `assets/mockups/04_mapa_hospitais_proximos.png` |
| **Avaliação de Região** | Formulário comunitário com avaliação por estrelas de 4 categorias | `assets/mockups/01_form_avaliacao_regiao.png` |
| **Predisposição (AI)** | Wizard interativo para cálculo de predisposição a doenças | `assets/mockups/07_form_predisposicao.png` |
| **Modo Agente** | Gamificação educativa sobre saúde pública de SP com badges | `assets/mockups/08_game_agente_saude.png` |
| **Profile & Feedback** | Avaliação de experiência com emojis e relatos de melhorias/erros | `assets/mockups/02_profile_feedback.png` |

---

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **React Router DOM v7** (Mobile-first app routing)
- **Leaflet** / **React Leaflet v5** (Mapas interativos com camadas de zonas de risco)
- **Vanilla CSS3** (Design system com variáveis CSS, glassmorphism, animações fluidas)

### Backend & Banco de Dados
- **Node.js** + **Express 5**
- **sql.js** (In-Memory SQLite via WebAssembly, totalmente compatível com a modelagem **PostgreSQL / Supabase**)
- **Algoritmos Epidemiológicos**: Cálculo de Haversine para distâncias e cruzamento de fatores ambientais x hábitos de saúde.

---

## 🗄️ Modelagem de Banco de Dados (Supabase / PostgreSQL)

O repositório inclui o script DDL SQL completo para deploy no Supabase em [`backend/database/schema.sql`](backend/database/schema.sql):

1. **`regions`**: Cadastro de bairros de SP com coordenadas e nível de risco (Baixo, Médio, Alto).
2. **`epidemiological_data`**: Dados de doenças incidentes (Dengue, Influenza, Tuberculose, etc.).
3. **`health_facilities`**: Hospitais e UBSs com badges de emergência e plantão 24h.
4. **`user_evaluations`**: Formulários enviados pela população (limpeza, insetos, qualidade do ar).
5. **`predisposition_assessments`**: Registros da análise de predisposição (JSONB).
6. **`agent_game_sessions`**: Histórico de partidas e pontuações da gamificação.

---

## ⚙️ Endpoints da API

- `GET /api/regions`: Retorna regiões de SP com índice de risco e coordenadas.
- `GET /api/regions/:id/details`: Detalhes epidemiológicos completos por bairro.
- `GET /api/facilities?lat={lat}&lng={lng}&radius={km}`: Busca hospitais/UBSs mais próximos com tempo estimado a pé e de carro.
- `POST /api/evaluations`: Registra nova avaliação da comunidade sobre a região.
- `POST /api/predisposition/calculate`: Calcula riscos individuais a doenças cruzando hábitos, histórico e dados da região.
- `GET /api/game/questions` & `POST /api/game/submit`: Processa desafios do Agente de Saúde e concede badges.

---

## 💻 Como Rodar Localmente

### Pré-requisitos
- Node.js (v18+) e `npm`

### 1. Iniciar o Backend API (Porta 3001)
```bash
cd backend
npm install
npm run dev
```

### 2. Iniciar o Frontend React (Porta 5173)
```bash
# Na raiz do projeto HealthCore.AI
npm install
npm run dev
```

Acesse em seu navegador: **`http://localhost:5173`**

---

## 📄 Licença
Este projeto é de uso livre sob a licença MIT.
