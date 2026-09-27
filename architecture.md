# KrishiMitra AI — APMC Market Intelligence & Farmer Alerts Module

## 🏗️ Project Architecture & Implementation Plan

Based on your prompt, I'm setting up a production-grade module with the following architecture:

### 1. Project Structure
- **Monorepo Style** (within this directory):
  - `/frontend`: React + TypeScript + Vite + Tailwind CSS
  - `/backend`: Node.js (Express) + TypeScript + PostgreSQL

### 2. Frontend (React/Vite)
- **Styling**: Tailwind CSS using the requested palette:
  - Primary Green: `#2D5016`
  - Secondary Green: `#52B788`
  - Accent Yellow: `#FFD60A`
- **Routing**: `react-router-dom` with the following pages:
  - `/mandi-prices` (Public market prices, trend charts)
  - `/register` (Farmer registration with mandi selection, OTP verification)
  - `/dashboard` (Live profit/loss, price trends, alert history)
  - `/settings` (Profile updates, explicit SMS/WhatsApp consent toggles)
  - `/admin` (Farmer list, sync logs, delivery reports)
- **Key Libraries**: `recharts` for trend charts, `lucide-react` for icons, `axios` for API calls.

### 3. Backend (Node.js/Express)
- **Database**: PostgreSQL (will write raw SQL/pg or use a lightweight query builder)
- **Scheduled Jobs**: `node-cron` for daily data sync from data.gov.in (Agmarknet)
- **Authentication**: JWT based, passwordless OTP flow (hashed OTPs in the database)
- **API Organization**:
  - `/api/farmer/*` (Auth, Registration, Profile, Opt-out)
  - `/api/mandis/*` (Mandi list, search)
  - `/api/prices/*` (Daily prices, historical trends, P&L calculations)
  - `/api/admin/*` (Stats, Broadcast, Logs)

### 4. Database Schema (PostgreSQL)
We will enforce relational integrity for these core tables:
1. `mandis` (id, name, state, district, location, agmarknet_name)
2. `farmers` (id, phone, preferences, cost_price, consent flags)
3. `market_prices` (daily Agmarknet records, FK to mandis)
4. `otp_verifications` (rate-limited, hashed OTPs)
5. `alerts_log` (delivery statuses for SMS/WhatsApp)
6. `sync_logs` (cron job execution history)

### 5. Next Steps
1. **Scaffold the project**: I am currently running background tasks to generate the `frontend` (Vite) and `backend` (Express) folders and install all required dependencies.
2. **Database Setup**: I will write the SQL migration script to create the schema. Do you have a local PostgreSQL server running, or should we set up a Docker compose file?
3. **Tailwind Config**: I will configure the custom colors and base UI components.
4. **Backend API**: I will start with the Agmarknet Sync Job and the Mandi lookup API.

Let me know if this aligns with your expectations!
