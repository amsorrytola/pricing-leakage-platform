export type InsightCard = {
  id: string;
  period: string;
  insight_type: string;
  title: string;
  summary: string;
  severity: "info" | "warning" | "critical";
  supporting_data: Record<string, any>;
};
