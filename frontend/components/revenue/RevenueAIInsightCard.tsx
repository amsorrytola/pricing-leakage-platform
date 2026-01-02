// frontend/components/revenue/RevenueAIInsightCard.tsx
"use client";

import { useEffect, useState } from "react";

type AIInsight = {
  id: string;
  insight_type: string;
  title: string;
  summary: string;
  recommendations: string[] | null;
  supporting_data: Record<string, any> | null;
  severity: "info" | "warning" | "critical";
  generated_at: string;
};

type Props = {
  contractId: string;
  period?: string | null;
};

const severityConfig = {
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    icon: (
      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-900",
    icon: (
      <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  critical: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    icon: (
      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export default function RevenueAIInsightCard({ contractId, period }: Props) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!contractId) return;

    async function fetchInsights() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/revenue/ai-insights?contract_id=${contractId}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch AI insights");
        }

        const data = await res.json();
        setInsights(data);
      } catch (err) {
        console.error("Error fetching AI insights:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [contractId, period]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <svg className="h-4 w-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">AI Revenue Insights</h2>
              <p className="text-xs text-slate-500">Loading intelligent analysis...</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-slate-200"></div>
              <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">AI Revenue Insights</h2>
              <p className="text-xs text-slate-500">Failed to load insights</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex gap-3">
              <svg className="h-5 w-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-900">Error loading insights</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">AI Revenue Insights</h2>
              <p className="text-xs text-slate-500">Intelligent revenue analysis</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-900 mb-1">No insights available yet</p>
            <p className="text-xs text-slate-500">Submit volume data to generate AI-powered insights</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">AI Revenue Insights</h2>
            <p className="text-xs text-slate-500">{insights.length} intelligent analysis cards</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
        {insights.map((insight) => {
          const config = severityConfig[insight.severity];
          const isExpanded = expandedId === insight.id;

          return (
            <div
              key={insight.id}
              className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden transition-all`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-semibold ${config.text} mb-1`}>
                        {insight.title}
                      </h3>
                      <p className="text-xs text-slate-600 mb-2">
                        {new Date(insight.generated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : insight.id)}
                    className={`flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-colors ${config.text}`}
                  >
                    <svg
                      className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed mb-3">
                  {insight.summary}
                </p>

                {isExpanded && (
                  <div className="space-y-3 pt-3 border-t border-slate-200/50">
                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <div>
                        <h4 className={`text-xs font-semibold ${config.text} uppercase tracking-wide mb-2`}>
                          Recommendations
                        </h4>
                        <ul className="space-y-1.5">
                          {insight.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                              <svg className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {insight.supporting_data && Object.keys(insight.supporting_data).length > 0 && (
                      <div>
                        <h4 className={`text-xs font-semibold ${config.text} uppercase tracking-wide mb-2`}>
                          Supporting Data
                        </h4>
                        <div className="rounded-lg bg-white/50 p-3 border border-slate-200/50">
                          <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-auto max-h-40">
                            {JSON.stringify(insight.supporting_data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/50 border border-slate-200/50">
                        <svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="text-xs font-medium text-slate-600 capitalize">
                          {insight.insight_type.replace(/_/g, " ")}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}