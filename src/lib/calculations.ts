// ── Core spending power formulas ──

export interface SpendingInputs {
  aov: number;
  returnRate: number;
  frequency: number;
  buyers: number;
}

export interface SpendingOutputs {
  netAov: number;
  transactions: number;
  annualSpendingPower: number;
  spendPerBuyer: number;
}

export function calculate(inputs: SpendingInputs): SpendingOutputs {
  const netAov = inputs.aov * (1 - inputs.returnRate);
  const transactions = inputs.frequency * inputs.buyers;
  const annualSpendingPower = transactions * netAov;
  const spendPerBuyer = inputs.buyers > 0 ? annualSpendingPower / inputs.buyers : 0;
  return { netAov, transactions, annualSpendingPower, spendPerBuyer };
}

// ── Triangular distribution (Range Mode) ──

export interface TriangularInput {
  low: number;
  best: number;
  high: number;
}

export interface RangeInputs {
  aov: TriangularInput;
  returnRate: TriangularInput;
  frequency: TriangularInput;
  buyers: TriangularInput;
}

function sampleTriangular(tri: TriangularInput): number {
  const { low, best, high } = tri;
  if (high === low) return low;
  const fc = (best - low) / (high - low);
  const u = Math.random();
  if (u < fc) {
    return low + Math.sqrt(u * (high - low) * (best - low));
  }
  return high - Math.sqrt((1 - u) * (high - low) * (high - best));
}

export interface RangeResults {
  p10: SpendingOutputs;
  p50: SpendingOutputs;
  p90: SpendingOutputs;
  samples: number[];
  tornado: TornadoItem[];
}

export interface TornadoItem {
  label: string;
  lowImpact: number;
  highImpact: number;
  baseValue: number;
}

export function runRangeAnalysis(inputs: RangeInputs, iterations = 10000): RangeResults {
  const samples: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const result = calculate({
      aov: sampleTriangular(inputs.aov),
      returnRate: sampleTriangular(inputs.returnRate),
      frequency: sampleTriangular(inputs.frequency),
      buyers: sampleTriangular(inputs.buyers),
    });
    samples.push(result.annualSpendingPower);
  }

  samples.sort((a, b) => a - b);

  const percentile = (arr: number[], p: number) => {
    const idx = Math.floor(arr.length * p);
    return arr[Math.min(idx, arr.length - 1)];
  };

  const p10Val = percentile(samples, 0.1);
  const p50Val = percentile(samples, 0.5);
  const p90Val = percentile(samples, 0.9);

  const baseInputs: SpendingInputs = {
    aov: inputs.aov.best,
    returnRate: inputs.returnRate.best,
    frequency: inputs.frequency.best,
    buyers: inputs.buyers.best,
  };
  const baseResult = calculate(baseInputs);

  // Tornado: vary each input independently
  const tornado: TornadoItem[] = [];
  const inputKeys: { key: keyof RangeInputs; label: string }[] = [
    { key: "aov", label: "AOV" },
    { key: "returnRate", label: "Return Rate" },
    { key: "frequency", label: "Frequency" },
    { key: "buyers", label: "Buyers" },
  ];

  for (const { key, label } of inputKeys) {
    const lowInputs = { ...baseInputs, [key]: inputs[key].low };
    const highInputs = { ...baseInputs, [key]: inputs[key].high };
    const lowResult = calculate(lowInputs);
    const highResult = calculate(highInputs);
    tornado.push({
      label,
      lowImpact: lowResult.annualSpendingPower,
      highImpact: highResult.annualSpendingPower,
      baseValue: baseResult.annualSpendingPower,
    });
  }

  // Sort tornado by total impact range (largest first)
  tornado.sort(
    (a, b) =>
      Math.abs(b.highImpact - b.lowImpact) - Math.abs(a.highImpact - a.lowImpact)
  );

  return {
    p10: calculateFromSpendingPower(p10Val, baseInputs),
    p50: calculateFromSpendingPower(p50Val, baseInputs),
    p90: calculateFromSpendingPower(p90Val, baseInputs),
    samples,
    tornado,
  };
}

function calculateFromSpendingPower(
  spendingPower: number,
  baseInputs: SpendingInputs
): SpendingOutputs {
  const netAov = baseInputs.aov * (1 - baseInputs.returnRate);
  const transactions = baseInputs.frequency * baseInputs.buyers;
  const ratio = transactions > 0 && netAov > 0 ? spendingPower / (transactions * netAov) : 1;
  return {
    netAov: netAov * Math.sqrt(ratio),
    transactions: transactions * Math.sqrt(ratio),
    annualSpendingPower: spendingPower,
    spendPerBuyer: baseInputs.buyers > 0 ? spendingPower / baseInputs.buyers : 0,
  };
}

