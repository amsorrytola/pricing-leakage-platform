// frontend/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function fetchWorkspaceSummary(institutionId: string) {
  const res = await fetch(
    `${API_BASE}/api/workspace/summary?institution_id=${institutionId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch workspace summary");
  }

  return res.json();
}

export async function fetchActivePricingCatalogue(institutionId: string) {
  const url = `${API_BASE}/api/pricing-catalogue/active?institution_id=${institutionId}`;
  console.log("DEBUG: Fetching active pricing catalogue", url);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch active pricing catalogue");

  return res.json();
}


export async function fetchClients(institutionId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/clients?institution_id=${institutionId}`
  );
  return res.json();
}

export async function fetchContracts(clientId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/contracts?client_id=${clientId}`
  );
  return res.json();
}

export async function fetchContractText(contractId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/contracts/${contractId}/text`
  );
  return res.json();
}


