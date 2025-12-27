"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import PageHeader from "@/components/ui/PageHeader";
import StatusPill from "@/components/ui/StatusPill";
import { getInstitutionId } from "@/lib/auth";
import { fetchContractsPaginated } from "@/lib/api";

type Contract = {
  id: string;
  name: string;
  leakage_pct: number | null;
  leakage_severity: "healthy" | "warning" | "critical" | null;
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<string>("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  async function loadContracts(reset = false) {
    const institutionId = await getInstitutionId();
    if (!institutionId) return;

    setLoading(true);

    const res = await fetchContractsPaginated({
      institution_id: institutionId,
      search: search || undefined,
      severity: severity === "all" ? undefined : severity,
      cursor: reset ? undefined : cursor ?? undefined,
      limit: 20,
    });

    setContracts((prev) => (reset ? res.data : [...prev, ...res.data]));
    setCursor(res.next_cursor);
    setHasMore(Boolean(res.next_cursor));
    setLoading(false);
  }

  // Initial + filter/search reload
  useEffect(() => {
    loadContracts(true);
  }, [search, severity]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        description="All uploaded commercial contracts."
        action={
          <Link
            href="/contracts/upload"
            className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Upload Contract
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search contracts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded border px-3 py-2 text-sm"
        />

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">All severities</option>
          <option value="critical">High leakage</option>
          <option value="warning">Attention</option>
          <option value="healthy">Healthy</option>
        </select>
      </div>

      {/* Empty */}
      {!loading && contracts.length === 0 && (
        <div className="mt-10 text-center text-gray-500">
          No contracts found.
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {contracts.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded border p-4 hover:bg-gray-50"
          >
            <div className="space-y-1">
              <div className="font-medium">{c.name}</div>

              <div className="flex items-center gap-3 text-sm">
                {c.leakage_pct !== null ? (
                  <span className="font-medium">{c.leakage_pct}%</span>
                ) : (
                  <span className="text-gray-400">Not analyzed</span>
                )}

                <StatusPill status={c.leakage_severity} />
              </div>
            </div>

            <Link
              href={`/contracts/${c.id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              View
            </Link>
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="pt-4">
          <button
            onClick={() => loadContracts()}
            disabled={loading}
            className="rounded border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
