'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FlaskConical, ArrowRight } from 'lucide-react';
import { LAB_CATALOG, LabId } from '@/data/catalog';
import { InteractiveLab } from '@/components/InteractiveLabs';

export default function LabsHubPage() {
  const [focusedLab, setFocusedLab] = useState<LabId | 'all'>('all');

  const visibleLabs =
    focusedLab === 'all' ? LAB_CATALOG : LAB_CATALOG.filter((l) => l.id === focusedLab);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800">
          <FlaskConical className="h-3.5 w-3.5" /> Interactive AI PM Labs Hub
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Practice AI Product Decisions Without Guesswork
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Every simulator below runs live in your browser to build intuition around token COGS,
          system prompt injection defense, stratified eval release gates, hybrid RAG retrieval,
          compounding multi-step agent math, and AI-native PRDs.
        </p>

        {/* Filter / Jump Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFocusedLab('all')}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              focusedLab === 'all'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            All {LAB_CATALOG.length} Labs
          </button>
          {LAB_CATALOG.map((lab) => (
            <button
              key={lab.id}
              type="button"
              onClick={() => setFocusedLab(lab.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                focusedLab === lab.id
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {lab.shortTitle}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 space-y-12">
        {visibleLabs.map((lab) => (
          <section key={lab.id} className="space-y-3">
            <div className="flex flex-col justify-between gap-2 px-1 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xs font-bold tracking-wider text-indigo-700 uppercase">
                  {lab.badge}
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">{lab.description}</p>
              </div>
              <Link
                href={`/lessons/${lab.relatedLessonSlug}`}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-700 hover:underline"
              >
                Open Linked Lesson <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <InteractiveLab labId={lab.id} />
          </section>
        ))}
      </div>
    </div>
  );
}
