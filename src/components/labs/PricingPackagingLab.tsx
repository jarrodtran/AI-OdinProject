'use client';

import React, { useMemo, useState } from 'react';
import { Coins } from 'lucide-react';
/* ========================================================================== */
/* 10. AI SaaS Pricing, Credit Metering & Margin Stress-Tester                */
/* ========================================================================== */

type PackagingStrategy = 'flat-unlimited' | 'hybrid-pooled' | 'usage-metered' | 'outcome-based';

export function PricingPackagingLab() {
  const [seats, setSeats] = useState(2500);
  const [strategy, setStrategy] = useState<PackagingStrategy>('hybrid-pooled');
  const [avgRunsPerSeat, setAvgRunsPerSeat] = useState(90);
  const [whaleMultiplier, setWhaleMultiplier] = useState(8);
  const [cogsPerRun, setCogsPerRun] = useState(0.025);

  const summary = useMemo(() => {
    const baseSeats = Math.round(seats * 0.9);
    const whaleSeats = seats - baseSeats;
    const baseRuns = baseSeats * avgRunsPerSeat;
    const whaleRuns = whaleSeats * avgRunsPerSeat * whaleMultiplier;
    const totalRuns = baseRuns + whaleRuns;
    const totalCogs = totalRuns * cogsPerRun;

    let monthlyRevenue = 0;
    let whaleLossNote = '';
    if (strategy === 'flat-unlimited') {
      monthlyRevenue = seats * 29;
      whaleLossNote = `${whaleSeats.toLocaleString()} heavy accounts generate ${Math.round(
        (whaleRuns / totalRuns) * 100
      )}% of spend at flat $29 revenue—turning whale seats negative-margin whenever runs > $${Math.floor(
        29 / cogsPerRun
      )}/mo.`;
    } else if (strategy === 'hybrid-pooled') {
      const includedPoolPerSeat = 120;
      const billableOverageRuns = Math.max(0, totalRuns - seats * includedPoolPerSeat);
      monthlyRevenue = seats * 29 + billableOverageRuns * 0.08;
      whaleLossNote = `Pooled allowance absorbs organic variance while overage packs ($0.08/run vs. $${cogsPerRun.toFixed(
        3
      )} COGS) convert power users into gross-margin accretive expansion.`;
    } else if (strategy === 'usage-metered') {
      monthlyRevenue = totalRuns * 0.065;
      whaleLossNote =
        'Every run carries positive unit contribution, though CFOs demand monthly budget caps and spend alerts.';
    } else {
      const verifiedResolvedRate = 0.72;
      monthlyRevenue = totalRuns * verifiedResolvedRate * 0.14;
      whaleLossNote =
        'Outcome fees command high enterprise willingness-to-pay, requiring clear 72-hour non-reopen attribution contracts.';
    }

    const grossProfit = monthlyRevenue - totalCogs;
    const grossMarginPct =
      monthlyRevenue > 0 ? Math.round((grossProfit / monthlyRevenue) * 100) : 0;

    return {
      monthlyRevenue,
      totalCogs,
      grossProfit,
      grossMarginPct,
      totalRuns,
      whaleSharePct: Math.round((whaleRuns / totalRuns) * 100),
      whaleLossNote,
    };
  }, [seats, strategy, avgRunsPerSeat, whaleMultiplier, cogsPerRun]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
            <Coins className="h-3.5 w-3.5" /> Interactive Lab · AI Monetization
          </span>
          <h3 className="mt-2 text-lg font-bold text-slate-900">
            AI SaaS Pricing, Credit Metering &amp; Margin Stress-Tester
          </h3>
          <p className="text-xs text-slate-500">
            Stress-test Flat Unlimited vs. Hybrid Credit Pools vs. Outcome pricing against top-10% power users.
          </p>
        </div>
        <div
          className={`rounded-xl px-3.5 py-2 font-mono text-xs font-bold ${
            summary.grossMarginPct >= 75
              ? 'bg-emerald-950 text-emerald-300'
              : summary.grossMarginPct >= 55
              ? 'bg-amber-950 text-amber-300'
              : 'bg-rose-950 text-rose-300'
          }`}
        >
          Gross Margin: {summary.grossMarginPct}% (75% SaaS Target)
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-6">
          <div>
            <label className="text-xs font-semibold text-slate-700">Packaging Model</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {[
                { id: 'flat-unlimited' as const, label: 'Flat $29 Unlimited' },
                { id: 'hybrid-pooled' as const, label: 'Hybrid $29 + Credit Pool' },
                { id: 'usage-metered' as const, label: 'Pure Usage ($0.065/run)' },
                { id: 'outcome-based' as const, label: 'Outcome ($0.14/resolved)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStrategy(opt.id)}
                  className={`rounded-xl border px-3 py-2 text-left text-xs font-bold transition ${
                    strategy === opt.id
                      ? 'border-teal-600 bg-teal-50 text-teal-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Active Paid Seats</span>
              <span className="font-mono text-slate-900">{seats.toLocaleString()}</span>
            </div>
            <input aria-label="Active Paid Seats"
              type="range"
              min={500}
              max={20000}
              step={500}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="mt-1.5 w-full accent-teal-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Average Monthly AI Workflows / Standard Seat</span>
              <span className="font-mono text-slate-900">{avgRunsPerSeat} runs</span>
            </div>
            <input aria-label="Average Monthly AI Workflows / Standard Seat"
              type="range"
              min={20}
              max={300}
              step={10}
              value={avgRunsPerSeat}
              onChange={(e) => setAvgRunsPerSeat(Number(e.target.value))}
              className="mt-1.5 w-full accent-teal-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Top-10% Power-User (&ldquo;Whale&rdquo;) Multiplier</span>
              <span className="font-mono text-rose-700">{whaleMultiplier}x average</span>
            </div>
            <input aria-label="Top-10% Power-User (“Whale”) Multiplier"
              type="range"
              min={2}
              max={15}
              step={1}
              value={whaleMultiplier}
              onChange={(e) => setWhaleMultiplier(Number(e.target.value))}
              className="mt-1.5 w-full accent-rose-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Internal Inference COGS / Workflow Run</span>
              <span className="font-mono text-slate-900">${cogsPerRun.toFixed(3)}</span>
            </div>
            <input aria-label="Internal Inference COGS / Workflow Run"
              type="range"
              min={0.005}
              max={0.08}
              step={0.005}
              value={cogsPerRun}
              onChange={(e) => setCogsPerRun(Number(e.target.value))}
              className="mt-1.5 w-full accent-amber-600"
            />
          </div>
        </div>

        <div className="space-y-4 lg:col-span-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Monthly Revenue</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">
                ${Math.round(summary.monthlyRevenue).toLocaleString()}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                {(summary.totalRuns / 1000).toFixed(0)}k total workflow runs
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Inference COGS</div>
              <div className="mt-1 text-2xl font-extrabold text-rose-700">
                ${Math.round(summary.totalCogs).toLocaleString()}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                Whales drive {summary.whaleSharePct}% of total runs
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>Gross Margin Gauge</span>
              <span className="font-mono">{summary.grossMarginPct}%</span>
            </div>
            <div className="relative mt-2 h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full transition-all ${
                  summary.grossMarginPct >= 75
                    ? 'bg-emerald-500'
                    : summary.grossMarginPct >= 55
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.max(4, Math.min(100, summary.grossMarginPct))}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
              <span>0% (Margin Bleed)</span>
              <span className="font-semibold text-slate-600">75% Healthy SaaS Target</span>
              <span>100%</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
            <div className="font-bold text-slate-900">Packaging &amp; CFO Analysis</div>
            <p className="mt-1">{summary.whaleLossNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
