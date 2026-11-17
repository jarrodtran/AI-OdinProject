'use client';

import React, { useMemo, useState } from 'react';
import { Cpu } from 'lucide-react';
/* ========================================================================== */
/* 9. Cascade Model Router & Reasoning Compute Simulator                      */
/* ========================================================================== */

type ReasoningEffort = 'low' | 'medium' | 'high';

const REASONING_EFFORT_SPECS: Record<
  ReasoningEffort,
  { label: string; thinkingTokens: number; ttftMs: number; accuracy: number }
> = {
  low: { label: 'Low (600 thinking tokens)', thinkingTokens: 600, ttftMs: 1800, accuracy: 91 },
  medium: { label: 'Medium (2,000 thinking tokens)', thinkingTokens: 2000, ttftMs: 4200, accuracy: 94.5 },
  high: { label: 'High (5,500 thinking tokens)', thinkingTokens: 5500, ttftMs: 11200, accuracy: 96.5 },
};

export function ModelRouterLab() {
  const [monthlyRequestsK, setMonthlyRequestsK] = useState(500);
  const [simplePct, setSimplePct] = useState(65);
  const [standardPct, setStandardPct] = useState(25);
  const [effort, setEffort] = useState<ReasoningEffort>('medium');
  const [routerAccuracy, setRouterAccuracy] = useState(94);

  const complexPct = Math.max(0, 100 - simplePct - standardPct);

  const metrics = useMemo(() => {
    const reqs = monthlyRequestsK * 1000;
    const effortSpec = REASONING_EFFORT_SPECS[effort];

    const inputTokens = 1800;
    const visibleOutput = 280;

    // Fast-Mini ($0.15 / 1M in, $0.60 / 1M out), Frontier Standard ($2.50 / 1M in, $10.00 / 1M out), Reasoning ($3.00 / 1M in, $15.00 / 1M out)
    const fastCostPerReq = (inputTokens * 0.15 + visibleOutput * 0.6) / 1_000_000;
    const stdCostPerReq = (inputTokens * 2.5 + visibleOutput * 10.0) / 1_000_000;
    const reasonCostPerReq =
      (inputTokens * 3.0 + (visibleOutput + effortSpec.thinkingTokens) * 15.0) / 1_000_000;

    const allReasonMonthly = reqs * reasonCostPerReq;
    const cascadeMonthly =
      reqs *
      ((simplePct / 100) * fastCostPerReq +
        (standardPct / 100) * stdCostPerReq +
        (complexPct / 100) * reasonCostPerReq);

    const savingsPct =
      allReasonMonthly > 0
        ? Math.max(0, Math.round(((allReasonMonthly - cascadeMonthly) / allReasonMonthly) * 100))
        : 0;
    const costPer1kCascade = (cascadeMonthly / reqs) * 1000;
    const costPer1kBaseline = (allReasonMonthly / reqs) * 1000;

    const p50LatencyMs =
      simplePct >= 50 ? 480 : simplePct + standardPct >= 50 ? 1150 : effortSpec.ttftMs;
    const p95LatencyMs =
      complexPct >= 5 ? effortSpec.ttftMs + 1400 : standardPct >= 5 ? 1900 : 750;

    const baseSimpleAcc = 93;
    const baseStdAcc = 95;
    const routerPenalty = (100 - routerAccuracy) * 0.25;
    const blendedAccuracy = Math.max(
      70,
      Math.min(
        99,
        Number(
          (
            (simplePct / 100) * baseSimpleAcc +
            (standardPct / 100) * baseStdAcc +
            (complexPct / 100) * effortSpec.accuracy -
            routerPenalty
          ).toFixed(1)
        )
      )
    );

    return {
      allReasonMonthly,
      cascadeMonthly,
      savingsPct,
      costPer1kCascade,
      costPer1kBaseline,
      p50LatencyMs,
      p95LatencyMs,
      blendedAccuracy,
      effortSpec,
    };
  }, [monthlyRequestsK, simplePct, standardPct, complexPct, effort, routerAccuracy]);

  const handleSimpleChange = (nextSimple: number) => {
    setSimplePct(nextSimple);
    if (nextSimple + standardPct > 100) {
      setStandardPct(100 - nextSimple);
    }
  };

  const handleStandardChange = (nextStd: number) => {
    const clamped = Math.min(nextStd, 100 - simplePct);
    setStandardPct(clamped);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-800">
            <Cpu className="h-3.5 w-3.5" /> Interactive Lab · Cascade Routing
          </span>
          <h3 className="mt-2 text-lg font-bold text-slate-900">
            Cascade Model Router &amp; Reasoning Compute Simulator
          </h3>
          <p className="text-xs text-slate-500">
            Balance System-1 fast models vs. hidden System-2 thinking tokens across traffic slices.
          </p>
        </div>
        <div className="rounded-xl bg-slate-900 px-3.5 py-2 text-right font-mono text-xs text-amber-300">
          COGS Saved vs. All-Reasoning: {metrics.savingsPct}%
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-6">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Monthly Request Volume</span>
              <span className="font-mono text-slate-900">{monthlyRequestsK}k reqs/mo</span>
            </div>
            <input aria-label="Monthly Request Volume"
              type="range"
              min={50}
              max={5000}
              step={50}
              value={monthlyRequestsK}
              onChange={(e) => setMonthlyRequestsK(Number(e.target.value))}
              className="mt-1.5 w-full accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Simple Route → Fast-Mini (System-1)</span>
              <span className="font-mono text-emerald-700">{simplePct}%</span>
            </div>
            <input aria-label="Simple Route → Fast-Mini (System-1)"
              type="range"
              min={0}
              max={95}
              step={5}
              value={simplePct}
              onChange={(e) => handleSimpleChange(Number(e.target.value))}
              className="mt-1.5 w-full accent-emerald-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Standard Route → Frontier Standard</span>
              <span className="font-mono text-sky-700">{standardPct}%</span>
            </div>
            <input aria-label="Standard Route → Frontier Standard"
              type="range"
              min={0}
              max={100 - simplePct}
              step={5}
              value={standardPct}
              onChange={(e) => handleStandardChange(Number(e.target.value))}
              className="mt-1.5 w-full accent-sky-600"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span>Complex Escalation → Reasoning Tier</span>
              <span className="font-mono text-purple-700">{complexPct}% of traffic</span>
            </div>
            <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div className="bg-emerald-500 transition-all" style={{ width: `${simplePct}%` }} />
              <div className="bg-sky-500 transition-all" style={{ width: `${standardPct}%` }} />
              <div className="bg-purple-500 transition-all" style={{ width: `${complexPct}%` }} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Reasoning Effort Parameter (`reasoning_effort`)
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as ReasoningEffort[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setEffort(lvl)}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-bold capitalize transition ${
                    effort === lvl
                      ? 'border-purple-600 bg-purple-50 text-purple-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">{metrics.effortSpec.label}</div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Router Classifier Accuracy (Escalation Precision)</span>
              <span className="font-mono text-slate-900">{routerAccuracy}%</span>
            </div>
            <input aria-label="Router Classifier Accuracy (Escalation Precision)"
              type="range"
              min={75}
              max={99}
              step={1}
              value={routerAccuracy}
              onChange={(e) => setRouterAccuracy(Number(e.target.value))}
              className="mt-1.5 w-full accent-amber-600"
            />
          </div>
        </div>

        <div className="space-y-4 lg:col-span-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Cascade Monthly Spend</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">
                ${Math.round(metrics.cascadeMonthly).toLocaleString()}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                Baseline all-reasoning: ${Math.round(metrics.allReasonMonthly).toLocaleString()}/mo
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Cost / 1k Requests</div>
              <div className="mt-1 text-2xl font-extrabold text-emerald-700">
                ${metrics.costPer1kCascade.toFixed(2)}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                vs. ${metrics.costPer1kBaseline.toFixed(2)} baseline
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Median / P95 Wait</div>
              <div className="mt-1 text-xl font-extrabold text-slate-900">
                {(metrics.p50LatencyMs / 1000).toFixed(2)}s / {(metrics.p95LatencyMs / 1000).toFixed(1)}s
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">P50 perceived interactivity</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Blended Accuracy</div>
              <div className="mt-1 text-2xl font-extrabold text-indigo-700">
                {metrics.blendedAccuracy}%
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">Eval rubric pass estimate</div>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 text-xs leading-relaxed ${
              metrics.savingsPct >= 45 && metrics.blendedAccuracy >= 91
                ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                : 'border-amber-200 bg-amber-50 text-amber-950'
            }`}
          >
            <div className="font-bold">Staff AI PM Routing Assessment</div>
            <p className="mt-1">
              {complexPct > 45
                ? 'Warning: Sending over 45% of requests to Reasoning models keeps median latency sluggish and burns heavy hidden CoT tokens. Move structured parsing rules to Fast-Mini + schema validators.'
                : routerAccuracy < 86
                ? 'Router Accuracy below 86% sends hard prompts to weak tiers too often. Pair your semantic router with deterministic schema/retry escalation.'
                : 'Healthy Pareto frontier: Routine requests resolve sub-second on Fast-Mini while Reasoning compute concentrates strictly on hard multi-constraint tasks.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
