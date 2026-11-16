'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  BookOpen,
  Wrench,
  FlaskConical,
  Map,
  CheckCircle2,
  ArrowRight,
  FileText,
  BookMarked,
} from 'lucide-react';
import { LEARNING_PATHS, LESSONS, LAB_CATALOG, getPathBySlug } from '@/data/curriculum';
import {
  AI_PM_GLOSSARY,
  INTERVIEW_QUESTIONS,
  PLAYBOOK_TEMPLATES,
  PRODUCT_TEARDOWNS,
} from '@/data/playbookData';
import { useProgress } from '@/context/ProgressContext';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { completedLessons } = useProgress();
  const completedSet = useMemo(() => new Set(completedLessons), [completedLessons]);

  useEffect(() => {
    if (open) {
      setQuery('');
      const timer = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) onClose();
      } else if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const paths = LEARNING_PATHS.filter(
      (p) =>
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
    const lessons = LESSONS.filter(
      (l) =>
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.skills.some((s) => s.toLowerCase().includes(q))
    ).slice(0, q ? 12 : 6);
    const labs = LAB_CATALOG.filter(
      (lab) =>
        !q ||
        lab.title.toLowerCase().includes(q) ||
        lab.description.toLowerCase().includes(q) ||
        lab.badge.toLowerCase().includes(q)
    );
    const templates = PLAYBOOK_TEMPLATES.filter(
      (tpl) =>
        !q ||
        tpl.title.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q) ||
        tpl.category.toLowerCase().includes(q)
    ).slice(0, q ? 6 : 3);
    const glossary = q
      ? AI_PM_GLOSSARY.filter(
          (g) =>
            g.term.toLowerCase().includes(q) ||
            g.definition.toLowerCase().includes(q) ||
            g.category.toLowerCase().includes(q)
        ).slice(0, 6)
      : [];
    const teardowns = PRODUCT_TEARDOWNS.filter(
      (td) =>
        !q ||
        td.product.toLowerCase().includes(q) ||
        td.company.toLowerCase().includes(q) ||
        td.headline.toLowerCase().includes(q) ||
        td.architectureStack.toLowerCase().includes(q)
    ).slice(0, q ? 4 : 2);
    const interviews = q
      ? INTERVIEW_QUESTIONS.filter(
          (iq) =>
            iq.question.toLowerCase().includes(q) ||
            iq.category.toLowerCase().includes(q) ||
            iq.whatInterviewersLookFor.toLowerCase().includes(q)
        ).slice(0, 4)
      : [];
    return { paths, lessons, labs, templates, glossary, teardowns, interviews };
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/55 px-4 pt-16 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search curriculum"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search AI PM lessons, projects, RAG, evals, pricing, MCP..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-3">
          {results.paths.length > 0 && (
            <div className="mb-4">
              <div className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Learning Paths
              </div>
              <div className="space-y-1">
                {results.paths.map((path) => (
                  <Link
                    key={path.slug}
                    href={`/paths/${path.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-amber-50/70"
                  >
                    <div className="flex items-center gap-3">
                      <Map className="h-4 w-4 shrink-0 text-amber-600" />
                      <div>
                        <div className="font-semibold text-slate-900">{path.title}</div>
                        <div className="text-xs text-slate-500">{path.badge} · {path.estimatedHours}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.lessons.length > 0 && (
            <div className="mb-4">
              <div className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Lessons & Projects
              </div>
              <div className="space-y-1">
                {results.lessons.map((lesson) => {
                  const path = getPathBySlug(lesson.pathSlug);
                  const isDone = completedSet.has(lesson.slug);
                  return (
                    <Link
                      key={lesson.slug}
                      href={`/lessons/${lesson.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-slate-100"
                    >
                      <div className="flex items-start gap-3">
                        {lesson.type === 'project' ? (
                          <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        ) : (
                          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                        )}
                        <div>
                          <div className="flex items-center gap-2 font-medium text-slate-900">
                            <span>{lesson.title}</span>
                            {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                          </div>
                          <div className="text-xs text-slate-500">
                            {path?.shortTitle} · {lesson.type === 'project' ? 'Hands-on Project' : 'Lesson'} · {lesson.duration}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {results.labs.length > 0 && (
            <div className="mb-4">
              <div className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Interactive AI PM Labs
              </div>
              <div className="space-y-1">
                {results.labs.map((lab) => (
                  <Link
                    key={lab.id}
                    href={`/labs#${lab.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-indigo-50/70"
                  >
                    <div className="flex items-center gap-3">
                      <FlaskConical className="h-4 w-4 shrink-0 text-indigo-600" />
                      <div>
                        <div className="font-medium text-slate-900">{lab.title}</div>
                        <div className="text-xs text-slate-500">{lab.badge}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.templates.length > 0 && (
            <div className="mb-4">
              <div className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Playbook Templates
              </div>
              <div className="space-y-1">
                {results.templates.map((tpl) => (
                  <Link
                    key={tpl.id}
                    href={`/playbook#${tpl.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-amber-50/70"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 shrink-0 text-amber-600" />
                      <div>
                        <div className="font-medium text-slate-900">{tpl.title}</div>
                        <div className="text-xs text-slate-500">{tpl.category} Template</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.teardowns.length > 0 && (
            <div className="mb-4">
              <div className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Product Teardowns
              </div>
              <div className="space-y-1">
                {results.teardowns.map((td) => (
                  <Link
                    key={td.id}
                    href="/playbook#teardowns"
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-amber-50/70"
                  >
                    <div className="flex items-center gap-3">
                      <BookMarked className="h-4 w-4 shrink-0 text-amber-600" />
                      <div>
                        <div className="font-medium text-slate-900">
                          {td.product} ({td.company})
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1">{td.headline}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.interviews.length > 0 && (
            <div className="mb-4">
              <div className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Interview Blueprints
              </div>
              <div className="space-y-1">
                {results.interviews.map((iq) => (
                  <Link
                    key={iq.id}
                    href="/playbook#interviews"
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-indigo-50/70"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 shrink-0 text-indigo-600" />
                      <div>
                        <div className="font-medium text-slate-900 line-clamp-1">{iq.question}</div>
                        <div className="text-xs text-slate-500">
                          {iq.difficulty} · {iq.category}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.glossary.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                AI PM Glossary
              </div>
              <div className="space-y-1">
                {results.glossary.map((g) => (
                  <Link
                    key={g.term}
                    href="/playbook#glossary"
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <BookMarked className="h-4 w-4 shrink-0 text-teal-700" />
                      <div>
                        <div className="font-medium text-slate-900">{g.term}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">{g.definition}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.paths.length === 0 &&
            results.lessons.length === 0 &&
            results.labs.length === 0 &&
            results.templates.length === 0 &&
            results.teardowns.length === 0 &&
            results.interviews.length === 0 &&
            results.glossary.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-500">
                No curriculum items match &ldquo;{query}&rdquo;. Try searching &ldquo;RAG&rdquo;, &ldquo;Cursor&rdquo;, &ldquo;reasoning&rdquo;, &ldquo;pricing&rdquo;, or &ldquo;MCP&rdquo;.
              </div>
            )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-500">
          <span>Tip: Press Esc to close</span>
          <span>
            {LESSONS.length} Modules · {LAB_CATALOG.length} Labs · {PRODUCT_TEARDOWNS.length} Teardowns · {PLAYBOOK_TEMPLATES.length} Templates
          </span>
        </div>
      </div>
    </div>
  );
}
