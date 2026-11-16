'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { PathSlug, LESSONS, LEARNING_PATHS, getLessonsForPath, getSkillBreakdown } from '@/data/curriculum';

const STORAGE_KEY = 'ai-odin-project-progress-v1';
const USER_STORAGE_KEY = 'ai-odin-project-user-v1';

export interface SyncHistoryEvent {
  action: string;
  timestamp: string;
  modulesCompleted: number;
}

export interface AuthUser {
  email: string;
  name: string;
  roleTitle?: string;
  provider: 'email' | 'github' | 'google';
  syncToken: string;
  recoveryCode?: string;
  revision?: number;
  backend?: string;
  syncHistory?: SyncHistoryEvent[];
  lastSyncedAt: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline';

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

const DEFAULT_STATE: ProgressState = {
  completedLessons: [],
  activePathSlug: 'foundations',
  quizScores: {},
  projectSubmissions: {},
  lastVisitedLessonSlug: null,
  lessonNotes: {},
  bookmarkedLessons: [],
};

interface ProgressContextValue extends ProgressState {
  hydrated: boolean;
  user: AuthUser | null;
  syncStatus: SyncStatus;
  signIn: (input: {
    email: string;
    name?: string;
    roleTitle?: string;
    passcode?: string;
    provider?: 'email' | 'github' | 'google';
    authMode?: 'auto' | 'signin' | 'register';
  }) => Promise<{ ok: boolean; error?: string }>;
  recoverAccount: (input: {
    email: string;
    recoveryCode: string;
    newPasscode?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  updateProfile: (input: {
    name: string;
    roleTitle?: string;
    newPasscode?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  rotateSyncCredentials: () => Promise<{ ok: boolean; error?: string }>;
  deleteCloudAccount: () => Promise<{ ok: boolean; error?: string }>;
  pullFromCloud: () => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
  syncNow: () => Promise<{ ok: boolean; error?: string }>;
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
  importProgressJson: (raw: string) => { ok: boolean; error?: string };
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

const VALID_LESSON_SLUGS = new Set(LESSONS.map((l) => l.slug));
const VALID_PATH_SLUGS = new Set<PathSlug>(['foundations', 'ai-product-strategy', 'technical-ai-pm']);

function sanitizeClientProgress(parsed?: Partial<ProgressState> | null): ProgressState {
  if (!parsed || typeof parsed !== 'object') return DEFAULT_STATE;
  return {
    completedLessons: Array.isArray(parsed.completedLessons)
      ? Array.from(new Set(parsed.completedLessons.filter((s) => VALID_LESSON_SLUGS.has(s))))
      : [],
    activePathSlug:
      parsed.activePathSlug && VALID_PATH_SLUGS.has(parsed.activePathSlug)
        ? parsed.activePathSlug
        : 'foundations',
    quizScores:
      parsed.quizScores && typeof parsed.quizScores === 'object' ? parsed.quizScores : {},
    projectSubmissions:
      parsed.projectSubmissions && typeof parsed.projectSubmissions === 'object'
        ? parsed.projectSubmissions
        : {},
    lastVisitedLessonSlug:
      parsed.lastVisitedLessonSlug && VALID_LESSON_SLUGS.has(parsed.lastVisitedLessonSlug)
        ? parsed.lastVisitedLessonSlug
        : null,
    lessonNotes:
      parsed.lessonNotes && typeof parsed.lessonNotes === 'object' ? parsed.lessonNotes : {},
    bookmarkedLessons: Array.isArray(parsed.bookmarkedLessons)
      ? Array.from(new Set(parsed.bookmarkedLessons.filter((s) => VALID_LESSON_SLUGS.has(s))))
      : [],
  };
}

function mergeClientAndCloudProgress(cloud: ProgressState, local: ProgressState): ProgressState {
  const completedLessons = Array.from(new Set([...cloud.completedLessons, ...local.completedLessons]));
  const bookmarkedLessons = Array.from(new Set([...cloud.bookmarkedLessons, ...local.bookmarkedLessons]));

  const quizScores = { ...cloud.quizScores };
  for (const [slug, attempt] of Object.entries(local.quizScores)) {
    const existing = quizScores[slug];
    if (!existing || new Date(attempt.passedAt).getTime() >= new Date(existing.passedAt).getTime()) {
      quizScores[slug] = attempt;
    }
  }

  const projectSubmissions = { ...cloud.projectSubmissions };
  for (const [slug, sub] of Object.entries(local.projectSubmissions)) {
    const existing = projectSubmissions[slug];
    if (!existing || new Date(sub.savedAt).getTime() >= new Date(existing.savedAt).getTime()) {
      projectSubmissions[slug] = sub;
    }
  }

  const lessonNotes = { ...cloud.lessonNotes };
  for (const [slug, note] of Object.entries(local.lessonNotes)) {
    if (typeof note === 'string' && note.trim().length > 0) {
      lessonNotes[slug] = note;
    }
  }

  return sanitizeClientProgress({
    completedLessons,
    bookmarkedLessons,
    activePathSlug: local.completedLessons.length > 0 ? local.activePathSlug : cloud.activePathSlug,
    quizScores,
    projectSubmissions,
    lessonNotes,
    lastVisitedLessonSlug: local.lastVisitedLessonSlug ?? cloud.lastVisitedLessonSlug,
  });
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(DEFAULT_STATE);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [hydrated, setHydrated] = useState(false);
  const skipSyncRef = useRef(true);
  const initialRestoreRanRef = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ProgressState>;
        setState(sanitizeClientProgress(parsed));
      }
      const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
      if (rawUser) {
        const parsedUser = JSON.parse(rawUser) as Partial<AuthUser>;
        if (parsedUser?.email && parsedUser?.syncToken) {
          setUser({
            email: parsedUser.email,
            name: parsedUser.name || parsedUser.email.split('@')[0],
            roleTitle: parsedUser.roleTitle,
            provider:
              parsedUser.provider === 'github' || parsedUser.provider === 'google'
                ? parsedUser.provider
                : 'email',
            syncToken: parsedUser.syncToken,
            recoveryCode: parsedUser.recoveryCode,
            revision: parsedUser.revision,
            backend: parsedUser.backend,
            syncHistory: parsedUser.syncHistory,
            lastSyncedAt: parsedUser.lastSyncedAt || new Date().toISOString(),
          });
          setSyncStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced');
        }
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

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (user) {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [user, hydrated]);

  const userEmail = user?.email;
  const userToken = user?.syncToken;

  // Startup cloud restore/merge once per session if user was already signed in
  useEffect(() => {
    if (!hydrated || !userEmail || !userToken || initialRestoreRanRef.current) return;
    initialRestoreRanRef.current = true;

    (async () => {
      try {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'restore',
            email: userEmail,
            syncToken: userToken,
          }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          ok?: boolean;
          user?: AuthUser;
          state?: Partial<ProgressState>;
        };
        if (data.ok && data.state) {
          const cloudState = sanitizeClientProgress(data.state);
          skipSyncRef.current = true;
          setState((localCurr) => mergeClientAndCloudProgress(cloudState, localCurr));
          if (data.user) {
            setUser(data.user);
          }
          setSyncStatus('synced');
        }
      } catch {
        setSyncStatus('offline');
      }
    })();
  }, [hydrated, userEmail, userToken]);

  // Network online / offline sync status listener
  useEffect(() => {
    if (!hydrated || !userEmail) return;
    const onOffline = () => setSyncStatus('offline');
    const onOnline = () => {
      setSyncStatus('synced');
    };
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [hydrated, userEmail]);

  // Debounced auto cloud sync whenever signed-in user's ProgressState changes
  useEffect(() => {
    if (!hydrated || !userEmail || !userToken) return;
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setSyncStatus('syncing');
      try {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sync',
            email: userEmail,
            syncToken: userToken,
            mergeWithCloud: true,
            state,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            syncedAt?: string;
            revision?: number;
            backend?: string;
            syncHistory?: SyncHistoryEvent[];
          };
          setSyncStatus('synced');
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  lastSyncedAt: data.syncedAt || prev.lastSyncedAt,
                  revision: data.revision ?? prev.revision,
                  backend: data.backend ?? prev.backend,
                  syncHistory: data.syncHistory ?? prev.syncHistory,
                }
              : prev
          );
        } else {
          setSyncStatus('offline');
        }
      } catch {
        setSyncStatus('offline');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [state, hydrated, userEmail, userToken]);

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
      return {
        ...prev,
        completedLessons: [...prev.completedLessons, slug],
      };
    });
  }, []);

  const setActivePath = useCallback((slug: PathSlug) => {
    setState((prev) => ({
      ...prev,
      activePathSlug: slug,
    }));
  }, []);

  const saveQuizResult = useCallback(
    (
      lessonSlug: string,
      selectedAnswers: Record<string, number>,
      score: number,
      total: number
    ) => {
      setState((prev) => ({
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [lessonSlug]: {
            selectedAnswers,
            score,
            total,
            passedAt: new Date().toISOString(),
          },
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
          [lessonSlug]: {
            ...data,
            savedAt: new Date().toISOString(),
          },
        },
      }));
    },
    []
  );

  const setLastVisitedLesson = useCallback((slug: string) => {
    setState((prev) => {
      if (prev.lastVisitedLessonSlug === slug) return prev;
      return {
        ...prev,
        lastVisitedLessonSlug: slug,
      };
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
      return {
        ...prev,
        lessonNotes: nextNotes,
      };
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
        if (sub?.content) {
          lines.push('', sub.content.trim());
        }
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

  const exportProgressJson = useCallback(() => {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        app: 'the-ai-odin-project',
        version: 2,
        state,
      },
      null,
      2
    );
  }, [state]);

  const importProgressJson = useCallback((raw: string): { ok: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(raw) as { state?: Partial<ProgressState> } & Partial<ProgressState>;
      const candidate = parsed.state ?? parsed;
      if (!candidate || typeof candidate !== 'object') {
        return { ok: false, error: 'Invalid JSON structure.' };
      }
      setState(sanitizeClientProgress(candidate));
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Could not parse JSON backup.',
      };
    }
  }, []);

  const signIn = useCallback(
    async (input: {
      email: string;
      name?: string;
      roleTitle?: string;
      passcode?: string;
      provider?: 'email' | 'github' | 'google';
      authMode?: 'auto' | 'signin' | 'register';
    }): Promise<{ ok: boolean; error?: string }> => {
      try {
        setSyncStatus('syncing');
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'signin',
            authMode: input.authMode ?? 'auto',
            email: input.email,
            name: input.name,
            roleTitle: input.roleTitle,
            passcode: input.passcode,
            provider: input.provider ?? 'email',
            state,
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          user?: AuthUser;
          state?: Partial<ProgressState>;
        };
        if (!res.ok || !data.ok || !data.user) {
          setSyncStatus('idle');
          return { ok: false, error: data.error || 'Could not sign in.' };
        }
        skipSyncRef.current = true;
        setState(sanitizeClientProgress(data.state));
        setUser(data.user);
        setSyncStatus('synced');
        return { ok: true };
      } catch (err) {
        setSyncStatus('offline');
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Network error during sign-in.',
        };
      }
    },
    [state]
  );

  const recoverAccount = useCallback(
    async (input: {
      email: string;
      recoveryCode: string;
      newPasscode?: string;
    }): Promise<{ ok: boolean; error?: string }> => {
      try {
        setSyncStatus('syncing');
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'recover',
            email: input.email,
            recoveryCode: input.recoveryCode,
            newPasscode: input.newPasscode,
            state,
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          user?: AuthUser;
          state?: Partial<ProgressState>;
        };
        if (!res.ok || !data.ok || !data.user) {
          setSyncStatus('idle');
          return { ok: false, error: data.error || 'Could not recover account.' };
        }
        skipSyncRef.current = true;
        setState(sanitizeClientProgress(data.state));
        setUser(data.user);
        setSyncStatus('synced');
        return { ok: true };
      } catch (err) {
        setSyncStatus('offline');
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Network error during recovery.',
        };
      }
    },
    [state]
  );

  const updateProfile = useCallback(
    async (input: {
      name: string;
      roleTitle?: string;
      newPasscode?: string;
    }): Promise<{ ok: boolean; error?: string }> => {
      if (!user) return { ok: false, error: 'Sign in first to update your profile.' };
      setSyncStatus('syncing');
      try {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update-profile',
            email: user.email,
            syncToken: user.syncToken,
            name: input.name,
            roleTitle: input.roleTitle,
            newPasscode: input.newPasscode,
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          user?: AuthUser;
        };
        if (!res.ok || !data.ok || !data.user) {
          setSyncStatus('synced');
          return { ok: false, error: data.error || 'Profile update failed.' };
        }
        setUser(data.user);
        setSyncStatus('synced');
        return { ok: true };
      } catch (err) {
        setSyncStatus('offline');
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Network error updating profile.',
        };
      }
    },
    [user]
  );

  const rotateSyncCredentials = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: 'Not signed in.' };
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rotate-token',
          email: user.email,
          syncToken: user.syncToken,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; user?: AuthUser };
      if (!res.ok || !data.ok || !data.user) {
        setSyncStatus('synced');
        return { ok: false, error: data.error || 'Could not rotate keys.' };
      }
      setUser(data.user);
      setSyncStatus('synced');
      return { ok: true };
    } catch (err) {
      setSyncStatus('offline');
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Network error rotating keys.',
      };
    }
  }, [user]);

  const deleteCloudAccount = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: 'Not signed in.' };
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-account',
          email: user.email,
          syncToken: user.syncToken,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        return { ok: false, error: data.error || 'Could not delete cloud account.' };
      }
      setUser(null);
      setSyncStatus('idle');
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Network error deleting account.',
      };
    }
  }, [user]);

  const pullFromCloud = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: 'Sign in first to pull cloud progress.' };
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          email: user.email,
          syncToken: user.syncToken,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        user?: AuthUser;
        state?: Partial<ProgressState>;
      };
      if (!res.ok || !data.ok || !data.state) {
        setSyncStatus('offline');
        return { ok: false, error: data.error || 'Could not pull cloud state.' };
      }
      const cloudState = sanitizeClientProgress(data.state);
      skipSyncRef.current = true;
      setState((localCurr) => mergeClientAndCloudProgress(cloudState, localCurr));
      if (data.user) setUser(data.user);
      setSyncStatus('synced');
      return { ok: true };
    } catch (err) {
      setSyncStatus('offline');
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Network error pulling from cloud.',
      };
    }
  }, [user]);

  const signOut = useCallback(() => {
    setUser(null);
    setSyncStatus('idle');
    initialRestoreRanRef.current = false;
  }, []);

  const syncNow = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: 'Sign in first to sync progress.' };
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          email: user.email,
          syncToken: user.syncToken,
          mergeWithCloud: true,
          state,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        syncedAt?: string;
        revision?: number;
        backend?: string;
        syncHistory?: SyncHistoryEvent[];
        state?: Partial<ProgressState>;
      };
      if (!res.ok || !data.ok) {
        setSyncStatus('offline');
        return { ok: false, error: data.error || 'Sync failed.' };
      }
      if (data.state) {
        skipSyncRef.current = true;
        setState(sanitizeClientProgress(data.state));
      }
      setUser((prev) =>
        prev
          ? {
              ...prev,
              lastSyncedAt: data.syncedAt || new Date().toISOString(),
              revision: data.revision ?? prev.revision,
              backend: data.backend ?? prev.backend,
              syncHistory: data.syncHistory ?? prev.syncHistory,
            }
          : prev
      );
      setSyncStatus('synced');
      return { ok: true };
    } catch (err) {
      setSyncStatus('offline');
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Offline — changes kept locally.',
      };
    }
  }, [user, state]);

  const resetProgress = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        ...state,
        hydrated,
        user,
        syncStatus,
        signIn,
        recoverAccount,
        updateProfile,
        rotateSyncCredentials,
        deleteCloudAccount,
        pullFromCloud,
        signOut,
        syncNow,
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
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return ctx;
}
