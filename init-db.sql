-- Crear tabla para sectores
CREATE TABLE IF NOT EXISTS sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Crear tabla para países
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    code CHAR(2) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL
);

-- Crear tabla para mercados
CREATE TABLE IF NOT EXISTS markets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Crear tabla para empresas
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    country_id INTEGER REFERENCES countries(id),
    sector_id INTEGER REFERENCES sectors(id),
    market_id INTEGER REFERENCES markets(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar la velocidad de consulta
CREATE INDEX idx_companies_symbol ON companies(symbol);
CREATE INDEX idx_companies_country_id ON companies(country_id);
CREATE INDEX idx_companies_sector_id ON companies(sector_id);
CREATE INDEX idx_companies_market_id ON companies(market_id);

-- Pre-cargar algunos mercados comunes
INSERT INTO markets (name) VALUES 
('NASDAQ'), 
('NYSE'), 
('BCBA'), -- Buenos Aires (Argentina)
('EURONEXT'),
('LSE'), -- London Stock Exchange
('XETRA'), -- Frankfurt
('IBEX'); -- España

-- Pre-cargar países para filtrar empresas
INSERT INTO countries (code, name) VALUES 
('US', 'United States'),
('AR', 'Argentina'),
('GB', 'United Kingdom'),
('DE', 'Germany'),
('FR', 'France'),
('ES', 'Spain'),
('IT', 'Italy'),
('NL', 'Netherlands');