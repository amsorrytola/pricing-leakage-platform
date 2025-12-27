"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:40px_40px]" />
      
      <nav className="relative border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600" />
              <span className="text-lg font-semibold text-slate-900">Pricing Intelligence</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:shadow-blue-500/20"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div
            className={`transition-all duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              AI-Powered Revenue Intelligence
            </div>
            
            <h1 className="mb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-5xl font-bold leading-tight tracking-tight text-transparent md:text-6xl">
              Identify Revenue Leakage<br />Hidden Inside Commercial Contracts
            </h1>

            <p className="mb-10 max-w-3xl text-lg leading-relaxed text-slate-600">
              Extract, normalize, and analyze pricing terms across thousands of commercial contracts—surface underpricing, expired discounts, and missed escalations with full explainability.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
              >
                Get Started
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:border-slate-400 hover:shadow-md"
              >
                How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">The Problem Financial Institutions Face</h2>
            <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Unstructured Data", desc: "Complex, unstructured pricing terms buried in contracts" },
              { title: "Silent Drift", desc: "Discounts carry forward beyond intended validity periods" },
              { title: "Missed Escalations", desc: "Escalation clauses inconsistently applied or overlooked" },
              { title: "Team Silos", desc: "Different teams negotiate overlapping pricing terms" },
              { title: "No Visibility", desc: "Leadership lacks centralized pricing deviation insights" },
              { title: "Revenue Loss", desc: "Resulting in leakage, erosion, and uncontrolled drift" },
            ].map((item, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 transition-all hover:border-blue-300 hover:shadow-lg"
              >
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md transition-transform group-hover:scale-110">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">How the Platform Works</h2>
            <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Ingest Contracts", desc: "Upload commercial contracts and pricing addendums securely" },
              { step: "02", title: "Extract Pricing Terms", desc: "Identify transaction fees, discounts, tiers, and escalation clauses" },
              { step: "03", title: "Normalize Pricing", desc: "Compare contract terms against your standard pricing catalogue" },
              { step: "04", title: "Surface Leakage", desc: "Detect underpricing, expired concessions, and missed escalations" },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-xl">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="absolute -right-4 top-1/2 hidden h-0.5 w-8 -translate-y-1/2 bg-gradient-to-r from-blue-400 to-indigo-400 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">Key Capabilities</h2>
            <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              "Contract-level pricing term extraction",
              "Client-level commercial profiles",
              "Standard vs agreed pricing comparison",
              "Revenue leakage detection and quantification",
              "Explainable insights for leadership and audit teams",
              "Centralized pricing visibility across the institution",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="flex-1 text-sm font-medium text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">Built For</h2>
            <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🏦", title: "Banks & Financial Institutions" },
              { icon: "💰", title: "Pricing & Revenue Teams" },
              { icon: "📊", title: "Commercial Operations" },
              { icon: "📈", title: "Finance & Profitability" },
            ].map((item, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all hover:border-blue-300 hover:shadow-xl"
              >
                <div className="mb-4 text-4xl transition-transform group-hover:scale-110">{item.icon}</div>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-24">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-white">Create Your Institution Workspace</h2>
          <p className="mb-10 text-lg text-slate-300">
            Gain visibility into pricing deviations and stop revenue leakage before it compounds.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-xl transition-all hover:shadow-2xl"
          >
            Sign Up
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-slate-500">
          © 2025 Pricing Intelligence Platform. All rights reserved.
        </div>
      </footer>
    </main>
  );
}