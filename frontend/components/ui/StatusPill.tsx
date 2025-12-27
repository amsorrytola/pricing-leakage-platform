export default function StatusPill({
  status,
}: {
  status?: "healthy" | "warning" | "critical" | "unknown" | null;
}) {
  if (!status || status === "unknown") {
    return (
      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
        Not analyzed
      </span>
    );
  }

  if (status === "healthy") {
    return (
      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
        Healthy
      </span>
    );
  }

  if (status === "warning") {
    return (
      <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
        Attention
      </span>
    );
  }

  return (
    <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
      High Leakage
    </span>
  );
}
