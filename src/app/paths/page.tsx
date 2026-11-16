'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, Target } from 'lucide-react';
import { LEARNING_PATHS, getCoursesForPath, getLessonsForPath } from '@/data/curriculum';
import { useProgress } from '@/context/ProgressContext';
import { PathCrestIcon } from '@/components/Graphics';

export default function AllPathsPage() {
  const { completedLessons, activePathSlug, setActivePath, hydrated } = useProgress();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          Structured Curriculum Roadmap
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          All Learning Paths
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          Just like The Odin Project, begin with <strong>Foundations</strong> to master core LLM
          mechanics, unit economics, and prompt specifications. Then choose the specialization path
          aligned with your career trajectory—or master both.
        </p>
      </div>

      {/* Path Progression Connector */}
      <div className="mt-12 space-y-8">
        {LEARNING_PATHS.map((path, index) => {
          const courses = getCoursesForPath(path.slug);
          const lessons = getLessonsForPath(path.slug);
          const projectCount = lessons.filter((l) => l.type === 'project').length;
          const completedCount = hydrated
            ? lessons.filter((l) => completedLessons.includes(l.slug)).length
            : 0;
          const pct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
          const isSelected = hydrated && activePathSlug === path.slug;

          const accentRing =
            path.accentColor === 'amber'
              ? 'border-amber-300 ring-1 ring-amber-200'
              : path.accentColor === 'teal'
              ? 'border-teal-300 ring-1 ring-teal-200'
              : 'border-indigo-300 ring-1 ring-indigo-200';

          const badgeClass =
            path.accentColor === 'amber'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : path.accentColor === 'teal'
              ? 'bg-teal-50 text-teal-800 border-teal-200'
              : 'bg-indigo-50 text-indigo-800 border-indigo-200';

          return (
            <div
              key={path.slug}
              className={`rounded-3xl border bg-white p-6 shadow-xs transition duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-8 ${
                isSelected ? accentRing : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <PathCrestIcon slug={path.slug} size={42} />
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${badgeClass}`}
                    >
                      {path.badge}
                    </span>
                    {isSelected && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        Active Path
                      </span>
                    )}
                  </div>

                  <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
                    {path.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{path.description}</p>

                  <div className="mt-5 grid gap-3 text-xs text-slate-600 sm:grid-cols-2">
                    <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
                      <Target className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <div>
                        <div className="font-semibold text-slate-800">Ideal Target Roles</div>
                        <div className="mt-0.5">{path.targetRole}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                      <div>
                        <div className="font-semibold text-slate-800">Prerequisites & Pace</div>
                        <div className="mt-0.5">
                          {path.estimatedHours} · {path.prerequisites}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:w-72">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">
                      Path Overview
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-slate-800">
                      <div className="flex justify-between">
                        <span>Courses</span>
                        <span className="font-bold">{courses.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lessons</span>
                        <span className="font-bold">{lessons.length - projectCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Projects / Capstones</span>
                        <span className="font-bold">{projectCount}</span>
                      </div>
                    </div>

                    {hydrated && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>Completion</span>
                          <span>
                            {completedCount}/{lessons.length} ({pct}%)
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 space-y-2">
                    <Link
                      href={`/paths/${path.slug}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-amber-700"
                    >
                      Open Path Syllabus <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    {!isSelected && (
                      <button
                        type="button"
                        onClick={() => setActivePath(path.slug)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Select as Active Path
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Courses Included
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/paths/${path.slug}#${course.id}`}
                      className="rounded-xl border border-slate-200 p-3 text-xs transition hover:border-amber-300 hover:bg-amber-50/40"
                    >
                      <div className="font-semibold text-amber-700">Course {course.order}</div>
                      <div className="mt-1 font-bold text-slate-900">{course.title}</div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        {course.lessonSlugs.length} items
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {path.outcomes.map((outcome) => (
                  <div key={outcome} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
