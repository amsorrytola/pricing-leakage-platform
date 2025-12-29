// frontend/app/(workspace)/clients/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import PageHeader from "@/components/ui/PageHeader";
import { getInstitutionId } from "@/lib/auth";
import { fetchClientsPaginated } from "@/lib/api";
import useDebouncedValue from "@/lib/useDebouncedValue";

type Client = {
  id: string;
  name: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  async function loadClients(reset = false) {
    const institutionId = await getInstitutionId();
    if (!institutionId) return;

    setLoading(true);

    const res = await fetchClientsPaginated({
      institution_id: institutionId,
      search: debouncedSearch || undefined,
      cursor: reset ? undefined : cursor ?? undefined,
      limit: 20,
    });

    setClients((prev) => (reset ? res.data : [...prev, ...res.data]));
    setCursor(res.next_cursor);
    setHasMore(Boolean(res.next_cursor));
    setLoading(false);
  }

  useEffect(() => {
    loadClients(true);
  }, [debouncedSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage and view all corporate and institutional clients in your portfolio"
      />

      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            type="text"
            placeholder="Search clients by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200">
          <svg
            className="h-4 w-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
            />
          </svg>
          <span className="text-sm font-medium text-slate-700">
            {clients.length} clients
          </span>
        </div>
      </div>

      {!loading && clients.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No clients found
          </h3>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            {search
              ? "Try adjusting your search query or clear filters to see all clients"
              : "Upload contracts to automatically populate your client portfolio"}
          </p>

          {!search && (
            <Link
              href="/contracts/upload"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
            >
              Upload First Contract
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/clients/${c.id}`}
            className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <h3 className="font-semibold text-slate-900 truncate">
              {c.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Client ID: <span className="font-mono">{c.id.slice(0, 8)}</span>
            </p>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => loadClients()}
            disabled={loading}
            className="px-6 py-3 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More Clients"}
          </button>
        </div>
      )}
    </div>
  );
}
