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

    setClients((prev) =>
      reset ? res.data : [...prev, ...res.data]
    );
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
        description="All corporate and institutional clients."
      />

      <input
        type="text"
        placeholder="Search clients…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-64 rounded border px-3 py-2 text-sm"
      />

      <div className="space-y-3">
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/clients/${c.id}`}
            className="block rounded border p-4 hover:bg-gray-50"
          >
            {c.name}
          </Link>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => loadClients()}
          disabled={loading}
          className="rounded border px-4 py-2 text-sm"
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
