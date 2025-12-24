const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
