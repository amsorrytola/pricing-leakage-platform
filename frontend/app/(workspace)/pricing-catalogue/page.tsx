// frontend/app/(workspace)/pricing-catalogue/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getInstitutionId } from "@/lib/auth";
import { DEFAULT_CATALOGUE } from "@/lib/defaultPricingCatalogue";

/* ---------------- TYPES ---------------- */

type Catalogue = {
  catalogue_metadata: any;
  pricing_categories: Record<
    string,
    Record<
      string,
      {
        service_code?: string;
        unit?: string;
        price?: number;
      }
    >
  >;
};

/* ---------------- PAGE ---------------- */

export default function PricingCataloguePage() {
  const [catalogue, setCatalogue] = useState<Catalogue>(DEFAULT_CATALOGUE);
  const [catalogueId, setCatalogueId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* ---------------- LOAD EXISTING CATALOGUE ---------------- */

  useEffect(() => {
    async function loadCatalogue() {
      const institutionId = await getInstitutionId();
      if (!institutionId) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/pricing-catalogue/latest?institution_id=${institutionId}`
      ).then((r) => r.json());

      if (res?.rules) {
        setCatalogue({
          ...DEFAULT_CATALOGUE,
          ...res.rules,
          pricing_categories: {
            ...DEFAULT_CATALOGUE.pricing_categories,
            ...res.rules.pricing_categories,
          },
        });
        setCatalogueId(res.id);
      }
    }

    loadCatalogue();
  }, []);

  /* ---------------- SAFETY GUARD ---------------- */

  if (!catalogue || !catalogue.pricing_categories) {
    return (
      <main className="p-10 text-sm text-gray-600">
        Loading pricing catalogue…
      </main>
    );
  }

  /* ---------------- CATEGORY EDITOR ---------------- */

  function PricingCategoryEditor({ categoryKey }: { categoryKey: string }) {
    const services = catalogue.pricing_categories[categoryKey] || {};

    function commit(serviceKey: string, patch: any) {
      setCatalogue((prev) => ({
        ...prev,
        pricing_categories: {
          ...prev.pricing_categories,
          [categoryKey]: {
            ...prev.pricing_categories[categoryKey],
            [serviceKey]: {
              ...prev.pricing_categories[categoryKey][serviceKey],
              ...patch,
            },
          },
        },
      }));
    }

    function addService() {
      const key = `service_${Date.now()}`;
      commit(key, { service_code: "", unit: "", price: 0 });
    }

    function removeService(serviceKey: string) {
      const copy = { ...services };
      delete copy[serviceKey];

      setCatalogue((prev) => ({
        ...prev,
        pricing_categories: {
          ...prev.pricing_categories,
          [categoryKey]: copy,
        },
      }));
    }

    return (
      <div className="space-y-4">
        {Object.entries(services).map(([key, svc]: any) => {
          const [local, setLocal] = useState({
            service_code: svc.service_code ?? "",
            unit: svc.unit ?? "",
            price: svc.price ?? 0,
          });

          return (
            <div key={key} className="grid grid-cols-4 gap-3 items-center">
              <input
                className="border rounded p-2 text-sm"
                placeholder="Service code"
                value={local.service_code}
                onChange={(e) =>
                  setLocal({ ...local, service_code: e.target.value })
                }
                onBlur={() => commit(key, { service_code: local.service_code })}
              />

              <input
                className="border rounded p-2 text-sm"
                placeholder="Unit"
                value={local.unit}
                onChange={(e) => setLocal({ ...local, unit: e.target.value })}
                onBlur={() => commit(key, { unit: local.unit })}
              />

              <input
                type="number"
                className="border rounded p-2 text-sm"
                placeholder="Price"
                value={local.price}
                onChange={(e) =>
                  setLocal({ ...local, price: Number(e.target.value) })
                }
                onBlur={() => commit(key, { price: local.price })}
              />

              <button
                onClick={() => removeService(key)}
                className="text-red-600 text-sm"
              >
                ✕
              </button>
            </div>
          );
        })}

        <button onClick={addService} className="text-sm text-blue-600">
          + Add Service
        </button>
      </div>
    );
  }

  /* ---------------- SAVE ---------------- */

  async function saveCatalogue() {
    setSaving(true);

    const institutionId = await getInstitutionId();
    if (!institutionId) return;

    const payload = {
      institution_id: institutionId,
      name:
        catalogue.catalogue_metadata?.catalogue_version ?? "Pricing Catalogue",
      rules: catalogue,
    };

    if (catalogueId) {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/pricing-catalogue/${catalogueId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
    } else {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/pricing-catalogue/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      ).then((r) => r.json());

      setCatalogueId(res.id);
    }

    setSaving(false);
    alert("Pricing catalogue saved");
  }

  /* ---------------- UI ---------------- */

  return (
    <main className="max-w-5xl mx-auto p-10 space-y-10">
      <header>
        <h1 className="text-2xl font-semibold">Pricing Catalogue</h1>
        <p className="text-sm text-gray-600">
          Define standard pricing used for leakage detection.
        </p>
      </header>

      {Object.keys(catalogue.pricing_categories).map((categoryKey) => (
        <section key={categoryKey} className="border rounded p-6 space-y-4">
          <h2 className="font-semibold capitalize">
            {categoryKey.replaceAll("_", " ")}
          </h2>
          <PricingCategoryEditor categoryKey={categoryKey} />
        </section>
      ))}

      <div className="flex justify-end">
        <button
          onClick={saveCatalogue}
          disabled={saving}
          className="bg-black text-white px-6 py-2 rounded text-sm disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Catalogue"}
        </button>
      </div>
    </main>
  );
}
