"use client";

import { SpendingOutputs, Currency, formatCurrency, formatNumber, formatPercent } from "@/lib/calculations";

interface ResultCardsProps {
  p10: SpendingOutputs;
  p50: SpendingOutputs;
  p90: SpendingOutputs;
  currency: Currency;
}

interface CardProps {
  title: string;
  p10: number;
  p50: number;
  p90: number;
  format: (v: number) => string;
  accent?: boolean;
}

function Card({ title, p10, p50, p90, format, accent }: CardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border p-5 transition-shadow"
      style={{
        background: accent ? "var(--accent)" : "var(--bg-secondary)",
        borderColor: accent ? "var(--accent)" : "var(--border)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <div
        className="mb-1 text-xs font-medium uppercase tracking-wider"
        style={{ color: accent ? "rgba(255,255,255,0.7)" : "var(--text-tertiary)" }}
      >
        {title}
      </div>

      <div
        className="text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ color: accent ? "#ffffff" : "var(--text-primary)" }}
      >
        {format(p50)}
      </div>

      <div className="mt-2 flex items-center gap-3">
        <div
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: accent ? "rgba(255,255,255,0.6)" : "var(--text-tertiary)" }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: accent ? "rgba(255,255,255,0.4)" : "var(--text-tertiary)" }} />
          P10: {format(p10)}
        </div>
        <div
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: accent ? "rgba(255,255,255,0.6)" : "var(--text-tertiary)" }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: accent ? "rgba(255,255,255,0.4)" : "var(--text-tertiary)" }} />
          P90: {format(p90)}
        </div>
      </div>

      {/* Range bar — shows P50 position within P10–P90 */}
      <div className="mt-3">
        <div
          className="relative h-1.5 rounded-full"
          style={{ background: accent ? "rgba(255,255,255,0.15)" : "var(--bg-tertiary)" }}
        >
          {/* P10–P90 filled range */}
          <div
            className="absolute h-full rounded-full"
            style={{
              background: accent ? "rgba(255,255,255,0.25)" : "var(--accent)",
              opacity: accent ? 1 : 0.15,
              left: "0%",
              width: "100%",
            }}
          />
          {/* P50 marker */}
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full"
            style={{
              background: accent ? "#ffffff" : "var(--accent)",
              left: p90 > p10 ? `${Math.min(100, Math.max(0, ((p50 - p10) / (p90 - p10)) * 100))}%` : "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ResultCards({ p10, p50, p90, currency }: ResultCardsProps) {
  const cur = (v: number) => formatCurrency(v, currency);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        title="Net AOV"
        p10={p10.netAov}
        p50={p50.netAov}
        p90={p90.netAov}
        format={cur}
      />
      <Card
        title="Transactions"
        p10={p10.transactions}
        p50={p50.transactions}
        p90={p90.transactions}
        format={formatNumber}
      />
      <Card
        title="Spending Power"
        p10={p10.annualSpendingPower}
        p50={p50.annualSpendingPower}
        p90={p90.annualSpendingPower}
        format={cur}
        accent
      />
      <Card
        title="Spend / Buyer"
        p10={p10.spendPerBuyer}
        p50={p50.spendPerBuyer}
        p90={p90.spendPerBuyer}
        format={cur}
      />
    </div>
  );
}
