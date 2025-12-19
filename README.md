# Demony

Investment platform where people can invest in listed local projects, companies, and businesses.

## Tech Stack

- **Web App**: Pure JavaScript + HTML/CSS (Vite bundler)
- **Mobile App**: Pure JavaScript + Capacitor (iOS/Android)
- **Backend**: Node.js + Express + C++ native addons
- **Database**: SQLite (can be swapped for PostgreSQL/MySQL)

## Project Structure

```
packages/
├── web/          # Web application (Pure JS + Vite)
├── mobile/       # Mobile application (Pure JS + Capacitor)
├── backend/      # API server (Node.js + C++)
├── shared/       # Shared utilities and constants
└── database/     # Database schema and operations
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- C++ build tools (for native addon)
  - Windows: Visual Studio Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: build-essential

### Installation

```bash
# Install all dependencies
pnpm install

# Or with npm
npm install
```

### Development

```bash
# Start web app (http://localhost:3000)
npm run dev:web

# Start mobile app (http://localhost:3002)
npm run dev:mobile

# Start backend API (http://localhost:3001)
npm run dev:backend
```

### Building

```bash
# Build web app
npm run build:web

# Build mobile app
npm run build:mobile

# Build C++ native addon
npm run build:cpp
```

### Database

```bash
# Initialize database
npm run db:setup

# Seed with sample data
npm run db:seed
```

## C++ Native Addon

The backend includes a C++ native addon for high-performance financial calculations:

- `calculateCompoundInterest(principal, rate, time)`
- `calculateIRR(cashFlows)`
- `calculateNPV(rate, cashFlows)`
- `calculatePortfolioRisk(returns)`
- `calculateSharpeRatio(returns, riskFreeRate)`

To build the C++ addon:

```bash
cd packages/backend
npm run build:cpp
```

## Mobile App

The mobile app uses Capacitor to build native iOS and Android apps from web code:

```bash
cd packages/mobile

# Build web assets
npm run build

# Add platforms
npx cap add android
npx cap add ios

# Sync and open
npx cap sync
npx cap open android  # Opens Android Studio
npx cap open ios      # Opens Xcode
```

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/investments` - Create investment
- `GET /api/investments/my` - Get user investments
- `GET /api/portfolio` - Get portfolio summary
- `POST /api/performance/returns` - Calculate projected returns
- `POST /api/performance/npv` - Calculate NPV
- `POST /api/performance/risk` - Calculate portfolio risk

## License

MIT
