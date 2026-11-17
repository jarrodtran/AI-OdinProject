// Shared progress model used by both the browser (ProgressContext) and the
// /api/progress route. Keep this file free of heavy imports: the caller passes
// in the set of valid lesson slugs so the curriculum is not pulled in here.

export type PathSlug = 'foundations' | 'ai-product-strategy' | 'technical-ai-pm';

export const PATH_SLUGS: readonly PathSlug[] = [
  'foundations',
  'ai-product-strategy',
  'technical-ai-pm',
];

export interface QuizAttempt {
  selectedAnswers: Record<string, number>;
  score: number;
  total: number;
  passedAt: string;
}

export interface ProjectSubmission {
  content: string;
  checkedDeliverables: string[];
  checkedRubric: string[];
  savedAt: string;
  portfolioUrl?: string;
}

export interface ProgressState {
  completedLessons: string[];
  activePathSlug: PathSlug;
  quizScores: Record<string, QuizAttempt>;
  projectSubmissions: Record<string, ProjectSubmission>;
  lastVisitedLessonSlug: string | null;
  lessonNotes: Record<string, string>;
  bookmarkedLessons: string[];
}

export const DEFAULT_PROGRESS_STATE: ProgressState = {
  completedLessons: [],
  activePathSlug: 'foundations',
  quizScores: {},
  projectSubmissions: {},
  lastVisitedLessonSlug: null,
  lessonNotes: {},
  bookmarkedLessons: [],
};

/** Hard limits so a single record can't grow without bound. */
export const LIMITS = {
  noteChars: 20_000,
  projectChars: 60_000,
  urlChars: 500,
  checklistItems: 50,
  idChars: 80,
  quizAnswers: 50,
  /** Max serialized request body accepted by the API, in bytes. */
  requestBytes: 512 * 1024,
} as const;

type SlugCheck = (slug: string) => boolean;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isIsoDate = (v: unknown): v is string =>
  typeof v === 'string' && v.length <= 40 && !Number.isNaN(Date.parse(v));

const clampString = (v: unknown, max: number): string | null =>
  typeof v === 'string' ? v.slice(0, max) : null;

function slugList(v: unknown, isValid: SlugCheck): string[] {
  if (!Array.isArray(v)) return [];
  return Array.from(new Set(v.filter((s): s is string => typeof s === 'string' && isValid(s))));
}

function idList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return Array.from(
    new Set(
      v.filter((s): s is string => typeof s === 'string' && s.length > 0 && s.length <= LIMITS.idChars)
    )
  ).slice(0, LIMITS.checklistItems);
}

function sanitizeQuiz(v: unknown): QuizAttempt | null {
  if (!isRecord(v)) return null;
  const { score, total, passedAt, selectedAnswers } = v;
  if (typeof score !== 'number' || typeof total !== 'number' || !isIsoDate(passedAt)) return null;
  if (!Number.isFinite(score) || !Number.isFinite(total) || total < 0 || score < 0 || score > total) {
    return null;
  }
  const answers: Record<string, number> = {};
  if (isRecord(selectedAnswers)) {
    for (const [k, a] of Object.entries(selectedAnswers).slice(0, LIMITS.quizAnswers)) {
      if (k.length <= LIMITS.idChars && typeof a === 'number' && Number.isInteger(a) && a >= 0 && a < 20) {
        answers[k] = a;
      }
    }
  }
  return { selectedAnswers: answers, score, total, passedAt };
}

