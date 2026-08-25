-- Insert Regions
INSERT INTO regions (id, name, risk_level, latitude, longitude) VALUES
(1, 'Sé', 'Alto', -23.5505, -46.6333),
(2, 'Pinheiros', 'Baixo', -23.5615, -46.6974),
(3, 'Itaquera', 'Alto', -23.5367, -46.4601),
(4, 'Vila Mariana', 'Baixo', -23.5898, -46.6341),
(5, 'Moema', 'Baixo', -23.6006, -46.6631),
(6, 'Bela Vista', 'Médio', -23.5574, -46.6437),
(7, 'Santa Cecília', 'Médio', -23.5385, -46.6504),
(8, 'República', 'Alto', -23.5434, -46.6425),
(9, 'Liberdade', 'Médio', -23.5677, -46.6368),
(10, 'Consolação', 'Médio', -23.5501, -46.6575);

-- Insert Epidemiological Data
INSERT INTO epidemiological_data (region_id, disease_name, cases_count, trend, risk_factors, preventative_recommendations) VALUES
(1, 'Dengue', 120, 'Subindo', 'Água parada, lixo acumulado, alta densidade populacional', 'Eliminar focos de água parada, usar repelente.'),
(1, 'Gripe (Influenza)', 450, 'Estável', 'Aglomerações, clima frio', 'Vacinação anual, lavar as mãos.'),
(1, 'Tuberculose', 35, 'Subindo', 'População em situação de rua, abrigos lotados', 'Ventilação de ambientes, busca ativa de casos.'),
(2, 'Dengue', 15, 'Descendo', 'Jardins com pratos de plantas', 'Limpar calhas, colocar areia nos pratos de plantas.'),
(2, 'COVID-19', 80, 'Estável', 'Contato social, ambientes fechados', 'Manter vacinação em dia.'),
(3, 'Dengue', 300, 'Subindo', 'Saneamento irregular, acúmulo de entulho', 'Uso de telas nas janelas, mutirão de limpeza.'),
(3, 'Asma/Doenças Respiratórias', 210, 'Estável', 'Poluição, poeira, umidade', 'Evitar tapetes, uso correto de inaladores.'),
(4, 'COVID-19', 60, 'Descendo', 'Contato em transporte público', 'Uso de máscaras se sintomático.'),
(5, 'Dengue', 12, 'Estável', 'Piscinas não tratadas', 'Manutenção contínua de piscinas.'),
(6, 'Gripe (Influenza)', 320, 'Subindo', 'Alta circulação de pessoas, eventos', 'Vacinação, higiene das mãos.'),
(6, 'COVID-19', 110, 'Estável', 'Ambientes fechados', 'Ventilação natural.'),
(7, 'Leptospirose', 18, 'Subindo', 'Enchentes, presença de roedores', 'Evitar contato com água de enchente, desratização.'),
(8, 'Dengue', 95, 'Subindo', 'Lixo nas ruas', 'Descarte correto de resíduos.'),
(8, 'Tuberculose', 40, 'Estável', 'Aglomerações, cortiços', 'Acompanhamento médico contínuo.'),
(9, 'Gripe (Influenza)', 150, 'Descendo', 'Mudança de temperatura', 'Vacinação.'),
(10, 'COVID-19', 90, 'Estável', 'Bares e restaurantes lotados', 'Higienização de mãos.');

