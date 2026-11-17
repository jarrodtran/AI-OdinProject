'use client';

import React, { useMemo, useState } from 'react';
import { ShieldAlert, Activity } from 'lucide-react';
/* ========================================================================== */
/* 8. Production AI Incident & Interview War-Room Simulator                   */
/* ========================================================================== */

interface IncidentScenario {
  id: string;
  title: string;
  severity: 'SEV-1' | 'SEV-2';
  alertSummary: string;
  traceSnippet: string;
  containmentOptions: { label: string; correct: boolean }[];
  rootCauseOptions: { label: string; correct: boolean }[];
  longTermOptions: { label: string; correct: boolean }[];
  debrief: string;
}

const INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: 'alias-drift',
    title: 'Case 1: 02:15 UTC JSON Schema Breakage (Zero Deploys)',
    severity: 'SEV-1',
    alertSummary:
      'JSON parse failures on your Invoice Triage Copilot jumped from 0.2% to 13.8% overnight despite zero internal code merges.',
    traceSnippet:
      'model_param: "balanced-latest" | output_preview: "Here is your extracted JSON:\\n```json\\n{...}" | parser_err: Unexpected token `',
    containmentOptions: [
      { label: 'Pin production config flag immediately to last known good dated snapshot (`-2026-02-15`) or fallback model.', correct: true },
      { label: 'Spend 3 hours manually regex-patching markdown fences in the frontend UI.', correct: false },
      { label: 'Wait until morning standup to see if users complain.', correct: false },
    ],
    rootCauseOptions: [
      { label: 'Production called a floating `-latest` provider alias whose weights/formatting updated overnight.', correct: true },
      { label: 'KV prefix cache expired after 10 minutes.', correct: false },
      { label: 'User browsers blocked JSON responses.', correct: false },
    ],
    longTermOptions: [
      { label: 'Ban floating `-latest` aliases in prod, enforce Structured Outputs decoding, and gate snapshot upgrades through CI Golden Evals.', correct: true },
      { label: 'Turn temperature up to 1.0.', correct: false },
      { label: 'Ask users to paste cleaner invoices.', correct: false },
    ],
    debrief:
      'Floating `-latest` aliases are silent production time-bombs. Pin immutable dated model snapshots and promote new snapshots only after passing Tier-1 schema & Golden Eval gates.',
  },
  {
    id: 'cache-acl-leak',
    title: 'Case 2: Semantic Cache Cross-Tenant Executive Leak',
    severity: 'SEV-1',
    alertSummary:
      'A junior support specialist asked "What is our Q3 restructuring plan?" and received confidential CFO board figures in 22ms.',
    traceSnippet:
      'cache_hit: true (cosine=0.971) | cache_key: "emb_v3_849201" | rag_acl_check: SKIPPED_ON_CACHE_HIT | origin_user: cfo@acme.com',
    containmentOptions: [
      { label: 'Purge the semantic cache and disable semantic caching globally via feature flag immediately.', correct: true },
      { label: 'Add "Do not leak CFO files" to the system prompt.', correct: false },
      { label: 'Lower the cosine similarity threshold from 0.96 to 0.80.', correct: false },
    ],
    rootCauseOptions: [
      { label: 'Semantic cache keys hashed only the query embedding without `tenant_id`, `acl_group_ids`, or `kb_version`.', correct: true },
      { label: 'BM25 search weighted keywords too strongly.', correct: false },
      { label: 'The model memorized confidential CFO slides during pretraining.', correct: false },
    ],
    longTermOptions: [
      { label: 'Partition semantic cache strictly by `(tenant_id, sorted_acl_scope, kb_version)`, exclude private queries from cache, and add ACL leak tests to CI.', correct: true },
      { label: 'Replace Redis with local browser cookies.', correct: false },
      { label: 'Disable streaming tokens.', correct: false },
    ],
    debrief:
      'Semantic caches bypass retrieval ACL checks by design! Never store or serve cached completions unless the cache key strictly partitions by tenant, user permission group, and KB version.',
  },
  {
    id: 'stale-rag-sync',
    title: 'Case 3: Stale 2024 Policy Cited After Nightly Sync',
    severity: 'SEV-2',
    alertSummary:
      'EU customers report OpsCopilot is quoting obsolete 2024 refund limits, and Recall@8 dropped from 92% to 48% after 03:00 UTC.',
    traceSnippet:
      'ingestion_job: partial_fail (412/4200 docs indexed) | active_index_docs: 412 (was 4,200) | top_hit: "2024_Policy_Archive.md"',
    containmentOptions: [
      { label: 'Point search alias immediately back to yesterday’s Blue/Green healthy index snapshot.', correct: true },
      { label: 'Increase LLM output max_tokens from 400 to 2,000.', correct: false },
      { label: 'Switch all customers to a larger reasoning model.', correct: false },
    ],
    rootCauseOptions: [
      { label: 'A crashed nightly ingestion script atomically overwrote the live search collection with only 10% of documents.', correct: true },
      { label: 'Structured JSON outputs broke markdown rendering.', correct: false },
      { label: 'Temperature drifted upward.', correct: false },
    ],
    longTermOptions: [
      { label: 'Implement Blue/Green index swaps gated by minimum document-count invariants + a 30-query canary Recall@8 gate before promoting.', correct: true },
      { label: 'Stop updating the knowledge base permanently.', correct: false },
      { label: 'Fine-tune the model weights every night.', correct: false },
    ],
    debrief:
      'Most "AI outages" are plain data-pipeline bugs. Blue/Green vector index promotion with doc-count and canary Recall@8 gates prevents partial syncs from ever hitting users.',
  },
  {
    id: 'runaway-agent-loop',
    title: 'Case 4: Runaway Agent Tool Retry Burn (5x Hourly COGS)',
    severity: 'SEV-1',
    alertSummary:
      'Hourly inference spend jumped 4.8x and 90 NetSuite vendor drafts were duplicated inside one enterprise account.',
    traceSnippet:
      'steps_executed: 47 | tool: "create_draft_po" | resp: "503 Gateway Timeout" | retry_count: 34 | idempotency_key: null',
    containmentOptions: [
      { label: 'Pause the enterprise async agent queue and enforce an immediate `max_steps = 8` circuit breaker via config.', correct: true },
      { label: 'Email the customer asking them to stop using the product.', correct: false },
      { label: 'Double the account’s monthly seat price.', correct: false },
    ],
    rootCauseOptions: [
      { label: 'Missing step/cost circuit breakers + missing idempotency keys caused repeated blind retries on 503 tool timeouts.', correct: true },
      { label: 'Cross-encoder reranker ran too accurately.', correct: false },
      { label: 'VAD silence threshold was too short.', correct: false },
    ],
    longTermOptions: [
      { label: 'Mandate `idempotency_key` on all write tools, hard `max_steps` / `max_trace_cost` circuit breakers, and informative retry limits.', correct: true },
      { label: 'Remove all error handling from MCP tools.', correct: false },
      { label: 'Switch to pure chat UI with no tools.', correct: false },
    ],
    debrief:
      'Autonomous loops without step budgets, cost caps, and idempotency keys turn transient downstream 503 timeouts into expensive duplicate-mutation storms.',
  },
];

