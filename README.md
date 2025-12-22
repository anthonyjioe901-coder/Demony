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


Investment Calculator - [ ] ROI calculator showing potential returns - [ ] Profit distribution timeline visualization - [ ] Comparison tool between projects - [ ] Break-even analysis ## 3. Clear Terms & Conditions - [ ] Profit-sharing formula (e.g., "Investors receive 60% of profits, platform takes 40%") - [ ] Lock-in period clearly stated - [ ] Early withdrawal penalties (if applicable) - [ ] What happens if project fails - [ ] Investor protection policies - [ ] Dispute resolution process ## 4. Risk Disclosure - [ ] Clear warning: "This is a high-risk investment" - [ ] Possible loss of principal - [ ] No guaranteed returns - [ ] Regulatory compliance information ## 5. Investor Dashboard - [ ] Current investment value - [ ] Projected returns - [ ] Profit history and withdrawals - [ ] Project status updates - [ ] Performance tracking ## 6. Project Manager Verification - [ ] KYC (Know Your Customer) verification - [ ] Business registration proof - [ ] Track record and references - [ ] Insurance or bonding information ## 7. Communication & Updates - [ ] Monthly/weekly profit reports - [ ] Project milestone updates - [ ] Performance notifications - [ ] Risk alerts ## 8. Regulatory Compliance - [ ] Securities registration (if required in your jurisdiction) - [ ] Investor protection insurance - [ ] Audit trails and transparency - [ ] Tax documentation (1099 equivalent)

Scan the codebase and tell me how exactly the above can be done.



Demony is a Investment platform where people can invest in listed local projects, companies, and businesses.

Test and go through this page and report to me what we are not doing right. I mean the projects listed the users keep asking how much they will make. ([20/12/2025 06:59] Tony Shelby: Yes bro I know the owners. It a start and it will become big soon

[20/12/2025 22:32] Mawuli Joy: So this one, how does it work

[20/12/2025 22:35] Tony Shelby: You invest in a project of ur choice then when they start making profit, they share it among their investers

[20/12/2025 22:36] Mawuli Joy: Oh okay

[20/12/2025 22:36] Mawuli Joy: Is the profit daily abd what's the starting rate

[20/12/2025 22:37] Tony Shelby: The starting rate depends on the managers of every project.

[20/12/2025 22:38] Tony Shelby: You find the one that interests you.

[20/12/2025 22:38] Mawuli Joy: Okay 👍🏽

[20/12/2025 22:40] Tony Shelby: For now the company is set to report profite every month coz it new but they promise to change it to weekly and daily if they get good ground.

[20/12/2025 22:40] Tony Shelby: Bro me I know this will become a big thing soon so I am taking the chance.) Note that whay we do is we take their money and start a business with it then reture the profites made. note they are not allow to take their investment back until they the project it closed but they can withdraw profits made.
Help me solidify this idea.
http://localhost:3000/#projects