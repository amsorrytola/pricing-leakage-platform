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

/* ---------------- Types ---------------- */

type ServiceRow = {
  service_code: string;
  volume?: number;
};

/* ---------------- Page ---------------- */

export default function RevenueAnalysisPage() {
  const { contractId } = useParams<{ contractId: string }>();

  /* ---- READ (Analytics) ---- */
  const [period, setPeriod] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [byService, setByService] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);

  /* ---- WRITE (Volume Input) ---- */
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [inputPeriod, setInputPeriod] = useState("2025-01");
  const [saving, setSaving] = useState(false);

  /* ---------------- Load Analytics ---------------- */

  useEffect(() => {
    if (!contractId) return;

    async function loadAnalytics() {
      const [s, bs, t] = await Promise.all([
        getRevenueSummary(contractId, period),
        getRevenueByService(contractId, period),
        getRevenueTrends(contractId),
      ]);

      setSummary(s);
      setByService(bs);
      setTrends(t);
    }

    loadAnalytics();
  }, [contractId, period]);

  /* ---------------- Load Billable Services ---------------- */

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

  /* ---------------- Load Existing Volume Report ---------------- */

  useEffect(() => {
    if (!contractId || services.length === 0 || !inputPeriod) return;

    async function loadExistingVolumeReport() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/revenue/volume-report?contract_id=${contractId}&period=${inputPeriod}`
      ).then((r) => r.json());

      if (!res.services || res.services.length === 0) return;

      // map service_code -> volume
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

  /* ---------------- Volume Handlers ---------------- */

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

    // refresh analytics after submission
    setPeriod(inputPeriod);
  }

  /* ---------------- UI ---------------- */

  return (
    <main className="max-w-7xl mx-auto p-8 space-y-10">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold">Revenue Analysis</h1>
        <p className="text-sm text-gray-600">
          Volume-based revenue impact & leakage insights
        </p>
      </header>

      {/* Summary */}
      {summary && <SummaryHeader summary={summary} />}

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-8">
        <LeakageByServiceChart data={byService} />
        <RevenueTrendChart data={trends} />
      </div>

      {/* AI Insights Card - NEW */}
      <RevenueAIInsightCard contractId={contractId} period={period} />

      {/* ---------------- Volume Report Input ---------------- */}

      <section className="border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Submit Volume Report</h2>
        <p className="text-sm text-gray-600">
          Enter transaction volumes for this period
        </p>

        {/* Period */}
        <div className="flex gap-3 items-center">
          <label className="text-sm font-medium">Period</label>
          <input
            value={inputPeriod}
            onChange={(e) => setInputPeriod(e.target.value)}
            placeholder="YYYY-MM"
            className="border rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Volume Table */}
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Service</th>
                <th className="text-right p-3">Volume</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={s.service_code} className="border-t">
                  <td className="p-3 font-mono">{s.service_code}</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-32 text-right"
                      value={s.volume ?? ""}
                      onChange={(e) => updateVolume(i, Number(e.target.value))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => submitVolume("draft")}
            disabled={saving}
            className="px-4 py-2 rounded border text-sm"
          >
            Save Draft
          </button>

          <button
            onClick={() => submitVolume("final")}
            disabled={saving}
            className="px-4 py-2 rounded bg-black text-white text-sm"
          >
            Submit Final
          </button>
        </div>
      </section>
    </main>
  );
}