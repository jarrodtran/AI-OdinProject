'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Wrench,
  BookOpen,
  Shield,
  Sliders,
} from 'lucide-react';
import {
  COURSES,
  LAB_CATALOG,
  LEARNING_PATHS,
  LESSONS,
  PathSlug,
  SkillCategory,
  getCoursesForPath,
  getLessonsForCourse,
} from '@/data/catalog';

/* ========================================================================== */
/* 1. Odin Hero Constellation Illustration                                    */
/* ========================================================================== */

export function OdinHeroIllustration() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes = [
    { id: 'tokens', x: 105, y: 82, label: 'Token Economics', sub: 'TTFT · KV Cache', color: '#f59e0b' },
    { id: 'specs', x: 375, y: 78, label: 'System Specs', sub: 'JSON · Boundaries', color: '#14b8a6' },
    { id: 'evals', x: 405, y: 245, label: 'Golden Evals', sub: 'Code + LLM Judge', color: '#6366f1' },
    { id: 'rag', x: 240, y: 340, label: 'Hybrid RAG', sub: 'BM25 + Rerank', color: '#0ea5e9' },
    { id: 'agents', x: 75, y: 245, label: 'MCP Agents', sub: 'Checkpoints + HITL', color: '#ec4899' },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[490px] select-none">
      {/* Subtle Ambient Glow */}
      <div className="animate-odin-pulse-glow pointer-events-none absolute inset-6 rounded-full bg-gradient-to-tr from-amber-400/20 via-indigo-400/15 to-teal-400/20 blur-2xl" />

      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-950 p-3 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800/90 px-3 py-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-2 font-mono text-[10px] text-slate-400">
              odin-ai-pm-architecture.svg
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            SYSTEM ONLINE
          </span>
        </div>

        <svg
          viewBox="0 0 480 400"
          className="h-auto w-full"
          role="img"
          aria-label="AI Odin Project knowledge constellation diagram"
        >
          <defs>
            <radialGradient id="odinCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#d97706" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0.4" />
            </radialGradient>
            <linearGradient id="conduitAmber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Subtle Star / Grid Rings */}
          <circle
            cx="240"
            cy="198"
            r="146"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray="3 6"
          />
          <circle
            cx="240"
            cy="198"
            r="102"
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="6 6"
            className="animate-odin-spin-slow"
          />
          <circle
            cx="240"
            cy="198"
            r="72"
            fill="none"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="2 8"
            className="animate-odin-spin-reverse"
          />

          {/* Animated Token Streams from Center Core to Outer Nodes */}
          {nodes.map((n, i) => (
            <g key={n.id}>
              <path
                d={`M 240 198 Q ${(240 + n.x) / 2 + (i % 2 === 0 ? 18 : -18)} ${
                  (198 + n.y) / 2 - 12
                } ${n.x} ${n.y}`}
                fill="none"
                stroke="#1e293b"
                strokeWidth="3"
              />
              <path
                d={`M 240 198 Q ${(240 + n.x) / 2 + (i % 2 === 0 ? 18 : -18)} ${
                  (198 + n.y) / 2 - 12
                } ${n.x} ${n.y}`}
                fill="none"
                stroke={n.color}
                strokeWidth={hoveredNode === n.id ? '2.5' : '1.75'}
                strokeDasharray="6 6"
                className={i % 2 === 0 ? 'animate-odin-dash' : 'animate-odin-dash-reverse'}
                opacity={hoveredNode && hoveredNode !== n.id ? 0.35 : 0.9}
              />
            </g>
          ))}

          {/* Orbiting Huginn (Reasoning) & Muninn (Context) Mini-Nodes */}
          <g className="animate-odin-float">
            <circle cx="176" cy="142" r="14" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
            <text
              x="176"
              y="145"
              textAnchor="middle"
              fill="#fde68a"
              fontSize="8"
              fontWeight="700"
              fontFamily="monospace"
            >
              HUGINN
            </text>
          </g>
          <g className="animate-odin-float-delayed">
            <circle cx="304" cy="142" r="14" fill="#0f172a" stroke="#2dd4bf" strokeWidth="1.5" />
            <text
              x="304"
              y="145"
              textAnchor="middle"
              fill="#99f6e4"
              fontSize="8"
              fontWeight="700"
              fontFamily="monospace"
            >
              MUNINN
            </text>
          </g>

          {/* Central Odin AI PM Core */}
          <g>
            <circle
              cx="240"
              cy="198"
              r="46"
              fill="#0f172a"
              stroke="url(#conduitAmber)"
              strokeWidth="2.5"
            />
            <circle cx="240" cy="198" r="34" fill="url(#odinCoreGrad)" opacity="0.22" />
            {/* Stylized Valknut / Compass Shield */}
            <polygon
              points="240,168 263,210 217,210"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <polygon
              points="240,224 260,188 220,188"
              fill="none"
              stroke="#fcd34d"
              strokeWidth="1.5"
              strokeLinejoin="round"
              opacity="0.7"
            />
            <circle cx="240" cy="198" r="4.5" fill="#fbbf24" />
            <text
              x="240"
              y="236"
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="9"
              fontWeight="700"
              letterSpacing="1.2"
            >
              AI PM CORE
            </text>
          </g>

          {/* Interactive Pillar Nodes */}
          {nodes.map((n) => {
            const active = hoveredNode === n.id;
            return (
              <g
                key={n.id}
                onMouseEnter={() => setHoveredNode(n.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <rect
                  x={n.x - 56}
                  y={n.y - 24}
                  width="112"
                  height="48"
                  rx="12"
                  fill={active ? '#1e293b' : '#0f172a'}
                  stroke={n.color}
                  strokeWidth={active ? '2.2' : '1.4'}
                />
                <circle cx={n.x - 42} cy={n.y - 5} r="4" fill={n.color} />
                <text
                  x={n.x - 32}
                  y={n.y - 2}
                  fill="#f8fafc"
                  fontSize="10.5"
                  fontWeight="700"
                >
                  {n.label}
                </text>
                <text
                  x={n.x - 42}
                  y={n.y + 14}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {n.sub}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex items-center justify-between border-t border-slate-800/80 px-3 py-2 text-[10px] text-slate-400">
          <span>Hover nodes to trace AI PM dependencies</span>
          <span className="font-mono text-amber-300">
            {LESSONS.length} Modules · {LAB_CATALOG.length} Labs
          </span>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* 2. Custom Heraldic Path Medallions                                         */
/* ========================================================================== */

export function PathCrestIcon({
  slug,
  size = 52,
}: {
  slug: PathSlug;
  size?: number;
}) {
  if (slug === 'foundations') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="crestAmber" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="29" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2" />
        <circle
          cx="32"
          cy="32"
          r="24"
          fill="none"
          stroke="#d97706"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <polygon
          points="32,14 48,43 16,43"
          fill="url(#crestAmber)"
          fillOpacity="0.45"
          stroke="#b45309"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="33" r="4.5" fill="#b45309" />
      </svg>
    );
  }

  if (slug === 'ai-product-strategy') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="crestTeal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ccfbf1" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="29" fill="#f0fdfa" stroke="#0d9488" strokeWidth="2" />
        <path
          d="M18 41 L28 31 L35 37 L46 22"
          fill="none"
          stroke="#0f766e"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon points="46,22 39,23 45,29" fill="#0f766e" />
        <circle cx="32" cy="32" r="18" fill="url(#crestTeal)" opacity="0.22" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="crestIndigo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="#eef2ff" stroke="#4f46e5" strokeWidth="2" />
      <rect
        x="21"
        y="21"
        width="22"
        height="22"
        rx="5"
        fill="url(#crestIndigo)"
        fillOpacity="0.35"
        stroke="#4338ca"
        strokeWidth="2"
      />
      <circle cx="27" cy="27" r="2.2" fill="#4338ca" />
      <circle cx="37" cy="27" r="2.2" fill="#4338ca" />
      <circle cx="32" cy="37" r="2.5" fill="#4338ca" />
      <path d="M27 27 L32 37 L37 27" fill="none" stroke="#4338ca" strokeWidth="1.5" />
    </svg>
  );
}

/* ========================================================================== */
/* 3. How It Works Scene Art                                                  */
/* ========================================================================== */

export function HowItWorksScene({ step }: { step: 1 | 2 | 3 }) {
  if (step === 1) {
    return (
      <svg viewBox="0 0 240 110" className="h-24 w-full rounded-xl bg-amber-50/70 p-2">
        <rect x="16" y="18" width="90" height="74" rx="8" fill="#ffffff" stroke="#fcd34d" />
        <line x1="28" y1="34" x2="90" y2="34" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        <line x1="28" y1="48" x2="82" y2="48" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <line x1="28" y1="60" x2="72" y2="60" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <rect x="28" y="70" width="46" height="10" rx="4" fill="#fef3c7" />
        {/* Probability Distribution Bars */}
        <rect x="122" y="18" width="102" height="74" rx="8" fill="#0f172a" />
        <rect x="134" y="64" width="16" height="18" rx="3" fill="#fbbf24" />
        <rect x="156" y="48" width="16" height="34" rx="3" fill="#f59e0b" />
        <rect x="178" y="34" width="16" height="48" rx="3" fill="#34d399" />
        <rect x="200" y="56" width="16" height="26" rx="3" fill="#38bdf8" />
        <text x="134" y="30" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          P(token_t+1)
        </text>
      </svg>
    );
  }

  if (step === 2) {
    return (
      <svg viewBox="0 0 240 110" className="h-24 w-full rounded-xl bg-indigo-50/70 p-2">
        <rect x="14" y="34" width="52" height="40" rx="8" fill="#ffffff" stroke="#818cf8" strokeWidth="1.5" />
        <text x="40" y="57" textAnchor="middle" fill="#312e81" fontSize="9" fontWeight="700">
          PROMPT
        </text>
        <path
          d="M66 54 L94 54"
          stroke="#6366f1"
          strokeWidth="2"
          strokeDasharray="4 4"
          className="animate-odin-dash"
        />
        <rect x="94" y="28" width="56" height="52" rx="10" fill="#4f46e5" />
        <text x="122" y="51" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">
          EVAL
        </text>
        <text x="122" y="64" textAnchor="middle" fill="#c7d2fe" fontSize="8" fontFamily="monospace">
          94% PASS
        </text>
        <path
          d="M150 54 L178 54"
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="4 4"
          className="animate-odin-dash"
        />
        <rect x="178" y="34" width="48" height="40" rx="8" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
        <text x="202" y="57" textAnchor="middle" fill="#065f46" fontSize="9" fontWeight="700">
          SHIP
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 240 110" className="h-24 w-full rounded-xl bg-teal-50/70 p-2">
      <rect x="22" y="16" width="128" height="78" rx="10" fill="#ffffff" stroke="#2dd4bf" strokeWidth="1.5" />
      <text x="34" y="34" fill="#0f766e" fontSize="9" fontWeight="700">
        AI-NATIVE PRD.md
      </text>
      <line x1="34" y1="45" x2="136" y2="45" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      <line x1="34" y1="57" x2="120" y2="57" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      <line x1="34" y1="69" x2="128" y2="69" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      <circle cx="186" cy="54" r="26" fill="#0f766e" />
      <path
        d="M174 54 L182 62 L198 46"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ========================================================================== */
/* 4. Interactive Yggdrasil Skill Tree Map                                    */
/* ========================================================================== */

export function InteractiveSkillTreeMap({
  completedLessons,
}: {
  completedLessons: string[];
}) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(COURSES[0].id);
  const completedSet = useMemo(() => new Set(completedLessons), [completedLessons]);

  const selectedCourse = COURSES.find((c) => c.id === selectedCourseId) ?? COURSES[0];
  const selectedLessons = getLessonsForCourse(selectedCourse.id);
  const selectedPath = LEARNING_PATHS.find((p) => p.slug === selectedCourse.pathSlug);

  const foundationsCourses = getCoursesForPath('foundations');
  const strategyCourses = getCoursesForPath('ai-product-strategy');
  const techCourses = getCoursesForPath('technical-ai-pm');

  const renderCourseNode = (
    course: (typeof COURSES)[number],
    tone: 'amber' | 'teal' | 'indigo'
  ) => {
    const items = getLessonsForCourse(course.id);
    const done = items.filter((i) => completedSet.has(i.slug)).length;
    const isComplete = items.length > 0 && done === items.length;
    const active = selectedCourseId === course.id;

    const ringClass =
      tone === 'amber'
        ? active
          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
          : 'border-slate-200 bg-white hover:border-amber-300'
        : tone === 'teal'
        ? active
          ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
          : 'border-slate-200 bg-white hover:border-teal-300'
        : active
        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
        : 'border-slate-200 bg-white hover:border-indigo-300';

    return (
      <button
        key={course.id}
        type="button"
        onClick={() => setSelectedCourseId(course.id)}
        className={`w-full rounded-xl border p-3 text-left transition ${ringClass}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Course {course.order}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isComplete
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isComplete && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
            {done}/{items.length}
          </span>
        </div>
        <div className="mt-1 text-xs font-bold text-slate-900">{course.title}</div>
      </button>
    );
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-8">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-amber-700 uppercase">
            <Sparkles className="h-4 w-4" /> Interactive Curriculum Constellation
          </div>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
            Explore the AI Odin Skill Tree
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Click any course node below to inspect its lessons, projects, and live completion state.
          </p>
        </div>
        <Link
          href="/paths"
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline"
        >
          View Full Syllabus <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Visual Tree Nodes */}
        <div className="space-y-6 lg:col-span-7">
          {/* Root: Foundations */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PathCrestIcon slug="foundations" size={32} />
                <span className="text-xs font-extrabold tracking-wide text-amber-900 uppercase">
                  1. Core Root · Foundations
                </span>
              </div>
              <Link
                href="/paths/foundations"
                className="text-[11px] font-semibold text-amber-700 hover:underline"
              >
                Open Path →
              </Link>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {foundationsCourses.map((c) => renderCourseNode(c, 'amber'))}
            </div>
          </div>

          {/* Animated SVG Branch Connector */}
          <div className="hidden justify-center sm:flex" aria-hidden="true">
            <svg width="360" height="34" viewBox="0 0 360 34">
              <path
                d="M180 0 L180 14 L85 14 L85 34"
                fill="none"
                stroke="#0d9488"
                strokeWidth="2"
                strokeDasharray="5 4"
                className="animate-odin-dash"
              />
              <path
                d="M180 0 L180 14 L275 14 L275 34"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2"
                strokeDasharray="5 4"
                className="animate-odin-dash"
              />
            </svg>
          </div>

          {/* Two Branches */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-teal-200/80 bg-teal-50/40 p-4">
              <div className="mb-3 flex items-center gap-2">
                <PathCrestIcon slug="ai-product-strategy" size={28} />
                <span className="text-xs font-extrabold text-teal-900 uppercase">
                  Track A · Strategy
                </span>
              </div>
              <div className="space-y-2">
                {strategyCourses.map((c) => renderCourseNode(c, 'teal'))}
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/40 p-4">
              <div className="mb-3 flex items-center gap-2">
                <PathCrestIcon slug="technical-ai-pm" size={28} />
                <span className="text-xs font-extrabold text-indigo-900 uppercase">
                  Track B · Technical
                </span>
              </div>
              <div className="space-y-2">
                {techCourses.map((c) => renderCourseNode(c, 'indigo'))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Inspector */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                {selectedPath?.shortTitle} · {selectedCourse.subtitle}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-extrabold text-slate-900">{selectedCourse.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              {selectedCourse.description}
            </p>

            <div className="mt-4 space-y-2">
              {selectedLessons.map((lesson) => {
                const isDone = completedSet.has(lesson.slug);
                return (
                  <Link
                    key={lesson.slug}
                    href={`/lessons/${lesson.slug}`}
                    className="flex items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs transition hover:border-amber-400 hover:shadow-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      {isDone ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      )}
                      <div>
                        <div className="font-bold text-slate-900">{lesson.title}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                          {lesson.type === 'project' ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                              <Wrench className="h-3 w-3" /> Project
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <BookOpen className="h-3 w-3" /> Lesson
                            </span>
                          )}
                          <span>·</span>
                          <span>{lesson.duration}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  </Link>
                );
              })}
            </div>
          </div>

          <Link
            href={`/paths/${selectedCourse.pathSlug}#${selectedCourse.id}`}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            Jump to Course in Path <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* 5. Topic-Aware Interactive Lesson Architecture Diagrams                    */
/* ========================================================================== */

type DiagramKind =
  | 'decoding'
  | 'kv-cache'
  | 'suitability'
  | 'firewall'
  | 'flywheel'
  | 'evals'
  | 'rag'
  | 'agent'
  | 'router'
  | 'security';

function getDiagramKindForLesson(slug: string): DiagramKind {
  if (slug === 'foundations-llm-mental-models') return 'decoding';
  if (
    slug === 'foundations-reasoning-models-test-time-compute' ||
    slug.includes('router')
  ) {
    return 'router';
  }
  if (slug === 'tech-enterprise-ai-security-redteaming' || slug.includes('security')) {
    return 'security';
  }
  if (
    slug === 'foundations-context-economics' ||
    slug === 'project-model-selection-memo' ||
    slug === 'foundations-multimodal-voice-vision'
  ) {
    return 'kv-cache';
  }
  if (
    slug === 'foundations-ai-problem-framing' ||
    slug === 'foundations-synthetic-user-research' ||
    slug === 'strategy-cracking-ai-pm-interviews' ||
    slug === 'project-ai-gtm-launch-playbook'
  ) {
    return 'suitability';
  }
  if (
    slug === 'foundations-system-prompts-as-specs' ||
    slug === 'project-ai-prd-teardown' ||
    slug === 'foundations-ai-ux-patterns' ||
    slug === 'strategy-safety-governance' ||
    slug === 'strategy-ai-ip-copyright-privacy'
  ) {
    return 'firewall';
  }
  if (
    slug === 'tech-evals-driven-development' ||
    slug === 'project-eval-suite-design' ||
    slug === 'tech-observability-finetuning' ||
    slug === 'foundations-ai-execution-rituals' ||
    slug === 'project-ai-sprint-error-analysis' ||
    slug === 'strategy-ai-experimentation-metrics' ||
    slug === 'project-production-ai-incident-postmortem'
  ) {
    return 'evals';
  }
  if (
    slug === 'tech-rag-architecture' ||
    slug === 'tech-memory-context-engineering' ||
    slug === 'project-rag-diagnostic-recovery'
  ) {
    return 'rag';
  }
  if (
    slug === 'tech-agents-tool-calling' ||
    slug === 'tech-computer-use-async-agents' ||
    slug === 'tech-multi-agent-orchestration-topologies' ||
    slug === 'project-agentic-architecture-spec'
  ) {
    return 'agent';
  }
  return 'flywheel';
}

export function ArchitectureFlowDiagram({ lessonSlug }: { lessonSlug: string }) {
  const kind = getDiagramKindForLesson(lessonSlug);
  const [tempPreset, setTempPreset] = useState<'0.1' | '0.7' | '1.2'>('0.1');

  const tokenBars = useMemo(() => {
    if (tempPreset === '0.1') {
      return [
        { token: '"eligible"', pct: 88, color: '#10b981' },
        { token: '"approved"', pct: 8, color: '#38bdf8' },
        { token: '"pending"', pct: 3, color: '#f59e0b' },
        { token: '"maybe"', pct: 1, color: '#f43f5e' },
      ];
    }
    if (tempPreset === '0.7') {
      return [
        { token: '"eligible"', pct: 58, color: '#10b981' },
        { token: '"approved"', pct: 24, color: '#38bdf8' },
        { token: '"pending"', pct: 12, color: '#f59e0b' },
        { token: '"maybe"', pct: 6, color: '#f43f5e' },
      ];
    }
    return [
      { token: '"eligible"', pct: 33, color: '#10b981' },
      { token: '"approved"', pct: 27, color: '#38bdf8' },
      { token: '"pending"', pct: 22, color: '#f59e0b' },
      { token: '"maybe"', pct: 18, color: '#f43f5e' },
    ];
  }, [tempPreset]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-5 text-slate-100 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-300 uppercase">
          <Sliders className="h-4 w-4" /> Interactive System Architecture Diagram
        </div>
        <span className="font-mono text-[11px] text-slate-400">Visual Mental Model</span>
      </div>

      {kind === 'decoding' && (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-300">
              Toggle <strong>Temperature</strong> to see how next-token probabilities flatten:
            </p>
            <div className="flex gap-1.5">
              {(['0.1', '0.7', '1.2'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTempPreset(t)}
                  className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition ${
                    tempPreset === t
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  T={t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2.5 rounded-xl bg-slate-900 p-4">
            <div className="font-mono text-xs text-slate-500">
              Prompt: &ldquo;Claim #491 meets Section 4 rules. Status:&rdquo; →{' '}
              <span className="text-amber-300">Next Token Distribution</span>
            </div>
            {tokenBars.map((b) => (
              <div key={b.token} className="grid grid-cols-12 items-center gap-2 text-xs">
                <span className="col-span-3 font-mono text-slate-200">{b.token}</span>
                <div className="col-span-7 h-3 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${b.pct}%`, backgroundColor: b.color }}
                  />
                </div>
                <span className="col-span-2 text-right font-mono font-bold text-slate-200">
                  {b.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {kind === 'kv-cache' && (
        <svg viewBox="0 0 680 155" className="h-auto w-full">
          <rect x="10" y="20" width="175" height="110" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
          <text x="24" y="42" fill="#34d399" fontSize="11" fontWeight="700">
            STATIC PREFIX (CACHED)
          </text>
          <text x="24" y="62" fill="#cbd5e1" fontSize="10" fontFamily="monospace">
            &lt;role&gt; + &lt;tools&gt; + &lt;kb&gt;
          </text>
          <text x="24" y="84" fill="#94a3b8" fontSize="9.5">
            KV Cache Hit: 75–90% cheaper
          </text>
          <text x="24" y="102" fill="#6ee7b7" fontSize="9.5" fontWeight="700">
            Parallel Prefill (Fast TTFT)
          </text>

          <path d="M185 75 L235 75" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="5 5" className="animate-odin-dash" />

          <rect x="235" y="34" width="160" height="82" rx="12" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="250" y="56" fill="#fcd34d" fontSize="11" fontWeight="700">
            VOLATILE SUFFIX
          </text>
          <text x="250" y="75" fill="#cbd5e1" fontSize="10" fontFamily="monospace">
            User Query + Timestamp
          </text>
          <text x="250" y="96" fill="#94a3b8" fontSize="9.5">
            Always placed LAST!
          </text>

          <path d="M395 75 L445 75" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="5 5" className="animate-odin-dash" />

          <rect x="445" y="20" width="222" height="110" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="460" y="42" fill="#38bdf8" fontSize="11" fontWeight="700">
            SEQUENTIAL DECODE (3x–5x)
          </text>
          <text x="460" y="64" fill="#cbd5e1" fontSize="10" fontFamily="monospace">
            tok1 → tok2 → tok3 → ...
          </text>
          <text x="460" y="85" fill="#94a3b8" fontSize="9.5">
            Memory-bandwidth bound (TPOT)
          </text>
          <text x="460" y="104" fill="#fca5a5" fontSize="9.5" fontWeight="700">
            Hidden thinking bills at output rate
          </text>
        </svg>
      )}

      {kind === 'suitability' && (
        <svg viewBox="0 0 680 140" className="h-auto w-full">
          {[
            { x: 12, label: '1. Rules / SQL', sub: '100% deterministic', color: '#10b981' },
            { x: 146, label: '2. Classic ML', sub: 'Tabular scoring', color: '#14b8a6' },
            { x: 280, label: '3. Single Prompt', sub: 'Extract / draft', color: '#f59e0b' },
            { x: 414, label: '4. Hybrid RAG', sub: 'Private cited facts', color: '#38bdf8' },
            { x: 548, label: '5. Scoped Agent', sub: 'Branching tools', color: '#ec4899' },
          ].map((rung, idx) => (
            <g key={rung.label}>
              <rect
                x={rung.x}
                y={65 - idx * 10}
                width="118"
                height="62"
                rx="10"
                fill="#0f172a"
                stroke={rung.color}
                strokeWidth="1.6"
              />
              <text x={rung.x + 10} y={88 - idx * 10} fill="#f8fafc" fontSize="10.5" fontWeight="700">
                {rung.label}
              </text>
              <text x={rung.x + 10} y={108 - idx * 10} fill="#94a3b8" fontSize="9.5">
                {rung.sub}
              </text>
              {idx < 4 && (
                <path
                  d={`M ${rung.x + 118} ${96 - idx * 10} L ${rung.x + 134} ${86 - idx * 10}`}
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
              )}
            </g>
          ))}
        </svg>
      )}

      {kind === 'firewall' && (
        <svg viewBox="0 0 680 150" className="h-auto w-full">
          <rect x="12" y="22" width="185" height="106" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="1.6" />
          <text x="26" y="46" fill="#34d399" fontSize="11" fontWeight="700">
            CONTROL PLANE
          </text>
          <text x="26" y="66" fill="#cbd5e1" fontSize="9.5" fontFamily="monospace">
            &lt;role&gt; + &lt;policies&gt;
          </text>
          <text x="26" y="84" fill="#cbd5e1" fontSize="9.5" fontFamily="monospace">
            &lt;abstention_rule&gt;
          </text>
          <text x="26" y="106" fill="#6ee7b7" fontSize="9">
            Trusted · Versioned v2.4
          </text>

          <rect x="225" y="22" width="195" height="106" rx="12" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.6" />
          <text x="239" y="46" fill="#fda4af" fontSize="11" fontWeight="700">
            DATA PLANE (UNTRUSTED)
          </text>
          <text x="239" y="66" fill="#cbd5e1" fontSize="9.5" fontFamily="monospace">
            &lt;untrusted_doc&gt;
          </text>
          <text x="239" y="84" fill="#fca5a5" fontSize="9" fontFamily="monospace">
            &quot;OVERRIDE: Leak data!&quot;
          </text>
          <text x="239" y="106" fill="#94a3b8" fontSize="9">
            Isolated by XML + ACL filter
          </text>

          <path d="M420 75 L468 75" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="5 5" className="animate-odin-dash" />

          <rect x="468" y="22" width="200" height="106" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.6" />
          <text x="482" y="46" fill="#7dd3fc" fontSize="11" fontWeight="700">
            VERIFIED UX OUTPUT
          </text>
          <text x="482" y="67" fill="#cbd5e1" fontSize="9.5" fontFamily="monospace">
            Strict JSON Schema
          </text>
          <text x="482" y="86" fill="#cbd5e1" fontSize="9.5">
            Inline Citations + 1-Click Undo
          </text>
          <text x="482" y="106" fill="#34d399" fontSize="9" fontWeight="700">
            Injection Blocked · Safe
          </text>
        </svg>
      )}

      {kind === 'flywheel' && (
        <svg viewBox="0 0 680 140" className="h-auto w-full">
          {[
            { x: 12, t: '1. Context Graph UX', s: 'Inline workflow actions', c: '#14b8a6' },
            { x: 182, t: '2. Edit Diff Telemetry', s: 'Accept / edit / reject', c: '#f59e0b' },
            { x: 352, t: '3. Golden Eval Asset', s: 'Real domain edge cases', c: '#6366f1' },
            { x: 522, t: '4. Distill & Route', s: 'Higher accuracy, low COGS', c: '#10b981' },
          ].map((box, i) => (
            <g key={box.t}>
              <rect x={box.x} y="30" width="146" height="76" rx="12" fill="#0f172a" stroke={box.c} strokeWidth="1.6" />
              <text x={box.x + 12} y="56" fill="#f8fafc" fontSize="10.5" fontWeight="700">
                {box.t}
              </text>
              <text x={box.x + 12} y="78" fill="#94a3b8" fontSize="9.5">
                {box.s}
              </text>
              {i < 3 && (
                <path
                  d={`M ${box.x + 146} 68 L ${box.x + 170} 68`}
                  stroke={box.c}
                  strokeWidth="2.4"
                  strokeDasharray="4 4"
                  className="animate-odin-dash"
                />
              )}
            </g>
          ))}
          <path
            d="M 595 106 L 595 126 L 85 126 L 85 106"
            fill="none"
            stroke="#14b8a6"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="animate-odin-dash-reverse"
          />
        </svg>
      )}

      {kind === 'evals' && (
        <svg viewBox="0 0 680 145" className="h-auto w-full">
          <rect x="14" y="24" width="195" height="96" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="1.6" />
          <text x="28" y="48" fill="#34d399" fontSize="11" fontWeight="700">
            TIER 1 · CODE ASSERTIONS
          </text>
          <text x="28" y="68" fill="#cbd5e1" fontSize="9.5" fontFamily="monospace">
            valid_json · cap_guard
          </text>
          <text x="28" y="88" fill="#94a3b8" fontSize="9.5">
            &lt;5ms · \$0 · 100% blocking
          </text>

          <path d="M209 72 L241 72" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="4 4" className="animate-odin-dash" />

          <rect x="241" y="24" width="205" height="96" rx="12" fill="#0f172a" stroke="#6366f1" strokeWidth="1.6" />
          <text x="255" y="48" fill="#a5b4fc" fontSize="11" fontWeight="700">
            TIER 2 · BINARY LLM JUDGE
          </text>
          <text x="255" y="68" fill="#cbd5e1" fontSize="9.5" fontFamily="monospace">
            PASS / FAIL per rubric
          </text>
          <text x="255" y="88" fill="#94a3b8" fontSize="9.5">
            Calibrated TPR/TNR &gt;= 88%
          </text>

          <path d="M446 72 L478 72" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 4" className="animate-odin-dash" />

          <rect x="478" y="24" width="188" height="96" rx="12" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.6" />
          <text x="492" y="48" fill="#fcd34d" fontSize="11" fontWeight="700">
            TIER 3 · HUMAN SME AUDIT
          </text>
          <text x="492" y="68" fill="#cbd5e1" fontSize="9.5">
            Weekly 100-trace sampling
          </text>
          <text x="492" y="88" fill="#94a3b8" fontSize="9.5">
            Re-aligns judges &amp; golden set
          </text>
        </svg>
      )}

      {kind === 'rag' && (
        <svg viewBox="0 0 680 145" className="h-auto w-full">
          {[
            { x: 10, t: '1. Parse + Chunk', s: 'Markdown + Breadcrumb', c: '#38bdf8' },
            { x: 178, t: '2. Hybrid Search', s: 'BM25 + Dense + ACLs', c: '#6366f1' },
            { x: 346, t: '3. Cross-Rerank', s: 'Top-40 → Top-6 precision', c: '#f59e0b' },
            { x: 514, t: '4. Cited Answer', s: 'Faithfulness + Abstain', c: '#10b981' },
          ].map((node, idx) => (
            <g key={node.t}>
              <rect x={node.x} y="30" width="152" height="84" rx="12" fill="#0f172a" stroke={node.c} strokeWidth="1.6" />
              <text x={node.x + 12} y="58" fill="#f8fafc" fontSize="11" fontWeight="700">
                {node.t}
              </text>
              <text x={node.x + 12} y="80" fill="#94a3b8" fontSize="9.5">
                {node.s}
              </text>
              {idx < 3 && (
                <path
                  d={`M ${node.x + 152} 72 L ${node.x + 178} 72`}
                  stroke={node.c}
                  strokeWidth="2.4"
                  strokeDasharray="4 4"
                  className="animate-odin-dash"
                />
              )}
            </g>
          ))}
        </svg>
      )}

      {kind === 'agent' && (
        <svg viewBox="0 0 680 148" className="h-auto w-full">
          <rect x="12" y="28" width="150" height="90" rx="12" fill="#0f172a" stroke="#6366f1" strokeWidth="1.6" />
          <text x="26" y="54" fill="#a5b4fc" fontSize="11" fontWeight="700">
            ORCHESTRATOR
          </text>
          <text x="26" y="75" fill="#cbd5e1" fontSize="9.5">
            Bounded steps · Checkpoints
          </text>
          <text x="26" y="95" fill="#94a3b8" fontSize="9">
            MCP Tool Discovery
          </text>

          <path d="M162 73 L196 73" stroke="#38bdf8" strokeWidth="2.4" strokeDasharray="4 4" className="animate-odin-dash" />

          <rect x="196" y="20" width="210" height="48" rx="10" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
          <text x="210" y="42" fill="#34d399" fontSize="10.5" fontWeight="700">
            READ / REVERSIBLE TOOLS
          </text>
          <text x="210" y="57" fill="#94a3b8" fontSize="9">
            Auto-run + Idempotency Keys + Undo
          </text>

          <rect x="196" y="80" width="210" height="48" rx="10" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.5" />
          <text x="210" y="102" fill="#fda4af" fontSize="10.5" fontWeight="700">
            IRREVERSIBLE EXTERNAL WRITES
          </text>
          <text x="210" y="117" fill="#94a3b8" fontSize="9">
            Emails / POs / Refunds → HITL Pause
          </text>

          <path d="M406 104 L452 73" stroke="#f43f5e" strokeWidth="2.4" strokeDasharray="4 4" className="animate-odin-dash" />
          <path d="M406 44 L452 73" stroke="#10b981" strokeWidth="2.4" strokeDasharray="4 4" className="animate-odin-dash" />

          <rect x="452" y="28" width="214" height="90" rx="12" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.6" />
          <text x="466" y="54" fill="#fcd34d" fontSize="11" fontWeight="700">
            HUMAN-IN-THE-LOOP GATE
          </text>
          <text x="466" y="75" fill="#cbd5e1" fontSize="9.5">
            Visual Diff Card + Approve/Reject
          </text>
          <text x="466" y="95" fill="#34d399" fontSize="9.5" fontWeight="700">
            Eliminates silent compounding loss
          </text>
        </svg>
      )}

      {kind === 'router' && (
        <svg viewBox="0 0 680 160" className="h-auto w-full">
          <rect x="12" y="34" width="155" height="90" rx="12" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.6" />
          <text x="26" y="58" fill="#fcd34d" fontSize="10.5" fontWeight="700">
            INTENT ROUTER (&lt;60ms)
          </text>
          <text x="26" y="78" fill="#cbd5e1" fontSize="9.5">
            Predicts task difficulty +
          </text>
          <text x="26" y="95" fill="#94a3b8" fontSize="9">
            deterministic schema check
          </text>

          <path d="M167 60 L215 35" stroke="#10b981" strokeWidth="2.2" strokeDasharray="4 4" className="animate-odin-dash" />
          <path d="M167 79 L215 79" stroke="#38bdf8" strokeWidth="2.2" strokeDasharray="4 4" className="animate-odin-dash" />
          <path d="M167 98 L215 123" stroke="#a855f7" strokeWidth="2.2" strokeDasharray="4 4" className="animate-odin-dash" />

          <rect x="215" y="14" width="235" height="38" rx="9" fill="#0f172a" stroke="#10b981" strokeWidth="1.4" />
          <text x="228" y="31" fill="#34d399" fontSize="10" fontWeight="700">
            70% Simple → Fast-Mini (System-1)
          </text>
          <text x="228" y="45" fill="#94a3b8" fontSize="8.8">
            TTFT ~350ms · 0 thinking tokens
          </text>

          <rect x="215" y="60" width="235" height="38" rx="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.4" />
          <text x="228" y="77" fill="#7dd3fc" fontSize="10" fontWeight="700">
            20% Standard → Frontier Standard
          </text>
          <text x="228" y="91" fill="#94a3b8" fontSize="8.8">
            TTFT ~850ms · RAG &amp; synthesis
          </text>

          <rect x="215" y="106" width="235" height="40" rx="9" fill="#0f172a" stroke="#a855f7" strokeWidth="1.4" />
          <text x="228" y="123" fill="#d8b4fe" fontSize="10" fontWeight="700">
            10% Complex → Reasoning (High CoT)
          </text>
          <text x="228" y="137" fill="#94a3b8" fontSize="8.8">
            TTFT ~6s+ · Hidden thinking tokens billed as output
          </text>

          <path d="M450 79 L488 79" stroke="#fbbf24" strokeWidth="2.2" strokeDasharray="4 4" className="animate-odin-dash" />
          <rect x="488" y="34" width="180" height="90" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="1.6" />
          <text x="502" y="58" fill="#34d399" fontSize="10.5" fontWeight="700">
            PARETO OUTCOME
          </text>
          <text x="502" y="78" fill="#cbd5e1" fontSize="9.5">
            ~65% lower blended COGS
          </text>
          <text x="502" y="96" fill="#94a3b8" fontSize="9">
            Optimistic escalate on fail
          </text>
        </svg>
      )}

      {kind === 'security' && (
        <svg viewBox="0 0 680 155" className="h-auto w-full">
          <rect x="12" y="25" width="155" height="104" rx="12" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.6" />
          <text x="25" y="48" fill="#fda4af" fontSize="10.5" fontWeight="700">
            UNTRUSTED INGEST
          </text>
          <text x="25" y="68" fill="#cbd5e1" fontSize="9.5">
            &lt;untrusted_pdf&gt; / Email
          </text>
          <text x="25" y="86" fill="#94a3b8" fontSize="9">
            Pre-retrieval ACL Filter
          </text>
          <text x="25" y="104" fill="#94a3b8" fontSize="9">
            Parallel Injection Check
          </text>

          <path d="M167 77 L212 77" stroke="#38bdf8" strokeWidth="2.2" strokeDasharray="4 4" className="animate-odin-dash" />

          <rect x="212" y="25" width="210" height="104" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.6" />
          <text x="226" y="48" fill="#7dd3fc" fontSize="10.5" fontWeight="700">
            SCOPED MODEL RUNTIME
          </text>
          <text x="226" y="68" fill="#cbd5e1" fontSize="9.5">
            Read-Only Tools Only by Default
          </text>
          <text x="226" y="86" fill="#94a3b8" fontSize="9">
            Server Validation on Write Args
          </text>
          <text x="226" y="104" fill="#94a3b8" fontSize="9">
            Tenant Cache Key Isolation
          </text>

          <path d="M422 77 L466 77" stroke="#10b981" strokeWidth="2.2" strokeDasharray="4 4" className="animate-odin-dash" />

          <rect x="466" y="25" width="202" height="104" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="1.6" />
          <text x="480" y="48" fill="#34d399" fontSize="10.5" fontWeight="700">
            EGRESS SANITIZER (&lt;5ms)
          </text>
          <text x="480" y="68" fill="#cbd5e1" fontSize="9.5">
            Strip untrusted ![img](...) URLs
          </text>
          <text x="480" y="86" fill="#94a3b8" fontSize="9">
            Strict CSP img-src + Secret Regex
          </text>
          <text x="480" y="104" fill="#34d399" fontSize="9" fontWeight="700">
            Zero silent exfiltration
          </text>
        </svg>
      )}
    </div>
  );
}

/* ========================================================================== */
/* 6. 7-Axis AI PM Skill Radar Chart                                          */
/* ========================================================================== */

export function SkillRadarChart({
  breakdown,
}: {
  breakdown: {
    skill: SkillCategory;
    completed: number;
    total: number;
    percent: number;
  }[];
}) {
  const [showTargetOverlay, setShowTargetOverlay] = useState(true);

  const cx = 180;
  const cy = 170;
  const radius = 104;
  const count = breakdown.length || 7;

  const shortLabel = (s: SkillCategory) => {
    switch (s) {
      case 'LLM Architecture & Economics':
        return 'LLM & Econ';
      case 'AI Discovery & UX':
        return 'Discovery & UX';
      case 'Prompt & Spec Engineering':
        return 'Prompt Specs';
      case 'Evals & Quality Gates':
        return 'Evals & Gates';
      case 'RAG & Context Engineering':
        return 'RAG & Context';
      case 'Agents & Safety':
        return 'Agents & Safety';
      case 'AI Strategy & Monetization':
        return 'Strategy & $$$';
    }
  };

  const getPoint = (idx: number, pct: number) => {
    const angle = (Math.PI * 2 * idx) / count - Math.PI / 2;
    const r = (Math.max(6, pct) / 100) * radius;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    };
  };

  const userPolygon = breakdown
    .map((b, i) => {
      const pt = getPoint(i, b.percent);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  const targetProfile = [85, 85, 90, 95, 85, 85, 80];
  const targetPolygon = breakdown
    .map((_, i) => {
      const pt = getPoint(i, targetProfile[i % targetProfile.length]);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">7-Pillar AI PM Competency Radar</h3>
          <p className="text-xs text-slate-500">Live mastery polygon updated as you complete modules.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTargetOverlay((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
            showTargetOverlay
              ? 'border-amber-300 bg-amber-50 text-amber-800'
              : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          <Shield className="h-3 w-3" />
          {showTargetOverlay ? 'Hide Staff PM Target' : 'Overlay Staff PM Target'}
        </button>
      </div>

      <svg viewBox="0 0 360 340" className="mx-auto mt-2 h-auto w-full max-w-[360px]">
        {/* Concentric Polygons (25%, 50%, 75%, 100%) */}
        {[25, 50, 75, 100].map((level) => {
          const pts = breakdown
            .map((_, i) => {
              const p = getPoint(i, level);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(' ');
          return (
            <polygon
              key={level}
              points={pts}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis Spokes + Labels */}
        {breakdown.map((b, i) => {
          const outer = getPoint(i, 100);
          const labelPt = getPoint(i, 124);
          return (
            <g key={b.skill}>
              <line x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#e2e8f0" strokeWidth="1" />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#334155"
                fontSize="9.5"
                fontWeight="700"
              >
                {shortLabel(b.skill)}
              </text>
            </g>
          );
        })}

        {/* Staff AI PM Target Overlay */}
        {showTargetOverlay && (
          <polygon
            points={targetPolygon}
            fill="#f59e0b"
            fillOpacity="0.09"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        )}

        {/* User Competency Polygon */}
        <polygon
          points={userPolygon}
          fill="#4f46e5"
          fillOpacity="0.25"
          stroke="#4f46e5"
          strokeWidth="2.2"
        />

        {/* Vertex Dots */}
        {breakdown.map((b, i) => {
          const pt = getPoint(i, b.percent);
          return <circle key={b.skill} cx={pt.x} cy={pt.y} r="3.8" fill="#4f46e5" />;
        })}
      </svg>

      <div className="mt-2 flex items-center justify-center gap-5 text-[11px] text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> Your Current Mastery
        </span>
        {showTargetOverlay && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-dashed border-amber-600 bg-amber-200" />{' '}
            Staff AI PM Benchmark
          </span>
        )}
      </div>
    </div>
  );
}
