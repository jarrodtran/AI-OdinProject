'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  FlaskConical,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Sparkles,
  BookMarked,
  Target,
  Rocket,
  Cpu,
  MessageSquareQuote,
} from 'lucide-react';
import {
  COURSES,
  LEARNING_PATHS,
  LESSONS,
  LAB_CATALOG,
  getLessonsForPath,
  getLessonBySlug,
} from '@/data/curriculum';
import {
  AI_PM_GLOSSARY,
  DECISION_FRAMEWORKS,
  INTERVIEW_QUESTIONS,
  PLAYBOOK_TEMPLATES,
  PRODUCT_TEARDOWNS,
} from '@/data/playbookData';
import { useProgress } from '@/context/ProgressContext';
import {
  OdinHeroIllustration,
  PathCrestIcon,
  HowItWorksScene,
  InteractiveSkillTreeMap,
} from '@/components/Graphics';

type RoleDiagnosticId = 'new-ai-pm' | 'strategy-founder' | 'tech-platform' | 'interview-prep';

const ROLE_DIAGNOSTICS: Record<
  RoleDiagnosticId,
  {
    label: string;
    trackLabel: string;
    trackHref: string;
    headline: string;
    summary: string;
    labHref: string;
    labLabel: string;
    recommendedModules: { slug: string; title: string; badge: string }[];
  }
> = {
  'new-ai-pm': {
    label: 'PM Transitioning Into AI',
    trackLabel: 'Start Foundations Path',
    trackHref: '/paths/foundations',
    headline: 'Master mental models, unit economics, and AI-native PRDs first.',
    summary:
      'Build fluency in why next-token probability breaks classic deterministic specs, model TTFT/TPOT latency & KV caching math, and ship your first 3 portfolio memos.',
    labHref: '/labs#token-economics',
    labLabel: 'Launch Token Economics Lab',
    recommendedModules: [
      { slug: 'foundations-llm-mental-models', title: 'How LLMs Actually Generate Text & Fail', badge: 'Module 1' },
      { slug: 'foundations-context-economics', title: 'Context Windows, Token Economics & Latency Budgets', badge: 'Lab Included' },
      { slug: 'foundations-reasoning-models-test-time-compute', title: 'Reasoning Models, Test-Time Compute & Cascade Routing', badge: 'New Module' },
    ],
  },
  'strategy-founder': {
    label: 'Senior PM / Founder Scaling AI',
    trackLabel: 'Explore AI Strategy & Growth',
    trackHref: '/paths/ai-product-strategy',
    headline: 'Build non-wrapper context moats, margin-safe pricing, and canary launches.',
    summary:
      'Dissect Cursor, Perplexity, NotebookLM & Sierra teardowns, stress-test flat vs. hybrid credit margins against power-user whales, and design tenant-clustered launches.',
    labHref: '/labs#pricing-packaging',
    labLabel: 'Launch Pricing Stress-Tester',
    recommendedModules: [
      { slug: 'strategy-data-flywheels', title: 'Why Thin Wrappers Die: Proprietary Data Flywheels', badge: 'Core Strategy' },
      { slug: 'strategy-ai-product-teardowns', title: 'AI-Native Product Teardowns: Cursor, Perplexity & Sierra', badge: 'Case Studies' },
      { slug: 'strategy-ai-pricing-models', title: 'Seat-Based vs. Usage-Based vs. Outcome Pricing', badge: 'Margin Lab' },
    ],
  },
  'tech-platform': {
    label: 'Technical / Platform AI PM',
    trackLabel: 'Explore Technical AI PM Track',
    trackHref: '/paths/technical-ai-pm',
    headline: 'Lead ML & backend engineering on Evals, Hybrid RAG, Multi-Agent & Red-Teaming.',
    summary:
      'Replace subjective vibe checks with calibrated binary LLM judges, debug Recall@K vs. Faithfulness, isolate agent handoffs, and neutralize indirect prompt injection.',
    labHref: '/labs#eval-studio',
    labLabel: 'Launch Eval Release Studio',
    recommendedModules: [
      { slug: 'tech-evals-driven-development', title: 'Evals-Driven Development & Calibrated LLM Judges', badge: 'Eval Lab' },
      { slug: 'tech-rag-architecture', title: 'Hybrid RAG, Contextual Retrieval & Reranking', badge: 'RAG Lab' },
      { slug: 'tech-multi-agent-orchestration-topologies', title: 'Multi-Agent Orchestration & Handoff State Graphs', badge: 'New Module' },
    ],
  },
  'interview-prep': {
    label: 'Prepping for L5/L6/Staff Interviews',
    trackLabel: 'Open Field Manual & Playbook',
    trackHref: '/playbook#interviews',
    headline: 'Drill Staff system design, product teardowns, and live war-room incidents.',
    summary:
      'Practice 16 structured Staff interview blueprints, 6 real-world product teardowns, copy-ready PRD/Eval templates, and production incident containment scenarios.',
    labHref: '/labs#incident-triage',
    labLabel: 'Launch Incident War-Room Lab',
    recommendedModules: [
      { slug: 'strategy-cracking-ai-pm-interviews', title: 'Cracking L5/L6/Staff AI PM Case & Design Loops', badge: 'War-Room Lab' },
      { slug: 'tech-enterprise-ai-security-redteaming', title: 'AI Security, Red-Teaming & Guardrail Latency', badge: 'Security Depth' },
      { slug: 'project-production-ai-incident-postmortem', title: 'Capstone: Production AI Incident Triage & Postmortem', badge: 'Capstone' },
    ],
  },
};

