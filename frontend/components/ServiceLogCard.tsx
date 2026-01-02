"use client";

import { useEffect, useState } from "react";

type Service = {
  service_code: string;
  service_name: string;
  expiry_date: string;
  days_left: number;
  status: "ACTIVE" | "EXPIRING" | "EXPIRED";
};

export default function ServiceLogCard({ contractId }: { contractId: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/contracts/${contractId}/service-log`
    )
      .then((r) => r.json())
      .then(setData);

    
  }, [contractId]);

  if (!data) return null;

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="px-6 py-4 border-b">
        <h2 className="font-semibold text-lg">Service Log</h2>
        <p className="text-xs text-gray-500">Track service validity</p>
      </div>

      <div className="px-6 py-3 flex gap-4 text-sm">
        🟢 Active: {data.summary.active}
        🟡 Expiring: {data.summary.expiring}
        🔴 Expired: {data.summary.expired}
      </div>

      <div className="px-6 pb-4 space-y-2 max-h-64 overflow-auto">
        {data.services.map((s: Service) => (
          <div
            key={s.service_code}
            className={`p-3 rounded border text-sm ${
              s.status === "ACTIVE"
                ? "bg-green-50 border-green-200"
                : s.status === "EXPIRING"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="font-medium">{s.service_name}</div>
            <div className="text-xs">
              Valid till: {s.expiry_date} • {s.days_left} days left
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
