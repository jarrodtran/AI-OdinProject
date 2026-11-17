'use client';

import React, { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
/* ========================================================================== */
/* 1. Token Economics & Latency Budget Simulator                              */
/* ========================================================================== */

type ModelPresetKey = 'small' | 'mid' | 'frontier';

const MODEL_PRICING: Record<
  ModelPresetKey,
  { name: string; inputPer1M: number; cachedPer1M: number; outputPer1M: number; baseTtftMs: number; tps: number }
> = {
  small: {
    name: 'Fast / Small Tier (e.g., Mini / Flash / Haiku)',
    inputPer1M: 0.2,
    cachedPer1M: 0.04,
    outputPer1M: 0.8,
    baseTtftMs: 280,
    tps: 115,
  },
  mid: {
    name: 'Balanced Tier (e.g., Standard Generalist)',
    inputPer1M: 1.25,
    cachedPer1M: 0.25,
    outputPer1M: 5.0,
    baseTtftMs: 520,
    tps: 75,
  },
  frontier: {
    name: 'Frontier Reasoning Tier',
    inputPer1M: 3.0,
    cachedPer1M: 0.3,
    outputPer1M: 15.0,
    baseTtftMs: 1150,
    tps: 52,
  },
};

export function TokenEconomicsLab() {
  const [modelTier, setModelTier] = useState<ModelPresetKey>('frontier');
  const [routeToSmallPct, setRouteToSmallPct] = useState(0);
  const [inputTokens, setInputTokens] = useState(4500);
  const [outputTokens, setOutputTokens] = useState(450);
  const [reasoningTokens, setReasoningTokens] = useState(300);
  const [cacheHitRate, setCacheHitRate] = useState(20);
  const [callsPerSeatMonth, setCallsPerSeatMonth] = useState(800);
  const [seatPrice, setSeatPrice] = useState(49);

  const applyPreset = (preset: 'naive' | 'optimized' | 'helpflow' | 'poweruser') => {
    if (preset === 'naive') {
      setModelTier('frontier');
      setRouteToSmallPct(0);
      setInputTokens(6500);
      setOutputTokens(600);
      setReasoningTokens(800);
      setCacheHitRate(0);
      setCallsPerSeatMonth(950);
      setSeatPrice(39);
    } else if (preset === 'optimized') {
      setModelTier('mid');
      setRouteToSmallPct(70);
      setInputTokens(4500);
      setOutputTokens(350);
      setReasoningTokens(0);
      setCacheHitRate(80);
      setCallsPerSeatMonth(950);
      setSeatPrice(49);
    } else if (preset === 'helpflow') {
      setModelTier('mid');
      setRouteToSmallPct(65);
      setInputTokens(3800);
      setOutputTokens(320);
      setReasoningTokens(0);
      setCacheHitRate(75);
      setCallsPerSeatMonth(1584);
      setSeatPrice(49);
    } else {
      setModelTier('frontier');
      setRouteToSmallPct(0);
      setInputTokens(12000);
      setOutputTokens(900);
      setReasoningTokens(1200);
      setCacheHitRate(10);
      setCallsPerSeatMonth(2400);
      setSeatPrice(39);
    }
  };

  const metrics = useMemo(() => {
    const primary = MODEL_PRICING[modelTier];
    const small = MODEL_PRICING.small;
    const smallShare = routeToSmallPct / 100;
    const primaryShare = 1 - smallShare;

    const calcBreakdown = (m: typeof primary) => {
      const cacheRatio = cacheHitRate / 100;
      const uncachedIn = (inputTokens * (1 - cacheRatio) * m.inputPer1M) / 1_000_000;
      const cachedIn = (inputTokens * cacheRatio * m.cachedPer1M) / 1_000_000;
      const outCost = ((outputTokens + reasoningTokens) * m.outputPer1M) / 1_000_000;
      return { uncachedIn, cachedIn, outCost, total: uncachedIn + cachedIn + outCost };
    };

    const pBreak = calcBreakdown(primary);
    const sBreak = calcBreakdown(small);

    const uncachedInCost = primaryShare * pBreak.uncachedIn + smallShare * sBreak.uncachedIn;
    const cachedInCost = primaryShare * pBreak.cachedIn + smallShare * sBreak.cachedIn;
    const outputReasonCost = primaryShare * pBreak.outCost + smallShare * sBreak.outCost;

    const blendedReqCost = uncachedInCost + cachedInCost + outputReasonCost;
    const monthlyCogsPerSeat = blendedReqCost * callsPerSeatMonth;
    const grossMarginPct = seatPrice > 0 ? ((seatPrice - monthlyCogsPerSeat) / seatPrice) * 100 : 0;
    const p95MonthlyCogs = monthlyCogsPerSeat * 3.2;
    const p95MarginPct = seatPrice > 0 ? ((seatPrice - p95MonthlyCogs) / seatPrice) * 100 : 0;

    // Approximate TTFT & Total Latency
    const prefillPenalty = (inputTokens * (1 - cacheHitRate / 100)) / 40; // ~40 tok/ms penalty scale
    const thinkingPenalty = (reasoningTokens / primary.tps) * 1000;
    const estTtftMs = Math.round(
      primaryShare * (primary.baseTtftMs + prefillPenalty + thinkingPenalty) +
        smallShare * (small.baseTtftMs + prefillPenalty * 0.4)
    );
    const blendedTps = primaryShare * primary.tps + smallShare * small.tps;
    const decodeMs = Math.round((outputTokens / blendedTps) * 1000);
    const estTotalSec = Number(((estTtftMs + decodeMs) / 1000).toFixed(2));

    const safeTotal = blendedReqCost > 0 ? blendedReqCost : 1;
    const uncachedSharePct = Math.round((uncachedInCost / safeTotal) * 100);
    const cachedSharePct = Math.round((cachedInCost / safeTotal) * 100);
    const outputSharePct = Math.max(0, 100 - uncachedSharePct - cachedSharePct);

    return {
      blendedReqCost,
      monthlyCogsPerSeat,
      grossMarginPct,
      p95MonthlyCogs,
      p95MarginPct,
      estTtftMs,
      decodeMs,
      estTotalSec,
      uncachedSharePct,
      cachedSharePct,
      outputSharePct,
    };
  }, [
    modelTier,
    routeToSmallPct,
    inputTokens,
    outputTokens,
    reasoningTokens,
    cacheHitRate,
    callsPerSeatMonth,
    seatPrice,
  ]);

  const marginTone =
    metrics.grossMarginPct >= 72
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : metrics.grossMarginPct >= 55
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-amber-700 uppercase">
            <Calculator className="h-4 w-4" /> Lab 1 · Unit Economics & Latency
          </div>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Token Economics & Latency Budget Simulator
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset('naive')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Naive Frontier Build
          </button>
          <button
            type="button"
            onClick={() => applyPreset('optimized')}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
          >
            Routed + Cached
          </button>
          <button
            type="button"
            onClick={() => applyPreset('helpflow')}
            className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
          >
            HelpFlow Case
          </button>
          <button
            type="button"
            onClick={() => applyPreset('poweruser')}
            className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-800 hover:bg-rose-100"
          >
            Power-User Burn
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <div>
            <label className="text-xs font-semibold text-slate-700">Primary Model Tier</label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {(['small', 'mid', 'frontier'] as ModelPresetKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setModelTier(key)}
                  className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                    modelTier === key
                      ? 'border-amber-600 bg-amber-50 font-semibold text-amber-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="capitalize">{key}</div>
                  <div className="text-[11px] opacity-90">
                    ${MODEL_PRICING[key].inputPer1M} / ${MODEL_PRICING[key].outputPer1M}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">Routed to Fast/Small Model</span>
                <span className="font-mono font-semibold text-slate-900">{routeToSmallPct}%</span>
              </div>
              <input aria-label="Routed to Fast/Small Model"
                type="range"
                min={0}
                max={95}
                step={5}
                value={routeToSmallPct}
                onChange={(e) => setRouteToSmallPct(Number(e.target.value))}
                className="mt-1.5 w-full accent-amber-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">Prefix Cache Hit Rate</span>
                <span className="font-mono font-semibold text-slate-900">{cacheHitRate}%</span>
              </div>
              <input aria-label="Prefix Cache Hit Rate"
                type="range"
                min={0}
                max={95}
                step={5}
                value={cacheHitRate}
                onChange={(e) => setCacheHitRate(Number(e.target.value))}
                className="mt-1.5 w-full accent-amber-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">Input Tokens / Request</span>
                <span className="font-mono font-semibold text-slate-900">
                  {inputTokens.toLocaleString()}
                </span>
              </div>
              <input aria-label="Input Tokens / Request"
                type="range"
                min={500}
                max={25000}
                step={500}
                value={inputTokens}
                onChange={(e) => setInputTokens(Number(e.target.value))}
                className="mt-1.5 w-full accent-amber-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">Output Tokens / Request</span>
                <span className="font-mono font-semibold text-slate-900">{outputTokens}</span>
              </div>
              <input aria-label="Output Tokens / Request"
                type="range"
                min={50}
                max={2500}
                step={50}
                value={outputTokens}
                onChange={(e) => setOutputTokens(Number(e.target.value))}
                className="mt-1.5 w-full accent-amber-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">Hidden Reasoning Tokens</span>
                <span className="font-mono font-semibold text-slate-900">{reasoningTokens}</span>
              </div>
              <input aria-label="Hidden Reasoning Tokens"
                type="range"
                min={0}
                max={3000}
                step={100}
                value={reasoningTokens}
                onChange={(e) => setReasoningTokens(Number(e.target.value))}
                className="mt-1.5 w-full accent-amber-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">Calls / Active Seat / Month</span>
                <span className="font-mono font-semibold text-slate-900">
                  {callsPerSeatMonth.toLocaleString()}
                </span>
              </div>
              <input aria-label="Calls / Active Seat / Month"
                type="range"
                min={50}
                max={3500}
                step={50}
                value={callsPerSeatMonth}
                onChange={(e) => setCallsPerSeatMonth(Number(e.target.value))}
                className="mt-1.5 w-full accent-amber-600"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">Monthly Subscription Price / Seat</span>
              <span className="font-mono font-semibold text-slate-900">${seatPrice}/mo</span>
            </div>
            <input aria-label="Monthly Subscription Price / Seat"
              type="range"
              min={15}
              max={149}
              step={5}
              value={seatPrice}
              onChange={(e) => setSeatPrice(Number(e.target.value))}
              className="mt-1.5 w-full accent-amber-600"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-5">
          <div className="space-y-3">
            <div className={`rounded-xl border p-3.5 ${marginTone}`}>
              <div className="text-xs font-semibold uppercase">Blended AI Gross Margin</div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold">
                  {metrics.grossMarginPct.toFixed(1)}%
                </span>
                <span className="text-xs font-medium">
                  ${metrics.monthlyCogsPerSeat.toFixed(2)} AI COGS / seat
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-[11px] font-medium text-slate-500">Cost / Request</div>
                <div className="mt-0.5 font-mono text-lg font-bold text-slate-900">
                  ${metrics.blendedReqCost.toFixed(4)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-[11px] font-medium text-slate-500">Est. TTFT / Total</div>
                <div className="mt-0.5 font-mono text-lg font-bold text-slate-900">
                  {metrics.estTtftMs}ms / {metrics.estTotalSec}s
                </div>
              </div>
            </div>

            {/* Stacked Per-Request Cost Breakdown Bar */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>Request Cost Share</span>
                <span className="font-mono text-[11px] text-slate-500">Output = 3x–5x Input</span>
              </div>
              <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="bg-amber-500 transition-all duration-300"
                  style={{ width: `${metrics.uncachedSharePct}%` }}
                  title={`Uncached Input: ${metrics.uncachedSharePct}%`}
                />
                <div
                  className="bg-emerald-500 transition-all duration-300"
                  style={{ width: `${metrics.cachedSharePct}%` }}
                  title={`Cached Input: ${metrics.cachedSharePct}%`}
                />
                <div
                  className="bg-indigo-600 transition-all duration-300"
                  style={{ width: `${metrics.outputSharePct}%` }}
                  title={`Output + Reasoning: ${metrics.outputSharePct}%`}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-medium text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Uncached ({metrics.uncachedSharePct}%)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Cached ({metrics.cachedSharePct}%)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-600" />
                  Output/Think ({metrics.outputSharePct}%)
                </span>
              </div>
            </div>

            {/* Visual Latency Timeline */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>Latency Budget (TTFT + Stream)</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    metrics.estTtftMs <= 350
                      ? 'bg-emerald-50 text-emerald-700'
                      : metrics.estTtftMs <= 1000
                      ? 'bg-amber-50 text-amber-800'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {metrics.estTtftMs <= 350
                    ? 'Autocomplete Ready'
                    : metrics.estTtftMs <= 1000
                    ? 'Copilot Interactive'
                    : 'Async Recommended'}
                </span>
              </div>
              <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="bg-rose-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((metrics.estTtftMs / Math.max(1, metrics.estTtftMs + metrics.decodeMs)) * 100)
                    )}%`,
                  }}
                />
                <div className="flex-1 bg-sky-500" />
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[10px] text-slate-500">
                <span>TTFT wait: {metrics.estTtftMs}ms</span>
                <span>Stream decode: {(metrics.decodeMs / 1000).toFixed(2)}s</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>P95 Power-User Cohort (3.2x vol)</span>
                <span
                  className={
                    metrics.p95MarginPct < 40 ? 'text-rose-600' : 'text-emerald-700'
                  }
                >
                  {metrics.p95MarginPct.toFixed(1)}% margin
                </span>
              </div>
              <p className="mt-1 text-slate-600">
                Heavy customers burn ~<strong>${metrics.p95MonthlyCogs.toFixed(2)}/seat/mo</strong>{' '}
                in inference alone.{' '}
                {metrics.p95MarginPct < 30
                  ? 'Warning: unlimited flat pricing loses money on power users! Add workflow credit pools + small-model routing.'
                  : 'Healthy margin buffer even under heavy cohort utilization.'}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Tip: Notice how turning off hidden reasoning tokens on simple tasks and enabling 75%+
            prefix caching drastically lowers both COGS and TTFT.
          </div>
        </div>
      </div>
    </div>
  );
}
