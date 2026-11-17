'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  ClipboardList,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  MessageSquareQuote,
  NotebookPen,
  Sparkles,
  Wrench,
  Save,
  Compass,
  Maximize2,
  Minimize2,
  Building2,
  ListChecks,
} from 'lucide-react';
import {
  getAdjacentLessons,
  getCourseById,
  getLessonsForCourse,
  getNextCrossPathLesson,
  getPathBySlug,
  type LessonItem,
} from '@/data/catalog';
import { useProgress } from '@/context/ProgressContext';
import { InteractiveLab } from '@/components/InteractiveLabs';
import { ArchitectureFlowDiagram } from '@/components/Graphics';

function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-slate-800"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

/** Accept "github.com/me/repo" by adding https://; only http(s) links are stored. */
function normalizePortfolioUrl(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : `https://${value.replace(/^\/+/, '')}`;
}

export function LessonReader({ lesson }: { lesson: LessonItem }) {

  const {
    completedLessons,
    toggleLessonComplete,
    markLessonComplete,
    quizScores,
    saveQuizResult,
    projectSubmissions,
    saveProjectSubmission,
    setLastVisitedLesson,
    lessonNotes,
    saveLessonNote,
    bookmarkedLessons,
    toggleBookmarkLesson,
    hydrated,
  } = useProgress();

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Course outline & Odin pedagogical toggles
  const [showCourseOutline, setShowCourseOutline] = useState(false);
  const [showAssignmentExemplar, setShowAssignmentExemplar] = useState(false);
  const [showProjectExemplar, setShowProjectExemplar] = useState(false);
  const [copiedExemplar, setCopiedExemplar] = useState(false);
  const [openReflections, setOpenReflections] = useState<Record<number, boolean>>({});

  // Project workbench state
  const [draftContent, setDraftContent] = useState('');
  const [checkedDeliverables, setCheckedDeliverables] = useState<string[]>([]);
  const [checkedRubric, setCheckedRubric] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Personal study notes scratchpad
  const [noteText, setNoteText] = useState('');
  const [noteNotice, setNoteNotice] = useState<string | null>(null);

  const [readingPct, setReadingPct] = useState(0);
  const [celebrateBanner, setCelebrateBanner] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedCheatSheet, setCopiedCheatSheet] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setReadingPct(0);
        return;
      }
      setReadingPct(Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100))));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setLastVisitedLesson(lesson.slug);
    setShowAssignmentExemplar(false);
    setShowProjectExemplar(false);
    setOpenReflections({});
  }, [lesson, setLastVisitedLesson]);

  useEffect(() => {
    if (!hydrated) return;
    const savedQuiz = quizScores[lesson.slug];
    if (savedQuiz) {
      setSelectedAnswers(savedQuiz.selectedAnswers);
      setQuizSubmitted(true);
    } else {
      setSelectedAnswers({});
      setQuizSubmitted(false);
    }

    const savedProject = projectSubmissions[lesson.slug];
    if (savedProject) {
      setDraftContent(savedProject.content);
      setCheckedDeliverables(savedProject.checkedDeliverables);
      setCheckedRubric(savedProject.checkedRubric);
      setPortfolioUrl(savedProject.portfolioUrl ?? '');
    } else if (lesson.projectBrief) {
      setDraftContent(lesson.projectBrief.starterMarkdown);
      setCheckedDeliverables([]);
      setCheckedRubric([]);
      setPortfolioUrl('');
    }

    setNoteText(lessonNotes[lesson.slug] ?? '');
  }, [lesson, hydrated, quizScores, projectSubmissions, lessonNotes]);

  const path = getPathBySlug(lesson.pathSlug);
  const course = getCourseById(lesson.courseId);
  const courseLessons = course ? getLessonsForCourse(course.id) : [];
  const completedSet = new Set(hydrated ? completedLessons : []);
  const courseDone = courseLessons.filter((item) => completedSet.has(item.slug)).length;

  const { prev, next } = getAdjacentLessons(lesson.slug);
  const crossPathNext = !next ? getNextCrossPathLesson(lesson.slug) : null;
  const isCompleted = hydrated && completedSet.has(lesson.slug);
  const isBookmarked = hydrated && bookmarkedLessons.includes(lesson.slug);

  const handleQuizSubmit = () => {
    if (lesson.quiz.length === 0) return;
    let score = 0;
    lesson.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) score += 1;
    });
    setQuizSubmitted(true);
    saveQuizResult(lesson.slug, selectedAnswers, score, lesson.quiz.length);
  };

  const handleSaveProject = (alsoComplete = false) => {
    saveProjectSubmission(lesson.slug, {
      content: draftContent,
      checkedDeliverables,
      checkedRubric,
      portfolioUrl: normalizePortfolioUrl(portfolioUrl),
    });
    if (alsoComplete) {
      markLessonComplete(lesson.slug);
    }
    setSaveNotice(
      alsoComplete
        ? 'Project saved to your portfolio & marked complete!'
        : 'Draft saved to your local portfolio.'
    );
    setTimeout(() => setSaveNotice(null), 2800);
  };

  const handleDownloadMarkdown = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveNote = () => {
    saveLessonNote(lesson.slug, noteText);
    setNoteNotice(noteText.trim() ? 'Study note saved to your dashboard.' : 'Study note cleared.');
    setTimeout(() => setNoteNotice(null), 2500);
  };

  const handleCopyExemplar = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedExemplar(true);
      setTimeout(() => setCopiedExemplar(false), 1800);
    } catch {
      // Ignore restricted clipboard environments
    }
  };

  const handleCopyCode = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 1800);
    } catch {
      // Ignore restricted clipboard environments
    }
  };

  const handleCopyCheatSheet = async () => {
    const md = [
      `# ${lesson.title}`,
      `Track: ${path?.title ?? lesson.pathSlug} | Course: ${course?.title ?? ''}`,
      '',
      `## Summary`,
      lesson.summary,
      '',
      `## Learning Outcomes`,
      ...lesson.learningOutcomes.map((o) => `- ${o}`),
      ...(lesson.keyTakeaways && lesson.keyTakeaways.length > 0
        ? ['', '## Key Takeaways', ...lesson.keyTakeaways.map((t) => `- ${t}`)]
        : []),
      ...(lesson.realWorldCaseStudy
        ? [
            '',
            `## Case Study: ${lesson.realWorldCaseStudy.company}`,
            `- Surface: ${lesson.realWorldCaseStudy.productSurface}`,
            `- Architecture: ${lesson.realWorldCaseStudy.architectureHighlight}`,
            `- PM Takeaway: ${lesson.realWorldCaseStudy.pmTakeaway}`,
          ]
        : []),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(md);
      setCopiedCheatSheet(true);
      setTimeout(() => setCopiedCheatSheet(false), 2000);
    } catch {
      // Ignore restricted clipboard environments
    }
  };

  const toggleItem = (list: string[], setList: (next: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const handleToggleComplete = () => {
    const nextDone = !isCompleted;
    toggleLessonComplete(lesson.slug);
    if (nextDone) {
      setCelebrateBanner(true);
      setTimeout(() => setCelebrateBanner(false), 4500);
    }
  };

  return (
    <div
      className={`mx-auto px-4 py-8 sm:px-6 sm:py-10 ${
        focusMode ? 'max-w-4xl' : 'max-w-6xl'
      }`}
    >
      {/* Top Sticky Reading Scroll Progress Bar */}
      <div className="fixed top-16 right-0 left-0 z-30 h-1 bg-slate-200/70">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-teal-500 to-emerald-500 transition-all duration-150"
          style={{ width: `${readingPct}%` }}
        />
      </div>

      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/paths" className="hover:text-slate-900">
            Paths
          </Link>
          <span>/</span>
          {path && (
            <>
              <Link href={`/paths/${path.slug}`} className="hover:text-slate-900">
                {path.shortTitle}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="font-medium text-slate-800">{course?.subtitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFocusMode((v) => !v)}
            className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 lg:inline-flex"
            title="Toggle distraction-free Focus Reading Mode"
          >
            {focusMode ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" /> Show Outline Rail
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" /> Focus Mode
              </>
            )}
          </button>

          {course && courseLessons.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCourseOutline((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span>
                Course Outline ({courseDone}/{courseLessons.length})
              </span>
              {showCourseOutline ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Course Syllabus Drawer */}
      {showCourseOutline && course && (
        <div className="animate-odin-fade-up mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-900">
            {course.subtitle}: {course.title}
          </div>
          <div className="mt-2.5 space-y-1.5">
            {courseLessons.map((item) => {
              const active = item.slug === lesson.slug;
              const done = completedSet.has(item.slug);
              return (
                <Link
                  key={item.slug}
                  href={`/lessons/${item.slug}`}
                  onClick={() => setShowCourseOutline(false)}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-xs transition ${
                    active
                      ? 'border-amber-400 bg-amber-50/70 font-bold text-slate-900'
                      : 'border-slate-100 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-slate-300" />
                    )}
                    <span className="truncate">{item.title}</span>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-slate-500">
                    {item.type === 'project' ? 'Project' : item.duration}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className={focusMode ? 'mt-4' : 'mt-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8'}>
        <div className={focusMode ? '' : 'min-w-0 lg:col-span-8'}>

      {/* Header */}
      <header className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {lesson.type === 'project' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                <Wrench className="h-3.5 w-3.5" /> Hands-On Project
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                <BookOpen className="h-3.5 w-3.5" /> Curriculum Lesson
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              <Clock className="h-3.5 w-3.5" /> {lesson.duration}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {lesson.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleBookmarkLesson(lesson.slug)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                isBookmarked
                  ? 'border-amber-300 bg-amber-50 text-amber-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark for review'}
              aria-label="Toggle bookmark"
            >
              <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-600' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleComplete}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                isCompleted
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {isCompleted ? 'Completed' : 'Mark Complete'}
            </button>
          </div>
        </div>

        {celebrateBanner && (
          <div className="animate-odin-fade-up mt-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>
                Module logged! Your 7-pillar AI PM radar &amp; dashboard progress updated.
              </span>
            </div>
            {next ? (
              <Link href={`/lessons/${next.slug}`} className="underline hover:text-emerald-950">
                Next Module →
              </Link>
            ) : crossPathNext ? (
              <Link
                href={`/lessons/${crossPathNext.lesson.slug}`}
                className="underline hover:text-emerald-950"
              >
                Start {crossPathNext.path.shortTitle} →
              </Link>
            ) : null}
          </div>
        )}

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {lesson.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{lesson.summary}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {lesson.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Learning Outcomes */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="text-xs font-bold tracking-wider text-slate-700 uppercase">
            Learning Outcomes
          </div>
          <ul className="mt-2.5 space-y-2">
            {lesson.learningOutcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{renderInlineFormatting(outcome)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Section Jump Pills */}
        {lesson.sections.length > 1 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Jump to:
            </span>
            {lesson.sections.map((sec, idx) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
              >
                {idx + 1}. {sec.heading}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* Topic-Aware Interactive Architecture Diagram */}
      <div id="overview" className="scroll-mt-24 mt-8">
        <ArchitectureFlowDiagram lessonSlug={lesson.slug} />
      </div>

      {/* Real-World Production Case Study Spotlight */}
      {lesson.realWorldCaseStudy && (
        <section
          id="case-study"
          className="scroll-mt-24 mt-6 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 p-5 shadow-xs sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-indigo-800 uppercase">
              <Building2 className="h-4 w-4" /> Real-World Case Study · {lesson.realWorldCaseStudy.company}
            </div>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-800">
              {lesson.realWorldCaseStudy.productSurface}
            </span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-indigo-100 bg-white p-3.5 text-xs leading-relaxed text-slate-700">
              <div className="text-[11px] font-bold text-slate-900 uppercase">
                Architecture Pattern
              </div>
              <p className="mt-1">{lesson.realWorldCaseStudy.architectureHighlight}</p>
            </div>
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 text-xs leading-relaxed text-amber-950">
              <div className="text-[11px] font-bold text-amber-900 uppercase">
                PM Principle to Apply
              </div>
              <p className="mt-1">{lesson.realWorldCaseStudy.pmTakeaway}</p>
            </div>
          </div>
        </section>
      )}

      {/* Executive Key Takeaways */}
      {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
        <section
          id="key-takeaways"
          className="scroll-mt-24 mt-6 rounded-2xl border border-emerald-200/90 bg-emerald-50/40 p-5 shadow-xs"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-900 uppercase">
            <ListChecks className="h-4 w-4 text-emerald-700" /> Executive Key Takeaways
          </div>
          <ul className="mt-2.5 space-y-2">
            {lesson.keyTakeaways.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-800 sm:text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{renderInlineFormatting(point)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Main Content Sections */}
      <article className="mt-8 space-y-8">
        {lesson.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
          >
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{section.heading}</h2>

            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700 sm:text-[15px]">
              {section.paragraphs.map((p, idx) => (
                <p key={idx}>{renderInlineFormatting(p)}</p>
              ))}
            </div>

            {section.bulletPoints && (
              <div className="mt-5 space-y-3">
                {section.bulletPoints.map((bp) => (
                  <div
                    key={bp.title}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="text-sm font-bold text-slate-900">{bp.title}</div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {renderInlineFormatting(bp.description)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {section.table && (
              <div tabIndex={0} role="region" aria-label="Scrollable table" className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-800">
                    <tr>
                      {section.table.headers.map((h) => (
                        <th key={h} className="px-4 py-3 font-bold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {section.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/70">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`px-4 py-3 align-top leading-relaxed ${
                              cIdx === 0 ? 'font-semibold text-slate-900' : 'text-slate-600'
                            }`}
                          >
                            {renderInlineFormatting(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {section.codeExample && (
              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">
                      {section.codeExample.label}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600 uppercase">
                      {section.codeExample.language}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCode(section.id, section.codeExample?.code ?? '')
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {copiedCodeId === section.id ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copiedCodeId === section.id ? 'Copied' : 'Copy Code'}
                  </button>
                </div>
                <pre tabIndex={0} className="overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-100">
                  {section.codeExample.code}
                </pre>
              </div>
            )}

            {section.callout && (
              <div
                className={`mt-5 rounded-xl border p-4 ${
                  section.callout.tone === 'warning'
                    ? 'border-rose-200 bg-rose-50/70 text-rose-950'
                    : section.callout.tone === 'tip'
                    ? 'border-teal-200 bg-teal-50/70 text-teal-950'
                    : section.callout.tone === 'mental-model'
                    ? 'border-indigo-200 bg-indigo-50/70 text-indigo-950'
                    : 'border-amber-200 bg-amber-50/70 text-amber-950'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {section.callout.tone === 'warning' ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  ) : section.callout.tone === 'tip' ? (
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                  ) : section.callout.tone === 'mental-model' ? (
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-700" />
                  ) : (
                    <Compass className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  )}
                  <div>
                    <div className="text-sm font-bold">{section.callout.title}</div>
                    <p className="mt-1 text-sm leading-relaxed opacity-90">
                      {renderInlineFormatting(section.callout.body)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        ))}
      </article>

      {/* Embedded Interactive Lab */}
      {lesson.interactiveLabId && (
        <section id="interactive-lab" className="scroll-mt-24 mt-10">
          <InteractiveLab labId={lesson.interactiveLabId} />
        </section>
      )}

      {/* Odin-Style Hands-On Assignment */}
      {lesson.assignment && (
        <section
          id="odin-assignment"
          className="scroll-mt-24 mt-10 rounded-3xl border border-amber-200 bg-white p-6 shadow-xs sm:p-8"
        >
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-700 uppercase">
            <ClipboardList className="h-4 w-4" /> Odin Hands-On Assignment
          </div>
          <h2 className="mt-2 text-xl font-extrabold text-slate-900 sm:text-2xl">
            {lesson.assignment.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {renderInlineFormatting(lesson.assignment.scenario)}
          </p>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-bold text-slate-800 uppercase">Action Steps</div>
            <ol className="mt-2.5 list-decimal space-y-2 pl-5 text-sm text-slate-700">
              {lesson.assignment.steps.map((step) => (
                <li key={step}>{renderInlineFormatting(step)}</li>
              ))}
            </ol>
            <div className="mt-4 border-t border-slate-200 pt-3 text-xs font-semibold text-slate-800">
              Target Deliverable: <span className="font-normal text-slate-600">{lesson.assignment.deliverable}</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowAssignmentExemplar((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
            >
              <Eye className="h-4 w-4" />
              {showAssignmentExemplar
                ? 'Hide Staff AI PM Exemplar Solution'
                : 'Reveal Staff AI PM Exemplar Solution'}
            </button>

            {showAssignmentExemplar && (
              <div className="animate-odin-fade-up mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs leading-relaxed text-slate-800 sm:text-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold text-emerald-900 uppercase text-[11px] tracking-wider">
                    Staff AI PM Benchmark Solution
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyExemplar(lesson.assignment?.exemplarSolution ?? '')}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50"
                  >
                    {copiedExemplar ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedExemplar ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="whitespace-pre-wrap font-sans">
                  {lesson.assignment.exemplarSolution}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Project Brief & Interactive Portfolio Workbench */}
      {lesson.type === 'project' && lesson.projectBrief && (
        <section
          id="project-workbench"
          className="scroll-mt-24 mt-10 rounded-3xl border border-amber-200 bg-white p-6 shadow-xs sm:p-8"
        >
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-700 uppercase">
            <Wrench className="h-4 w-4" /> Project Brief &amp; Portfolio Workbench
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Assignment Specification</h2>

          <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div>
              <span className="font-bold text-slate-900">Your Role: </span>
              {lesson.projectBrief.role}
            </div>
            <div>
              <span className="font-bold text-slate-900">Scenario: </span>
              {lesson.projectBrief.scenario}
            </div>
            <div>
              <div className="font-bold text-slate-900">Hard Constraints:</div>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs sm:text-sm">
                {lesson.projectBrief.constraints.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {lesson.projectDeliverables && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                Required Deliverables Checklist
              </h3>
              <div className="mt-3 space-y-2">
                {lesson.projectDeliverables.map((d) => {
                  const checked = checkedDeliverables.includes(d.id);
                  return (
                    <label
                      key={d.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm transition hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          toggleItem(checkedDeliverables, setCheckedDeliverables, d.id)
                        }
                        className="mt-1 h-4 w-4 accent-amber-600"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{d.title}</div>
                        <div className="text-xs text-slate-600">{d.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {lesson.rubricCriteria && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                Self-Grading Quality Rubric
              </h3>
              <div className="mt-3 space-y-2">
                {lesson.rubricCriteria.map((r) => {
                  const checked = checkedRubric.includes(r.id);
                  return (
                    <label
                      key={r.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3 text-sm transition hover:bg-emerald-50/70"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItem(checkedRubric, setCheckedRubric, r.id)}
                        className="mt-1 h-4 w-4 accent-emerald-600"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{r.criterion}</div>
                        <div className="text-xs text-slate-600">
                          <strong>Pass Bar:</strong> {r.bar}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Markdown Workbench Editor */}
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="project-draft" className="text-sm font-bold text-slate-900">
                Your Solution Artifact (Markdown)
              </label>
              <button
                type="button"
                onClick={() => handleDownloadMarkdown(draftContent, `${lesson.slug}.md`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" /> Export .md
              </button>
            </div>
            <textarea
              id="project-draft"
              rows={14}
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-100 outline-none focus:border-amber-500"
            />

            <div className="mt-3">
              <label htmlFor="project-link" className="text-xs font-semibold text-slate-600">
                Optional External Link (Notion / GitHub / Google Doc URL)
              </label>
              <input
                id="project-link"
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/you/ai-pm-portfolio/..."
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-amber-500"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleSaveProject(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
              >
                <Save className="h-4 w-4" /> Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSaveProject(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-800"
              >
                <CheckCircle2 className="h-4 w-4" /> Submit to Portfolio &amp; Mark Complete
              </button>
              {saveNotice && (
                <span className="text-xs font-semibold text-emerald-700">{saveNotice}</span>
              )}
            </div>
          </div>

          {/* Staff AI PM Reference Artifact Benchmark */}
          {lesson.projectBrief.exemplarArtifact && (
            <div className="mt-6 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={() => setShowProjectExemplar((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-900 transition hover:bg-indigo-100"
              >
                <Eye className="h-4 w-4" />
                {showProjectExemplar
                  ? 'Hide Staff AI PM Reference Artifact'
                  : 'View Staff AI PM Reference Artifact (Benchmark After Drafting)'}
              </button>

              {showProjectExemplar && (
                <div className="animate-odin-fade-up mt-3 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-slate-100">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <span className="font-mono text-[11px] font-bold text-amber-300">
                      GOLD-STANDARD REFERENCE SOLUTION
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyExemplar(lesson.projectBrief?.exemplarArtifact ?? '')
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-800"
                      >
                        {copiedExemplar ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copiedExemplar ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (lesson.projectBrief?.exemplarArtifact) {
                            setDraftContent(lesson.projectBrief.exemplarArtifact);
                            setSaveNotice('Reference loaded into editor — customize it as your own!');
                            setTimeout(() => setSaveNotice(null), 3000);
                          }
                        }}
                        className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500"
                      >
                        Load Into Workbench
                      </button>
                    </div>
                  </div>
                  <pre tabIndex={0} className="max-h-96 overflow-auto font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-200">
                    {lesson.projectBrief.exemplarArtifact}
                  </pre>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Odin-Style Reflective Knowledge Check */}
      {lesson.reflectionQuestions && lesson.reflectionQuestions.length > 0 && (
        <section
          id="reflections"
          className="scroll-mt-24 mt-10 rounded-3xl border border-indigo-200/80 bg-white p-6 shadow-xs sm:p-8"
        >
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-indigo-700 uppercase">
            <MessageSquareQuote className="h-4 w-4" /> Think &amp; Articulate · Interview Readiness Check
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Can You Explain This Out Loud Without Looking?
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Just like The Odin Project&apos;s Knowledge Checks, try answering each prompt in your own
            words before clicking to verify against the Staff AI PM benchmark.
          </p>

          <div className="mt-4 space-y-3">
            {lesson.reflectionQuestions.map((rq, idx) => {
              const open = Boolean(openReflections[idx]);
              return (
                <div
                  key={rq.question}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenReflections((prev) => ({ ...prev, [idx]: !prev[idx] }))
                    }
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-bold text-slate-900 transition hover:bg-slate-100/70"
                  >
                    <span>
                      {idx + 1}. {rq.question}
                    </span>
                    {open ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                    )}
                  </button>
                  {open && (
                    <div className="border-t border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700">
                      <span className="font-semibold text-indigo-700">Staff AI PM Takeaway: </span>
                      {renderInlineFormatting(rq.answer)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Knowledge Check Quiz */}
      {lesson.quiz.length > 0 && (
        <section
          id="quiz-section"
          className="scroll-mt-24 mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
        >
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-teal-700 uppercase">
            <HelpCircle className="h-4 w-4" /> Knowledge Check
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Test Your AI PM Judgment
          </h2>

          <div className="mt-6 space-y-6">
            {lesson.quiz.map((q, qIdx) => {
              const chosen = selectedAnswers[q.id];
              return (
                <div key={q.id} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <div className="text-sm font-bold text-slate-900">
                    {qIdx + 1}. {q.question}
                  </div>
                  <div className="mt-3 space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = chosen === optIdx;
                      const isCorrect = q.correctIndex === optIdx;
                      let optionStyle = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
                      if (quizSubmitted) {
                        if (isCorrect) {
                          optionStyle = 'border-emerald-300 bg-emerald-50 text-emerald-950 font-medium';
                        } else if (isChosen && !isCorrect) {
                          optionStyle = 'border-rose-300 bg-rose-50 text-rose-950';
                        }
                      } else if (isChosen) {
                        optionStyle = 'border-amber-500 bg-amber-50/70 text-slate-900 font-medium';
                      }

                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                            if (quizSubmitted) setQuizSubmitted(false);
                          }}
                          className={`flex w-full items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-xs leading-relaxed transition sm:text-sm ${optionStyle}`}
                        >
                          <span className="mt-0.5 font-mono font-bold">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                      <strong
                        className={
                          chosen === q.correctIndex ? 'text-emerald-700' : 'text-rose-700'
                        }
                      >
                        {chosen === q.correctIndex ? 'Correct: ' : 'Explanation: '}
                      </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleQuizSubmit}
              disabled={Object.keys(selectedAnswers).length < lesson.quiz.length}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Check Answers
            </button>
            {quizSubmitted && (
              <span className="text-xs font-semibold text-slate-700">
                Score:{' '}
                {
                  lesson.quiz.filter((q) => selectedAnswers[q.id] === q.correctIndex)
                    .length
                }{' '}
                / {lesson.quiz.length}
              </span>
            )}
          </div>
        </section>
      )}

      {/* Personal Study Notes Scratchpad */}
      <section
        id="study-notes"
        className="scroll-mt-24 mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-600 uppercase">
              <NotebookPen className="h-3.5 w-3.5 text-amber-700" /> Personal Study Notes
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Jot takeaways, interview stories, or examples from this module. Saved to your Dashboard
              &amp; Portfolio Dossier.
            </p>
          </div>
          {noteText.trim().length > 0 && (
            <button
              type="button"
              onClick={() => handleDownloadMarkdown(noteText, `${lesson.slug}-notes.md`)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" /> Export Note .md
            </button>
          )}
        </div>

        <textarea
          aria-label="Personal study notes for this lesson"
          rows={4}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Capture mental models, how this applies to your product, or interview talking points..."
          className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs leading-relaxed text-slate-800 outline-none focus:border-amber-500 focus:bg-white sm:text-sm"
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveNote}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50"
          >
            <Save className="h-3.5 w-3.5" /> Save Note
          </button>
          {noteNotice && <span className="text-xs font-semibold text-emerald-700">{noteNotice}</span>}
        </div>
      </section>

      {/* Curated Additional Resources */}
      {lesson.resources.length > 0 && (
        <section
          id="reading-docs"
          className="scroll-mt-24 mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
        >
          <h2 className="text-base font-bold text-slate-900">Additional Reading &amp; Engineering Docs</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {lesson.resources.map((res) => {
              const isInternal = res.url.startsWith('/');
              if (isInternal) {
                return (
                  <Link
                    key={res.url + res.title}
                    href={res.url}
                    className="group rounded-xl border border-slate-200 p-3.5 transition hover:border-amber-300 hover:bg-amber-50/30"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-amber-700">
                      <span>
                        {res.kind} · {res.source}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-700" />
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900">{res.title}</div>
                    <p className="mt-1 text-xs text-slate-600">{res.description}</p>
                  </Link>
                );
              }
              return (
                <a
                  key={res.url + res.title}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-slate-200 p-3.5 transition hover:border-amber-300 hover:bg-amber-50/30"
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-amber-700">
                    <span>
                      {res.kind} · {res.source}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-700" />
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{res.title}</div>
                  <p className="mt-1 text-xs text-slate-600">{res.description}</p>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Bottom Odin Navigation Controls */}
      <div className="mt-10 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center">
        {prev ? (
          <Link
            href={`/lessons/${prev.slug}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="max-w-[190px] truncate">{prev.title}</span>
          </Link>
        ) : (
          <Link
            href={path ? `/paths/${path.slug}` : '/paths'}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Path Overview
          </Link>
        )}

        <button
          type="button"
          onClick={handleToggleComplete}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
            isCompleted
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-amber-700 text-white hover:bg-amber-700'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {isCompleted ? 'Completed' : 'Mark Complete & Continue'}
        </button>

        {next ? (
          <Link
            href={`/lessons/${next.slug}`}
            className="inline-flex items-center justify-end gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span className="max-w-[190px] truncate">{next.title}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : crossPathNext ? (
          <Link
            href={`/lessons/${crossPathNext.lesson.slug}`}
            className="inline-flex items-center justify-end gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-800 hover:bg-teal-100"
          >
            <span>Next Track: {crossPathNext.path.shortTitle}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-end gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
        </div>

        {/* Sticky Right Rail (Hidden in Focus Mode & Mobile) */}
        {!focusMode && (
          <aside className="hidden lg:sticky lg:top-24 lg:col-span-4 lg:block space-y-5">
            {/* Module Mastery & Quick Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Module Status
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {isCompleted ? 'Completed' : `${readingPct}% Scrolled`}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Quiz Mastery</span>
                  <span className="font-mono font-bold text-slate-900">
                    {hydrated && quizScores[lesson.slug]
                      ? `${quizScores[lesson.slug].score}/${quizScores[lesson.slug].total}`
                      : `0/${lesson.quiz.length} answered`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Course Progress</span>
                  <span className="font-mono font-bold text-slate-900">
                    {courseDone}/{courseLessons.length}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleToggleComplete}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    isCompleted
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {isCompleted ? 'Module Completed' : 'Mark Module Complete'}
                </button>
                <button
                  type="button"
                  onClick={handleCopyCheatSheet}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
                >
                  {copiedCheatSheet ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedCheatSheet ? 'Cheat-Sheet Copied!' : 'Copy Module Cheat-Sheet (.md)'}
                </button>
              </div>
            </div>

            {/* On This Page Jump Outline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                On This Page
              </div>
              <nav className="mt-3 space-y-1 text-xs">
                <a
                  href="#overview"
                  className="block rounded-lg px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                >
                  System Architecture Diagram
                </a>
                {lesson.realWorldCaseStudy && (
                  <a
                    href="#case-study"
                    className="block rounded-lg px-2.5 py-1.5 font-medium text-indigo-700 hover:bg-indigo-50"
                  >
                    Case Study: {lesson.realWorldCaseStudy.company}
                  </a>
                )}
                {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
                  <a
                    href="#key-takeaways"
                    className="block rounded-lg px-2.5 py-1.5 font-medium text-emerald-800 hover:bg-emerald-50"
                  >
                    Executive Key Takeaways
                  </a>
                )}
                {lesson.sections.map((sec, idx) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block truncate rounded-lg px-2.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    {idx + 1}. {sec.heading}
                  </a>
                ))}
                {lesson.interactiveLabId && (
                  <a
                    href="#interactive-lab"
                    className="block rounded-lg px-2.5 py-1.5 font-semibold text-indigo-700 hover:bg-indigo-50"
                  >
                    Interactive AI PM Simulator
                  </a>
                )}
                {lesson.assignment && (
                  <a
                    href="#odin-assignment"
                    className="block rounded-lg px-2.5 py-1.5 font-semibold text-amber-800 hover:bg-amber-50"
                  >
                    Odin Hands-On Assignment
                  </a>
                )}
                {lesson.type === 'project' && lesson.projectBrief && (
                  <a
                    href="#project-workbench"
                    className="block rounded-lg px-2.5 py-1.5 font-semibold text-amber-800 hover:bg-amber-50"
                  >
                    Project Workbench &amp; Rubric
                  </a>
                )}
                {lesson.reflectionQuestions && lesson.reflectionQuestions.length > 0 && (
                  <a
                    href="#reflections"
                    className="block rounded-lg px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Interview Reflection Check
                  </a>
                )}
                {lesson.quiz.length > 0 && (
                  <a
                    href="#quiz-section"
                    className="block rounded-lg px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Knowledge Quiz ({lesson.quiz.length})
                  </a>
                )}
                <a
                  href="#study-notes"
                  className="block rounded-lg px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                >
                  Personal Study Notes
                </a>
                {lesson.resources.length > 0 && (
                  <a
                    href="#reading-docs"
                    className="block rounded-lg px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Additional Reading Docs
                  </a>
                )}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
