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

    setContracts((prev) =>
      reset ? res.data : [...prev, ...res.data]
    );
    setCursor(res.next_cursor);
    setHasMore(Boolean(res.next_cursor));
    setLoading(false);
  }

  useEffect(() => {
    loadContracts(true);
  }, [debouncedSearch, severity]);

  return (
    <div className="space-y-6">
      <PageHeader title="Client Contracts" />

      <div className="flex gap-4">
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

      <div className="space-y-3">
        {contracts.map((c) => (
          <div
            key={c.id}
            className="flex justify-between rounded border p-4"
          >
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="flex gap-3 text-sm">
                {c.leakage_pct ?? "—"}%
                <StatusPill status={c.leakage_severity} />
              </div>
            </div>

            <Link
              href={`/contracts/${c.id}`}
              className="text-sm text-blue-600"
            >
              View
            </Link>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => loadContracts()}
          disabled={loading}
          className="rounded border px-4 py-2 text-sm"
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
