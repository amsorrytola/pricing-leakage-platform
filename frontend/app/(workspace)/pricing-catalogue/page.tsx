"use client";

import { useState } from "react";
import { getInstitutionId } from "@/lib/auth";

type TransactionFeeRule = {
  base_pct: number;
  min_pct: number;
  max_discount_pct: number;
  annual_escalation_pct: number;
};

export default function PricingCataloguePage() {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const [transactionFee, setTransactionFee] =
    useState<TransactionFeeRule>({
      base_pct: 2.5,
      min_pct: 2.0,
      max_discount_pct: 20,
      annual_escalation_pct: 5,
    });

  const [mmrg, setMmrg] = useState<number>(5000);

  async function handleCreate() {
    setSaving(true);

    const institutionId = await getInstitutionId();
    if (!institutionId) {
      alert("Institution not found");
      setSaving(false);
      return;
    }

    const rules = {
      transaction_fee: transactionFee,
      minimum_monthly_revenue: mmrg,
    };

    console.log("DEBUG: Creating pricing catalogue", rules);

    await fetch("http://localhost:8000/api/pricing-catalogue/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        institution_id: institutionId,
        name,
        rules,
      }),
    });

    setSaving(false);
    alert("Pricing catalogue created (draft)");
  }

  return (
    <main className="max-w-3xl space-y-8 p-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Pricing Catalogue</h1>
        <p className="text-sm text-gray-600">
          Define standard pricing rules used to detect revenue leakage.
        </p>
      </div>

      {/* Catalogue Name */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Catalogue Name
        </label>
        <input
          className="border rounded p-2 w-full"
          placeholder="Standard Pricing 2025"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Transaction Fee Section */}
      <section className="border rounded p-6 space-y-4">
        <h2 className="font-semibold text-lg">
          Transaction Fee Rules
        </h2>

        {[
          ["Base Fee (%)", "base_pct"],
          ["Minimum Fee (%)", "min_pct"],
          ["Max Discount Allowed (%)", "max_discount_pct"],
          ["Annual Escalation (%)", "annual_escalation_pct"],
        ].map(([label, key]) => (
          <div key={key} className="grid grid-cols-3 gap-4 items-center">
            <label className="text-sm text-gray-700">{label}</label>
            <input
              type="number"
              className="border rounded p-2 col-span-2"
              value={(transactionFee as any)[key]}
              onChange={(e) =>
                setTransactionFee({
                  ...transactionFee,
                  [key]: Number(e.target.value),
                })
              }
            />
          </div>
        ))}
      </section>

      {/* MMRG */}
      <section className="border rounded p-6 space-y-3">
        <h2 className="font-semibold text-lg">
          Minimum Monthly Revenue Guarantee
        </h2>
        <input
          type="number"
          className="border rounded p-2 w-full"
          value={mmrg}
          onChange={(e) => setMmrg(Number(e.target.value))}
        />
      </section>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          onClick={handleCreate}
          disabled={saving || !name}
          className="rounded bg-black px-5 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Create Draft Catalogue"}
        </button>
      </div>
    </main>
  );
}
