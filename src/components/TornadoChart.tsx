"use client";

import { TornadoItem, Currency, formatCurrency } from "@/lib/calculations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TornadoChartProps {
  data: TornadoItem[];
  currency: Currency;
}

export default function TornadoChart({ data, currency }: TornadoChartProps) {
  if (!data.length) return null;

  const baseValue = data[0].baseValue;

  const chartData = data.map((item) => ({
    name: item.label,
    low: item.lowImpact - baseValue,
    high: item.highImpact - baseValue,
    lowAbs: item.lowImpact,
    highAbs: item.highImpact,
  }));

  const maxAbs = Math.max(
    ...chartData.map((d) => Math.max(Math.abs(d.low), Math.abs(d.high)))
  );

  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Sensitivity Analysis
          </h3>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Impact on Annual Spending Power when each input varies independently
          </p>
        </div>
        <div
          className="rounded-md px-2 py-1 text-xs font-medium"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
        >
          Base: {formatCurrency(baseValue, currency)}
        </div>
      </div>

      <div className="mt-4" style={{ height: Math.max(180, data.length * 52) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 70, bottom: 0 }}
          >
            <XAxis
              type="number"
              domain={[-maxAbs * 1.1, maxAbs * 1.1]}
              tickFormatter={(v: number) => formatCurrency(v + baseValue, currency)}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: "var(--text-secondary)", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={65}
            />
            <ReferenceLine x={0} stroke="var(--border)" strokeWidth={1} />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div
                    className="rounded-lg border px-3 py-2 text-xs shadow-lg"
                    style={{
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <div className="font-semibold">{d.name}</div>
                    <div style={{ color: "var(--text-secondary)" }}>
                      Low: {formatCurrency(d.lowAbs, currency)}
                    </div>
                    <div style={{ color: "var(--text-secondary)" }}>
                      High: {formatCurrency(d.highAbs, currency)}
                    </div>
                    <div className="mt-1 font-medium" style={{ color: "var(--accent)" }}>
                      Range: {formatCurrency(d.highAbs - d.lowAbs, currency)}
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="low" stackId="tornado" barSize={28} radius={[4, 0, 0, 4]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill="#ef4444" fillOpacity={0.7} />
              ))}
            </Bar>
            <Bar dataKey="high" stackId="tornado" barSize={28} radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill="#22c55e" fillOpacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