export function IncidentTriageLab() {
  const [scenarioId, setScenarioId] = useState<string>(INCIDENT_SCENARIOS[0].id);
  const [containmentIdx, setContainmentIdx] = useState<number | null>(null);
  const [rootCauseIdx, setRootCauseIdx] = useState<number | null>(null);
  const [longTermIdx, setLongTermIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const scenario = INCIDENT_SCENARIOS.find((s) => s.id === scenarioId) ?? INCIDENT_SCENARIOS[0];

  const handleSelectScenario = (id: string) => {
    setScenarioId(id);
    setContainmentIdx(null);
    setRootCauseIdx(null);
    setLongTermIdx(null);
    setSubmitted(false);
  };

  const score = useMemo(() => {
    let s = 0;
    if (containmentIdx !== null && scenario.containmentOptions[containmentIdx]?.correct) s += 1;
    if (rootCauseIdx !== null && scenario.rootCauseOptions[rootCauseIdx]?.correct) s += 1;
    if (longTermIdx !== null && scenario.longTermOptions[longTermIdx]?.correct) s += 1;
    return s;
  }, [containmentIdx, rootCauseIdx, longTermIdx, scenario]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-rose-700 uppercase">
          <ShieldAlert className="h-4 w-4" /> Lab 8 · Staff AI PM War-Room
        </div>
        <h3 className="mt-1 text-lg font-bold text-slate-900">
          Production AI Incident &amp; Interview War-Room Simulator
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          Inspect live telemetry traces across 4 classic AI outages and lock in Containment, Root Cause,
          and Permanent Guardrails.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {INCIDENT_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => handleSelectScenario(sc.id)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                sc.id === scenarioId
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span
                className={`mr-1.5 font-mono text-[10px] ${sc.id === scenarioId ? 'text-rose-300' : 'text-rose-700'}`}
              >
                {sc.severity}
              </span>
              {sc.title.replace(/^Case \d+: /, '')}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-950">
            <div className="flex items-center gap-1.5 font-bold uppercase">
              <Activity className="h-4 w-4 text-rose-600" /> {scenario.severity} Telemetry Alert
            </div>
            <p className="mt-1.5 leading-relaxed">{scenario.alertSummary}</p>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold text-slate-600">Sample Production Trace</div>
            <pre tabIndex={0} className="overflow-x-auto rounded-xl bg-slate-900 p-3.5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-amber-200">
              {scenario.traceSnippet}
            </pre>
          </div>

          {submitted && (
            <div
              className={`rounded-xl border p-4 text-xs ${
                score === 3
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                  : 'border-amber-200 bg-amber-50 text-amber-950'
              }`}
            >
              <div className="font-extrabold">
                War-Room Score: {score}/3 {score === 3 ? '· Staff AI PM Cleared!' : '· Review Debrief'}
              </div>
              <p className="mt-1.5 leading-relaxed">{scenario.debrief}</p>
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-span-7">
          {[
            {
              title: '1. Minute 0–10 Immediate Containment',
              options: scenario.containmentOptions,
              chosen: containmentIdx,
              setChosen: setContainmentIdx,
            },
            {
              title: '2. Root-Cause Layer Diagnosis',
              options: scenario.rootCauseOptions,
              chosen: rootCauseIdx,
              setChosen: setRootCauseIdx,
            },
            {
              title: '3. Permanent Architectural & CI Guardrail',
              options: scenario.longTermOptions,
              chosen: longTermIdx,
              setChosen: setLongTermIdx,
            },
          ].map((step) => (
            <div key={step.title} className="rounded-xl border border-slate-200 p-3.5">
              <div className="text-xs font-bold text-slate-900">{step.title}</div>
              <div className="mt-2 space-y-1.5">
                {step.options.map((opt, idx) => {
                  const isChosen = step.chosen === idx;
                  let cls = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
                  if (submitted) {
                    if (opt.correct) cls = 'border-emerald-300 bg-emerald-50 font-semibold text-emerald-950';
                    else if (isChosen && !opt.correct) cls = 'border-rose-300 bg-rose-50 text-rose-950';
                  } else if (isChosen) {
                    cls = 'border-amber-500 bg-amber-50 font-semibold text-slate-900';
                  }
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        step.setChosen(idx);
                        if (submitted) setSubmitted(false);
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition ${cls}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={containmentIdx === null || rootCauseIdx === null || longTermIdx === null}
              onClick={() => setSubmitted(true)}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Evaluate War-Room Call
            </button>
            {submitted && (
              <span className="font-mono text-xs font-bold text-slate-700">Score: {score} / 3</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
