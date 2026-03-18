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

      {/* Range bar */}
      <div className="mt-3">
        <div
          className="h-1 rounded-full"
          style={{ background: accent ? "rgba(255,255,255,0.15)" : "var(--bg-tertiary)" }}
        >
          <div
            className="relative h-full rounded-full"
            style={{
              background: accent ? "rgba(255,255,255,0.4)" : "var(--accent)",
              opacity: accent ? 1 : 0.3,
              width: p90 > 0 ? `${Math.min(100, (p50 / p90) * 100)}%` : "50%",
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
