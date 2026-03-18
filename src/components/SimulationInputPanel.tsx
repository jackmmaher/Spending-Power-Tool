"use client";

import { SimulationInputs, SimulationInput, DistributionType } from "@/lib/calculations";

interface SimulationInputPanelProps {
  inputs: SimulationInputs;
  onChange: (inputs: SimulationInputs) => void;
}

interface SimFieldProps {
  label: string;
  sublabel: string;
  input: SimulationInput;
  onChange: (v: SimulationInput) => void;
  step?: number;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  isPercent?: boolean;
}

function SimField({
  label,
  sublabel,
  input,
  onChange,
  step = 1,
  min = 0,
  max = 1000000,
  prefix = "",
  suffix = "",
  isPercent = false,
}: SimFieldProps) {
  const displayVal = isPercent ? +(input.value * 100).toFixed(2) : input.value;
  const parseVal = (v: number) => (isPercent ? v / 100 : v);

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

      <div className="space-y-2">
        {/* Value */}
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "var(--accent)" }}>
            Central Value
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
              value={displayVal}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                if (!isNaN(num)) onChange({ ...input, value: parseVal(num) });
              }}
              step={isPercent ? step * 100 : step}
              min={isPercent ? min * 100 : min}
              max={isPercent ? max * 100 : max}
              className="w-full rounded-lg border px-2 py-1.5 text-sm font-medium outline-none transition-colors focus:ring-1"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--accent)",
                color: "var(--text-primary)",
                paddingLeft: prefix ? "1.25rem" : "0.5rem",
                paddingRight: suffix ? "1.75rem" : "0.5rem",
                boxShadow: "0 0 0 1px var(--accent)",
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

        <div className="grid grid-cols-2 gap-2">
          {/* Distribution */}
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
              Distribution
            </label>
            <select
              value={input.distribution}
              onChange={(e) =>
                onChange({ ...input, distribution: e.target.value as DistributionType })
              }
              className="w-full rounded-lg border px-2 py-1.5 text-xs font-medium outline-none"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              <option value="normal">Normal</option>
              <option value="lognormal">Log-normal</option>
              <option value="uniform">Uniform</option>
            </select>
          </div>

          {/* Uncertainty */}
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
              Uncertainty
            </label>
            <div className="relative">
              <input
                type="number"
                value={input.uncertainty}
                onChange={(e) => {
                  const num = parseFloat(e.target.value);
                  if (!isNaN(num) && num >= 0 && num <= 100)
                    onChange({ ...input, uncertainty: num });
                }}
                min={1}
                max={100}
                step={5}
                className="w-full rounded-lg border px-2 py-1.5 text-sm font-medium outline-none"
                style={{
                  background: "var(--bg-primary)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                  paddingRight: "1.5rem",
                }}
              />
              <span
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SimulationInputPanel({
  inputs,
  onChange,
}: SimulationInputPanelProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SimField
        label="AOV"
        sublabel="Average order value"
        input={inputs.aov}
        onChange={(v) => onChange({ ...inputs, aov: v })}
        step={5}
        min={0}
        max={1000}
        prefix="£"
      />
      <SimField
        label="Return Rate"
        sublabel="% of orders returned"
        input={inputs.returnRate}
        onChange={(v) => onChange({ ...inputs, returnRate: v })}
        step={0.01}
        min={0}
        max={1}
        suffix="%"
        isPercent
      />
      <SimField
        label="Frequency"
        sublabel="Purchases per annum"
        input={inputs.frequency}
        onChange={(v) => onChange({ ...inputs, frequency: v })}
        step={0.5}
        min={0}
        max={52}
      />
      <SimField
        label="Buyers"
        sublabel="Total buyer count"
        input={inputs.buyers}
        onChange={(v) => onChange({ ...inputs, buyers: v })}
        step={1000}
        min={0}
        max={10000000}
      />
    </div>
  );
}