// ── Monte Carlo Simulation Mode ──

export type DistributionType = "normal" | "lognormal" | "uniform";

export interface SimulationInput {
  value: number;
  distribution: DistributionType;
  uncertainty: number; // percentage (e.g. 20 = 20%)
}

export interface SimulationInputs {
  aov: SimulationInput;
  returnRate: SimulationInput;
  frequency: SimulationInput;
  buyers: SimulationInput;
}

function sampleNormal(mean: number, sd: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + sd * z;
}

function sampleDistribution(input: SimulationInput): number {
  const { value, distribution, uncertainty } = input;
  const sd = (value * uncertainty) / 100;

  switch (distribution) {
    case "normal": {
      return sampleNormal(value, sd);
    }
    case "lognormal": {
      if (value <= 0) return value;
      const cv = uncertainty / 100;
      const sigma2 = Math.log(1 + cv * cv);
      const mu = Math.log(value) - sigma2 / 2;
      const sigma = Math.sqrt(sigma2);
      return Math.exp(sampleNormal(mu, sigma));
    }
    case "uniform": {
      const half = sd * Math.sqrt(3); // uniform with same SD
      return value - half + Math.random() * 2 * half;
    }
    default:
      return value;
  }
}

export interface SimulationResults {
  p10: SpendingOutputs;
  p50: SpendingOutputs;
  p90: SpendingOutputs;
  samples: number[];
  mean: number;
  stdDev: number;
}

export function runSimulation(
  inputs: SimulationInputs,
  iterations = 10000
): SimulationResults {
  const samples: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const aov = Math.max(0, sampleDistribution(inputs.aov));
    const returnRate = Math.max(0, Math.min(1, sampleDistribution(inputs.returnRate)));
    const frequency = Math.max(0, sampleDistribution(inputs.frequency));
    const buyers = Math.max(0, Math.round(sampleDistribution(inputs.buyers)));

    const result = calculate({ aov, returnRate, frequency, buyers });
    samples.push(result.annualSpendingPower);
  }

  samples.sort((a, b) => a - b);

  const percentile = (arr: number[], p: number) => {
    const idx = Math.floor(arr.length * p);
    return arr[Math.min(idx, arr.length - 1)];
  };

  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance =
    samples.reduce((sum, val) => sum + (val - mean) ** 2, 0) / samples.length;
  const stdDev = Math.sqrt(variance);

  const baseInputs: SpendingInputs = {
    aov: inputs.aov.value,
    returnRate: inputs.returnRate.value,
    frequency: inputs.frequency.value,
    buyers: inputs.buyers.value,
  };

  const p10Val = percentile(samples, 0.1);
  const p50Val = percentile(samples, 0.5);
  const p90Val = percentile(samples, 0.9);

  return {
    p10: calculateFromSpendingPower(p10Val, baseInputs),
    p50: calculateFromSpendingPower(p50Val, baseInputs),
    p90: calculateFromSpendingPower(p90Val, baseInputs),
    samples,
    mean,
    stdDev,
  };
}

// ── Histogram binning helper ──

export interface HistogramBin {
  min: number;
  max: number;
  mid: number;
  count: number;
  frequency: number;
}

export function buildHistogram(samples: number[], binCount = 40): HistogramBin[] {
  if (samples.length === 0) return [];
  const min = samples[0];
  const max = samples[samples.length - 1];
  if (max === min) return [{ min, max, mid: min, count: samples.length, frequency: 1 }];

  const binWidth = (max - min) / binCount;
  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => ({
    min: min + i * binWidth,
    max: min + (i + 1) * binWidth,
    mid: min + (i + 0.5) * binWidth,
    count: 0,
    frequency: 0,
  }));

  for (const val of samples) {
    const idx = Math.min(Math.floor((val - min) / binWidth), binCount - 1);
    bins[idx].count++;
  }

  for (const bin of bins) {
    bin.frequency = bin.count / samples.length;
  }

  return bins;
}

// ── Currency formatting ──

export type Currency = "GBP" | "USD" | "EUR";

const currencySymbols: Record<Currency, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
};

export function formatCurrency(value: number, currency: Currency): string {
  const symbol = currencySymbols[currency];
  if (Math.abs(value) >= 1_000_000_000) {
    return `${symbol}${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${symbol}${(value / 1_000).toFixed(1)}K`;
  }
  return `${symbol}${value.toFixed(2)}`;
}

export function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(1);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
