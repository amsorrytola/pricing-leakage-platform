// frontend/app/(workspace)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getInstitutionId } from "@/lib/auth";
import {
  fetchDashboardSummary,
  fetchLeakageByClient
} from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";

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

  if (!summary) return <p className="p-10">Loading…</p>;

  return (
    <main className="p-10 space-y-6">
      <PageHeader
  title="Dashboard"
  description="High-level overview of pricing risk and revenue leakage."
/>


      <div className="grid grid-cols-3 gap-6">
        <Stat title="Total Findings" value={summary.total_findings} />
        <Stat title="High Severity" value={summary.high_severity_findings} />
        <Stat title="Clients Impacted" value={summary.clients_impacted} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-8 mb-4">
          Leakage by Client
        </h2>

        <ul className="space-y-2">
          {Object.entries(clients).map(([cid, count]) => (
            <li key={cid} className="border p-3 rounded">
              Client {cid} — {count} findings
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

function Stat({ title, value }: any) {
  return (
    <div className="border rounded p-4">
      <p className="text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
