'use client';

import React, { useMemo, useState } from 'react';
import { FileCode2, Sparkles } from 'lucide-react';
import { CopyButton } from './CopyButton';
/* ========================================================================== */
/* 6. AI-Native PRD & Guardrail Builder                                       */
/* ========================================================================== */

export function PrdStudioLab() {
  const [featureName, setFeatureName] = useState('SpecGuard RFC Reviewer');
  const [pattern, setPattern] = useState('RAG + Structured Findings');
  const [latencySla, setLatencySla] = useState('< 12s end-to-end');
  const [cogsCeiling, setCogsCeiling] = useState('$0.06 / run');
  const [errorTolerance, setErrorTolerance] = useState('High precision (>90%) · Low false-positive noise');
  const [fallbackUx, setFallbackUx] = useState('Abstain cleanly ("No Policy Conflict Found") + 1-click Dismiss telemetry');

  const markdown = useMemo(() => {
    return `# AI-Native PRD: ${featureName}

## 1. AI Suitability & Architecture Pattern
- **Selected Pattern:** ${pattern}
- **Why AI Wins Here:** Input artifacts contain unstructured prose/edge nuances where static rules miss intent, while human verification of cited findings takes <90 seconds.

## 2. Performance & Unit Economics Budget
- **Latency SLA:** ${latencySla}
- **Unit Cost Ceiling:** ${cogsCeiling} (enforced via tiered routing + prefix caching)

## 3. Non-Deterministic UX & Trust Calibration
- **Error-Cost Profile:** ${errorTolerance}
- **Fallback & Abstention Behavior:** ${fallbackUx}
- **Implicit Telemetry Loop:** Capture Accept, Edit Diff, and Dismiss-False-Positive events into the weekly eval curation queue.

## 4. Golden Eval Release Gate (Ship / No-Ship)
- **Tier-1 Code Assertions:** Valid JSON output schema, cited policy IDs exist in retrieved ACL-filtered context, max cost ceiling respected.
- **Tier-2 Binary LLM Judges:** Faithfulness >= 97%, Policy Reasoning Accuracy >= 90% (calibrated against human SME labels).
- **Tier-3 Security Gate:** 100% pass on indirect prompt injection and tenant ACL isolation tests.`;
  }, [featureName, pattern, latencySla, cogsCeiling, errorTolerance, fallbackUx]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-teal-700 uppercase">
            <FileCode2 className="h-4 w-4" /> Lab 6 · AI Product Specification
          </div>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            AI-Native PRD & Guardrail Builder
          </h3>
        </div>
        <CopyButton text={markdown} label="Copy Markdown PRD" />
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-5">
          <div>
            <label className="text-xs font-semibold text-slate-700">Feature / Product Name</label>
            <input aria-label="Feature / Product Name"
              type="text"
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">AI Architecture Pattern</label>
            <select aria-label="AI Architecture Pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
            >
              <option>Inline Ghost-Text Copilot</option>
              <option>RAG + Structured Findings</option>
              <option>Single-Shot Extraction + Schema</option>
              <option>Deterministic Workflow + Scoped Agent</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Latency SLA</label>
              <input aria-label="Latency SLA"
                type="text"
                value={latencySla}
                onChange={(e) => setLatencySla(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">COGS Ceiling</label>
              <input aria-label="COGS Ceiling"
                type="text"
                value={cogsCeiling}
                onChange={(e) => setCogsCeiling(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Error-Cost & Quality Target</label>
            <input aria-label="Error-Cost & Quality Target"
              type="text"
              value={errorTolerance}
              onChange={(e) => setErrorTolerance(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Fallback & Abstention UX
            </label>
            <textarea aria-label="Fallback & Abstention UX"
              rows={2}
              value={fallbackUx}
              onChange={(e) => setFallbackUx(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
            />
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Live AI-Native PRD Preview</span>
            <span className="inline-flex items-center gap-1 text-teal-700">
              <Sparkles className="h-3.5 w-3.5" /> Ready for Project Workbench
            </span>
          </div>
          <pre tabIndex={0} className="max-h-80 overflow-auto rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-100">
            {markdown}
          </pre>
        </div>
      </div>
    </div>
  );
}
