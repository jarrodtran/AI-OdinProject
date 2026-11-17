'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  signIn as authSignIn,
  signOut as authSignOut,
  useSession,
} from 'next-auth/react';
import { LESSONS, LEARNING_PATHS, getLessonsForPath, getSkillBreakdown } from '@/data/catalog';
import {
  DEFAULT_PROGRESS_STATE,
  canonicalJson,
  hashString,
  isEmptyProgress,
  mergeProgress,
  sanitizeProgress,
  type PathSlug,
  type ProgressState,
} from '@/lib/progress';

export type { ProgressState, QuizAttempt, ProjectSubmission } from '@/lib/progress';

const STORAGE_KEY = 'ai-odin-project-progress-v1';
/** Which account/revision this browser last synced, and a hash of that state. */
const SYNC_META_KEY = 'ai-odin-project-sync-v2';
/** Pre-OAuth key that stored sync tokens and recovery codes; purged on load. */
const LEGACY_USER_KEY = 'ai-odin-project-user-v1';
const SYNC_DEBOUNCE_MS = 800;

export interface AuthUser {
  name: string;
  email: string | null;
  image: string | null;
  provider: string;
}

export type AuthProviderId = 'github' | 'google';
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';
type Result = { ok: boolean; error?: string };

interface SyncMeta {
  uid: string;
  revision: number;
  hash: string;
}

interface ProgressContextValue extends ProgressState {
  hydrated: boolean;
  /** Whether this deployment has sign-in configured. */
  cloudEnabled: boolean;
  user: AuthUser | null;
  authLoading: boolean;
  syncStatus: SyncStatus;
  syncError: string | null;
  lastSyncedAt: string | null;
  signIn: (provider: AuthProviderId) => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<Result>;
  deleteCloudData: () => Promise<Result>;
  toggleLessonComplete: (slug: string) => void;
  markLessonComplete: (slug: string) => void;
  setActivePath: (slug: PathSlug) => void;
  saveQuizResult: (
    lessonSlug: string,
    selectedAnswers: Record<string, number>,
    score: number,
    total: number
  ) => void;
  saveProjectSubmission: (
    lessonSlug: string,
    data: {
      content: string;
      checkedDeliverables: string[];
      checkedRubric: string[];
      portfolioUrl?: string;
    }
  ) => void;
  setLastVisitedLesson: (slug: string) => void;
  saveLessonNote: (slug: string, note: string) => void;
  toggleBookmarkLesson: (slug: string) => void;
  exportPortfolioMarkdown: () => string;
  exportProgressJson: () => string;
  importProgressJson: (raw: string) => Result;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

const VALID_LESSON_SLUGS = new Set(LESSONS.map((l) => l.slug));
const sanitize = (candidate: unknown) =>
  sanitizeProgress(candidate, (slug) => VALID_LESSON_SLUGS.has(slug));
const fingerprint = (s: ProgressState) => canonicalJson(sanitize(s));

function readMeta(): SyncMeta | null {
  try {
    const raw = window.localStorage.getItem(SYNC_META_KEY);
    const m = raw ? (JSON.parse(raw) as Partial<SyncMeta>) : null;
    if (m && typeof m.uid === 'string' && typeof m.revision === 'number' && typeof m.hash === 'string') {
      return m as SyncMeta;
    }
  } catch {
    // ignore
  }
  return null;
}

function writeMeta(meta: SyncMeta) {
  try {
    window.localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function ProgressProvider({
  children,
  cloudEnabled = true,
}: {
  children: React.ReactNode;
  cloudEnabled?: boolean;
}) {
  const [state, setState] = useState<ProgressState>(DEFAULT_PROGRESS_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const { data: session, status: sessionStatus } = useSession();
  const uid = session?.user?.id ?? null;
  const user = useMemo<AuthUser | null>(
    () =>
      session?.user?.id
        ? {
            name: session.user.name || session.user.email?.split('@')[0] || 'AI PM Learner',
            email: session.user.email ?? null,
            image: session.user.image ?? null,
            provider: session.user.provider,
          }
        : null,
    [session]
  );

  // Sync bookkeeping lives in refs so async callbacks always see current values.
  const stateRef = useRef(state);
  const uidRef = useRef<string | null>(null);
  /** Server revision our local copy is based on; null until loaded for this user. */
  const revisionRef = useRef<number | null>(null);
  /** Fingerprint of the state last confirmed by the server. */
  const syncedFingerprintRef = useRef('');
  const inFlightRef = useRef(false);
  const pendingRef = useRef(false);
  const pushRef = useRef<() => Promise<Result>>(async () => ({ ok: false }));

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Load local progress once and purge the legacy credential store.
  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_USER_KEY);
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const loaded = sanitize(JSON.parse(raw));
        stateRef.current = loaded;
        setState(loaded);
      }
    } catch {
      // Ignore malformed localStorage and keep default state
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state, hydrated]);