function sanitizeSubmission(v: unknown): ProjectSubmission | null {
  if (!isRecord(v) || !isIsoDate(v.savedAt)) return null;
  const content = clampString(v.content, LIMITS.projectChars) ?? '';
  const url = clampString(v.portfolioUrl, LIMITS.urlChars);
  const sub: ProjectSubmission = {
    content,
    checkedDeliverables: idList(v.checkedDeliverables),
    checkedRubric: idList(v.checkedRubric),
    savedAt: v.savedAt,
  };
  // Only keep http(s) links so the dashboard never renders a javascript: href.
  if (url && /^https?:\/\//i.test(url.trim())) sub.portfolioUrl = url.trim();
  return sub;
}

/**
 * Turn untrusted input (localStorage, an imported backup, or an API body)
 * into a well-formed ProgressState. Unknown lesson slugs are dropped.
 */
export function sanitizeProgress(candidate: unknown, isValidLesson: SlugCheck): ProgressState {
  if (!isRecord(candidate)) return { ...DEFAULT_PROGRESS_STATE };

  const quizScores: Record<string, QuizAttempt> = {};
  if (isRecord(candidate.quizScores)) {
    for (const [slug, raw] of Object.entries(candidate.quizScores)) {
      if (!isValidLesson(slug)) continue;
      const q = sanitizeQuiz(raw);
      if (q) quizScores[slug] = q;
    }
  }

  const projectSubmissions: Record<string, ProjectSubmission> = {};
  if (isRecord(candidate.projectSubmissions)) {
    for (const [slug, raw] of Object.entries(candidate.projectSubmissions)) {
      if (!isValidLesson(slug)) continue;
      const s = sanitizeSubmission(raw);
      if (s) projectSubmissions[slug] = s;
    }
  }

  const lessonNotes: Record<string, string> = {};
  if (isRecord(candidate.lessonNotes)) {
    for (const [slug, raw] of Object.entries(candidate.lessonNotes)) {
      if (!isValidLesson(slug)) continue;
      const note = clampString(raw, LIMITS.noteChars);
      if (note && note.trim()) lessonNotes[slug] = note;
    }
  }

  const path = candidate.activePathSlug;
  const last = candidate.lastVisitedLessonSlug;

  return {
    completedLessons: slugList(candidate.completedLessons, isValidLesson),
    activePathSlug:
      typeof path === 'string' && (PATH_SLUGS as readonly string[]).includes(path)
        ? (path as PathSlug)
        : 'foundations',
    quizScores,
    projectSubmissions,
    lastVisitedLessonSlug: typeof last === 'string' && isValidLesson(last) ? last : null,
    lessonNotes,
    bookmarkedLessons: slugList(candidate.bookmarkedLessons, isValidLesson),
  };
}

const newer = (a: string, b: string) => new Date(a).getTime() >= new Date(b).getTime();

/**
 * Union-merge two states. Used only when there is no single source of truth:
 * the first sign-in on a device that already has guest progress, and when a
 * save hits a revision conflict. Normal saves replace the stored copy, so
 * deletions (un-completing a lesson, clearing a note) persist.
 */
export function mergeProgress(base: ProgressState, incoming: ProgressState): ProgressState {
  const quizScores = { ...base.quizScores };
  for (const [slug, attempt] of Object.entries(incoming.quizScores)) {
    const existing = quizScores[slug];
    if (!existing || newer(attempt.passedAt, existing.passedAt)) quizScores[slug] = attempt;
  }

  const projectSubmissions = { ...base.projectSubmissions };
  for (const [slug, sub] of Object.entries(incoming.projectSubmissions)) {
    const existing = projectSubmissions[slug];
    if (!existing || newer(sub.savedAt, existing.savedAt)) projectSubmissions[slug] = sub;
  }

  const lessonNotes = { ...base.lessonNotes };
  for (const [slug, note] of Object.entries(incoming.lessonNotes)) {
    if (note.trim()) lessonNotes[slug] = note;
  }

  return {
    completedLessons: Array.from(new Set([...base.completedLessons, ...incoming.completedLessons])),
    bookmarkedLessons: Array.from(new Set([...base.bookmarkedLessons, ...incoming.bookmarkedLessons])),
    activePathSlug:
      incoming.completedLessons.length > 0 ? incoming.activePathSlug : base.activePathSlug,
    quizScores,
    projectSubmissions,
    lessonNotes,
    lastVisitedLessonSlug: incoming.lastVisitedLessonSlug ?? base.lastVisitedLessonSlug,
  };
}

/** JSON with object keys sorted, so equal states always serialise identically. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, v) =>
    isRecord(v)
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]]))
      : v
  );
}

/** Small non-cryptographic string hash (FNV-1a) for change detection. */
export function hashString(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

export function isEmptyProgress(s: ProgressState): boolean {
  return (
    s.completedLessons.length === 0 &&
    s.bookmarkedLessons.length === 0 &&
    Object.keys(s.quizScores).length === 0 &&
    Object.keys(s.projectSubmissions).length === 0 &&
    Object.keys(s.lessonNotes).length === 0
  );
}
