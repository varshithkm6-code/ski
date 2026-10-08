# 🌉 SkillBridge: AI-Powered Skill Gap & Career Readiness Analyzer

SkillBridge is a full-stack web application designed for students and career switchers to objectively measure their career readiness against real job requirements, identify prioritized skill gaps, and execute an interactive 30/60/90-day learning roadmap with live score recalculation.

Inspired by [SkillGap AI](https://skillgapai.in/#assessment), SkillBridge delivers a deterministic scoring engine, interactive competency radar visualizations, AI-driven strategic guidance, and career counselor cohort tracking.

---

## ⚡ Quick Start

### 1. Prerequisites & Database Setup
- **Default (Zero-Config Local Dev)**: **SQLite** (`DATABASE_URL="file:./dev.db"`). Completely self-contained, pre-seeded with 114 skills and 12 roles. Requires no background database service or Docker.
- **Production (MongoDB Atlas)**: Recommended production database. See [DEPLOY.md](file:///c:/Users/kpmun/OneDrive/Desktop/sg/DEPLOY.md) for full step-by-step Atlas setup and Vercel deployment instructions:
  ```bash
  # Push MongoDB schema and seed:
  DATABASE_URL="mongodb+srv://..." npm run db:push:mongo
  DATABASE_URL="mongodb+srv://..." npm run db:seed
  # Verify connectivity:
  DATABASE_URL="mongodb+srv://..." npm run verify:atlas
  ```
- **Local Containerized Alternative (PostgreSQL)**: Supported via Docker Compose:
  ```bash
  docker compose up -d postgres
  # In .env: DATABASE_URL="postgresql://skillbridge:skillbridge@localhost:5432/skillbridge"
  npx prisma db push && npm run db:seed
  ```

### 2. Install & Start Development Server
```bash
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Pre-Seeded 1-Click Demo Accounts

The login page at **`/login`** includes **1-Click Quick-Fill buttons** for instant testing:

| Persona | Email | Password | Role / Description |
|---|---|---|---|
| **Alex Chen** | `alex@demo.skillbridge.dev` | `demo1234` | **Candidate** (CS Graduate · Target: Frontend Developer) |
| **Jordan Kim** | `jordan@demo.skillbridge.dev` | `demo1234` | **Candidate** (Career Switcher · Target: Data Analyst) |
| **Dr. Sarah Mehta** | `counselor@demo.skillbridge.dev` | `demo1234` | **Counselor** (Academic Advisor · Access to Cohort Portal) |

---

## 🚀 Key Features & Flow

### 1. Assessment Flow (`/dashboard`)
- **Step 1: Profile Intake**
  - Drag & drop resume upload (PDF / DOCX with server-side text extraction via `pdf-parse` & `mammoth`)
  - 1-Click Preset Loaders (`Alex Chen CS Grad` or `Jordan Kim Career Switcher`)
  - Competency Editor with 1-5 star proficiency ratings and evidence reliability tiers (Self-Rated `0.75x`, Project `0.90x`, Experience `0.95x`, Certification `1.00x`)
- **Step 2: Target Role Selection**
  - Choose from 12+ industry standard benchmarks (`Frontend`, `Backend`, `Full-Stack`, `DevOps`, `Data Analyst`, `ML Engineer`, `Mobile`, `Security`, etc.)
  - Filter by seniority (`Entry`, `Mid`, `Senior`)
  - Or switch to **Custom JD Mode**: Paste any job description to extract structured competencies via Gemini AI
- **Step 3: Interactive Readiness Dashboard**
  - **Circular SVG Score Gauge** (0-100 animated score with confidence rating)
  - **Competency Radar Chart** (Candidate proficiency polygon overlaid on role requirement threshold)
  - **5-Part Transparent Scoring Breakdown**:
    - Core Skill Coverage (40%)
    - Proficiency Depth (30%)
    - Evidence Reliability (20%)
    - Nice-to-Have Bonus (5%)
    - Soft Skills & Team Fit (5%)
  - **Prioritized Gap Matrix**: Filter by *Critical Gaps*, *Missing Skills*, *Partial Gaps*, and *Strong Matches* with visual proficiency level bars
  - **AI Insights & Strategic Guidance**:
    - Key Strengths to leverage
    - High-impact resume bullet optimizations
    - Top role-specific technical interview questions with preparation tips
    - Regulatory & ethics disclaimer banner
  - **30/60/90-Day Phased Action Plan / Roadmap**:
    - Month 1: Foundation & Critical Gaps
    - Month 2: Deep Dive & Applied Projects
    - Month 3: Mastery & Interview Readiness
    - **Interactive "Mark Complete" Checkboxes**: As milestones are completed, the Career Readiness Score updates in real time!
  - **Print / PDF Export**: 1-click printable report view

### 2. Benchmark Role Library (`/roles`)
Browse all 12+ curated technical roles with breakdown of core requirements, nice-to-have skills, minimum proficiency bars, and weighting.

### 3. Assessment History (`/history`)
Track progression, benchmark dates, completed milestones, and score trajectory over time.

### 4. Counselor Cohort Portal (`/counselor`)
Advisors and career counselors can:
- View cohort-wide metrics (Avg Readiness Score, Job-Ready count, At-Risk advisees)
- Student roster with score badges and target roles
- Drill-down inspector reviewing any student's individual gap matrix, strengths, and roadmap completion

---

## 🧪 Testing & Verification

### Unit Tests (Vitest)
Run the 28 unit tests covering deterministic scoring, gap classification, edge cases, and AI schemas:
```bash
npm run test
```
```
✓ tests/unit/scoring.test.ts (17 tests)
✓ tests/unit/ai-provider.test.ts (11 tests)
Test Files: 2 passed (2)
Tests:      28 passed (28)
```

### End-to-End Verification Script
Run the automated end-to-end integration test:
```bash
npx tsx scripts/verify-e2e.ts
```
Tests database seeding, user authentication, score calculation, gap distribution, roadmap generation, AI insights schema validation, DB persistence, and milestone live score recalculation.

---

## 🏗️ Tech Stack & Pinned Versions

- **Framework**: [Next.js](https://nextjs.org/) `16.4.0` (Turbopack, App Router, `src/` layout)
- **Runtime**: React `19.3.0` & TypeScript `5.x`
- **Authentication**: [Auth.js / NextAuth](https://authjs.dev/) `5.0.0-beta.32` (Credentials Provider, JWT Session)
- **Database ORM**: [Prisma](https://www.prisma.io/) `6.19.3` (`@prisma/client@6.19.3`)
- **Database Engines**: SQLite (`file:./dev.db`) for zero-daemon local dev; MongoDB Atlas for production deployment; PostgreSQL supported via Docker Compose
- **Visualization**: [Recharts](https://recharts.org/) `3.10.1` (Interactive Radar Chart & Area Score Trends)
- **AI Integration**: Multi-provider architecture (`GeminiProvider` via `@google/generative-ai` + deterministic heuristic fallback with Zod schema validation)
- **Styling**: Tailwind CSS v4 + Clinical Editorial Light Theme design tokens with glassmorphism and responsive layouts
- **Unit Testing**: Vitest `2.1.9` (28 unit tests)
- **E2E Testing**: Playwright `1.64.0` (Desktop + Mobile Chrome coverage)
