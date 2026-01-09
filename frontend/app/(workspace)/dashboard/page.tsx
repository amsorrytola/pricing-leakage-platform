// frontend/app/(workspace)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getInstitutionId } from "@/lib/auth";
import {
  fetchDashboardSummary,
  fetchLeakageByClient
} from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";

const HARD_CODED_NOTIFICATIONS = [
  {
    client: "TATA Steel",
    severity: "critical",
    title: "Service Expiry Risk",
    message:
      "ACH Origination Fee expires in 12 days. Renewal required to avoid operational disruption.",
    time: "2 days ago"
  },
  {
    client: "Bajaj Automobile",
    severity: "high",
    title: "Revenue Leakage Alert",
    message:
      "RTGS transactions underpriced by ₹15/unit, causing an estimated ₹1.2 Cr quarterly loss.",
    time: "5 days ago"
  },
  {
    client: "Infosys",
    severity: "medium",
    title: "Pricing Review Suggested",
    message:
      "FX Markup pricing deviates from standard catalogue for high-volume international flows.",
    time: "1 week ago"
  }
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [clients, setClients] = useState<Record<string, number>>({});

  useEffect(() => {
    async function load() {
      const institutionId = await getInstitutionId();
      if (!institutionId) return;

      setSummary(await fetchDashboardSummary(institutionId));
      setClients(await fetchLeakageByClient(institutionId));
    }
    load();
  }, []);

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-slate-600">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const severityConfig = {
    critical: {
      dot: "bg-red-600",
      badge: "bg-red-100 text-red-700 border-red-200",
      icon: (
        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      label: "Critical",
    },
    high: {
      dot: "bg-orange-500",
      badge: "bg-orange-100 text-orange-700 border-orange-200",
      icon: (
        <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "High",
    },
    medium: {
      dot: "bg-yellow-500",
      badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: (
        <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "Medium",
    },
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Enterprise intelligence for pricing risk, revenue impact, and contract alerts"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">Total Findings</p>
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{summary.total_findings}</p>
            <p className="text-xs text-slate-500 mt-2">Across all contracts</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-red-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-red-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-50 to-orange-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">High Severity</p>
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{summary.high_severity_findings}</p>
            <p className="text-xs text-slate-500 mt-2">Requires immediate attention</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">Clients Impacted</p>
              <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{summary.clients_impacted}</p>
            <p className="text-xs text-slate-500 mt-2">With identified issues</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-sm">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Critical Notifications</h2>
              <p className="text-sm text-slate-500">Actionable alerts requiring review or follow-up</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {HARD_CODED_NOTIFICATIONS.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-900">No notifications</p>
              <p className="text-xs text-slate-500 mt-1">All clear — no alerts at this time</p>
            </div>
          ) : (
            HARD_CODED_NOTIFICATIONS.map((n, i) => {
              const config = severityConfig[n.severity as keyof typeof severityConfig];
              
              return (
                <div
                  key={i}
                  className="group flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-10 w-10 rounded-lg bg-white border-2 ${config.badge} flex items-center justify-center`}>
                      {config.icon}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900">{n.client}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-sm font-medium text-slate-700">{n.title}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${config.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`}></span>
                          {config.label}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{n.time}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{n.message}</p>
                  </div>

                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}