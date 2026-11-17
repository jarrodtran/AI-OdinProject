'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  FlaskConical,
  Search,
  Wrench,
  Sparkles,
} from 'lucide-react';
import {
  getCoursesForPath,
  getLessonsForCourse,
  getLessonsForPath,
  type LearningPath,
} from '@/data/catalog';
import { useProgress } from '@/context/ProgressContext';
import { PathCrestIcon } from '@/components/Graphics';

type PathModuleFilter = 'all' | 'remaining' | 'completed' | 'projects' | 'labs';

export function PathDetail({ path }: { path: LearningPath }) {
  const { completedLessons, toggleLessonComplete, activePathSlug, setActivePath, hydrated } =
    useProgress();
  const [filterMode, setFilterMode] = useState<PathModuleFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const courses = getCoursesForPath(path.slug);
  const allLessons = getLessonsForPath(path.slug);
  const completedSet = new Set(hydrated ? completedLessons : []);
  const doneCount = allLessons.filter((l) => completedSet.has(l.slug)).length;
  const pct = allLessons.length > 0 ? Math.round((doneCount / allLessons.length) * 100) : 0;
  const nextLesson = allLessons.find((l) => !completedSet.has(l.slug)) ?? allLessons[0];
  const isActivePath = hydrated && activePathSlug === path.slug;

  const badgeClass =
    path.accentColor === 'amber'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : path.accentColor === 'teal'
      ? 'bg-teal-50 text-teal-800 border-teal-200'
      : 'bg-indigo-50 text-indigo-800 border-indigo-200';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/paths"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to All Paths
      </Link>

      {/* Path Header Card */}
      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <PathCrestIcon slug={path.slug} size={50} />
            <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${badgeClass}`}>
              {path.badge}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" /> {path.estimatedHours} · {path.targetRole}
            </div>
            {hydrated && (
              <svg width="42" height="42" viewBox="0 0 42 42" aria-label={`Path progress ${pct}%`}>
                <circle cx="21" cy="21" r="17" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                <circle
                  cx="21"
                  cy="21"
                  r="17"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 17}
                  strokeDashoffset={2 * Math.PI * 17 * (1 - pct / 100)}
                  transform="rotate(-90 21 21)"
                  className="transition-all duration-500"
                />
                <text
                  x="21"
                  y="24"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="800"
                  fill="#0f172a"
                  fontFamily="monospace"
                >
                  {pct}%
                </text>
              </svg>
            )}
          </div>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {path.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          {path.description}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {path.outcomes.map((item) => (
            <div
              key={item}
              className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-700"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Progress & Primary CTA */}
        <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Path Completion</span>
              <span>
                {doneCount} / {allLessons.length} completed ({pct}%)
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!isActivePath && (
              <button
                type="button"
                onClick={() => setActivePath(path.slug)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Set as Active Path
              </button>
            )}
            {nextLesson && (
              <Link
                href={`/lessons/${nextLesson.slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-amber-800"
              >
                {doneCount === 0 ? 'Start First Lesson' : 'Continue Next Item'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Path Filter & Quick Search Toolbar */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'all' as const, label: `All (${allLessons.length})` },
                { id: 'remaining' as const, label: `Remaining (${allLessons.length - doneCount})` },
                { id: 'completed' as const, label: `Completed (${doneCount})` },
                {
                  id: 'projects' as const,
                  label: `Projects (${allLessons.filter((l) => l.type === 'project').length})`,
                },
                {
                  id: 'labs' as const,
                  label: `With Lab (${allLessons.filter((l) => Boolean(l.interactiveLabId)).length})`,
                },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterMode(f.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  filterMode === f.id
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-slate-500" />
            <input
              type="search"
              aria-label="Filter modules in this path"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter modules in this path..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-8 text-xs text-slate-900 outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Course Sequence — Connected Vertical Odin Course Timeline */}
      <div className="relative mt-8 space-y-8 before:absolute before:top-6 before:bottom-6 before:left-5 before:hidden before:w-0.5 before:bg-slate-200 sm:pl-12 sm:before:block">
        {courses.map((course) => {
          const allCourseItems = getLessonsForCourse(course.id);
          const q = searchQuery.trim().toLowerCase();
          const items = allCourseItems.filter((item) => {
            const isDone = completedSet.has(item.slug);
            if (filterMode === 'remaining' && isDone) return false;
            if (filterMode === 'completed' && !isDone) return false;
            if (filterMode === 'projects' && item.type !== 'project') return false;
            if (filterMode === 'labs' && !item.interactiveLabId) return false;
            if (
              q &&
              !item.title.toLowerCase().includes(q) &&
              !item.summary.toLowerCase().includes(q) &&
              !item.skills.some((s) => s.toLowerCase().includes(q))
            ) {
              return false;
            }
            return true;
          });
          if (items.length === 0) return null;
          const courseDone = allCourseItems.filter((i) => completedSet.has(i.slug)).length;
          const courseComplete = allCourseItems.length > 0 && courseDone === allCourseItems.length;

          return (
            <section
              key={course.id}
              id={course.id}
              className="relative scroll-mt-24 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
            >
              <div
                className={`absolute top-6 -left-12 hidden h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-extrabold sm:flex ${
                  courseComplete
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-amber-500 bg-white text-amber-700'
                }`}
              >
                {courseComplete ? <CheckCircle2 className="h-5 w-5" /> : course.order}
              </div>
              <div className="rounded-t-2xl border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <div className="text-xs font-bold tracking-wider text-amber-700 uppercase">
                      {course.subtitle}
                    </div>
                    <h2 className="mt-1 text-xl font-bold text-slate-900">{course.title}</h2>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {courseDone}/{items.length} Done
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">{course.description}</p>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item) => {
                  const isDone = completedSet.has(item.slug);
                  const isProject = item.type === 'project';

                  return (
                    <div
                      key={item.slug}
                      className="flex flex-col justify-between gap-4 px-6 py-4 transition hover:bg-slate-50/80 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          onClick={() => toggleLessonComplete(item.slug)}
                          className="mt-0.5 shrink-0 text-slate-500 transition hover:text-emerald-600"
                          title={isDone ? 'Mark incomplete' : 'Mark complete'}
                          aria-label={`Toggle completion for ${item.title}`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/lessons/${item.slug}`}
                              className={`text-sm font-bold transition hover:text-amber-700 sm:text-base ${
                                isDone ? 'text-slate-600' : 'text-slate-900'
                              }`}
                            >
                              {item.title}
                            </Link>
                            {isProject ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200">
                                <Wrench className="h-3 w-3" /> Project
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                <BookOpen className="h-3 w-3" /> Lesson
                              </span>
                            )}
                            {item.interactiveLabId && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                                <FlaskConical className="h-3 w-3" /> Interactive Lab
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            {item.summary}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span>{item.duration}</span>
                            <span>·</span>
                            <span>{item.difficulty}</span>
                            {item.skills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/lessons/${item.slug}`}
                        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 transition hover:border-amber-400 hover:text-amber-800"
                      >
                        {isDone ? 'Review' : isProject ? 'Open Project' : 'Read Lesson'}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Next Track Suggestion */}
      {path.slug === 'foundations' && (
        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/70 p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                What Comes After Foundations?
              </h3>
              <p className="mt-1 text-sm text-slate-700">
                Once you complete Foundations, pick your specialization track—either{' '}
                <Link href="/paths/ai-product-strategy" className="font-semibold underline">
                  AI Product Strategy, Discovery & Growth
                </Link>{' '}
                or{' '}
                <Link href="/paths/technical-ai-pm" className="font-semibold underline">
                  Technical AI PM: Evals, RAG & Agents
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
