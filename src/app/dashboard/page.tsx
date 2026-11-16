'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  ExternalLink,
  RotateCcw,
  Upload,
  Wrench,
  Compass,
  ShieldCheck,
  Sparkles,
  Bookmark,
  FileText,
  NotebookPen,
  Cloud,
  RefreshCw,
  LogIn,
  Copy,
  Check,
  Briefcase,
} from 'lucide-react';
import {
  LEARNING_PATHS,
  LESSONS,
  getLessonBySlug,
  getLessonsForPath,
  getPathBySlug,
  getSkillBreakdown,
} from '@/data/curriculum';
import { useProgress } from '@/context/ProgressContext';
import { PathCrestIcon, SkillRadarChart } from '@/components/Graphics';
import { AuthModal } from '@/components/AuthModal';

export default function DashboardPage() {
  const {
    completedLessons,
    activePathSlug,
    setActivePath,
    quizScores,
    projectSubmissions,
    lastVisitedLessonSlug,
    lessonNotes,
    bookmarkedLessons,
    toggleBookmarkLesson,
    exportPortfolioMarkdown,
    exportProgressJson,
    importProgressJson,
    resetProgress,
    hydrated,
    user,
    syncStatus,
    syncNow,
  } = useProgress();

  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [copiedCert, setCopiedCert] = useState(false);

  const completedList = hydrated ? completedLessons : [];
  const completedSet = new Set(completedList);
  const totalCount = LESSONS.length;
  const overallPct = totalCount > 0 ? Math.round((completedList.length / totalCount) * 100) : 0;

  const projectItems = LESSONS.filter((l) => l.type === 'project');
  const completedProjectsCount = projectItems.filter((p) => completedSet.has(p.slug)).length;
  const savedPortfolioCount = hydrated ? Object.keys(projectSubmissions).length : 0;

  const quizAttempts = hydrated ? Object.values(quizScores) : [];
  const avgQuizPct =
    quizAttempts.length > 0
      ? Math.round(
          (quizAttempts.reduce((acc, q) => acc + (q.total > 0 ? q.score / q.total : 0), 0) /
            quizAttempts.length) *
            100
        )
      : null;

  const activePath = getPathBySlug(activePathSlug) ?? LEARNING_PATHS[0];
  const activePathLessons = getLessonsForPath(activePath.slug);
  const nextUpLesson =
    activePathLessons.find((l) => !completedSet.has(l.slug)) ??
    (lastVisitedLessonSlug ? getLessonBySlug(lastVisitedLessonSlug) : undefined) ??
    activePathLessons[0];

  const skillBreakdown = getSkillBreakdown(completedList);

  const handleExportDossier = () => {
    const md = exportPortfolioMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-pm-portfolio-dossier.md';
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Markdown Portfolio Dossier downloaded!');
    setTimeout(() => setStatusMessage(null), 2800);
  };

  const handleExport = () => {
    const json = exportProgressJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-odin-project-progress.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Progress backup downloaded.');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleImport = () => {
    const res = importProgressJson(importText);
    if (res.ok) {
      setStatusMessage('Progress restored successfully!');
      setShowImport(false);
      setImportText('');
    } else {
      setStatusMessage(`Import failed: ${res.error}`);
    }
    setTimeout(() => setStatusMessage(null), 3500);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold tracking-wider text-amber-700 uppercase">
            Student Progress & Portfolio
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            Your AI PM Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track curriculum mastery, skill coverage, and saved AI PM portfolio artifacts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportDossier}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700"
          >
            <FileText className="h-3.5 w-3.5" /> Export Portfolio Dossier (.md)
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" /> Backup JSON
          </button>
          <button
            type="button"
            onClick={() => setShowImport((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Upload className="h-3.5 w-3.5" /> Import JSON
          </button>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                resetProgress();
                setConfirmReset(false);
                setStatusMessage('Progress reset.');
              }}
              className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white"
            >
              Confirm Reset?
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800">
          {statusMessage}
        </div>
      )}

      {showImport && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-800">
            Paste Exported `ai-odin-project-progress.json`
          </div>
          <textarea
            rows={4}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{"app":"the-ai-odin-project","state":{...}}'
            className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-mono text-xs outline-none focus:border-amber-500"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleImport}
              className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white"
            >
              Restore Progress
            </button>
            <button
              type="button"
              onClick={() => setShowImport(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cloud Account & Progress Sync Banner */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        {hydrated && user ? (
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Cloud className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  Cloud Sync Active · {user.name} ({user.email})
                  {user.roleTitle ? ` · ${user.roleTitle}` : ''}
                </div>
                <div className="text-xs text-slate-500">
                  {syncStatus === 'syncing'
                    ? 'Syncing latest modules and artifacts...'
                    : syncStatus === 'offline'
                    ? 'Offline — changes safely saved locally and ready to re-sync.'
                    : `Last synced ${new Date(user.lastSyncedAt).toLocaleString()}${
                        user.revision ? ` · Revision #${user.revision}` : ''
                      }${user.backend ? ` · ${user.backend}` : ''}`}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  const res = await syncNow();
                  setStatusMessage(
                    res.ok ? 'Cloud progress synced!' : `Sync note: ${res.error}`
                  );
                  setTimeout(() => setStatusMessage(null), 2800);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
                />
                Sync Now
              </button>
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Account Settings
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Cloud className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  Browsing as Guest · Progress saved only in this browser
                </div>
                <div className="text-xs text-slate-500">
                  Sign in with email or a quick learner profile to back up your modules, quiz
                  scores, and project artifacts across devices.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign In to Save Progress
            </button>
          </div>
        )}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Top KPI Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Overall Progress</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{overallPct}%</span>
            <span className="text-xs font-medium text-slate-500">
              {completedList.length}/{totalCount} items
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-amber-500" style={{ width: `${overallPct}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Projects Shipped</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {completedProjectsCount}
            </span>
            <span className="text-xs font-medium text-slate-500">
              of {projectItems.length} ({savedPortfolioCount} drafts saved)
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Quiz Mastery</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {avgQuizPct !== null ? `${avgQuizPct}%` : '—'}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {quizAttempts.length} quizzes taken
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs">
          <div className="text-xs font-semibold text-amber-800 uppercase">Resume Active Path</div>
          <div className="mt-1 truncate text-sm font-bold text-slate-900">{activePath.shortTitle}</div>
          {nextUpLesson && (
            <Link
              href={`/lessons/${nextUpLesson.slug}`}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:underline"
            >
              Next: {nextUpLesson.title.slice(0, 34)}… <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* AI PM Readiness Scorecard & Shareable Credential Card */}
      {(() => {
        const readinessScore = hydrated
          ? Math.min(
              100,
              Math.round(
                overallPct * 0.55 +
                  (projectItems.length > 0
                    ? (completedProjectsCount / projectItems.length) * 100
                    : 0) *
                    0.3 +
                  (avgQuizPct ?? 0) * 0.15
              )
            )
          : 0;
        const rank =
          readinessScore >= 85
            ? 'Staff AI PM Allfather'
            : readinessScore >= 55
            ? 'Senior AI Product Manager'
            : readinessScore >= 25
            ? 'AI PM Practitioner'
            : 'Foundations Apprentice';
        const shareMarkdown = `I reached **${rank}** (${readinessScore}/100 Readiness Score) on **The AI Odin Project** — completing ${completedList.length}/${totalCount} modules, ${completedProjectsCount}/${projectItems.length} hands-on portfolio projects, and ${quizAttempts.length} knowledge assessments across Evals, Hybrid RAG, Unit Economics, Multi-Agent Safety & AI Strategy.`;

        return (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-6 text-white shadow-sm sm:p-7">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-bold text-amber-300 ring-1 ring-amber-400/30">
                  <Briefcase className="h-3.5 w-3.5" /> Career Readiness Tier
                </div>
                <div className="mt-2 flex flex-wrap items-baseline gap-3">
                  <h2 className="text-2xl font-extrabold tracking-tight text-white">{rank}</h2>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {readinessScore}/100 Weighted Score
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
                  Weighted score across curriculum completion (55%), shipped portfolio projects
                  (30%), and average quiz mastery (15%).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(shareMarkdown);
                      setCopiedCert(true);
                      setTimeout(() => setCopiedCert(false), 2000);
                    } catch {
                      // Ignore clipboard restrictions
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-amber-400"
                >
                  {copiedCert ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedCert ? 'Copied Profile Summary!' : 'Copy LinkedIn / Resume Summary'}
                </button>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Path Progress + 7 Skill Competencies */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-6">
          <h2 className="text-lg font-bold text-slate-900">Progress by Learning Path</h2>
          {LEARNING_PATHS.map((path) => {
            const items = getLessonsForPath(path.slug);
            const done = items.filter((i) => completedSet.has(i.slug)).length;
            const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
            const isActive = path.slug === activePathSlug;

            return (
              <div
                key={path.slug}
                className={`rounded-2xl border bg-white p-5 shadow-xs ${
                  isActive ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">{path.badge}</div>
                    <Link
                      href={`/paths/${path.slug}`}
                      className="mt-0.5 block text-base font-bold text-slate-900 hover:text-amber-700"
                    >
                      {path.title}
                    </Link>
                  </div>
                  {!isActive ? (
                    <button
                      type="button"
                      onClick={() => setActivePath(path.slug)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Set Active
                    </button>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>
                      {done}/{items.length} completed
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Competency Matrix + 7-Axis Radar */}
        <div className="space-y-6 lg:col-span-6">
          <SkillRadarChart breakdown={skillBreakdown} />

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">AI PM Skill Breakdown</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Calculated automatically across the 7 core pillars of modern AI Product Management.
            </p>

            <div className="mt-5 space-y-4">
              {skillBreakdown.map((item) => (
                <div key={item.skill}>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.skill}</span>
                    <span className="font-mono text-slate-500">
                      {item.completed}/{item.total} ({item.percent}%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Norse-AI Mastery Badges */}
      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-700 uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Achievement Seals
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Norse-AI Mastery Badges</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Unlock badges by completing lessons, quizzes &amp; portfolio projects
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(() => {
            const foundationsItems = getLessonsForPath('foundations');
            const strategyItems = getLessonsForPath('ai-product-strategy');
            const techItems = getLessonsForPath('technical-ai-pm');
            const foundationsDone = foundationsItems.every((l) => completedSet.has(l.slug));
            const strategyDone = strategyItems.every((l) => completedSet.has(l.slug));
            const techDone = techItems.every((l) => completedSet.has(l.slug));

            const badges = [
              {
                id: 'first-rune',
                title: "Odin's First Rune",
                desc: 'Complete your very first AI PM lesson or project.',
                unlocked: completedList.length >= 1,
                progress: `${Math.min(1, completedList.length)}/1`,
                icon: 'compass' as const,
              },
              {
                id: 'quiz-scholar',
                title: 'Huginn Reasoning Scholar',
                desc: 'Pass knowledge check quizzes on 3+ modules.',
                unlocked: quizAttempts.length >= 3,
                progress: `${Math.min(3, quizAttempts.length)}/3 quizzes`,
                icon: 'spark' as const,
              },
              {
                id: 'foundations-grad',
                title: 'Foundations Shieldbearer',
                desc: `Complete all ${foundationsItems.length} modules in Foundations of AI PM.`,
                unlocked: foundationsDone,
                progress: `${foundationsItems.filter((l) => completedSet.has(l.slug)).length}/${foundationsItems.length}`,
                icon: 'foundations' as const,
              },
              {
                id: 'builder-shipper',
                title: 'PRD & Spec Crafter',
                desc: 'Save or ship at least 2 hands-on project artifacts.',
                unlocked: completedProjectsCount >= 2 || savedPortfolioCount >= 2,
                progress: `${Math.max(completedProjectsCount, savedPortfolioCount)}/2 projects`,
                icon: 'shield' as const,
              },
              {
                id: 'strategy-master',
                title: 'Moat & Margin Strategist',
                desc: 'Complete the AI Product Strategy & Growth Track.',
                unlocked: strategyDone,
                progress: `${strategyItems.filter((l) => completedSet.has(l.slug)).length}/${strategyItems.length}`,
                icon: 'ai-product-strategy' as const,
              },
              {
                id: 'tech-architect',
                title: 'Valhalla Evals & RAG Architect',
                desc: 'Complete the Technical AI PM: Evals, RAG & Agents Track.',
                unlocked: techDone,
                progress: `${techItems.filter((l) => completedSet.has(l.slug)).length}/${techItems.length}`,
                icon: 'technical-ai-pm' as const,
              },
            ];

            return badges.map((b) => (
              <div
                key={b.id}
                className={`flex items-start gap-3.5 rounded-xl border p-4 transition ${
                  b.unlocked
                    ? 'border-amber-300 bg-amber-50/50 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/60 opacity-80'
                }`}
              >
                <div className="shrink-0">
                  {b.icon === 'foundations' ||
                  b.icon === 'ai-product-strategy' ||
                  b.icon === 'technical-ai-pm' ? (
                    <div className={b.unlocked ? '' : 'grayscale opacity-50'}>
                      <PathCrestIcon slug={b.icon} size={44} />
                    </div>
                  ) : (
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${
                        b.unlocked
                          ? 'border-amber-500 bg-amber-100 text-amber-800'
                          : 'border-slate-300 bg-slate-100 text-slate-400'
                      }`}
                    >
                      {b.icon === 'compass' ? (
                        <Compass className="h-5 w-5" />
                      ) : b.icon === 'spark' ? (
                        <Sparkles className="h-5 w-5" />
                      ) : (
                        <ShieldCheck className="h-5 w-5" />
                      )}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-bold text-slate-900">{b.title}</div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                        b.unlocked
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {b.unlocked ? 'UNLOCKED' : b.progress}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{b.desc}</p>
                </div>
              </div>
            ));
          })()}
        </div>
      </section>

      {/* Saved Project Portfolio */}
      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your AI PM Project Portfolio</h2>
            <p className="mt-1 text-xs text-slate-500">
              Complete all {projectItems.length} hands-on projects to build a tangible proof-of-work
              portfolio for interviews.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {projectItems.map((proj) => {
            const sub = hydrated ? projectSubmissions[proj.slug] : undefined;
            const isDone = completedSet.has(proj.slug);

            return (
              <div
                key={proj.slug}
                className="flex flex-col justify-between rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                      <Wrench className="h-3.5 w-3.5" /> {proj.duration}
                    </span>
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </span>
                    ) : sub ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        Draft Saved
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                        Not Started
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-slate-900">{proj.title}</h3>
                  <p className="mt-1 text-xs text-slate-600">{proj.summary}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <Link
                    href={`/lessons/${proj.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    {sub ? 'Edit Artifact' : 'Start Project'}
                  </Link>

                  {sub?.portfolioUrl && (
                    <a
                      href={sub.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      External Link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bookmarked Modules & Personal Study Notes */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">Bookmarked Modules</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Quickly revisit modules you starred for interview review or deep study.
          </p>

          {hydrated && bookmarkedLessons.length > 0 ? (
            <div className="mt-4 space-y-2">
              {bookmarkedLessons.map((slug) => {
                const item = getLessonBySlug(slug);
                if (!item) return null;
                return (
                  <div
                    key={slug}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-xs"
                  >
                    <Link
                      href={`/lessons/${item.slug}`}
                      className="font-bold text-slate-900 hover:text-amber-700"
                    >
                      {item.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleBookmarkLesson(slug)}
                      className="shrink-0 text-[11px] font-medium text-slate-400 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-500">
              No bookmarks yet. Click the <strong>Bookmark</strong> button inside any lesson header
              to save it here.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-teal-700" />
            <h2 className="text-lg font-bold text-slate-900">Saved Study Notes</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Personal notes written in lesson scratchpads (included automatically in your Dossier
            export).
          </p>

          {hydrated &&
          Object.entries(lessonNotes).filter(([, txt]) => txt.trim().length > 0).length > 0 ? (
            <div className="mt-4 space-y-2.5">
              {Object.entries(lessonNotes)
                .filter(([, txt]) => txt.trim().length > 0)
                .map(([slug, note]) => {
                  const item = getLessonBySlug(slug);
                  return (
                    <Link
                      key={slug}
                      href={`/lessons/${slug}`}
                      className="block rounded-xl border border-slate-200 p-3 transition hover:border-amber-300 hover:bg-amber-50/30"
                    >
                      <div className="text-xs font-bold text-slate-900">
                        {item?.title ?? slug}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">{note}</p>
                    </Link>
                  );
                })}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-500">
              No study notes saved yet. Capture takeaways in any lesson&apos;s{' '}
              <strong>Personal Study Notes</strong> box.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
