// frontend/app/(workspace)/clients/[clientId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import PageHeader from "@/components/ui/PageHeader";
import StatusPill from "@/components/ui/StatusPill";
import { fetchClientContractsPaginated } from "@/lib/api";
import useDebouncedValue from "@/lib/useDebouncedValue";

export default function ClientContractsPage() {
  const { clientId } = useParams<{ clientId: string }>();

  const [contracts, setContracts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [severity, setSeverity] = useState("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  async function loadContracts(reset = false) {
    setLoading(true);

    const res = await fetchClientContractsPaginated({
      client_id: clientId,
      search: debouncedSearch || undefined,
      severity: severity === "all" ? undefined : severity,
      cursor: reset ? undefined : cursor ?? undefined,
      limit: 20,
    });

    setContracts((prev) => (reset ? res.data : [...prev, ...res.data]));
    setCursor(res.next_cursor);
    setHasMore(Boolean(res.next_cursor));
    setLoading(false);
  }

  useEffect(() => {
    loadContracts(true);
  }, [debouncedSearch, severity]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Contracts"
        description="View and analyze all contracts for this client"
        action={
          <Link
            href="/clients"
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-100"
          >
            Back to Clients
          </Link>
        }
      />

      <div className="space-y-4">
        {contracts.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 hover:shadow transition-all"
          >
            <div>
              <h3 className="font-semibold text-slate-900">{c.name}</h3>
              <div className="flex items-center gap-3 text-sm mt-1">
                <StatusPill status={c.leakage_severity} />
                {c.leakage_pct !== null && (
                  <span className="text-slate-600">
                    {c.leakage_pct}% leakage
                  </span>
                )}
              </div>
            </div>

            <Link
              href={`/contracts/${c.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all"
            >
              View Contract Details
              <svg
                className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>

            <Link
              href={`/contracts/${c.id}/revenue-analysis`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all"
            >
              Revenue Analysis
              <svg
                className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => loadContracts()}
            disabled={loading}
            className="px-6 py-3 rounded-lg border border-slate-300 bg-white text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
