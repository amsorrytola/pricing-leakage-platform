// frontend/app/(workspace)/workspace/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getInstitutionId } from "@/lib/auth";
import { fetchActivePricingCatalogue, fetchWorkspaceSummary } from "@/lib/api";

export default function WorkspaceHome() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const institutionId = await getInstitutionId();
      if (!institutionId) return;

      const summary = await fetchWorkspaceSummary(institutionId);
      setData(summary);

      const activeCatalogue = await fetchActivePricingCatalogue(institutionId);
      console.log("DEBUG: Active catalogue", activeCatalogue);

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <p className="p-10">Loading workspace...</p>;
  }

  return (
    <main className="p-10">
      <h1 className="text-2xl font-semibold mb-6">
        {data.institution.name} — Workspace
      </h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="border p-4 rounded">
          <p className="text-sm text-gray-500">Contracts</p>
          <p className="text-2xl font-bold">{data.metrics.contracts}</p>
        </div>

        <div className="border p-4 rounded">
          <p className="text-sm text-gray-500">Clients</p>
          <p className="text-2xl font-bold">{data.metrics.clients}</p>
        </div>

        <div className="border p-4 rounded">
          <p className="text-sm text-gray-500">Pricing Catalogue</p>
          <p className="text-lg font-medium">
            {data.metrics.pricing_catalogue === "not_configured"
              ? "Not configured"
              : "Configured"}
          </p>
        </div>
      </div>
    </main>
  );
}
