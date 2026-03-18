# Spending Power Tool — Design Document

## Overview
A personal PWA for quickly sense-checking market size / spending power for a product or service. Single-page app, hosted on Vercel via GitHub. All computation client-side, no backend.

## Core Model
4 inputs, 4 derived outputs:

### Inputs
| Input | Description | Example |
|---|---|---|
| AOV per transaction | Average order value | £50 |
| Return Rate | % of orders returned | 3% |
| Buying Frequency | Purchases per annum | 4.8 |
| Number of Buyers | Total buyer count | 30,000 |

### Outputs (Formulas)
| Output | Formula |
|---|---|
| Net AOV | AOV × (1 - Return Rate) |
| Number of Transactions | Frequency × Buyers |
| Annual Spending Power | Transactions × Net AOV |
| Spend per Buyer | Spending Power / Buyers |

## Two Modes

### Range Mode (Triangular Distribution)
Each input has three fields: Low / Best Estimate / High. Uses triangular distribution.

- Pessimistic, Median, Optimistic outputs computed
- Tornado chart showing absolute monetary impact of each input's variance
- E.g. "if Buyers is off by ±10k, that's ±£2.3M spending power"

### Simulation Mode (Monte Carlo)
Each input has: Central value, Distribution type (Normal/Log-normal/Uniform), Spread parameter (uncertainty %).

- 10,000 iterations client-side
- Summary cards show P10 / P50 (median) / P90
- Histogram with percentile markers and 80% confidence band
- Default: Normal distribution, 20% uncertainty

## Layout
Single page, three vertical sections:
1. **Header** — Title, mode toggle (Range/Simulation), currency selector (£/$/€), dark/light toggle
2. **Inputs panel** — horizontal row on desktop, stacked on mobile
3. **Results area**:
   - 4 large summary cards (Net AOV, Transactions, Annual Spending Power, Spend per Buyer) showing median bold, range smaller
   - Distribution chart below (tornado in Range Mode, histogram in Simulation Mode)

## Tech Stack
- Next.js (static export)
- Tailwind CSS
- Recharts for visualizations
- Client-side computation only

## PWA Features
- Service worker + manifest for offline/installable
- Currency selector (£/$/€)
- Shareable state via URL query string
- Dark/light mode (system preference + toggle)
- Responsive (mobile-first)
- No login, no backend
