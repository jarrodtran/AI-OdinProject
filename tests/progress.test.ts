import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PROGRESS_STATE,
  LIMITS,
  canonicalJson,
  hashString,
  isEmptyProgress,
  mergeProgress,
  sanitizeProgress,
  type ProgressState,
} from '@/lib/progress';

const valid = new Set(['lesson-a', 'lesson-b', 'lesson-c']);
const isValid = (s: string) => valid.has(s);
const T1 = '2026-01-01T00:00:00.000Z';
const T2 = '2026-02-01T00:00:00.000Z';

const state = (over: Partial<ProgressState> = {}): ProgressState => ({
  ...DEFAULT_PROGRESS_STATE,
  ...over,
});

describe('sanitizeProgress', () => {
  it('returns defaults for non-objects', () => {
    expect(sanitizeProgress(null, isValid)).toEqual(DEFAULT_PROGRESS_STATE);
    expect(sanitizeProgress('nope', isValid)).toEqual(DEFAULT_PROGRESS_STATE);
    expect(sanitizeProgress([1, 2], isValid)).toEqual(DEFAULT_PROGRESS_STATE);
  });

  it('drops unknown lesson slugs everywhere and de-duplicates lists', () => {
    const out = sanitizeProgress(
      {
        completedLessons: ['lesson-a', 'lesson-a', 'bogus', 7],
        bookmarkedLessons: ['bogus', 'lesson-b'],
        lessonNotes: { 'lesson-a': 'note', bogus: 'x' },
        lastVisitedLessonSlug: 'bogus',
        quizScores: { bogus: { selectedAnswers: {}, score: 1, total: 1, passedAt: T1 } },
      },
      isValid
    );
    expect(out.completedLessons).toEqual(['lesson-a']);
    expect(out.bookmarkedLessons).toEqual(['lesson-b']);
    expect(out.lessonNotes).toEqual({ 'lesson-a': 'note' });
    expect(out.lastVisitedLessonSlug).toBeNull();
    expect(out.quizScores).toEqual({});
  });

  it('falls back to the default path for an unknown path slug', () => {
    expect(sanitizeProgress({ activePathSlug: 'hacked' }, isValid).activePathSlug).toBe('foundations');
    expect(sanitizeProgress({ activePathSlug: 'technical-ai-pm' }, isValid).activePathSlug).toBe(
      'technical-ai-pm'
    );
  });

  it('rejects impossible quiz attempts and bad dates', () => {
    const out = sanitizeProgress(
      {
        quizScores: {
          'lesson-a': { selectedAnswers: { q1: 1 }, score: 9, total: 3, passedAt: T1 },
          'lesson-b': { selectedAnswers: { q1: 1 }, score: 1, total: 3, passedAt: 'not a date' },
          'lesson-c': { selectedAnswers: { q1: 1, q2: -1, q3: 1.5 }, score: 2, total: 3, passedAt: T1 },
        },
      },
      isValid
    );
    expect(Object.keys(out.quizScores)).toEqual(['lesson-c']);
    expect(out.quizScores['lesson-c'].selectedAnswers).toEqual({ q1: 1 });
  });

  it('keeps only http(s) portfolio links', () => {
    const sub = (portfolioUrl: string) =>
      sanitizeProgress(
        {
          projectSubmissions: {
            'lesson-a': { content: 'x', checkedDeliverables: [], checkedRubric: [], savedAt: T1, portfolioUrl },
          },
        },
        isValid
      ).projectSubmissions['lesson-a'];
    expect(sub('javascript:alert(1)').portfolioUrl).toBeUndefined();
    expect(sub('data:text/html,hi').portfolioUrl).toBeUndefined();
    expect(sub(' https://example.com/x ').portfolioUrl).toBe('https://example.com/x');
  });

  it('truncates oversized strings', () => {
    const out = sanitizeProgress(
      { lessonNotes: { 'lesson-a': 'a'.repeat(LIMITS.noteChars + 500) } },
      isValid
    );
    expect(out.lessonNotes['lesson-a']).toHaveLength(LIMITS.noteChars);
  });
});

describe('mergeProgress', () => {
  it('unions lists and keeps the newest quiz and project attempts', () => {
    const base = state({
      completedLessons: ['lesson-a'],
      quizScores: { 'lesson-a': { selectedAnswers: {}, score: 1, total: 2, passedAt: T2 } },
      projectSubmissions: {
        'lesson-b': { content: 'old', checkedDeliverables: [], checkedRubric: [], savedAt: T1 },
      },
    });
    const incoming = state({
      completedLessons: ['lesson-b'],
      quizScores: { 'lesson-a': { selectedAnswers: {}, score: 2, total: 2, passedAt: T1 } },
      projectSubmissions: {
        'lesson-b': { content: 'new', checkedDeliverables: [], checkedRubric: [], savedAt: T2 },
      },
    });
    const merged = mergeProgress(base, incoming);
    expect(merged.completedLessons.sort()).toEqual(['lesson-a', 'lesson-b']);
    expect(merged.quizScores['lesson-a'].passedAt).toBe(T2);
    expect(merged.projectSubmissions['lesson-b'].content).toBe('new');
  });

  it('prefers incoming non-empty notes and keeps base notes otherwise', () => {
    const merged = mergeProgress(
      state({ lessonNotes: { 'lesson-a': 'base', 'lesson-b': 'keep' } }),
      state({ lessonNotes: { 'lesson-a': 'incoming' } })
    );
    expect(merged.lessonNotes).toEqual({ 'lesson-a': 'incoming', 'lesson-b': 'keep' });
  });
});

describe('canonicalJson / hashString', () => {
  it('is insensitive to object key order', () => {
    const a = { x: 1, y: { b: 2, a: [3, { d: 4, c: 5 }] } };
    const b = { y: { a: [3, { c: 5, d: 4 }], b: 2 }, x: 1 };
    expect(canonicalJson(a)).toBe(canonicalJson(b));
    expect(hashString(canonicalJson(a))).toBe(hashString(canonicalJson(b)));
  });

  it('detects real changes', () => {
    expect(hashString('a')).not.toBe(hashString('b'));
  });
});

describe('isEmptyProgress', () => {
  it('treats path selection and last-visited as non-progress', () => {
    expect(isEmptyProgress(state({ activePathSlug: 'technical-ai-pm', lastVisitedLessonSlug: 'lesson-a' }))).toBe(
      true
    );
    expect(isEmptyProgress(state({ bookmarkedLessons: ['lesson-a'] }))).toBe(false);
  });
});
