-- 1. regions (Regiões/Bairros de SP)
CREATE TABLE regions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  risk_level TEXT CHECK(risk_level IN ('Baixo', 'Médio', 'Alto')) NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_regions_name ON regions(name);
CREATE INDEX idx_regions_risk_level ON regions(risk_level);

-- 2. epidemiological_data
CREATE TABLE epidemiological_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  region_id INTEGER NOT NULL REFERENCES regions(id),
  disease_name TEXT NOT NULL,
  cases_count INTEGER DEFAULT 0,
  trend TEXT CHECK(trend IN ('Subindo', 'Estável', 'Descendo')),
  risk_factors TEXT,
  preventative_recommendations TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_epidemiological_data_region_id ON epidemiological_data(region_id);
CREATE INDEX idx_epidemiological_data_disease_name ON epidemiological_data(disease_name);

-- 3. health_facilities
CREATE TABLE health_facilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  region_id INTEGER NOT NULL REFERENCES regions(id),
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('Hospital', 'UBS')) NOT NULL,
  address TEXT,
  phone TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  is_24h INTEGER DEFAULT 0,
  is_emergency INTEGER DEFAULT 0,
  specialties TEXT,
  opening_hours TEXT
);

CREATE INDEX idx_health_facilities_region_id ON health_facilities(region_id);
CREATE INDEX idx_health_facilities_type ON health_facilities(type);

-- 4. user_evaluations
CREATE TABLE user_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  region_id INTEGER NOT NULL REFERENCES regions(id),
  public_cleanliness_rating INTEGER CHECK(public_cleanliness_rating BETWEEN 1 AND 5),
  insect_incidence_rating INTEGER CHECK(insect_incidence_rating BETWEEN 1 AND 5),
  air_quality_rating INTEGER CHECK(air_quality_rating BETWEEN 1 AND 5),
  health_service_rating INTEGER CHECK(health_service_rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_evaluations_region_id ON user_evaluations(region_id);

-- 5. predisposition_assessments
CREATE TABLE predisposition_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_region_id INTEGER REFERENCES regions(id),
  habits_data TEXT, -- JSON string
  family_history TEXT, -- JSON string
  chronic_conditions TEXT, -- JSON string
  calculated_risk_results TEXT, -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_predisposition_assessments_user_region_id ON predisposition_assessments(user_region_id);

-- 6. agent_game_sessions
CREATE TABLE agent_game_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  region_id INTEGER REFERENCES regions(id),
  score INTEGER DEFAULT 0,
  answers_data TEXT, -- JSON string
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_game_sessions_region_id ON agent_game_sessions(region_id);
