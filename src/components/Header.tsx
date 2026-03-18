"use client";

import { Currency } from "@/lib/calculations";
import { Mode } from "@/lib/url-state";

interface HeaderProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  darkMode: boolean;
  onDarkModeChange: (dark: boolean) => void;
}

export default function Header({
  mode,
  onModeChange,
  currency,
  onCurrencyChange,
  darkMode,
  onDarkModeChange,
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        borderColor: "var(--border)",
        background: darkMode ? "rgba(9,9,11,0.85)" : "rgba(250,250,250,0.85)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            SP
          </div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Spending Power
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode toggle */}
          <div
            className="flex rounded-lg p-0.5"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <button
              onClick={() => onModeChange("range")}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: mode === "range" ? "var(--bg-secondary)" : "transparent",
                color: mode === "range" ? "var(--text-primary)" : "var(--text-tertiary)",
                boxShadow: mode === "range" ? "var(--card-shadow)" : "none",
              }}
            >
              Range
            </button>
            <button
              onClick={() => onModeChange("simulation")}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: mode === "simulation" ? "var(--bg-secondary)" : "transparent",
                color: mode === "simulation" ? "var(--text-primary)" : "var(--text-tertiary)",
                boxShadow: mode === "simulation" ? "var(--card-shadow)" : "none",
              }}
            >
              Simulation
            </button>
          </div>

          {/* Currency */}
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as Currency)}
            className="rounded-lg border px-2 py-1.5 text-xs font-medium outline-none"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="GBP">£ GBP</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
          </select>

          {/* Dark mode toggle */}
          <button
            onClick={() => onDarkModeChange(!darkMode)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