-- Insert Health Facilities
INSERT INTO health_facilities (region_id, name, type, address, phone, latitude, longitude, is_24h, is_emergency, specialties, opening_hours) VALUES
(1, 'Hospital Santa Casa de Misericórdia', 'Hospital', 'R. Dr. Cesário Mota Júnior, 112 - Vila Buarque', '(11) 2176-7000', -23.5430, -46.6508, 1, 1, 'Geral, Traumatologia, Pediatria', '24 horas'),
(1, 'UBS Sé', 'UBS', 'Rua Frederico Alvarenga, 259 - Sé', '(11) 3105-8869', -23.5510, -46.6300, 0, 0, 'Clínica Geral, Ginecologia, Pediatria', '07:00 - 19:00'),
(2, 'Hospital das Clínicas (HC)', 'Hospital', 'Av. Dr. Enéas Carvalho de Aguiar, 255 - Cerqueira César', '(11) 2661-0000', -23.5567, -46.6670, 1, 1, 'Alta Complexidade, Cardiologia, Neurologia', '24 horas'),
(2, 'UBS Pinheiros', 'UBS', 'Rua Fradique Coutinho, 874 - Pinheiros', '(11) 3814-1188', -23.5600, -46.6890, 0, 0, 'Clínica Geral, Odontologia', '07:00 - 19:00'),
(3, 'Hospital Santa Marcelina', 'Hospital', 'R. Santa Marcelina, 177 - Itaquera', '(11) 2070-6000', -23.5350, -46.4560, 1, 1, 'Maternidade, Ortopedia, Oncologia', '24 horas'),
(3, 'UBS Jardim Itaquera', 'UBS', 'Rua Virgínia Ferni, 400 - Itaquera', '(11) 2521-4455', -23.5380, -46.4620, 0, 0, 'Saúde da Família, Vacinação', '07:00 - 17:00'),
(4, 'Hospital São Paulo', 'Hospital', 'R. Napoleão de Barros, 715 - Vila Clementino', '(11) 5576-4000', -23.5975, -46.6436, 1, 1, 'Transplantes, Oftalmologia, Geral', '24 horas'),
(4, 'UBS Vila Mariana', 'UBS', 'Rua Dr. Diogo de Faria, 41 - Vila Mariana', '(11) 5549-0011', -23.5850, -46.6380, 0, 0, 'Geriatria, Clínica Geral', '07:00 - 19:00'),
(5, 'Hospital Alvorada', 'Hospital', 'Av. Min. Gabriel de Rezende Passos, 550 - Moema', '(11) 5053-5000', -23.6020, -46.6650, 1, 1, 'Ortopedia, Cirurgia Geral', '24 horas'),
(5, 'UBS Moema', 'UBS', 'Alameda dos Nhambiquaras, 1150 - Moema', '(11) 5051-2233', -23.6050, -46.6600, 0, 0, 'Vacinação, Pediatria', '07:00 - 18:00'),
(6, 'Hospital Sírio-Libanês', 'Hospital', 'R. Dona Adma Jafet, 115 - Bela Vista', '(11) 3394-0200', -23.5595, -46.6508, 1, 1, 'Oncologia, Cardiologia, Geral', '24 horas'),
(6, 'UBS Bela Vista', 'UBS', 'Rua Humaitá, 520 - Bela Vista', '(11) 3105-1122', -23.5550, -46.6400, 0, 0, 'Clínica Geral, Ginecologia', '07:00 - 19:00'),
(7, 'Hospital Samaritano', 'Hospital', 'R. Conselheiro Brotero, 1486 - Santa Cecília', '(11) 3821-5300', -23.5370, -46.6580, 1, 1, 'Neurologia, Maternidade', '24 horas'),
(8, 'AMA/UBS Integrada República', 'UBS', 'Praça da República, 299 - República', '(11) 3255-8899', -23.5430, -46.6410, 1, 0, 'Pronto Atendimento, Vacinação', '24 horas'),
(9, 'Hospital Bandeirantes (Leforte)', 'Hospital', 'R. Barão de Iguape, 209 - Liberdade', '(11) 3345-2000', -23.5580, -46.6350, 1, 1, 'Cardiologia, Cirurgia Bariátrica', '24 horas'),
(10, 'UBS Consolação', 'UBS', 'Rua da Consolação, 1900 - Consolação', '(11) 3258-4455', -23.5510, -46.6550, 0, 0, 'Psicologia, Saúde Mental, Geral', '07:00 - 19:00');
