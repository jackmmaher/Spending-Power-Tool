"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Currency, formatCurrency } from "@/lib/calculations";
import categories from "@/lib/data/ons-categories.json";
import localAuthorities from "@/lib/data/local-authorities.json";
import demographics from "@/lib/data/demographics.json";

interface SenseCheckProps {
  bottomUpEstimate: number;
  currency: Currency;
}

interface Category {
  code: string;
  name: string;
  weeklySpend: number;
  totalWeeklyMillion: number | null;
  level: number;
}

interface LocalAuthority {
  name: string;
  region: string;
  households: number;
}

// Searchable dropdown component
function SearchSelect<T extends { name?: string; label?: string }>({
  items,
  value,
  onChange,
  placeholder,
  renderItem,
  renderSelected,
  groupBy,
}: {
  items: T[];
  value: T | null;
  onChange: (item: T | null) => void;
  placeholder: string;
  renderItem: (item: T) => string;
  renderSelected: (item: T) => string;
  groupBy?: (item: T) => string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((item) => renderItem(item).toLowerCase().includes(q));
  }, [items, search, renderItem]);

  const grouped = useMemo(() => {
    if (!groupBy) return null;
    const groups: Record<string, T[]> = {};
    for (const item of filtered) {
      const g = groupBy(item);
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    }
    return groups;
  }, [filtered, groupBy]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors"
        style={{
          background: "var(--bg-primary)",
          borderColor: value ? "var(--accent)" : "var(--border)",
          color: value ? "var(--text-primary)" : "var(--text-tertiary)",
        }}
      >
        <span className="truncate">
          {value ? renderSelected(value) : placeholder}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`ml-2 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-lg"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
            maxHeight: 280,
          }}
        >
          <div className="border-b p-2" style={{ borderColor: "var(--border)" }}>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-md border px-2.5 py-1.5 text-sm outline-none"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 224 }}>
            {value && (
              <button
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                  setSearch("");
                }}
                className="w-full px-3 py-2 text-left text-xs italic transition-colors hover:opacity-80"
                style={{ color: "var(--text-tertiary)" }}
              >
                Clear selection
              </button>
            )}
            {grouped
              ? Object.entries(grouped).map(([group, items]) => (
                  <div key={group}>
                    <div
                      className="sticky top-0 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        background: "var(--bg-tertiary)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {group}
                    </div>
                    {items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          onChange(item);
                          setOpen(false);
                          setSearch("");
                        }}
                        className="w-full px-3 py-2 text-left text-sm transition-colors hover:opacity-80"
                        style={{
                          color: "var(--text-primary)",
                          background:
                            value && renderItem(value) === renderItem(item)
                              ? "var(--bg-tertiary)"
                              : "transparent",
                        }}
                      >
                        {renderItem(item)}
                      </button>
                    ))}
                  </div>
                ))
              : filtered.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onChange(item);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="w-full px-3 py-2 text-left text-sm transition-colors hover:opacity-80"
                    style={{
                      color: "var(--text-primary)",
                      background:
                        value && renderItem(value) === renderItem(item)
                          ? "var(--bg-tertiary)"
                          : "transparent",
                    }}
                  >
                    {renderItem(item)}
                  </button>
                ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
                No results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple select for demographic filters
function SimpleSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string; pctOfHouseholds: number }[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block text-xs font-medium"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
        style={{
          background: "var(--bg-primary)",
          borderColor: value ? "var(--accent)" : "var(--border)",
          color: value ? "var(--text-primary)" : "var(--text-tertiary)",
        }}
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label} ({opt.pctOfHouseholds}%)
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SenseCheck({ bottomUpEstimate, currency }: SenseCheckProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedLA, setSelectedLA] = useState<LocalAuthority | null>(null);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<string | null>(null);
  const [selectedComposition, setSelectedComposition] = useState<string | null>(null);

  const topDownEstimate = useMemo(() => {
    if (!selectedCategory) return null;

    let households = demographics.totalUkHouseholds;

    // Geography filter
    if (selectedLA) {
      households = selectedLA.households;
    }

    // Demographic filters — apply as % reduction
    let demographicMultiplier = 1;

    if (selectedAge) {
      const ageGroup = demographics.ageGroups.find((g) => g.id === selectedAge);
      if (ageGroup) demographicMultiplier *= ageGroup.pctOfHouseholds / 100;
    }

    if (selectedIncome) {
      const incomeGroup = demographics.incomeGroups.find((g) => g.id === selectedIncome);
      if (incomeGroup) demographicMultiplier *= incomeGroup.pctOfHouseholds / 100;
    }

    if (selectedComposition) {
      const compGroup = demographics.compositionGroups.find(
        (g) => g.id === selectedComposition
      );
      if (compGroup) demographicMultiplier *= compGroup.pctOfHouseholds / 100;
    }

    const targetHouseholds = households * demographicMultiplier;
    const annualSpend = selectedCategory.weeklySpend * 52 * targetHouseholds;

    return {
      annualSpend,
      targetHouseholds,
      weeklyPerHousehold: selectedCategory.weeklySpend,
    };
  }, [selectedCategory, selectedLA, selectedAge, selectedIncome, selectedComposition]);

  // Comparison ratio
  const ratio = useMemo(() => {
    if (!topDownEstimate || topDownEstimate.annualSpend === 0) return null;
    return bottomUpEstimate / topDownEstimate.annualSpend;
  }, [bottomUpEstimate, topDownEstimate]);

  return (
    <div
      className="overflow-hidden rounded-xl border transition-shadow"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: "var(--text-secondary)" }}
            >
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Sense Check against ONS data
            </div>
            <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              Validate your estimate with official UK household expenditure data
            </div>
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          style={{ color: "var(--text-tertiary)" }}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: "var(--border)" }}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Funnel filters */}
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Filters
              </div>

              {/* Category */}
              <div>
                <label
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Expenditure Category
                </label>
                <SearchSelect
                  items={categories as Category[]}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Select ONS category..."
                  renderItem={(c) =>
                    `${c.code} ${c.name} — ${formatCurrency(c.weeklySpend, currency)}/wk`
                  }
                  renderSelected={(c) =>
                    `${c.name} (${formatCurrency(c.weeklySpend, currency)}/wk)`
                  }
                />
              </div>

              {/* Geography */}
              <div>
                <label
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Geography
                </label>
                <SearchSelect
                  items={localAuthorities as LocalAuthority[]}
                  value={selectedLA}
                  onChange={setSelectedLA}
                  placeholder="All UK (28.48M households)"
                  renderItem={(la) =>
                    `${la.name} — ${(la.households / 1000).toFixed(0)}K households`
                  }
                  renderSelected={(la) =>
                    `${la.name} (${(la.households / 1000).toFixed(0)}K households)`
                  }
                  groupBy={(la) => la.region}
                />
              </div>

              {/* Demographics */}
              <div className="grid grid-cols-3 gap-3">
                <SimpleSelect
                  label="Age of HRP"
                  options={demographics.ageGroups}
                  value={selectedAge}
                  onChange={setSelectedAge}
                />
                <SimpleSelect
                  label="Income"
                  options={demographics.incomeGroups}
                  value={selectedIncome}
                  onChange={setSelectedIncome}
                />
                <SimpleSelect
                  label="Composition"
                  options={demographics.compositionGroups}
                  value={selectedComposition}
                  onChange={setSelectedComposition}
                />
              </div>

              {/* Funnel summary */}
              {topDownEstimate && (
                <div
                  className="rounded-lg p-3"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <div className="space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <div className="flex justify-between">
                      <span>Target households</span>
                      <span className="font-mono font-medium" style={{ color: "var(--text-primary)" }}>
                        {topDownEstimate.targetHouseholds >= 1000000
                          ? `${(topDownEstimate.targetHouseholds / 1000000).toFixed(2)}M`
                          : `${(topDownEstimate.targetHouseholds / 1000).toFixed(1)}K`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly spend / household</span>
                      <span className="font-mono font-medium" style={{ color: "var(--text-primary)" }}>
                        {formatCurrency(topDownEstimate.weeklyPerHousehold, currency)}
                      </span>
                    </div>
                    <div
                      className="mt-2 flex justify-between border-t pt-2"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <span className="font-medium">Annual market size</span>
                      <span
                        className="font-mono font-semibold"
                        style={{ color: "var(--accent)" }}
                      >
                        {formatCurrency(topDownEstimate.annualSpend, currency)}/yr
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Comparison */}
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Comparison
              </div>

              {!selectedCategory ? (
                <div
                  className="flex h-48 items-center justify-center rounded-lg border border-dashed"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="text-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="mx-auto mb-2"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      <path d="M4 12h16M12 4v16" />
                    </svg>
                    <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      Select a category to compare
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Two estimate cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className="rounded-lg border p-4"
                      style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}
                    >
                      <div
                        className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Your Estimate
                      </div>
                      <div
                        className="text-xl font-bold tracking-tight font-mono"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {formatCurrency(bottomUpEstimate, currency)}
                      </div>
                      <div className="mt-0.5 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        Bottom-up (per annum)
                      </div>
                    </div>

                    <div
                      className="rounded-lg border p-4"
                      style={{
                        borderColor: "var(--accent)",
                        background: "var(--bg-primary)",
                      }}
                    >
                      <div
                        className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: "var(--accent)" }}
                      >
                        ONS Estimate
                      </div>
                      <div
                        className="text-xl font-bold tracking-tight font-mono"
                        style={{ color: "var(--accent)" }}
                      >
                        {topDownEstimate
                          ? formatCurrency(topDownEstimate.annualSpend, currency)
                          : "—"}
                      </div>
                      <div className="mt-0.5 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        Top-down (per annum)
                      </div>
                    </div>
                  </div>

                  {/* Comparison gauge */}
                  {ratio !== null && (
                    <div
                      className="rounded-lg p-4"
                      style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span
                          className="text-xs font-medium"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Estimate vs ONS
                        </span>
                        <span
                          className="rounded-md px-2 py-0.5 text-xs font-semibold font-mono"
                          style={{
                            background:
                              ratio >= 0.7 && ratio <= 1.5
                                ? "rgba(22, 163, 74, 0.1)"
                                : ratio >= 0.3 && ratio <= 3
                                ? "rgba(217, 119, 6, 0.1)"
                                : "rgba(220, 38, 38, 0.1)",
                            color:
                              ratio >= 0.7 && ratio <= 1.5
                                ? "var(--success)"
                                : ratio >= 0.3 && ratio <= 3
                                ? "var(--warning)"
                                : "var(--danger)",
                          }}
                        >
                          {(ratio * 100).toFixed(0)}% of ONS
                        </span>
                      </div>

                      {/* Visual gauge */}
                      <div className="relative">
                        <div
                          className="h-2 rounded-full"
                          style={{ background: "var(--bg-tertiary)" }}
                        >
                          {/* ONS reference (100%) */}
                          <div
                            className="absolute top-0 h-2 w-0.5"
                            style={{
                              background: "var(--accent)",
                              left: `${Math.min(95, (1 / Math.max(ratio, 1 / ratio, 1)) * 50)}%`,
                            }}
                          />
                          {/* User estimate bar */}
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, Math.max(2, ratio * 50))}%`,
                              background:
                                ratio >= 0.7 && ratio <= 1.5
                                  ? "var(--success)"
                                  : ratio >= 0.3 && ratio <= 3
                                  ? "var(--warning)"
                                  : "var(--danger)",
                              opacity: 0.6,
                            }}
                          />
                        </div>

                        {/* Labels */}
                        <div className="mt-2 flex justify-between text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                          <span>150%</span>
                          <span>200%</span>
                        </div>
                      </div>

                      {/* Interpretation */}
                      <div
                        className="mt-3 text-xs leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {ratio >= 0.7 && ratio <= 1.5
                          ? "Your estimate aligns well with the ONS household expenditure data. This suggests your assumptions are reasonable for this market."
                          : ratio < 0.7
                          ? "Your estimate is below the ONS benchmark. You may be underestimating the number of buyers, purchase frequency, or average order value."
                          : "Your estimate exceeds the ONS benchmark. Consider whether you're capturing a premium sub-segment, or if your assumptions need adjusting."}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Source attribution */}
          <div
            className="mt-4 border-t pt-3 text-[10px]"
            style={{ borderColor: "var(--border)", color: "var(--text-tertiary)" }}
          >
            Source: ONS Living Costs and Food Survey, FYE 2024. Household counts from ONS Census 2021 estimates.
          </div>
        </div>
      )}
    </div>
  );
}
