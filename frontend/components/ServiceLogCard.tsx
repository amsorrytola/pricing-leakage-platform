"use client";

import { useEffect, useState } from "react";

type Service = {
  service_code: string;
  service_name: string;
  expiry_date: string;
  days_left: number;
  status: "ACTIVE" | "EXPIRING" | "EXPIRED";
  id: string;
  _key: string;
};

export default function ServiceLogCard({ contractId, normalized, setNormalized }: { contractId: string; normalized: any; setNormalized: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/contracts/${contractId}/service-log`
    )
      .then((r) => r.json())
      .then((res) => {
        const withKeys = {
          ...res,
          services: res.services.map((s: any) => ({
            ...s,
            _key: crypto.randomUUID(),
          })),
        };

        setData(withKeys);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [contractId, normalized, setNormalized]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-sm animate-pulse">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Service Log</h2>
              <p className="text-xs text-slate-500">Loading validity tracker...</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              <div className="h-10 w-10 rounded-full border-4 border-slate-200"></div>
              <div className="absolute inset-0 h-10 w-10 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const statusConfig = {
    ACTIVE: {
      icon: (
        <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-900",
      badge: "bg-green-100 text-green-700",
    },
    EXPIRING: {
      icon: (
        <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-900",
      badge: "bg-yellow-100 text-yellow-700",
    },
    EXPIRED: {
      icon: (
        <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-900",
      badge: "bg-red-100 text-red-700",
    },
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-sm">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Service Log</h2>
            <p className="text-xs text-slate-500">Track service validity and expiration</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-green-100">
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{data.summary.active}</p>
              <p className="text-xs text-slate-600">Active</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-yellow-100">
              <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{data.summary.expiring}</p>
              <p className="text-xs text-slate-600">Expiring</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-100">
              <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{data.summary.expired}</p>
              <p className="text-xs text-slate-600">Expired</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {data.services.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-900">No services tracked</p>
            <p className="text-xs text-slate-500 mt-1">Service validity data will appear here</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2">
            {data.services.map((s: Service) => {
              const config = statusConfig[s.status];
              return (
                <div
                  key={s._key}
                  className={`p-4 rounded-xl border ${config.border} ${config.bg} transition-all hover:shadow-sm`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {config.icon}
                      <span className={`font-semibold text-sm ${config.text} truncate`}>
                        {s.service_name}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${config.badge} flex-shrink-0`}>
                      {s.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-600 ml-6">
                    <div className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Valid until {s.expiry_date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{s.days_left} days left</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}