  const markSynced = useCallback((snapshot: ProgressState, revision: number, updatedAt: string | null) => {
    const fp = fingerprint(snapshot);
    revisionRef.current = revision;
    syncedFingerprintRef.current = fp;
    if (uidRef.current) writeMeta({ uid: uidRef.current, revision, hash: hashString(fp) });
    if (updatedAt) setLastSyncedAt(updatedAt);
    setSyncStatus('synced');
    setSyncError(null);
  }, []);

  /** Push local state; on a revision conflict merge with the server copy and retry. */
  const push = useCallback(async (): Promise<Result> => {
    if (!uidRef.current || revisionRef.current === null) {
      return { ok: false, error: 'Cloud sync is still connecting.' };
    }
    if (inFlightRef.current) {
      pendingRef.current = true;
      return { ok: true };
    }
    inFlightRef.current = true;
    setSyncStatus('syncing');
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const snapshot = stateRef.current;
        const res = await fetch('/api/progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: snapshot, baseRevision: revisionRef.current }),
        });
        if (res.ok) {
          const data = (await res.json()) as { revision: number; updatedAt: string };
          markSynced(snapshot, data.revision, data.updatedAt);
          return { ok: true };
        }
        if (res.status === 409) {
          const data = (await res.json()) as {
            record: { state: unknown; revision: number } | null;
          };
          const server = data.record;
          const merged = server ? mergeProgress(sanitize(server.state), stateRef.current) : stateRef.current;
          revisionRef.current = server?.revision ?? 0;
          stateRef.current = merged;
          setState(merged);
          continue;
        }
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const error =
          res.status === 401
            ? 'Your session expired. Sign in again to keep syncing.'
            : data.error || `Sync failed (${res.status}).`;
        setSyncStatus('error');
        setSyncError(error);
        return { ok: false, error };
      }
      const error = 'Could not resolve a sync conflict. Please try again.';
      setSyncStatus('error');
      setSyncError(error);
      return { ok: false, error };
    } catch {
      setSyncStatus('offline');
      setSyncError(null);
      return { ok: false, error: 'You appear to be offline. Changes are saved in this browser.' };
    } finally {
      inFlightRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = false;
        setTimeout(() => void pushRef.current(), 0);
      }
    }
  }, [markSynced]);

  useEffect(() => {
    pushRef.current = push;
  }, [push]);

  /** Fetch the server copy for the signed-in user and reconcile it with local progress. */
  const pull = useCallback(async (): Promise<Result> => {
    const currentUid = uidRef.current;
    if (!currentUid) return { ok: false, error: 'Not signed in.' };
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/progress', { cache: 'no-store' });
      if (uidRef.current !== currentUid) return { ok: false };
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const error = data.error || `Could not load cloud progress (${res.status}).`;
        setSyncStatus('error');
        setSyncError(error);
        return { ok: false, error };
      }
      const { record } = (await res.json()) as {
        record: { state: unknown; revision: number; updatedAt: string } | null;
      };

      const local = stateRef.current;
      const storedMeta = readMeta();
      const meta = storedMeta?.uid === currentUid ? storedMeta : null;
      const localDirty = !meta || hashString(fingerprint(local)) !== meta.hash;

      let next = local;
      if (record) {
        const server = sanitize(record.state);
        if (meta && !localDirty) {
          next = server; // nothing new here: take the latest server copy
        } else if (meta && meta.revision === record.revision) {
          next = local; // only this browser changed since the last sync
        } else {
          next = isEmptyProgress(local) ? server : mergeProgress(server, local);
        }
        revisionRef.current = record.revision;
        syncedFingerprintRef.current = fingerprint(server);
        setLastSyncedAt(record.updatedAt);
      } else {
        revisionRef.current = 0;
        syncedFingerprintRef.current = '';
      }

      stateRef.current = next;
      setState(next);
      if (record && fingerprint(next) === syncedFingerprintRef.current) {
        markSynced(next, record.revision, record.updatedAt);
        return { ok: true };
      }
      return push();
    } catch {
      setSyncStatus('offline');
      return { ok: false, error: 'You appear to be offline. Changes are saved in this browser.' };
    }
  }, [markSynced, push]);

  // Reconcile with the cloud whenever the signed-in account changes.
  useEffect(() => {
    if (!hydrated) return;
    if (uidRef.current === uid) return;
    uidRef.current = uid;
    revisionRef.current = null;
    syncedFingerprintRef.current = '';
    setLastSyncedAt(null);
    setSyncError(null);
    if (!uid) {
      setSyncStatus('idle');
      return;
    }
    void pull();
  }, [hydrated, uid, pull]);

  // Debounced save after local changes.
  useEffect(() => {
    if (!hydrated || !uid || revisionRef.current === null) return;
    const timer = setTimeout(() => {
      if (fingerprint(stateRef.current) === syncedFingerprintRef.current) return;
      void push();
    }, SYNC_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state, hydrated, uid, push]);

  // Retry when connectivity returns.
  useEffect(() => {
    if (!uid) return;
    const onOffline = () => setSyncStatus('offline');
    const onOnline = () => {
      void (revisionRef.current === null ? pull() : push());
    };
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [uid, pull, push]);

  const syncNow = useCallback(async (): Promise<Result> => {
    if (!uidRef.current) return { ok: false, error: 'Sign in first to sync progress.' };
    if (revisionRef.current === null) return pull();
    if (fingerprint(stateRef.current) === syncedFingerprintRef.current) return pull();
    return push();
  }, [pull, push]);

  const signIn = useCallback(async (provider: AuthProviderId) => {
    await authSignIn(provider);
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut({ redirect: false });
  }, []);

  const deleteCloudData = useCallback(async (): Promise<Result> => {
    if (!uidRef.current) return { ok: false, error: 'Not signed in.' };
    try {
      const res = await fetch('/api/progress', { method: 'DELETE' });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        return { ok: false, error: data.error || 'Could not delete cloud data.' };
      }
      try {
        window.localStorage.removeItem(SYNC_META_KEY);
      } catch {
        // ignore
      }
      await authSignOut({ redirect: false });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error while deleting cloud data.' };
    }
  }, []);

  /* ----------------------------- Learning state ---------------------------- */

  const toggleLessonComplete = useCallback((slug: string) => {
    setState((prev) => {
      const exists = prev.completedLessons.includes(slug);
      return {
        ...prev,
        completedLessons: exists
          ? prev.completedLessons.filter((item) => item !== slug)
          : [...prev.completedLessons, slug],
      };
    });
  }, []);

  const markLessonComplete = useCallback((slug: string) => {
    setState((prev) => {
      if (prev.completedLessons.includes(slug)) return prev;
      return { ...prev, completedLessons: [...prev.completedLessons, slug] };
    });
  }, []);

  const setActivePath = useCallback((slug: PathSlug) => {
    setState((prev) => ({ ...prev, activePathSlug: slug }));
  }, []);

  const saveQuizResult = useCallback(
    (lessonSlug: string, selectedAnswers: Record<string, number>, score: number, total: number) => {
      setState((prev) => ({
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [lessonSlug]: { selectedAnswers, score, total, passedAt: new Date().toISOString() },
        },
      }));
    },
    []
  );

  const saveProjectSubmission = useCallback(
    (
      lessonSlug: string,
      data: {
        content: string;
        checkedDeliverables: string[];
        checkedRubric: string[];
        portfolioUrl?: string;
      }
    ) => {
      setState((prev) => ({
        ...prev,
        projectSubmissions: {
          ...prev.projectSubmissions,
          [lessonSlug]: { ...data, savedAt: new Date().toISOString() },
        },
      }));
    },
    []
  );

  const setLastVisitedLesson = useCallback((slug: string) => {
    setState((prev) => {
      if (prev.lastVisitedLessonSlug === slug) return prev;
      return { ...prev, lastVisitedLessonSlug: slug };
    });
  }, []);

  const saveLessonNote = useCallback((slug: string, note: string) => {
    setState((prev) => {
      const nextNotes = { ...prev.lessonNotes };
      if (!note.trim()) {
        delete nextNotes[slug];
      } else {
        nextNotes[slug] = note;
      }
      return { ...prev, lessonNotes: nextNotes };
    });
  }, []);

  const toggleBookmarkLesson = useCallback((slug: string) => {
    setState((prev) => {
      const exists = prev.bookmarkedLessons.includes(slug);
      return {
        ...prev,
        bookmarkedLessons: exists
          ? prev.bookmarkedLessons.filter((item) => item !== slug)
          : [...prev.bookmarkedLessons, slug],
      };
    });
  }, []);

  const exportPortfolioMarkdown = useCallback(() => {
    const completedSet = new Set(state.completedLessons);
    const overallPct =
      LESSONS.length > 0 ? Math.round((state.completedLessons.length / LESSONS.length) * 100) : 0;
    const skills = getSkillBreakdown(state.completedLessons);
    const projects = LESSONS.filter((l) => l.type === 'project');

    const lines: string[] = [
      '# The AI Odin Project · AI PM Mastery Portfolio Dossier',
      `Generated: ${new Date().toISOString().slice(0, 10)}`,
      '',
      '## 1. Curriculum Mastery Summary',
      `- **Overall Progress:** ${state.completedLessons.length}/${LESSONS.length} modules completed (${overallPct}%)`,
    ];

    LEARNING_PATHS.forEach((p) => {
      const items = getLessonsForPath(p.slug);
      const done = items.filter((i) => completedSet.has(i.slug)).length;
      const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
      lines.push(`- **${p.title}:** ${done}/${items.length} (${pct}%)`);
    });

    lines.push('', '## 2. 7-Pillar AI PM Competency Radar');
    skills.forEach((s) => {
      lines.push(`- **${s.skill}:** ${s.completed}/${s.total} (${s.percent}%)`);
    });

    lines.push('', '## 3. Portfolio Project Artifacts');
    let hasProjectContent = false;
    projects.forEach((proj) => {
      const sub = state.projectSubmissions[proj.slug];
      const isDone = completedSet.has(proj.slug);
      if (sub || isDone) {
        hasProjectContent = true;
        lines.push('', `### ${proj.title} (${isDone ? 'Completed' : 'Draft Saved'})`);
        if (sub?.portfolioUrl) lines.push(`- **External Link:** ${sub.portfolioUrl}`);
        if (sub?.savedAt) lines.push(`- **Last Saved:** ${sub.savedAt.slice(0, 10)}`);
        if (sub?.content) lines.push('', sub.content.trim());
      }
    });
    if (!hasProjectContent) {
      lines.push('_No project artifacts saved yet. Open any Project module to draft and save your work._');
    }

    const noteEntries = Object.entries(state.lessonNotes).filter(([, txt]) => txt.trim().length > 0);
    if (noteEntries.length > 0) {
      lines.push('', '## 4. Personal Study Notes');
      noteEntries.forEach(([slug, note]) => {
        const lesson = LESSONS.find((l) => l.slug === slug);
        lines.push('', `### ${lesson?.title ?? slug}`, note.trim());
      });
    }

    return lines.join('\n');
  }, [state]);

  const exportProgressJson = useCallback(
    () =>
      JSON.stringify(
        { exportedAt: new Date().toISOString(), app: 'the-ai-odin-project', version: 2, state },
        null,
        2
      ),
    [state]
  );

  const importProgressJson = useCallback((raw: string): Result => {
    try {
      const parsed = JSON.parse(raw) as { state?: unknown };
      const candidate = parsed && typeof parsed === 'object' && 'state' in parsed ? parsed.state : parsed;
      if (!candidate || typeof candidate !== 'object') {
        return { ok: false, error: 'Invalid JSON structure.' };
      }
      setState(sanitize(candidate));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Could not parse JSON backup.' };
    }
  }, []);

  const resetProgress = useCallback(() => {
    setState(DEFAULT_PROGRESS_STATE);
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      ...state,
      hydrated,
      cloudEnabled,
      user,
      authLoading: sessionStatus === 'loading',
      syncStatus,
      syncError,
      lastSyncedAt,
      signIn,
      signOut,
      syncNow,
      deleteCloudData,
      toggleLessonComplete,
      markLessonComplete,
      setActivePath,
      saveQuizResult,
      saveProjectSubmission,
      setLastVisitedLesson,
      saveLessonNote,
      toggleBookmarkLesson,
      exportPortfolioMarkdown,
      exportProgressJson,
      importProgressJson,
      resetProgress,
    }),
    [
      state,
      hydrated,
      cloudEnabled,
      user,
      sessionStatus,
      syncStatus,
      syncError,
      lastSyncedAt,
      signIn,
      signOut,
      syncNow,
      deleteCloudData,
      toggleLessonComplete,
      markLessonComplete,
      setActivePath,
      saveQuizResult,
      saveProjectSubmission,
      setLastVisitedLesson,
      saveLessonNote,
      toggleBookmarkLesson,
      exportPortfolioMarkdown,
      exportProgressJson,
      importProgressJson,
      resetProgress,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return ctx;
}
