'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookMarked,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Copy,
  Download,
  FileText,
  Layers,
  MessageSquareQuote,
  Search,
  Sparkles,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  AI_PM_GLOSSARY,
  DECISION_FRAMEWORKS,
  GlossaryCategory,
  INTERVIEW_QUESTIONS,
  InterviewCategory,
  PLAYBOOK_TEMPLATES,
  PRODUCT_TEARDOWNS,
  ProductTeardown,
} from '@/data/playbookData';

type PlaybookTab = 'templates' | 'frameworks' | 'teardowns' | 'interviews' | 'glossary';

const TEARDOWN_CATEGORIES: ('All' | ProductTeardown['category'])[] = [
  'All',
  'Coding & DevTools',
  'Answer & Research Engine',
  'Knowledge Synthesis',
  'Customer Operations',
  'Workflow Automation',
  'Vertical Enterprise AI',
];

const INTERVIEW_CATEGORIES: ('All' | InterviewCategory)[] = [
  'All',
  'Product Sense & AI UX',
  'Technical Architecture (RAG, Evals & Agents)',
  'Metrics, Experimentation & Execution',
  'Strategy, Moats & Pricing',
];

const GLOSSARY_CATEGORIES: ('All' | GlossaryCategory)[] = [
  'All',
  'LLM Mechanics',
  'Economics & Latency',
  'Evals & Quality',
  'RAG & Context',
  'Agents & Safety',
  'Strategy & Governance',
];

