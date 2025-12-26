// frontend/app/(workspace)/contracts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getInstitutionId } from "@/lib/auth";
import { fetchContractsByInstitution } from "@/lib/api";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const institutionId = await getInstitutionId();
      if (!institutionId) return;

      const data = await fetchContractsByInstitution(institutionId);

      console.log("DEBUG: contracts response", data);

      setContracts(Array.isArray(data) ? data : []);
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}

      <PageHeader
        title="Contracts"
        description="All uploaded commercial contracts for this institution."
        action={
          <Link
            href="/contracts/upload"
            className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Upload Contract
          </Link>
        }
      />

      {/* Contracts list */}
      {contracts.length === 0 ? (
        <div className="mt-10 rounded border border-dashed p-10 text-center text-gray-500">
          <p className="font-medium">No contracts uploaded yet</p>
          <p className="mt-1 text-sm">
            Upload a contract to begin pricing analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">
                  Status: {c.status ?? "Uploaded"}
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
      )}
    </div>
  );
}
