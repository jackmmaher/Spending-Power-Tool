"use client";

import { HistogramBin, Currency, formatCurrency } from "@/lib/calculations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Label,
} from "recharts";

interface HistogramChartProps {
  bins: HistogramBin[];
  p10: number;
  p50: number;
  p90: number;
  mean: number;
  stdDev: number;
  currency: Currency;
}

export default function HistogramChart({
  bins,
  p10,
  p50,
  p90,
  mean,
  stdDev,
  currency,
}: HistogramChartProps) {
  if (!bins.length) return null;

  const chartData = bins.map((bin) => ({
    value: bin.mid,
    count: bin.count,
    frequency: bin.frequency,
    isInCI: bin.mid >= p10 && bin.mid <= p90,
  }));

  const confidenceWidth = ((p90 - p10) / (bins[bins.length - 1].max - bins[0].min)) * 100;

  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Distribution of Spending Power
          </h3>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            10,000 Monte Carlo iterations
          </p>
        </div>
        <div className="flex gap-2">
          <div
            className="rounded-md px-2 py-1 text-xs font-medium"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
          >
            Mean: {formatCurrency(mean, currency)}
          </div>
          <div
            className="rounded-md px-2 py-1 text-xs font-medium"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
          >
            SD: {formatCurrency(stdDev, currency)}
          </div>
        </div>
      </div>

      {/* Confidence interval indicator */}
      <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
        <span
          className="inline-block h-2.5 w-6 rounded-sm"
          style={{ background: "var(--accent)", opacity: 0.7 }}
        />
        80% confidence interval (P10–P90)
      </div>

      <div className="mt-3" style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
            <XAxis
              dataKey="value"
              tickFormatter={(v: number) => formatCurrency(v, currency)}
              tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={{ stroke: "var(--border)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v: number) => `${(v * 100).toFixed(1)}%`}
              tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
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
                    <div className="font-semibold">
                      {formatCurrency(d.value, currency)}
                    </div>
                    <div style={{ color: "var(--text-secondary)" }}>
                      Frequency: {(d.frequency * 100).toFixed(2)}%
                    </div>
                  </div>
                );
              }}
            />

            {/* P10 line */}
            <ReferenceLine x={p10} stroke="var(--text-tertiary)" strokeDasharray="4 4" strokeWidth={1}>
              <Label
                value={`P10: ${formatCurrency(p10, currency)}`}
                position="top"
                style={{ fontSize: 10, fill: "var(--text-tertiary)" }}
              />
            </ReferenceLine>

            {/* P50 line */}
            <ReferenceLine x={p50} stroke="var(--accent)" strokeWidth={2}>
              <Label
                value={`Median: ${formatCurrency(p50, currency)}`}
                position="top"
                style={{ fontSize: 10, fill: "var(--accent)", fontWeight: 600 }}
              />
            </ReferenceLine>

            {/* P90 line */}
            <ReferenceLine x={p90} stroke="var(--text-tertiary)" strokeDasharray="4 4" strokeWidth={1}>
              <Label
                value={`P90: ${formatCurrency(p90, currency)}`}
                position="top"
                style={{ fontSize: 10, fill: "var(--text-tertiary)" }}
              />
            </ReferenceLine>

            <Bar dataKey="frequency" barSize={Math.max(4, 600 / bins.length)} radius={[2, 2, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.isInCI ? "var(--accent)" : "var(--border)"}
                  fillOpacity={entry.isInCI ? 0.7 : 0.4}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
