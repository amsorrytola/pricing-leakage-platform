📊 Pricing Leakage & Revenue Intelligence Platform

A Contract Operating System for Banks & Financial Institutions

An enterprise-grade contract intelligence and revenue analytics platform designed to detect pricing leakage, revenue impact, service expiry risks, and operational blind spots — powered by deterministic data pipelines with pluggable AI insights.

This is not a PDF analyzer.
This is a Contract Operating System (Contract OS).

🧠 Core Problem We Solve

Banks lose crores in revenue due to:

Underpriced services at scale

Forgotten contract renewals

Manual and delayed volume reporting

Lack of service-level revenue visibility

Most tools stop at:

“You are underpriced.”

We go further:

“You lost ₹3.4 Cr in Q1 because ACH was underpriced by ₹0.7 at high volumes.”

That difference drives decisions.

🏗️ High-Level Architecture
PDF Contract
     ↓
Contract Ingestion & Secure Storage
     ↓
Text Extraction + Normalization
     ↓
Service & Pricing Extraction
     ↓
Volume Reports (Multi-period)
     ↓
Revenue Impact Engine
     ↓
Dashboards, Trends, Notifications
     ↓
(Pluggable AI Insights Layer)

🧩 Feature Overview
1️⃣ Contract Management

Upload contracts (PDF)

Secure storage (Supabase bucket)

Metadata + raw text extraction

Contract-level navigation & traceability

2️⃣ Contract Normalization

Extract structured pricing terms

Identify billable services

Convert unstructured contracts into analytics-ready data

Normalization can be enhanced with:

  LLM-based clause understanding
  
  RAG over historical contracts
  
  Confidence scoring for extracted terms

3️⃣ Pricing Catalogue (Standard Pricing)

  Institution-wide pricing baseline
  
  Versioned pricing catalogues
  
  Reference layer for leakage detection

4️⃣ Revenue Analysis (Core Differentiator)

  📍 Dedicated Revenue Analysis Page
  
  Computation logic:
  
  price_diff = contract_price − standard_price
  revenue_impact = price_diff × volume
  
  
  Outputs:
  
  🔴 Leakage (₹ loss)
  
  🟢 Overpricing gain
  
  🟡 Net revenue impact
  
  Visualizations:
  
  Leakage by service (bar chart)
  
  Leakage trends over time (line chart)
  
  Period-wise comparisons


  Auto-generated executive summaries “Top contributors to leakage”, Natural-language explanations of impact

5️⃣ Volume Reporting (Multi-Submission)

  Monthly / quarterly volume submissions
  
  Draft vs Final states
  
  Historical storage for comparison
  
  Enables:
  
    Trend analysis
    
    Forecasting
    
6️⃣ Service Log (Operational Risk Tracker)

  Tracks service lifecycle per contract:
  
  Status	Meaning
  🟢 Active	Valid > 30 days
  🟡 Expiring	≤ 30 days
  🔴 Expired	Past expiry
  
  UI Features:
  
  Summary counts
  
  Color-coded service list
  
  Expiry-based sorting
    
  Infer expiry dates from unstructured clauses
  
  Risk explanations (“Why this is critical”)

7️⃣ Notifications System (Enterprise-Ready)

  🔔 Dedicated Notifications Page
  
  Triggered by deterministic backend rules:
  
  Service expiring in 30 / 15 / 7 days
  
  Service expired
  
  Contract-level risk escalation
  
  Design Principles:
  
  No AI hallucinations
  
  Immutable audit trail
  
  Severity-based alerts
  
  Contextual explanations
  
  “What should the RM do next?”
  
  Auto-drafted renewal emails


🛠️ Tech Stack
Frontend
Next.js (App Router)
TypeScript
Tailwind CSS
Recharts
Hooks-based data fetching

Backend
FastAPI
PostgreSQL (Supabase)
Supabase Storage
Pydantic schemas
Cron-ready background jobs

RAG & AI (Pluggable / Experimental)
Document chunking & embeddings
Retrieval-Augmented Generation over contract corpus
Local LLM inference (Ollama)
LoRA-based fine-tuning experiments on curated contract data
Executive summaries & explanations (non-critical paths)
⚠️ AI is additive, never authoritative.
🔐 Design Principles
Single Source of Truth (backend logic)
No AI for critical decisions
Explainability over black-box magic
Auditability for regulated environments
Phase-based extensibility

🚀 Roadmap (AI-Focused)
Phase 3 – AI Enhancements

Insight cards on Revenue Analysis

“Why leakage happened” explanations

Executive-ready summaries

Phase 4

Leakage forecasting

Renegotiation priority scoring

Board-ready PDF exports

Phase 5

Email / Slack alerts

RM task workflows

Auto-renewal & repricing simulations

🏦 Why Banks Care

This platform shifts conversations from:

❌ “Your pricing is wrong”
to
✅ “You lost ₹3.4 Cr last quarter — here’s how to fix it.”

That delivers:

Revenue recovery value

Risk mitigation value

Budget-approval clarity

⚙️ Setup & Run
Prerequisites

Node.js ≥ 18

Python ≥ 3.10

Supabase project (DB + Storage)

Docker (optional, for local services)

Backend Setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt


Create .env:

SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...


Run backend:

uvicorn app.main:app --reload


Backend runs on:
http://localhost:8000

Frontend Setup
cd frontend
npm install
npm run dev

create .env:
NEXT_PUBLIC_API_BASE=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

Frontend runs on:
http://localhost:3000

Optional: Local LLM 
ollama pull mistral
ollama serve


