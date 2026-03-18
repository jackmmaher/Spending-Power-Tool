"use client";

import { RangeInputs, TriangularInput } from "@/lib/calculations";

interface RangeInputPanelProps {
  inputs: RangeInputs;
  onChange: (inputs: RangeInputs) => void;
}

interface TriFieldProps {
  label: string;
  sublabel: string;
  value: TriangularInput;
  onChange: (v: TriangularInput) => void;
  step?: number;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  isPercent?: boolean;
}

function TriField({
  label,
  sublabel,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 1000000,
  prefix = "",
  suffix = "",
  isPercent = false,
}: TriFieldProps) {
  const display = (v: number) => (isPercent ? +(v * 100).toFixed(2) : v);
  const parse = (v: number) => (isPercent ? v / 100 : v);

  const update = (field: keyof TriangularInput, raw: string) => {
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    const val = parse(num);
    const next = { ...value, [field]: val };
    // Auto-constrain: low <= best <= high
    if (field === "low" && val > next.best) next.best = val;
    if (field === "high" && val < next.best) next.best = val;
    if (field === "best") {
      if (val < next.low) next.low = val;
      if (val > next.high) next.high = val;
    }
    onChange(next);
  };

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <div className="mb-3">
        <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {label}
        </div>
        <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {sublabel}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(["low", "best", "high"] as const).map((field) => (
          <div key={field}>
            <label
              className="mb-1 block text-xs font-medium capitalize"
              style={{
                color: field === "best" ? "var(--accent)" : "var(--text-tertiary)",
              }}
            >
              {field === "best" ? "Best Est." : field}
            </label>
            <div className="relative">
              {prefix && (
                <span
                  className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {prefix}
                </span>
              )}
              <input
                type="number"
                value={display(value[field])}
                onChange={(e) => update(field, e.target.value)}
                step={isPercent ? step * 100 : step}
                min={isPercent ? min * 100 : min}
                max={isPercent ? max * 100 : max}
                className="w-full rounded-lg border px-2 py-1.5 text-sm font-medium outline-none transition-colors focus:ring-1"
                style={{
                  background: "var(--bg-primary)",
                  borderColor: field === "best" ? "var(--accent)" : "var(--border)",
                  color: "var(--text-primary)",
                  paddingLeft: prefix ? "1.25rem" : "0.5rem",
                  paddingRight: suffix ? "1.75rem" : "0.5rem",
                  ...(field === "best" ? { boxShadow: "0 0 0 1px var(--accent)" } : {}),
                }}
              />
              {suffix && (
                <span
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {suffix}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Visual range indicator */}
      <div className="mt-3 flex items-center gap-1">
        <div className="h-1.5 flex-1 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
          <div
            className="relative h-full rounded-full"
            style={{
              background: "var(--accent)",
              opacity: 0.3,
              marginLeft: `${((value.low - min) / (max - min)) * 100}%`,
              width: `${((value.high - value.low) / (max - min)) * 100}%`,
            }}
          >
            <div
              className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full"
              style={{
                background: "var(--accent)",
                left: `${value.high > value.low ? ((value.best - value.low) / (value.high - value.low)) * 100 : 50}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RangeInputPanel({ inputs, onChange }: RangeInputPanelProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <TriField
        label="AOV"
        sublabel="Average order value"
        value={inputs.aov}
        onChange={(v) => onChange({ ...inputs, aov: v })}
        step={5}
        min={0}
        max={1000}
        prefix="£"
      />
      <TriField
        label="Return Rate"
        sublabel="% of orders returned"
        value={inputs.returnRate}
        onChange={(v) => onChange({ ...inputs, returnRate: v })}
        step={0.01}
        min={0}
        max={1}
        suffix="%"
        isPercent
      />
      <TriField
        label="Frequency"
        sublabel="Purchases per annum"
        value={inputs.frequency}
        onChange={(v) => onChange({ ...inputs, frequency: v })}
        step={0.5}
        min={0}
        max={52}
      />
      <TriField
        label="Buyers"
        sublabel="Total buyer count"
        value={inputs.buyers}
        onChange={(v) => onChange({ ...inputs, buyers: v })}
        step={1000}
        min={0}
        max={10000000}
      />
    </div>
  );
}
