// frontend/app/(workspace)/contracts/[contractId]/revenue-analysis/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getRevenueSummary,
  getRevenueByService,
  getRevenueTrends,
} from "@/lib/revenue-api";

import SummaryHeader from "@/components/revenue/SummaryHeader";
import LeakageByServiceChart from "@/components/revenue/LeakageByServiceChart";
import RevenueTrendChart from "@/components/revenue/RevenueTrendChart";
import RevenueAIInsightCard from "@/components/revenue/RevenueAIInsightCard";

type ServiceRow = {
  service_code: string;
  volume?: number;
};

export default function RevenueAnalysisPage() {
  const { contractId } = useParams<{ contractId: string }>();

  const [period, setPeriod] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [byService, setByService] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [inputPeriod, setInputPeriod] = useState("2025-01");
  const [saving, setSaving] = useState(false);

  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (!contractId) return;

    async function loadAnalytics() {
      setLoadingAnalytics(true);
      const [s, bs, t] = await Promise.all([
        getRevenueSummary(contractId, period),
        getRevenueByService(contractId, period),
        getRevenueTrends(contractId),
      ]);

      setSummary(s);
      setByService(bs);
      setTrends(t);
      setLoadingAnalytics(false);
    }

    loadAnalytics();
  }, [contractId, period]);

  useEffect(() => {
    if (!contractId) return;

    async function loadServices() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/contracts/${contractId}/billable-services`
      ).then((r) => r.json());

      const rows = (res.services || []).map((code: string) => ({
        service_code: code,
        volume: 0,
      }));

      setServices(rows);
    }

    loadServices();
  }, [contractId]);

  useEffect(() => {
    if (!contractId || services.length === 0 || !inputPeriod) return;

    async function loadExistingVolumeReport() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/revenue/volume-report?contract_id=${contractId}&period=${inputPeriod}`
      ).then((r) => r.json());

      if (!res.services || res.services.length === 0) return;

      const volumeMap = new Map<string, number>();
      res.services.forEach((s: any) => {
        volumeMap.set(s.service_code, s.volume);
      });

      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          volume: volumeMap.get(s.service_code) ?? 0,
        }))
      );
    }

    loadExistingVolumeReport();
  }, [contractId, inputPeriod, services.length]);

  function updateVolume(index: number, value: number) {
    const copy = [...services];
    copy[index].volume = value;
    setServices(copy);
  }

  async function submitVolume(status: "draft" | "final") {
    setSaving(true);

    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/revenue/volume-report`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_id: contractId,
          period: inputPeriod,
          status,
          services: services
            .filter((s) => s.volume && s.volume > 0)
            .map((s) => ({
              service_code: s.service_code,
              volume: s.volume,
            })),
        }),
      }
    );

    setSaving(false);
    alert(`Volume report ${status} saved`);

    setPeriod(inputPeriod);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Revenue Analysis</h1>
          <p className="text-sm text-slate-600">Volume-based revenue impact and leakage intelligence</p>
        </div>
      </div>

      {loadingAnalytics ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-slate-200"></div>
              <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-slate-600">Loading analytics...</p>
          </div>
        </div>
      ) : (
        <>
          {summary && <SummaryHeader summary={summary} />}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeakageByServiceChart data={byService} />
            <RevenueTrendChart data={trends} />
          </div>

          <RevenueAIInsightCard contractId={contractId} period={period} />
        </>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-sm">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Submit Volume Report</h2>
              <p className="text-sm text-slate-500">Enter transaction volumes to generate revenue impact analysis</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700 min-w-[80px]">Period</label>
            <input
              value={inputPeriod}
              onChange={(e) => setInputPeriod(e.target.value)}
              placeholder="YYYY-MM"
              className="px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wide">Service Code</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wide">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {services.map((s, i) => (
                    <tr key={s.service_code} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-medium text-slate-900">{s.service_code}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          className="w-32 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-900 text-right"
                          value={s.volume ?? ""}
                          onChange={(e) => updateVolume(i, Number(e.target.value))}
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => submitVolume("draft")}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Draft
            </button>

            <button
              onClick={() => submitVolume("final")}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Final
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}