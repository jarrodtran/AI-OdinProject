'use client';

import React, { useMemo, useState } from 'react';
import { GitBranch } from 'lucide-react';
/* ========================================================================== */
/* 5. Agent Reliability & Compounding Error Calculator                        */
/* ========================================================================== */

export function AgentReliabilityLab() {
  const [steps, setSteps] = useState(10);
  const [stepAccuracyPct, setStepAccuracyPct] = useState(94);
  const [checkpoints, setCheckpoints] = useState<'none' | 'checkpoint_retry' | 'state_machine'>(
    'checkpoint_retry'
  );
  const [hitlGuard, setHitlGuard] = useState(true);

  const math = useMemo(() => {
    const p = stepAccuracyPct / 100;
    const naiveSuccess = Math.pow(p, steps) * 100;

    // With verification checkpoints every 3 steps + 1 deterministic retry:
    // Retry gives effective step reliability p_eff = 1 - (1 - p)^2 for recoverable steps
    const recoverableP = 1 - Math.pow(1 - p, 2);
    const checkpointSuccess =
      checkpoints === 'none'
        ? naiveSuccess
        : checkpoints === 'checkpoint_retry'
        ? Math.pow(recoverableP, steps) * 100
        : Math.pow(1 - Math.pow(1 - p, 2.4), Math.max(2, Math.ceil(steps * 0.55))) * 100;

    const cleanCompletionOrSafeEsc = hitlGuard
      ? Math.min(99.5, checkpointSuccess + (100 - checkpointSuccess) * 0.72)
      : checkpointSuccess;

    const silentFailureRisk = hitlGuard
      ? Math.max(0.5, 100 - cleanCompletionOrSafeEsc)
      : 100 - checkpointSuccess;

    // Curve data across N=1..20 steps for SVG chart
    const curvePoints = Array.from({ length: 20 }, (_, i) => {
      const n = i + 1;
      const naiveY = Math.pow(p, n) * 100;
      const archY =
        checkpoints === 'none'
          ? naiveY
          : checkpoints === 'checkpoint_retry'
          ? Math.pow(recoverableP, n) * 100
          : Math.pow(1 - Math.pow(1 - p, 2.4), Math.max(1, Math.ceil(n * 0.55))) * 100;
      const safeY = hitlGuard ? Math.min(99.5, archY + (100 - archY) * 0.72) : archY;
      return { n, naiveY, archY, safeY };
    });

    return {
      naiveSuccess,
      checkpointSuccess,
      cleanCompletionOrSafeEsc,
      silentFailureRisk,
      curvePoints,
    };
  }, [steps, stepAccuracyPct, checkpoints, hitlGuard]);

  const toChartPoints = (key: 'naiveY' | 'archY' | 'safeY') =>
    math.curvePoints
      .map((pt) => {
        const x = 32 + ((pt.n - 1) / 19) * 326;
        const y = 122 - (pt[key] / 100) * 102;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

  const currentStepX = 32 + ((steps - 1) / 19) * 326;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-indigo-700 uppercase">
          <GitBranch className="h-4 w-4" /> Lab 5 · Agentic Reliability
        </div>
        <h3 className="mt-1 text-lg font-bold text-slate-900">
          Compounding Error Law & Verification Architecture Simulator
        </h3>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-6">
          <div>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">Sequential Agent Steps (N)</span>
              <span className="font-mono font-bold text-slate-900">{steps} steps</span>
            </div>
            <input aria-label="Sequential Agent Steps (N)"
              type="range"
              min={2}
              max={20}
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              className="mt-1.5 w-full accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">Per-Step Tool / Decision Accuracy</span>
              <span className="font-mono font-bold text-slate-900">{stepAccuracyPct}%</span>
            </div>
            <input aria-label="Per-Step Tool / Decision Accuracy"
              type="range"
              min={80}
              max={99}
              value={stepAccuracyPct}
              onChange={(e) => setStepAccuracyPct(Number(e.target.value))}
              className="mt-1.5 w-full accent-indigo-600"
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-700">Orchestration Architecture</div>
            <div className="mt-1.5 space-y-2">
              {[
                {
                  id: 'none' as const,
                  title: 'Open-Loop Autonomous Agent',
                  desc: 'No intermediate verification or retry budget (P = p^N)',
                },
                {
                  id: 'checkpoint_retry' as const,
                  title: 'Checkpoints + Informative Error Retries',
                  desc: 'Validates schema/invariants every 2–3 steps & allows self-correction',
                },
                {
                  id: 'state_machine' as const,
                  title: 'Deterministic Workflow + Scoped Sub-Agents',
                  desc: 'Collapses predictable transitions into deterministic code',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCheckpoints(opt.id)}
                  className={`w-full rounded-xl border p-3 text-left text-xs transition ${
                    checkpoints === opt.id
                      ? 'border-indigo-600 bg-indigo-50/70'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-slate-900">{opt.title}</div>
                  <div className="text-[11px] text-slate-600">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800">
            <input
              type="checkbox"
              checked={hitlGuard}
              onChange={(e) => setHitlGuard(e.target.checked)}
              className="h-4 w-4 accent-indigo-600"
            />
            Enforce HITL Approval + Idempotency Keys on External Write Tools
          </label>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Naive Open-Loop Baseline (p^N)</span>
                <span className="font-mono font-bold text-slate-900">
                  {math.naiveSuccess.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all"
                  style={{ width: `${Math.max(3, math.naiveSuccess)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Autonomous Success (With Chosen Architecture)</span>
                <span className="font-mono font-bold text-indigo-700">
                  {math.checkpointSuccess.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${Math.max(3, math.checkpointSuccess)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Safe Outcome Rate (Completed OR Clean HITL Escalation)</span>
                <span className="font-mono font-bold text-emerald-700">
                  {math.cleanCompletionOrSafeEsc.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.max(3, math.cleanCompletionOrSafeEsc)}%` }}
                />
              </div>
            </div>
          </div>

          {/* SVG Step-Decay Curve Chart (Steps 1..20) */}
          <div className="rounded-xl border border-slate-200 bg-slate-950 p-3 text-slate-100">
            <div className="mb-1 flex items-center justify-between text-[10px] font-semibold">
              <span className="text-slate-300">Compounding Reliability Curve (N=1..20)</span>
              <span className="font-mono text-amber-300">Current: N={steps}</span>
            </div>
            <svg viewBox="0 0 380 142" className="h-auto w-full">
              {/* Horizontal Guide Lines */}
              {[0, 50, 100].map((val) => {
                const y = 122 - (val / 100) * 102;
                return (
                  <g key={val}>
                    <line x1="32" y1={y} x2="358" y2={y} stroke="#1e293b" strokeWidth="1" />
                    <text x="6" y={y + 3} fill="#64748b" fontSize="8" fontFamily="monospace">
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Vertical Marker for Current Step Count */}
              <line
                x1={currentStepX}
                y1="16"
                x2={currentStepX}
                y2="124"
                stroke="#fbbf24"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />

              {/* Naive p^N Decay Curve */}
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                points={toChartPoints('naiveY')}
              />
              {/* Selected Architecture Curve */}
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.2"
                points={toChartPoints('archY')}
              />
              {/* Safe HITL Curve */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4 3"
                points={toChartPoints('safeY')}
              />

              <text x="32" y="136" fill="#64748b" fontSize="8" fontFamily="monospace">
                1 step
              </text>
              <text x="180" y="136" fill="#64748b" fontSize="8" fontFamily="monospace">
                10 steps
              </text>
              <text x="328" y="136" fill="#64748b" fontSize="8" fontFamily="monospace">
                20 steps
              </text>
            </svg>
            <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-slate-300">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Naive p^N
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-indigo-500" /> Architecture
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Safe w/ HITL
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs">
            <div className="font-bold text-slate-900">
              Uncontrolled Blast-Radius Risk: {math.silentFailureRisk.toFixed(1)}%
            </div>
            <p className="mt-1 text-slate-600">
              {math.silentFailureRisk > 15
                ? 'High production risk! Shorten autonomous step depth by moving deterministic steps into code and enabling verification checkpoints + HITL gates.'
                : 'Production-ready reliability profile: most runs succeed autonomously while edge cases escalate cleanly without corrupting state.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
