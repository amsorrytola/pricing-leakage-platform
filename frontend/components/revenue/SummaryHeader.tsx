// frontend/components/revenue/SummaryHeader.tsx
export default function SummaryHeader({ summary }: { summary: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        label="Revenue Leakage"
        value={summary.leakage}
        icon={(
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        )}
        trend="negative"
      />
      <MetricCard
        label="Overpricing Gain"
        value={summary.gain}
        icon={(
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )}
        trend="positive"
      />
      <MetricCard
        label="Net Impact"
        value={summary.net}
        icon={(
          <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
        trend={summary.net < 0 ? "negative" : "positive"}
      />
    </div>
  );
}

type TrendType = "negative" | "positive" | "neutral";

type MetricCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend: TrendType;
};

function MetricCard({ label, value, icon, trend }: MetricCardProps) {
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  const trendConfig = {
    negative: {
      bg: "from-red-50 to-orange-50",
      border: "border-red-200",
      text: "text-red-700",
      accent: "bg-red-100",
    },
    positive: {
      bg: "from-green-50 to-emerald-50",
      border: "border-green-200",
      text: "text-green-700",
      accent: "bg-green-100",
    },
    neutral: {
      bg: "from-slate-50 to-slate-100",
      border: "border-slate-200",
      text: "text-slate-700",
      accent: "bg-slate-100",
    },
  };

  const config = trendConfig[trend] || trendConfig.neutral;

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${config.border} bg-gradient-to-br ${config.bg} shadow-sm transition-all hover:shadow-md`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.accent} shadow-sm`}>
            {icon}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${config.text}`}>
              ₹{absValue.toLocaleString("en-IN")}
            </span>
            {isNegative && (
              <span className="text-sm font-medium text-red-600">loss</span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}