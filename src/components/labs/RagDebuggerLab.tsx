'use client';

import React, { useMemo, useState } from 'react';
import { SearchCode } from 'lucide-react';
/* ========================================================================== */
/* 4. RAG Pipeline & Failure Mode Debugger                                    */
/* ========================================================================== */

export function RagDebuggerLab() {
  const [queryMode, setQueryMode] = useState<'err_code' | 'policy_addendum'>('err_code');
  const [searchMode, setSearchMode] = useState<'dense' | 'bm25' | 'hybrid'>('dense');
  const [useReranker, setUseReranker] = useState(false);
  const [structureChunking, setStructureChunking] = useState(false);
  const [groundingStrict, setGroundingStrict] = useState(true);

  const sim = useMemo(() => {
    if (queryMode === 'err_code') {
      const recallHit = searchMode === 'hybrid' || searchMode === 'bm25';
      const topRankGood = recallHit && (useReranker || searchMode === 'hybrid');
      const recallScore = searchMode === 'dense' ? 35 : searchMode === 'bm25' ? 78 : useReranker ? 96 : 86;
      const faithfulness = !topRankGood ? 25 : groundingStrict ? 97 : 68;

      const chunks =
        searchMode === 'dense'
          ? [
              { title: 'Billing FAQ · Plan Upgrades', score: 0.81, hit: false },
              { title: 'API Rate Limits Overview', score: 0.78, hit: false },
              { title: 'SDK Timeout Best Practices', score: 0.74, hit: false },
            ]
          : [
              {
                title: structureChunking
                  ? 'Runbook > EU Enterprise > ERR_4092 Quota Lock'
                  : '...4092 happens when EU tenant exceeds...',
                score: useReranker ? 0.96 : 0.84,
                hit: true,
              },
              { title: 'EU Data Residency Endpoints', score: 0.77, hit: false },
              { title: 'Billing FAQ · Plan Upgrades', score: 0.62, hit: false },
            ];

      return {
        query: '"What does error code ERR_4092 mean for EU enterprise accounts?"',
        recallScore,
        faithfulness,
        chunks,
        diagnosis: !recallHit
          ? 'Retrieval Failure (Recall@K): Dense embeddings blurred exact token `ERR_4092`.'
          : !groundingStrict
          ? 'Generation Hallucination: Chunk retrieved, but model guessed extra SLA promises.'
          : 'Healthy Grounded RAG: Hybrid BM25+Vector hit exact error table & cited safely.',
        answer: !recallHit
          ? groundingStrict
            ? 'No evidence for ERR_4092 found in retrieved docs. (Abstained safely, though Recall failed!)'
            : 'ERR_4092 usually indicates an expired billing card; try resetting your API key. [HALLUCINATED]'
          : structureChunking
          ? 'Per [Runbook > EU Enterprise > ERR_4092], EU tenants receive ERR_4092 when regional batch concurrency exceeds 250/sec. Raise via EU Workspace Settings.'
          : 'Error 4092 means EU quota exceeded. (Warning: truncated chunk lacked parent heading & resolution steps.)',
        healthy: recallHit && structureChunking && groundingStrict,
      };
    }

    // policy_addendum
    const recallHit = searchMode === 'hybrid' && structureChunking;
    const rankGood = recallHit && useReranker;
    const recallScore = searchMode === 'hybrid' ? (useReranker ? 94 : 80) : 55;
    const faithfulness = rankGood && groundingStrict ? 96 : 58;

    return {
      query: '"Can temporary contractors waive SOC2 under the 2026 addendum?"',
      recallScore,
      faithfulness,
      chunks: rankGood
        ? [
            { title: '2026 Security Addendum §3.1 · Contractor Exception', score: 0.95, hit: true },
            { title: '2024 Vendor Policy (Archived)', score: 0.61, hit: false },
            { title: 'Contractor Onboarding Checklist', score: 0.58, hit: false },
          ]
        : [
            { title: '2024 Vendor Policy (Archived)', score: 0.83, hit: false },
            { title: 'Contractor Onboarding Checklist', score: 0.79, hit: false },
            {
              title: '2026 Security Addendum §3.1 (buried at rank #14)',
              score: 0.68,
              hit: false,
            },
          ],
      diagnosis: !structureChunking
        ? 'Chunking Failure: Naive 500-char split severed the "2026 Addendum" title from its §3.1 exception clause.'
        : !useReranker || searchMode !== 'hybrid'
        ? 'Ranking Failure: Outdated 2024 policy outranked the 2026 exception without hybrid + cross-encoder reranking.'
        : 'Healthy Grounded RAG: Structure-aware breadcrumb + hybrid search + reranker surfaced §3.1 at Rank #1.',
      answer:
        rankGood && groundingStrict
          ? 'Under [2026 Security Addendum §3.1], contractors with zero PII access may waive full SOC2 ONLY with CISO sign-off for <= 45 days.'
          : 'All vendors and contractors must complete SOC2 Type II before access. [STALE / INCOMPLETE ANSWER]',
      healthy: rankGood && groundingStrict,
    };
  }, [queryMode, searchMode, useReranker, structureChunking, groundingStrict]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-indigo-700 uppercase">
          <SearchCode className="h-4 w-4" /> Lab 4 · RAG Architecture
        </div>
        <h3 className="mt-1 text-lg font-bold text-slate-900">
          RAG Pipeline & Failure Mode Debugger
        </h3>
      </div>

      {/* Live 4-Stage RAG Pipeline Flow Graphic */}
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 p-3">
        <svg viewBox="0 0 640 76" className="h-auto w-full">
          {[
            {
              x: 6,
              label: '1. Chunking',
              sub: structureChunking ? 'Header + Breadcrumb' : 'Naive 500-char split',
              ok: structureChunking,
            },
            {
              x: 168,
              label: '2. Retrieval',
              sub:
                searchMode === 'hybrid'
                  ? 'BM25 + Dense RRF'
                  : searchMode === 'bm25'
                  ? 'BM25 Only'
                  : 'Dense Vector Only',
              ok: sim.recallScore >= 78,
            },
            {
              x: 330,
              label: '3. Reranker',
              sub: useReranker ? 'Cross-Encoder Top-3' : 'Disabled (Raw Order)',
              ok: useReranker || (queryMode === 'err_code' && searchMode === 'hybrid'),
            },
            {
              x: 492,
              label: '4. Grounding',
              sub: groundingStrict ? 'Cited + Abstain' : 'Unconstrained',
              ok: sim.faithfulness >= 90,
            },
          ].map((stage, i) => {
            const stroke = stage.ok ? '#10b981' : '#f59e0b';
            return (
              <g key={stage.label}>
                <rect
                  x={stage.x}
                  y="10"
                  width="140"
                  height="56"
                  rx="10"
                  fill="#0f172a"
                  stroke={stroke}
                  strokeWidth="1.6"
                />
                <circle cx={stage.x + 14} cy="27" r="3.5" fill={stroke} />
                <text x={stage.x + 24} y="30" fill="#f8fafc" fontSize="10" fontWeight="700">
                  {stage.label}
                </text>
                <text x={stage.x + 14} y="49" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">
                  {stage.sub}
                </text>
                {i < 3 && (
                  <path
                    d={`M ${stage.x + 140} 38 L ${stage.x + 162} 38`}
                    stroke={stroke}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="animate-odin-dash"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <div>
            <div className="text-xs font-semibold text-slate-700">Test Query Scenario</div>
            <div className="mt-1.5 flex gap-2">
              <button
                type="button"
                onClick={() => setQueryMode('err_code')}
                className={`flex-1 rounded-lg border px-2.5 py-2 text-xs font-medium ${
                  queryMode === 'err_code'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Exact Code (ERR_4092)
              </button>
              <button
                type="button"
                onClick={() => setQueryMode('policy_addendum')}
                className={`flex-1 rounded-lg border px-2.5 py-2 text-xs font-medium ${
                  queryMode === 'policy_addendum'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Nuanced 2026 Addendum
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-700">Retriever Strategy</div>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {[
                { id: 'dense' as const, label: 'Dense Vector' },
                { id: 'bm25' as const, label: 'BM25 Keyword' },
                { id: 'hybrid' as const, label: 'Hybrid + RRF' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSearchMode(m.id)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium ${
                    searchMode === m.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {[
              {
                label: 'Cross-Encoder Reranker (Top-40 -> Top-3)',
                val: useReranker,
                set: setUseReranker,
              },
              {
                label: 'Structure-Aware Chunking + Breadcrumb Header',
                val: structureChunking,
                set: setStructureChunking,
              },
              {
                label: 'Strict Grounding & Abstention Prompt',
                val: groundingStrict,
                set: setGroundingStrict,
              },
            ].map((tog) => (
              <label
                key={tog.label}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={tog.val}
                  onChange={(e) => tog.set(e.target.checked)}
                  className="h-4 w-4 accent-indigo-600"
                />
                {tog.label}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
            <span className="font-semibold text-slate-500">Query: </span>
            <span className="font-mono text-slate-900">{sim.query}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] font-medium text-slate-500">Retrieval Recall@5</div>
              <div className="mt-0.5 font-mono text-xl font-bold text-slate-900">
                {sim.recallScore}%
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] font-medium text-slate-500">Answer Faithfulness</div>
              <div className="mt-0.5 font-mono text-xl font-bold text-slate-900">
                {sim.faithfulness}%
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-700">Top-3 Chunks Passed to LLM</div>
            {sim.chunks.map((c, idx) => (
              <div
                key={c.title}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                  c.hit
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <span>
                  #{idx + 1} · {c.title}
                </span>
                <span className="font-mono font-semibold">{c.score.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-900 p-3.5 text-xs text-slate-100">
            <div className="font-semibold text-amber-300">Generated Output</div>
            <p className="mt-1 leading-relaxed">{sim.answer}</p>
          </div>

          <div
            className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold ${
              sim.healthy ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'
            }`}
          >
            Diagnosis: {sim.diagnosis}
          </div>
        </div>
      </div>
    </div>
  );
}
