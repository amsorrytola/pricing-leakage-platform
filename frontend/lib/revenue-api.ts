const BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function getRevenueSummary(contractId: string, period?: string | null) {
  const url =
    `${BASE}/api/revenue/summary?contract_id=${contractId}` +
    (period ? `&period=${period}` : "");

  return fetch(url).then(r => r.json());
}

export async function getRevenueByService(contractId: string, period?: string | null) {
  const url =
    `${BASE}/api/revenue/by-service?contract_id=${contractId}` +
    (period ? `&period=${period}` : "");

  return fetch(url).then(r => r.json());
}

export async function getRevenueTrends(contractId: string) {
  return fetch(
    `${BASE}/api/revenue/trends?contract_id=${contractId}`
  ).then(r => r.json());
}
