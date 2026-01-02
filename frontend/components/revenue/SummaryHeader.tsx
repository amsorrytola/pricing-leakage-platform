export default function SummaryHeader({ summary }: { summary: any }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <Metric
        label="Revenue Leakage"
        value={summary.leakage}
        color="red"
      />
      <Metric
        label="Overpricing Gain"
        value={summary.gain}
        color="green"
      />
      <Metric
        label="Net Impact"
        value={summary.net_impact}
        color={summary.net_impact < 0 ? "red" : "green"}
      />
    </div>
  );
}

function Metric({ label, value, color }: any) {
  return (
    <div className="rounded-lg border p-5 bg-white">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-2xl font-bold text-${color}-600`}>
        ₹ {Math.abs(value).toLocaleString()}
      </div>
    </div>
  );
}
