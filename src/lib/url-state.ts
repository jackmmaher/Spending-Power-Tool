import type { RangeInputs, SimulationInputs, Currency } from "./calculations";

export type Mode = "range" | "simulation";

export interface AppState {
  mode: Mode;
  currency: Currency;
  rangeInputs: RangeInputs;
  simulationInputs: SimulationInputs;
}

export function encodeState(state: AppState): string {
  const params = new URLSearchParams();
  params.set("m", state.mode);
  params.set("c", state.currency);

  if (state.mode === "range") {
    const r = state.rangeInputs;
    params.set("al", String(r.aov.low));
    params.set("ab", String(r.aov.best));
    params.set("ah", String(r.aov.high));
    params.set("rl", String(r.returnRate.low));
    params.set("rb", String(r.returnRate.best));
    params.set("rh", String(r.returnRate.high));
    params.set("fl", String(r.frequency.low));
    params.set("fb", String(r.frequency.best));
    params.set("fh", String(r.frequency.high));
    params.set("bl", String(r.buyers.low));
    params.set("bb", String(r.buyers.best));
    params.set("bh", String(r.buyers.high));
  } else {
    const s = state.simulationInputs;
    params.set("av", String(s.aov.value));
    params.set("ad", s.aov.distribution);
    params.set("au", String(s.aov.uncertainty));
    params.set("rv", String(s.returnRate.value));
    params.set("rd", s.returnRate.distribution);
    params.set("ru", String(s.returnRate.uncertainty));
    params.set("fv", String(s.frequency.value));
    params.set("fd", s.frequency.distribution);
    params.set("fu", String(s.frequency.uncertainty));
    params.set("bv", String(s.buyers.value));
    params.set("bd", s.buyers.distribution);
    params.set("bu", String(s.buyers.uncertainty));
  }

  return params.toString();
}

export function decodeState(search: string): Partial<AppState> | null {
  try {
    const params = new URLSearchParams(search);
    const mode = params.get("m") as Mode | null;
    if (!mode) return null;

    const currency = (params.get("c") as Currency) || "GBP";
    const num = (key: string, fallback: number) => {
      const v = params.get(key);
      return v ? parseFloat(v) : fallback;
    };

    if (mode === "range") {
      return {
        mode,
        currency,
        rangeInputs: {
          aov: { low: num("al", 30), best: num("ab", 50), high: num("ah", 70) },
          returnRate: { low: num("rl", 0.01), best: num("rb", 0.03), high: num("rh", 0.08) },
          frequency: { low: num("fl", 2), best: num("fb", 4.8), high: num("fh", 8) },
          buyers: { low: num("bl", 15000), best: num("bb", 30000), high: num("bh", 50000) },
        },
      };
    }

    return {
      mode,
      currency,
      simulationInputs: {
        aov: { value: num("av", 50), distribution: (params.get("ad") as "normal" | "lognormal" | "uniform") || "normal", uncertainty: num("au", 20) },
        returnRate: { value: num("rv", 0.03), distribution: (params.get("rd") as "normal" | "lognormal" | "uniform") || "normal", uncertainty: num("ru", 20) },
        frequency: { value: num("fv", 4.8), distribution: (params.get("fd") as "normal" | "lognormal" | "uniform") || "normal", uncertainty: num("fu", 20) },
        buyers: { value: num("bv", 30000), distribution: (params.get("bd") as "normal" | "lognormal" | "uniform") || "normal", uncertainty: num("bu", 20) },
      },
    };
  } catch {
    return null;
  }
}
