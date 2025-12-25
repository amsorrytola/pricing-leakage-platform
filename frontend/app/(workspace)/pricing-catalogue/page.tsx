// frontend/app/workspace/pricing-catalogue/page.tsx
"use client";

import { useState } from "react";
import { getInstitutionId } from "@/lib/auth";

export default function PricingCataloguePage() {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    setSaving(true);

    const institutionId = await getInstitutionId();
    if (!institutionId) return;

    const rules = {
      transaction_fee: {
        base_pct: 2.5,
        min_pct: 2.0,
        annual_escalation_pct: 5
      }
    };

    console.log("DEBUG: Creating pricing catalogue");

    await fetch("http://localhost:8000/api/pricing-catalogue/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        institution_id: institutionId,
        name,
        rules
      })
    });

    setSaving(false);
    alert("Pricing catalogue created (draft)");
  }

  return (
    <main className="p-10 max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">
        Pricing Catalogue
      </h1>

      <input
        className="border p-2 w-full mb-4"
        placeholder="Catalogue name (e.g. Standard Pricing 2025)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={handleCreate}
        disabled={saving}
        className="bg-black text-white px-4 py-2"
      >
        {saving ? "Saving..." : "Create Draft Catalogue"}
      </button>
    </main>
  );
}
