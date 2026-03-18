"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import RangeInputPanel from "@/components/RangeInputPanel";
import SimulationInputPanel from "@/components/SimulationInputPanel";
import ResultCards from "@/components/ResultCards";
import TornadoChart from "@/components/TornadoChart";
import HistogramChart from "@/components/HistogramChart";
import {
  Currency,
  RangeInputs,
  SimulationInputs,
  runRangeAnalysis,
  runSimulation,
  buildHistogram,
  RangeResults,
  SimulationResults,
} from "@/lib/calculations";
import { Mode, encodeState } from "@/lib/url-state";

const defaultRangeInputs: RangeInputs = {
  aov: { low: 30, best: 50, high: 70 },
  returnRate: { low: 0.01, best: 0.03, high: 0.08 },
  frequency: { low: 2, best: 4.8, high: 8 },
  buyers: { low: 15000, best: 30000, high: 50000 },
};

const defaultSimInputs: SimulationInputs = {
  aov: { value: 50, distribution: "normal", uncertainty: 20 },
  returnRate: { value: 0.03, distribution: "normal", uncertainty: 20 },
  frequency: { value: 4.8, distribution: "normal", uncertainty: 20 },
  buyers: { value: 30000, distribution: "normal", uncertainty: 20 },
};

export default function Home() {
  const [mode, setMode] = useState<Mode>("range");
  const [currency, setCurrency] = useState<Currency>("GBP");
  const [darkMode, setDarkMode] = useState(false);
  const [rangeInputs, setRangeInputs] = useState<RangeInputs>(defaultRangeInputs);
  const [simInputs, setSimInputs] = useState<SimulationInputs>(defaultSimInputs);
  const [mounted, setMounted] = useState(false);

  // System dark mode detection
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDarkMode(mq.matches);
    const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Apply dark class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // URL state sync
  useEffect(() => {
    if (!mounted) return;
    const state = encodeState({
      mode,
      currency,
      rangeInputs,
      simulationInputs: simInputs,
    });
    window.history.replaceState(null, "", `?${state}`);
  }, [mode, currency, rangeInputs, simInputs, mounted]);

  // Compute results
  const rangeResults = useMemo<RangeResults | null>(() => {
    if (mode !== "range") return null;
    return runRangeAnalysis(rangeInputs);
  }, [mode, rangeInputs]);

  const simResults = useMemo<SimulationResults | null>(() => {
    if (mode !== "simulation") return null;
    return runSimulation(simInputs);
  }, [mode, simInputs]);

  const histogram = useMemo(() => {
    if (simResults) return buildHistogram(simResults.samples);
    return [];
  }, [simResults]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--border)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const p10 = mode === "range" ? rangeResults!.p10 : simResults!.p10;
  const p50 = mode === "range" ? rangeResults!.p50 : simResults!.p50;
  const p90 = mode === "range" ? rangeResults!.p90 : simResults!.p90;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Header
        mode={mode}
        onModeChange={setMode}
        currency={currency}
        onCurrencyChange={setCurrency}
        darkMode={darkMode}
        onDarkModeChange={setDarkMode}
      />

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6">
        {/* Inputs */}
        {mode === "range" ? (
          <RangeInputPanel inputs={rangeInputs} onChange={setRangeInputs} />
        ) : (
          <SimulationInputPanel inputs={simInputs} onChange={setSimInputs} />
        )}

        {/* Result Cards */}
        <ResultCards p10={p10} p50={p50} p90={p90} currency={currency} />

        {/* Charts */}
        {mode === "range" && rangeResults && (
          <TornadoChart data={rangeResults.tornado} currency={currency} />
        )}

        {mode === "simulation" && simResults && histogram.length > 0 && (
          <HistogramChart
            bins={histogram}
            p10={simResults.p10.annualSpendingPower}
            p50={simResults.p50.annualSpendingPower}
            p90={simResults.p90.annualSpendingPower}
            mean={simResults.mean}
            stdDev={simResults.stdDev}
            currency={currency}
          />
        )}

        {/* Share button */}
        <div className="flex justify-center pb-6">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-colors hover:opacity-80"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16,6 12,2 8,6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Copy shareable link
          </button>
        </div>
      </main>
    </div>
  );
}
