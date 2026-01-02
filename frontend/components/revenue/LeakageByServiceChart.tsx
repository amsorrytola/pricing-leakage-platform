import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function LeakageByServiceChart({ data }: { data: any[] }) {
  return (
    <div className="rounded-lg border p-5 bg-white">
      <h3 className="font-semibold mb-4">Leakage by Service</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="service_code" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="leakage" fill="#dc2626" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