export default function HomePage() {
  const { completedLessons, lastVisitedLessonSlug, hydrated } = useProgress();
  const [selectedRole, setSelectedRole] = useState<RoleDiagnosticId>('new-ai-pm');
  const activeDiag = ROLE_DIAGNOSTICS[selectedRole];
  const completedCount = hydrated ? completedLessons.length : 0;
  const totalCount = LESSONS.length;
  const projectCount = LESSONS.filter((l) => l.type === 'project').length;
  const resumeLesson =
    hydrated && lastVisitedLessonSlug ? getLessonBySlug(lastVisitedLessonSlug) : null;

  return (
    <div>
      {/* Hero Section — Animated 2-Column Editorial + Knowledge Constellation */}
      <section className="bg-odin-grid relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12">
          <div className="animate-odin-fade-up text-center lg:col-span-7 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-800 shadow-2xs">
              <Compass className="h-3.5 w-3.5 text-amber-600" />
              Free, Open-Curriculum AI Product Management Mastery
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl xl:text-6xl">
              Your Career in <span className="text-amber-600">AI Product Management</span> Starts Here
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0">
              Stop watching shallow prompt tutorials. Master probabilistic UX, token unit
              economics, Evals-Driven Development, hybrid RAG, and agent reliability through
              structured lessons, live interactive labs, and hire-ready portfolio projects.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/paths"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-700 sm:w-auto"
              >
                View Full Curriculum
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={resumeLesson ? `/lessons/${resumeLesson.slug}` : '/labs'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50 sm:w-auto"
              >
                {resumeLesson ? (
                  <>Resume: {resumeLesson.title.slice(0, 30)}…</>
                ) : (
                  <>
                    <FlaskConical className="h-4 w-4 text-indigo-600" />
                    Launch Interactive Labs
                  </>
                )}
              </Link>
            </div>

            {hydrated && completedCount > 0 && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Welcome back! {completedCount} of {totalCount} modules completed.
                <Link href="/dashboard" className="underline hover:text-emerald-950">
                  Open Dashboard
                </Link>
              </div>
            )}

            {/* Quick Stats Strip */}
            <div className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white/90 p-3.5 shadow-xs backdrop-blur-xs sm:grid-cols-4 lg:mx-0">
              <div>
                <div className="text-xl font-extrabold text-slate-900">{LEARNING_PATHS.length}</div>
                <div className="text-[11px] font-medium text-slate-500">Structured Paths</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900">{COURSES.length}</div>
                <div className="text-[11px] font-medium text-slate-500">Focused Courses</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900">{totalCount}</div>
                <div className="text-[11px] font-medium text-slate-500">Lessons & Projects</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900">{LAB_CATALOG.length}</div>
                <div className="text-[11px] font-medium text-slate-500">Live Simulators</div>
              </div>
            </div>
          </div>

          <div className="animate-odin-fade-up lg:col-span-5">
            <OdinHeroIllustration />
          </div>
        </div>
      </section>

      {/* How It Works — Classic 3-column Odin methodology + Custom SVG Scenes */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            How It Works
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Like The Odin Project for software engineers, we believe AI Product Managers learn by
            actually building specs, running unit-economics math, and debugging failure modes—not
            just reading slide decks.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <HowItWorksScene step={1} />
            <h3 className="mt-5 text-lg font-bold text-slate-900">1. Learn Real Mechanics</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Start in <strong>Foundations</strong> to understand next-token prediction, input/output
              token pricing, TTFT vs. TPOT latency budgets, and how to turn prompts into testable
              product specs.
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <HowItWorksScene step={2} />
            <h3 className="mt-5 text-lg font-bold text-slate-900">2. Simulate & Debug in Labs</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Test P95 SaaS margins in our <strong>Token Economics Simulator</strong>, spot prompt
              injections, calibrate release gates in <strong>Eval Studio</strong>, and debug hybrid
              RAG pipelines right inside lessons.
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <HowItWorksScene step={3} />
            <h3 className="mt-5 text-lg font-bold text-slate-900">3. Build a Hire-Ready Portfolio</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Complete {projectCount} capstone &amp; hands-on project briefs—from Model Selection
              Memos to Eval Harnesses, RAG Overhauls, and Incident Postmortems—with Staff exemplar
              benchmarks and Markdown export.
            </p>
          </div>
        </div>
      </section>

      {/* 30-Second AI PM Role Diagnostic & Personalized Track Recommender */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-700 uppercase">
                <Target className="h-4 w-4" /> 30-Second Personalized Track Finder
              </div>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Where Should You Start Today?
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
                Select your current role or goal to jump straight into the highest-leverage path, modules, and interactive simulator.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                { id: 'new-ai-pm' as const, icon: Compass },
                { id: 'strategy-founder' as const, icon: Rocket },
                { id: 'tech-platform' as const, icon: Cpu },
                { id: 'interview-prep' as const, icon: MessageSquareQuote },
              ] as const
            ).map(({ id, icon: Icon }) => {
              const item = ROLE_DIAGNOSTICS[id];
              const active = selectedRole === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedRole(id)}
                  className={`flex items-center gap-2.5 rounded-2xl border p-3.5 text-left text-xs font-bold transition ${
                    active
                      ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-200'
                      : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-amber-700' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 lg:grid-cols-12">
            <div className="flex flex-col justify-between lg:col-span-6">
              <div>
                <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                  Recommended Plan
                </span>
                <h3 className="mt-2.5 text-xl font-extrabold text-slate-900">
                  {activeDiag.headline}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {activeDiag.summary}
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link
                  href={activeDiag.trackHref}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-amber-700"
                >
                  {activeDiag.trackLabel} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={activeDiag.labHref}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  <FlaskConical className="h-3.5 w-3.5 text-indigo-600" />
                  {activeDiag.labLabel}
                </Link>
              </div>
            </div>

            <div className="space-y-2 lg:col-span-6">
              <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                First 3 High-Impact Modules
              </div>
              {activeDiag.recommendedModules.map((mod, idx) => (
                <Link
                  key={mod.slug}
                  href={`/lessons/${mod.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs transition hover:border-amber-400 hover:bg-amber-50/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-[11px] font-bold text-slate-700">
                      {idx + 1}
                    </span>
                    <span className="truncate font-bold text-slate-900">{mod.title}</span>
                  </div>
                  <span className="shrink-0 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                    {mod.badge}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Yggdrasil Curriculum Constellation Map */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <InteractiveSkillTreeMap completedLessons={hydrated ? completedLessons : []} />
      </section>

      {/* Curriculum Paths Overview */}
      <section className="border-y border-slate-200 bg-slate-100/70 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Choose Your AI PM Path
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Every learner begins with Foundations, then branches into AI Strategy & Growth or
                Technical AI PM (or completes both!).
              </p>
            </div>
            <Link
              href="/paths"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:underline"
            >
              Compare Paths Side-by-Side <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {LEARNING_PATHS.map((path) => {
              const pathLessons = getLessonsForPath(path.slug);
              const doneInPath = hydrated
                ? pathLessons.filter((l) => completedLessons.includes(l.slug)).length
                : 0;
              const pct =
                pathLessons.length > 0 ? Math.round((doneInPath / pathLessons.length) * 100) : 0;

              const badgeStyle =
                path.accentColor === 'amber'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : path.accentColor === 'teal'
                  ? 'bg-teal-50 text-teal-800 border-teal-200'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200';

              return (
                <div
                  key={path.slug}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeStyle}`}
                      >
                        {path.badge}
                      </span>
                      <PathCrestIcon slug={path.slug} size={46} />
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-slate-900">{path.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{path.tagline}</p>

                    <ul className="mt-4 space-y-2">
                      {path.outcomes.slice(0, 3).map((outcome) => (
                        <li key={outcome} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {path.courseIds.length} Courses · {pathLessons.length} Lessons & Projects
                      </span>
                      <span className="font-semibold text-slate-700">{path.estimatedHours}</span>
                    </div>

                    {hydrated && (
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] font-medium text-slate-500">
                          <span>Progress</span>
                          <span>
                            {doneInPath}/{pathLessons.length} ({pct}%)
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <Link
                      href={`/paths/${path.slug}`}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      Explore {path.shortTitle}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive AI PM Labs Showcase */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-indigo-700 uppercase">
              <Sparkles className="h-4 w-4" /> Learn by Doing in the Browser
            </div>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {LAB_CATALOG.length} Interactive AI PM Simulators &amp; Studios
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              No API keys required. Stress-test architectural decisions, RAG pipelines, eval gates,
              and compounding agent math directly inside the curriculum.
            </p>
          </div>
          <Link
            href="/labs"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            Open Full Labs Hub <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LAB_CATALOG.map((lab) => (
            <Link
              key={lab.id}
              href={`/labs#${lab.id}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                  {lab.badge}
                </span>
                <FlaskConical className="h-4 w-4 text-slate-400 transition group-hover:text-indigo-600" />
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-indigo-700">
                {lab.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{lab.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* AI PM Field Manual & Interview Playbook Showcase */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col justify-between gap-6 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-indigo-50/60 p-6 shadow-xs sm:p-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-800 uppercase">
              <BookMarked className="h-4 w-4" /> Permanent Desk Reference &amp; Interview Prep
            </div>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              The AI PM Field Manual &amp; Playbook
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Grab {PLAYBOOK_TEMPLATES.length} copy-ready Markdown spec templates,{' '}
              {DECISION_FRAMEWORKS.length} executive decision matrices,{' '}
              {PRODUCT_TEARDOWNS.length} flagship AI product teardowns (Cursor, Perplexity,
              NotebookLM, Sierra, Linear, Harvey), {INTERVIEW_QUESTIONS.length} Staff AI PM
              interview blueprints, and a {AI_PM_GLOSSARY.length}-term glossary.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/playbook"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
            >
              Open Field Manual <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/playbook#teardowns"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              {PRODUCT_TEARDOWNS.length} Product Teardowns
            </Link>
            <Link
              href="/playbook#interviews"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              {INTERVIEW_QUESTIONS.length} Interview Blueprints
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <div className="rounded-3xl bg-slate-900 px-6 py-12 text-center text-white sm:px-12">
          <ShieldCheck className="mx-auto h-10 w-10 text-amber-400" />
          <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">
            Ready to build AI products that actually work in production?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
            Jump into Course 1 of Foundations—learn why deterministic PRDs fail on probabilistic
            models and build your first unit-economics memo.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/lessons/foundations-llm-mental-models"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
            >
              Start Lesson 1 Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              View Progress Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
