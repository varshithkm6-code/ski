# SkillBridge Production Deployment Guide

This guide walks you through deploying **SkillBridge** to production using **MongoDB Atlas** for data persistence and **Vercel** for serverless hosting.

---

## Architecture Overview

- **Frontend & API**: Next.js 16 App Router hosted on **Vercel**
- **Database**: **MongoDB Atlas** (M0 Free Tier or Dedicated Cluster)
- **ORM / Query Engine**: **Prisma ORM** (`prisma/schema.mongo.prisma`)
- **Authentication**: NextAuth v5 with stateless JWT sessions (no database locks or session adapter required)
- **Data Protection**: AES-256-GCM symmetric encryption for uploaded resume text (`src/lib/crypto.ts`)
- **Intelligence**: Dual-mode engine (instant heuristic fallback or Google Gemini API)

---

## Prerequisites

1. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.
2. A [Vercel](https://vercel.com) account.
3. A [GitHub](https://github.com) account with your SkillBridge repository pushed.
4. Node.js 20+ installed locally.

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create a Cluster
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Click **Create** to deploy a new database.
3. Select **M0 Free** (Shared) and choose a region closest to your Vercel deployment region (e.g., `us-east-1` / `iad1` or `eu-west-1`).
4. Name your cluster (e.g., `skillbridge-cluster`) and click **Create Deployment**.

### 1.2 Create Database User
1. Under **Security** in the left sidebar, click **Database Access**.
2. Click **Add New Database User**.
3. Authentication Method: **Password**.
4. Set a Username (e.g., `skillbridge_admin`) and secure Password.
5. Under **Database User Privileges**, select **Read and write to any database** (or restrict to `skillbridge`).
6. Click **Add User**.

### 1.3 Configure Network Access (IP Whitelist)
Because Vercel routes traffic through dynamic serverless IPs, you must allow external connections:
1. Under **Security** in the left sidebar, click **Network Access**.
2. Click **Add IP Address**.
3. Click **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Enter description: `Vercel Serverless Functions`.
5. Click **Confirm**.

### 1.4 Get the Connection String
1. Under **Deployment** in the left sidebar, click **Database**.
2. Click the **Connect** button next to your cluster.
3. Select **Drivers** (Node.js).
4. Copy the connection string. It will look like:
   ```text
   mongodb+srv://<username>:<password>@skillbridge-cluster.xxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Append `/skillbridge` before the query parameter `?`:
   ```text
   mongodb+srv://<username>:<password>@skillbridge-cluster.xxxx.mongodb.net/skillbridge?retryWrites=true&w=majority
   ```

---

## Step 2: Initialize & Verify Database

In your local terminal, initialize and verify the MongoDB Atlas database before deploying:

### 2.1 Generate 64-char Hex Encryption Key
Run this in PowerShell / terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Save this 64-character hex key for `ENCRYPTION_KEY`.

### 2.2 Generate 32-char Base64 Auth Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Save this string for `AUTH_SECRET`.

### 2.3 Push MongoDB Prisma Schema
Run `prisma db push` pointing to your MongoDB Atlas connection:
```bash
DATABASE_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/skillbridge?retryWrites=true&w=majority" npm run db:push:mongo
```
This automatically provisions collections and indexes on Atlas:
- `users` (index on `email`)
- `profiles`
- `profile_skills`
- `skills`
- `roles`
- `role_skills`
- `analyses` (compound index on `[userId, createdAt]`)
- `gaps`
- `roadmap_items` (index on `analysisId`)
- `progress_events`

### 2.4 Seed Database
Populate standard skills, target roles, and baseline accounts:
```bash
DATABASE_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/skillbridge?retryWrites=true&w=majority" npm run db:seed
```

### 2.5 Run Verification Check
Verify connection health, collection counts, and relational queries:
```bash
DATABASE_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/skillbridge?retryWrites=true&w=majority" npm run verify:atlas
```
You should see:
```text
✅ Connection established successfully
📊 Checking Collections & Document Counts:
  • Users:         10
  • Target Roles:  12
  • Skills:        114
  • Profiles:      10
  • Analyses:      22
🧪 Running Sample Query Integrity Check:
✅ Sample Role found: "Frontend Developer"
✨ ALL CHECKS PASSED: Database is healthy & ready
```

---

## Step 3: Deploy to Vercel

### 3.1 Push Changes to GitHub
```bash
git add .
git commit -m "feat: production readiness with MongoDB Atlas schema, PWA manifest, and health check"
git push origin main
```

### 3.2 Import Project into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Select your `SkillBridge` GitHub repository and click **Import**.
3. Framework Preset: **Next.js** (detected automatically).
4. Root Directory: `./`.

### 3.3 Set Environment Variables
Add the following Environment Variables in the Vercel project configuration:

| Variable | Example Value | Description |
|---|---|---|
| `DATABASE_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/skillbridge?retryWrites=true&w=majority` | MongoDB Atlas Connection String |
| `AUTH_SECRET` | `dGhpcy1pcy1hLXNlY3JldC1zdHJpbmctZXhhbXBsZQ==` | Generated random base64 secret |
| `AUTH_URL` | `https://skillbridge.vercel.app` (your Vercel domain) | NextAuth Canonical Domain |
| `NEXTAUTH_URL` | `https://skillbridge.vercel.app` | NextAuth v5 fallback domain |
| `ENCRYPTION_KEY` | `9f8e7d6c5b4a...` (64 hex characters) | AES-256-GCM symmetric key |
| `COUNSELOR_EMAILS` | `counselor@demo.skillbridge.dev` | Comma-separated counselor emails |
| `AI_PROVIDER` | `heuristic` | `heuristic` or `gemini` |
| `GEMINI_API_KEY` | `AIzaSy...` | Optional Gemini API key |

> **Note on Build Hook**: The `postinstall` script in `package.json` automatically runs `prisma generate`, so Prisma client bindings are compiled during Vercel's build step.

### 3.4 Deploy
1. Click **Deploy**.
2. Once the build finishes, your deployment will be live at `https://<your-project>.vercel.app`.

---

## Step 4: Post-Deployment Smoke Test

1. **Health Check Endpoint**:
   Visit: `https://<your-project>.vercel.app/api/health`
   Expected response:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "latencyMs": 42,
     "timestamp": "2026-10-08T..."
   }
   ```

2. **Login Verification**:
   - Navigate to `/login`.
   - Click demo chip **Alex (Candidate · CS)** or use credentials `alex@demo.skillbridge.dev` / `demo1234`.
   - Verify you are redirected to `/dashboard`.

3. **Readiness Assessment Flow**:
   - Step 1: Review or add skills in Profile Intake -> Click **Select Target Role**.
   - Step 2: Choose **Frontend Developer** -> Click **Analyze Career Readiness**.
   - Step 3: Review the Readiness Intelligence Bento Grid, Radar Chart, and Gap Matrix.
   - Click **Why this score?** to open the scoring breakdown drawer.
   - In 30-Day Action Plan, click the checkbox on a milestone to complete it and verify live score bump.

4. **Counselor View**:
   - Log out and sign in as `counselor@demo.skillbridge.dev` / `demo1234`.
   - Visit `/counselor`.
   - Verify student list, cohort average score, and student drilldown.

5. **PWA & Mobile Verification**:
   - Open Chrome DevTools Device Mode (or open the URL on mobile Safari / Chrome).
   - Verify hamburger menu drawer, responsive layouts, and PWA manifest at `/manifest.webmanifest`.

---

## Switching Between Environments

- **Local Zero-Config Offline Dev**: Uses SQLite (`file:./dev.db`).
  ```bash
  npm run dev
  ```
- **Local MongoDB Dev**: Set `DATABASE_URL="mongodb+srv://..."` in `.env.local` and run:
  ```bash
  npm run db:generate:mongo
  npm run dev
  ```
- **Production (Vercel)**: Automatically connects to MongoDB Atlas using the configured Vercel environment variables.
