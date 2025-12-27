"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getInstitutionId } from "@/lib/auth";
import { fetchContractsByInstitution } from "@/lib/api";

import PageHeader from "@/components/ui/PageHeader";
import StatusPill from "@/components/ui/StatusPill";

type Contract = {
  id: string;
  name: string;
  status?: string;
  leakage_pct?: number | null;
  leakage_severity?: "healthy" | "warning" | "critical" | null;
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const institutionId = await getInstitutionId();
      if (!institutionId) {
        setLoading(false);
        return;
      }

      const data = await fetchContractsByInstitution(institutionId);

      console.log("DEBUG: contracts response", data);

      setContracts(Array.isArray(data) ? data : []);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
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

      {/* Loading state */}
      {loading && (
        <div className="text-sm text-gray-500">
          Loading contracts…
        </div>
      )}

      {/* Empty state */}
      {!loading && contracts.length === 0 && (
        <div className="mt-10 rounded border border-dashed p-10 text-center text-gray-500">
          <p className="font-medium">No contracts uploaded yet</p>
          <p className="mt-1 text-sm">
            Upload a contract to begin pricing analysis.
          </p>
        </div>
      )}

      {/* Contracts list */}
      {!loading && contracts.length > 0 && (
        <div className="space-y-3">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="border rounded p-4 flex items-center justify-between hover:bg-gray-50"
            >
              {/* Left side */}
              <div className="space-y-1">
                <div className="font-medium text-gray-900">
                  {c.name}
                </div>

                <div className="text-xs text-gray-500">
                  Status: {c.status ?? "Uploaded"}
                </div>

                {/* Leakage info */}
                <div className="flex items-center gap-3 text-sm">
                  {c.leakage_pct !== null && c.leakage_pct !== undefined ? (
                    <span
                      className={
                        c.leakage_severity === "critical"
                          ? "text-red-600 font-medium"
                          : c.leakage_severity === "warning"
                          ? "text-yellow-600 font-medium"
                          : "text-green-600 font-medium"
                      }
                    >
                      {c.leakage_pct}% leakage
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      Not analyzed
                    </span>
                  )}

                  <StatusPill
                    status={c.leakage_severity ?? "unknown"}
                  />
                </div>
              </div>

              {/* Right side */}
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
