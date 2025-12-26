// frontend/app/(workspace)/clients/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getInstitutionId } from "@/lib/auth";
import { fetchClients } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const institutionId = await getInstitutionId();
      if (!institutionId) return;

      const data = await fetchClients(institutionId);
      setClients(data);
    }
    load();
  }, []);

  return (
    <main className="p-10">
      <PageHeader
        title="Clients"
        description="Corporate and institutional clients linked to contracts."
      />

      <ul className="space-y-4">
        {clients.map((c) => (
          <li key={c.id} className="border p-4 rounded">
            <Link href={`/clients/${c.id}`} className="font-medium">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
