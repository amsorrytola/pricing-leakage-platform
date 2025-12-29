"use client";

import { JSX, useEffect, useState } from "react";
import { getInstitutionId } from "@/lib/auth";
import { DEFAULT_CATALOGUE } from "@/lib/defaultPricingCatalogue";

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


export default function PricingCataloguePage() {
  const [catalogue, setCatalogue] = useState<Catalogue>(DEFAULT_CATALOGUE);
  const [catalogueId, setCatalogueId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  if (!catalogue || !catalogue.pricing_categories) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-slate-600">Loading pricing catalogue...</p>
        </div>
      </div>
    );
  }

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
      <div className="space-y-3">
        {Object.keys(services).length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-sm text-slate-600 mb-3">No services defined yet</p>
            <button
              onClick={addService}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add First Service
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <div className="col-span-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Service Code</div>
              <div className="col-span-3 text-xs font-semibold text-slate-700 uppercase tracking-wide">Unit</div>
              <div className="col-span-3 text-xs font-semibold text-slate-700 uppercase tracking-wide">Price</div>
              <div className="col-span-2 text-xs font-semibold text-slate-700 uppercase tracking-wide text-center">Actions</div>
            </div>

            {Object.entries(services).map(([key, svc]: any) => {
              const [local, setLocal] = useState({
                service_code: svc.service_code ?? "",
                unit: svc.unit ?? "",
                price: svc.price ?? 0,
              });

              return (
                <div key={key} className="grid grid-cols-12 gap-3 items-center p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all">
                  <div className="col-span-4">
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                      placeholder="e.g., WIRE_TRANSFER"
                      value={local.service_code}
                      onChange={(e) =>
                        setLocal({ ...local, service_code: e.target.value })
                      }
                      onBlur={() => commit(key, { service_code: local.service_code })}
                    />
                  </div>

                  <div className="col-span-3">
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                      placeholder="e.g., per transaction"
                      value={local.unit}
                      onChange={(e) => setLocal({ ...local, unit: e.target.value })}
                      onBlur={() => commit(key, { unit: local.unit })}
                    />
                  </div>

                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                      <input
                        type="number"
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                        placeholder="0.00"
                        value={local.price}
                        onChange={(e) =>
                          setLocal({ ...local, price: Number(e.target.value) })
                        }
                        onBlur={() => commit(key, { price: local.price })}
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <button
                      onClick={() => removeService(key)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      title="Remove service"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              onClick={addService}
              className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-slate-300 text-sm font-medium text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Service
            </button>
          </>
        )}
      </div>
    );
  }

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

  const categoryIcons: Record<string, JSX.Element> = {
    cash_management: (
      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    domestic_payments: (
      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    international_payments: (
      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    trade_finance: (
      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    digital_services: (
      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    credit_facilities: (
      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Pricing Catalogue</h1>
          <p className="text-sm text-slate-600">Define standard pricing rules used for revenue leakage detection across all contracts</p>
        </div>

        <button
          onClick={saveCatalogue}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Catalogue
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {Object.keys(catalogue.pricing_categories).map((categoryKey) => (
          <div key={categoryKey} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                  {categoryIcons[categoryKey] || (
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 capitalize">
                    {categoryKey.replaceAll("_", " ")}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {Object.keys(catalogue.pricing_categories[categoryKey] || {}).length} service{Object.keys(catalogue.pricing_categories[categoryKey] || {}).length !== 1 ? 's' : ''} configured
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <PricingCategoryEditor categoryKey={categoryKey} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">How pricing catalogue works</h3>
            <p className="text-sm text-blue-700">
              This catalogue defines your institution's standard pricing. When contracts are analyzed, their terms are compared against these standards to identify underpricing, expired discounts, and other revenue leakage opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}