-- Schema for KrishiMitra AI - APMC Market Intelligence & Farmer Alerts Module

CREATE TABLE IF NOT EXISTS mandis (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  agmarknet_market_name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farmers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  email VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  preferred_mandi_id INTEGER REFERENCES mandis(id),
  preferred_commodity VARCHAR(100),
  secondary_commodities TEXT[], -- array of strings
  cost_price DECIMAL(10,2),
  unit VARCHAR(50),
  language_preference VARCHAR(20) DEFAULT 'English',
  consent_sms BOOLEAN DEFAULT FALSE,
  consent_sms_timestamp TIMESTAMP,
  consent_whatsapp BOOLEAN DEFAULT FALSE,
  consent_whatsapp_timestamp TIMESTAMP,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_prices (
  id SERIAL PRIMARY KEY,
  mandi_id INTEGER REFERENCES mandis(id),
  commodity VARCHAR(100) NOT NULL,
  variety VARCHAR(100),
  arrival_date DATE NOT NULL,
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  modal_price DECIMAL(10,2),
  source VARCHAR(50) DEFAULT 'Agmarknet',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mandi_id, commodity, variety, arrival_date)
);

CREATE TABLE IF NOT EXISTS alerts_log (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER REFERENCES farmers(id),
  message TEXT NOT NULL,
  channel VARCHAR(20) CHECK (channel IN ('sms', 'whatsapp')),
  status VARCHAR(20) CHECK (status IN ('sent', 'failed', 'pending')),
  provider_message_id VARCHAR(255),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  error_reason TEXT
);

CREATE TABLE IF NOT EXISTS otp_verifications (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  otp_code_hash VARCHAR(255) NOT NULL,
  purpose VARCHAR(50) CHECK (purpose IN ('registration', 'login')),
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  attempt_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sync_logs (
  id SERIAL PRIMARY KEY,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  records_fetched INTEGER DEFAULT 0,
  records_upserted INTEGER DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('success', 'partial', 'failed')),
  error_detail TEXT
);

-- Pharmacy Quick Commerce Tables
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_icon VARCHAR(50),
  delivery_time_mins INTEGER DEFAULT 10,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER REFERENCES farmers(id),
  mandi_hub_id INTEGER REFERENCES mandis(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, preparing, ready, delivered
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10,2) NOT NULL
);
