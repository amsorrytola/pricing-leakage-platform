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