export default function PlaybookPage() {
  const [activeTab, setActiveTab] = useState<PlaybookTab>('templates');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(PLAYBOOK_TEMPLATES[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Interview filters & accordion
  const [interviewCategory, setInterviewCategory] = useState<'All' | InterviewCategory>('All');
  const [openBlueprints, setOpenBlueprints] = useState<Record<string, boolean>>({});

  // Teardowns filter
  const [teardownCategory, setTeardownCategory] = useState<'All' | ProductTeardown['category']>('All');

  // Glossary filters
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState<'All' | GlossaryCategory>('All');

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;
      if (
        hash === 'templates' ||
        hash === 'frameworks' ||
        hash === 'teardowns' ||
        hash === 'interviews' ||
        hash === 'glossary'
      ) {
        setActiveTab(hash);
      } else if (PLAYBOOK_TEMPLATES.some((t) => t.id === hash)) {
        setActiveTab('templates');
        setSelectedTemplateId(hash);
      } else if (PRODUCT_TEARDOWNS.some((t) => t.id === hash)) {
        setActiveTab('teardowns');
      } else if (hash.startsWith('glossary-')) {
        setActiveTab('glossary');
      }
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  const selectedTemplate =
    PLAYBOOK_TEMPLATES.find((t) => t.id === selectedTemplateId) ?? PLAYBOOK_TEMPLATES[0];

  const filteredTeardowns = useMemo(() => {
    if (teardownCategory === 'All') return PRODUCT_TEARDOWNS;
    return PRODUCT_TEARDOWNS.filter((t) => t.category === teardownCategory);
  }, [teardownCategory]);

  const filteredInterviews = useMemo(() => {
    if (interviewCategory === 'All') return INTERVIEW_QUESTIONS;
    return INTERVIEW_QUESTIONS.filter((q) => q.category === interviewCategory);
  }, [interviewCategory]);

  const filteredGlossary = useMemo(() => {
    const q = glossaryQuery.trim().toLowerCase();
    return AI_PM_GLOSSARY.filter((entry) => {
      const catOk = glossaryCategory === 'All' || entry.category === glossaryCategory;
      const textOk =
        !q ||
        entry.term.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q) ||
        entry.pmImplication.toLowerCase().includes(q);
      return catOk && textOk;
    });
  }, [glossaryQuery, glossaryCategory]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleDownloadTemplate = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              <BookMarked className="h-3.5 w-3.5" /> AI PM Field Manual &amp; Career Playbook
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Templates, Teardowns, Matrices, Interviews &amp; Glossary
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Your permanent Staff AI PM desk reference: {PLAYBOOK_TEMPLATES.length} copy-ready
              specification templates, {DECISION_FRAMEWORKS.length} cheat-sheet matrices,{' '}
              {PRODUCT_TEARDOWNS.length} deep AI product teardowns, {INTERVIEW_QUESTIONS.length}{' '}
              L5/L6/Staff interview blueprints, and {AI_PM_GLOSSARY.length} essential technical terms
              translated into PM decisions.
            </p>
          </div>
          <Link
            href="/labs"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100"
          >
            Open Interactive Labs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 5 Section Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
          {[
            {
              id: 'templates' as const,
              label: `Templates Vault (${PLAYBOOK_TEMPLATES.length})`,
              icon: FileText,
            },
            {
              id: 'frameworks' as const,
              label: `Decision Matrices (${DECISION_FRAMEWORKS.length})`,
              icon: Layers,
            },
            {
              id: 'teardowns' as const,
              label: `Product Teardowns (${PRODUCT_TEARDOWNS.length})`,
              icon: Sparkles,
            },
            {
              id: 'interviews' as const,
              label: `Interview Prep Bank (${INTERVIEW_QUESTIONS.length})`,
              icon: MessageSquareQuote,
            },
            {
              id: 'glossary' as const,
              label: `AI PM Glossary (${AI_PM_GLOSSARY.length})`,
              icon: Compass,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Templates Vault */}
      {activeTab === 'templates' && (
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="space-y-2.5 lg:col-span-4">
            <div className="px-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
              Select a Production Template
            </div>
            {PLAYBOOK_TEMPLATES.map((tpl) => {
              const active = tpl.id === selectedTemplate.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    active
                      ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-200'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                      {tpl.category}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-bold text-slate-900">{tpl.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{tpl.description}</p>
                </button>
              );
            })}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-8">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-start">
              <div>
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                  {selectedTemplate.category}
                </span>
                <h2 className="mt-2 text-xl font-extrabold text-slate-900">
                  {selectedTemplate.title}
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  <strong>When to use:</strong> {selectedTemplate.whenToUse}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(selectedTemplate.id, selectedTemplate.markdown)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {copiedId === selectedTemplate.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedId === selectedTemplate.id ? 'Copied!' : 'Copy Markdown'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadTemplate(`${selectedTemplate.id}.md`, selectedTemplate.markdown)
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700"
                >
                  <Download className="h-3.5 w-3.5" /> Export .md
                </button>
              </div>
            </div>

            <pre className="mt-5 max-h-[650px] overflow-auto rounded-2xl bg-slate-950 p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-100">
              {selectedTemplate.markdown}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Decision Matrices & Cheat Sheets */}
      {activeTab === 'frameworks' && (
        <div className="mt-8 space-y-8">
          {DECISION_FRAMEWORKS.map((fw) => (
            <section
              key={fw.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{fw.title}</h2>
              <p className="mt-1.5 text-sm text-slate-600">{fw.subtitle}</p>

              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-800">
                    <tr>
                      {fw.headers.map((h) => (
                        <th key={h} className="px-4 py-3 font-bold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {fw.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`px-4 py-3 align-top leading-relaxed ${
                              cIdx === 0 ? 'font-bold text-slate-900' : 'text-slate-600'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-950 sm:text-sm">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div>
                  <strong>Staff PM Rule of Thumb: </strong>
                  {fw.takeaway}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Tab 3: Product Teardowns Vault */}
      {activeTab === 'teardowns' && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {TEARDOWN_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setTeardownCategory(cat)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  teardownCategory === cat
                    ? 'bg-amber-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {filteredTeardowns.map((td) => {
              const mdSummary = `# AI Product Teardown: ${td.product} (${td.company})
Category: ${td.category}
Headline: ${td.headline}

- Core Wedge: ${td.coreWedge}
- UX Signature: ${td.uxSignature}
- Architecture Stack: ${td.architectureStack}
- Moat & Flywheel: ${td.moatAndFlywheel}
- Pricing & Margins: ${td.pricingAndMargins}
- Failure Mitigation: ${td.failureModeMitigation}
- Steal This Pattern: ${td.stealThisPattern}`;

              return (
                <article
                  key={td.id}
                  id={td.id}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-[11px] font-bold text-amber-800">
                        {td.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(td.id, mdSummary)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        {copiedId === td.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copiedId === td.id ? 'Copied' : 'Copy Notes'}
                      </button>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <h2 className="text-xl font-extrabold text-slate-900">{td.product}</h2>
                      <span className="text-xs font-semibold text-slate-400">· {td.company}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-700">
                      {td.headline}
                    </p>

                    <div className="mt-4 space-y-2.5 text-xs leading-relaxed text-slate-600">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="font-bold text-slate-900">Workflow Wedge: </span>
                        {td.coreWedge}
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="font-bold text-slate-900">Non-Chat UX Signature: </span>
                        {td.uxSignature}
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="font-bold text-slate-900">Architecture &amp; Stack: </span>
                        {td.architectureStack}
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="font-bold text-slate-900">Moat &amp; Pricing: </span>
                        {td.moatAndFlywheel} <strong>Economics:</strong> {td.pricingAndMargins}
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="font-bold text-slate-900">Failure Mitigation: </span>
                        {td.failureModeMitigation}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-xs leading-relaxed text-indigo-950">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-800 uppercase text-[11px]">
                      <Sparkles className="h-3.5 w-3.5" /> Steal This Pattern for Your Product
                    </div>
                    <p className="mt-1 font-medium">{td.stealThisPattern}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Interview Prep Bank */}
      {activeTab === 'interviews' && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {INTERVIEW_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setInterviewCategory(cat)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  interviewCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-5">
            {filteredInterviews.map((iq) => {
              const isOpen = Boolean(openBlueprints[iq.id]);
              return (
                <article
                  key={iq.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-0.5 text-[11px] font-bold text-indigo-800">
                      {iq.category}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
                      {iq.difficulty}
                    </span>
                  </div>

                  <h2 className="mt-3 text-lg font-extrabold text-slate-900 sm:text-xl">
                    {iq.question}
                  </h2>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-700">
                      <div className="font-bold text-slate-900 uppercase text-[11px]">
                        What Interviewers Look For
                      </div>
                      <p className="mt-1">{iq.whatInterviewersLookFor}</p>
                    </div>
                    <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 text-xs leading-relaxed text-rose-950">
                      <div className="flex items-center gap-1 font-bold uppercase text-[11px] text-rose-800">
                        <AlertTriangle className="h-3.5 w-3.5" /> Common Candidate Trap
                      </div>
                      <p className="mt-1">{iq.commonTrap}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenBlueprints((prev) => ({ ...prev, [iq.id]: !prev[iq.id] }))
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                    >
                      {isOpen ? (
                        <>
                          <ChevronUp className="h-4 w-4" /> Hide 4-Step Staff Answer Blueprint
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" /> Reveal 4-Step Staff Answer Blueprint
                        </>
                      )}
                    </button>

                    {isOpen && (
                      <ol className="animate-odin-fade-up mt-3 list-decimal space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 pl-9 text-xs leading-relaxed text-slate-800 sm:text-sm">
                        {iq.staffAnswerBlueprint.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: AI PM Glossary */}
      {activeTab === 'glossary' && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={glossaryQuery}
                  onChange={(e) => setGlossaryQuery(e.target.value)}
                  placeholder="Filter AI PM terms (e.g. TTFT, Reranker, Idempotency, ZDR, Context Rot)..."
                  className="w-full rounded-xl border border-slate-200 py-2 pr-3 pl-9 text-xs text-slate-900 outline-none focus:border-amber-500 sm:text-sm"
                />
              </div>
              <span className="font-mono text-xs font-semibold text-slate-500">
                Showing {filteredGlossary.length} of {AI_PM_GLOSSARY.length} terms
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {GLOSSARY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setGlossaryCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                    glossaryCategory === cat
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredGlossary.map((entry) => (
              <div
                key={entry.term}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                      {entry.category}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-extrabold text-slate-900">{entry.term}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {entry.definition}
                  </p>
                </div>

                <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 text-xs leading-relaxed text-amber-950">
                  <strong className="text-amber-800">Why it matters to an AI PM: </strong>
                  {entry.pmImplication}
                </div>
              </div>
            ))}
          </div>

          {filteredGlossary.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              No glossary terms match &ldquo;{glossaryQuery}&rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
