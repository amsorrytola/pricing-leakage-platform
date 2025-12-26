// frontend/app/(workspace)/clients/[clientId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchContracts } from "@/lib/api";
import Link from "next/link";

export default function ClientContractsPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    if (!clientId) return;

    async function load() {
      console.log("DEBUG: clientId =", clientId);
      const data = await fetchContracts(clientId);
      setContracts(data);
    }

    load();
  }, [clientId]);

  return (
    <main className="p-10">
      <h1 className="text-2xl font-semibold mb-6">Contracts</h1>

      <ul className="space-y-4">
        {contracts.map((c) => (
          <li key={c.id} className="border p-4 rounded">
            <Link href={`/contracts/${c.id}`} className="font-medium">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
