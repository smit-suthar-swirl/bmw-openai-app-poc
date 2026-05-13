# BMW AI Assistant — Phase 2

A semi-production automotive AI platform built with MCP Server, Express, PostgreSQL/Prisma, JWT auth, PostHog analytics, and React.

---

## Phase 2 Features

| Feature | Status |
|---------|--------|
| PostgreSQL + Prisma ORM | ✓ (optional — falls back to mock data) |
| Dealer Locator (UAE) | ✓ |
| Test Drive Booking | ✓ |
| JWT Authentication | ✓ (requires DB) |
| Analytics Tracking | ✓ (DB + PostHog) |
| Rate Limiting + Helmet | ✓ |
| Zod Validation | ✓ |
| Controller/Service/Repository architecture | ✓ |
| 5 MCP Tools | ✓ |
| Premium React UI | ✓ |
| Advanced Search Filters | ✓ |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start development (mock data mode — no DB needed)
```bash
npm run dev
```

This starts:
- **API Server**: http://localhost:3001
- **Web App**: http://localhost:5173

---

## PostgreSQL Setup (optional but recommended)

Without PostgreSQL, the app uses in-memory mock data. All features except user auth work.

### Option A: Docker (fastest)
```bash
docker run -d \
  --name bmw-ai-db \
  -e POSTGRES_DB=bmw_ai \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:16-alpine
```

### Option B: Local PostgreSQL
Create a database named `bmw_ai` and update `DATABASE_URL` in your `.env`.

### Apply schema + seed
```bash
# Push schema to database
npm run db:push --workspace=server

# Seed with BMW vehicles and UAE dealers
npm run db:seed --workspace=server

# (Optional) Open Prisma Studio to browse data
npm run db:studio --workspace=server
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port (default: 3001) |
| `NODE_ENV` | No | `development` or `production` |
| `CORS_ORIGIN` | No | Web app URL (default: http://localhost:5173) |
| `DATABASE_URL` | No* | PostgreSQL connection string |
| `JWT_SECRET` | Yes (auth) | Secret key — **change in production** |
| `JWT_EXPIRES_IN` | No | Token TTL (default: 7d) |
| `POSTHOG_API_KEY` | No | PostHog analytics key |
| `POSTHOG_HOST` | No | PostHog host (default: https://app.posthog.com) |

*Without `DATABASE_URL`, the app runs in mock-data mode.

---

## API Reference

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | List all vehicles |
| POST | `/api/vehicles/search` | Search with filters |
| POST | `/api/vehicles/compare` | Compare two models |
| POST | `/api/vehicles/pricing` | Get pricing + specs |

### Dealers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dealers` | List all UAE dealers |
| GET | `/api/dealers?city=Dubai` | Filter by city |
| GET | `/api/dealers/:id` | Get dealer by ID |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/test-drive` | Create test drive booking |
| GET | `/api/test-drive?email=...` | Get bookings by email |

### Auth (requires PostgreSQL)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Get current user (protected) |

---

## MCP Tools (5 total)

### `search_bmw_models`
Search by type, price, performance, or natural language.

```json
{
  "query": "electric BMW under $80k",
  "type": "EV",
  "maxPrice": 80000,
  "isElectric": true,
  "minHorsepower": 400,
  "minSeating": 5
}
```

### `compare_bmw_models`
Side-by-side comparison.

```json
{ "modelA": "BMW M4", "modelB": "BMW i4" }
```

### `get_bmw_pricing`
Full pricing + specification card.

```json
{ "model": "BMW X5" }
```

### `find_bmw_showrooms`
UAE BMW dealer locations with Maps links.

```json
{ "city": "Dubai" }
```

### `book_test_drive`
Create a test drive booking with confirmation.

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com",
  "phone": "+971-55-123-4567",
  "vehicleName": "BMW i4",
  "dealerCity": "Dubai",
  "preferredDate": "2026-09-20"
}
```

---

## MCP Integration (Claude Desktop)

Build the server first:
```bash
npm run build --workspace=server
```

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "bmw-ai": {
      "command": "node",
      "args": ["/absolute/path/to/bmw-ai/server/dist/mcp/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://postgres:password@localhost:5432/bmw_ai"
      }
    }
  }
}
```

Or for development (without build):
```bash
npm run dev:mcp --workspace=server
```

---

## Example User Flows

### Flow 1: Vehicle Search
> "Best BMW SUV under $90k"
→ `search_bmw_models` → Vehicle cards (BMW X5, BMW X3)

### Flow 2: Comparison
> "Compare BMW M4 vs BMW i4"
→ `compare_bmw_models` → Side-by-side table

### Flow 3: Dealer Locator
> "Nearest BMW showroom in Dubai"
→ `find_bmw_showrooms` → Dealer cards with Maps links

### Flow 4: Test Drive Booking
> "Book a test drive for BMW i4 in Dubai"
→ `book_test_drive` → Confirmation with reference number

---

## Project Structure

```
bmw-ai/
├── package.json                   # Monorepo root
├── .env.example
├── shared/
│   └── src/types.ts               # Shared TypeScript types
├── server/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                # Seed script
│   └── src/
│       ├── db/prisma.ts           # Prisma client singleton
│       ├── repositories/          # Database access layer
│       │   ├── vehicleRepository.ts
│       │   ├── dealerRepository.ts
│       │   ├── bookingRepository.ts
│       │   ├── userRepository.ts
│       │   └── analyticsRepository.ts
│       ├── services/              # Business logic
│       │   ├── vehicleService.ts
│       │   ├── dealerService.ts
│       │   ├── bookingService.ts
│       │   ├── authService.ts
│       │   └── analyticsService.ts
│       ├── controllers/           # Request handlers
│       ├── routes/                # Express routers
│       ├── middleware/            # Auth, errors, rate limit, validate
│       ├── validations/           # Zod schemas
│       ├── tools/                 # MCP tool definitions
│       ├── mcp/                   # MCP Server (5 tools)
│       ├── data/                  # Mock data fallback
│       ├── utils/                 # Text formatters
│       ├── app.ts                 # Express app
│       └── server.ts              # HTTP server
└── apps/
    └── web/
        └── src/
            ├── api/client.ts      # API client + intent parser
            └── components/
                ├── ChatInterface.tsx
                ├── VehicleCard.tsx
                ├── ComparisonTable.tsx
                ├── PricingCard.tsx
                ├── DealerCard.tsx
                ├── BookingForm.tsx
                ├── BookingConfirmationCard.tsx
                ├── FilterPanel.tsx
                └── LoadingState.tsx
```

---

## Phase 1 vs Phase 2

| Capability | Phase 1 | Phase 2 |
|------------|---------|---------|
| MCP Tools | 3 | **5** |
| Database | Mock only | **PostgreSQL + Prisma** |
| Architecture | Flat | **Controller/Service/Repository** |
| Auth | None | **JWT** |
| Dealer Locator | None | **UAE showrooms** |
| Test Drive | None | **Full booking flow** |
| Analytics | None | **DB + PostHog** |
| Validation | None | **Zod schemas** |
| Security | CORS | **Helmet + Rate limiting** |
| UI | Basic | **Advanced filters + booking form** |

## Phase 3 (not built)
- Production deployment (Docker / Railway / Render)
- Real BMW API integration
- Admin dashboard
- Multi-language support (Arabic/English)
- Payment integration
- Live dealer inventory
