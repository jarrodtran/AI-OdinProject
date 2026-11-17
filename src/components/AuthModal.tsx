'use client';

import React, { useEffect, useId, useState } from 'react';
import { getProviders } from 'next-auth/react';
import {
  CheckCircle2,
  Cloud,
  CloudOff,
  Download,
  FileText,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useProgress, type AuthProviderId } from '@/context/ProgressContext';
import { Modal } from './Modal';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const PROVIDER_LABELS: Record<AuthProviderId, string> = {
  github: 'GitHub',
  google: 'Google',
};

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.83Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.83C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const {
    cloudEnabled,
    user,
    syncStatus,
    syncError,
    lastSyncedAt,
    signIn,
    signOut,
    syncNow,
    deleteCloudData,
    exportPortfolioMarkdown,
    exportProgressJson,
  } = useProgress();

  const titleId = useId();
  const [providers, setProviders] = useState<AuthProviderId[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setStatusMsg(null);
    setConfirmDelete(false);
    if (providers !== null) return;
    if (!cloudEnabled) {
      setProviders([]);
      return;
    }
    getProviders()
      .then((p) =>
        setProviders(
          p ? (Object.keys(p).filter((id) => id in PROVIDER_LABELS) as AuthProviderId[]) : []
        )
      )
      .catch(() => setProviders([]));
  }, [open, providers, cloudEnabled]);

  const handleSignIn = async (provider: AuthProviderId) => {
    setBusy(true);
    setError(null);
    try {
      await signIn(provider); // navigates away to the provider
    } catch {
      setError(`Could not start ${PROVIDER_LABELS[provider]} sign-in.`);
      setBusy(false);
    }
  };

  const handleSync = async () => {
    setError(null);
    setStatusMsg(null);
    const res = await syncNow();
    if (res.ok) setStatusMsg('Progress is up to date in the cloud.');
    else if (res.error) setError(res.error);
  };

  const handleDelete = async () => {
    setBusy(true);
    setError(null);
    const res = await deleteCloudData();
    setBusy(false);
    if (res.ok) onClose();
    else setError(res.error || 'Delete failed.');
  };

  const initials = user?.name
    ? user.name
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'PM';

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-slate-50/95 px-6 py-4 backdrop-blur-xs">
        <h2 id={titleId} className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
          <Cloud className="h-4 w-4 text-amber-700" aria-hidden="true" />
          {user ? 'Account & Cloud Sync' : 'Sign in to sync your progress'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-500 hover:bg-slate-200/70 hover:text-slate-800"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-6">
        {!user ? (
          <>
            <p className="text-sm leading-relaxed text-slate-600">
              Your progress is always saved in this browser. Sign in to back it up and keep it in
              sync across devices. Anything you&apos;ve done as a guest is merged into your account.
            </p>

            {providers === null ? (
              <div className="h-24 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />
            ) : providers.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                Cloud sync isn&apos;t enabled on this deployment. Use{' '}
                <strong>Backup JSON</strong> on the dashboard to move progress between browsers.
              </div>
            ) : (
              <div className="space-y-2.5">
                {providers.includes('github') && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleSignIn('github')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    <GitHubMark /> Continue with GitHub
                  </button>
                )}
                {providers.includes('google') && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleSignIn('google')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <GoogleMark /> Continue with Google
                  </button>
                )}
              </div>
            )}

            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
              We only use your account to identify you. Your notes and project drafts are stored
              privately and you can delete them at any time.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-amber-400"
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-extrabold text-slate-900">{user.name}</span>
                  <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                    {PROVIDER_LABELS[user.provider as AuthProviderId] ?? user.provider}
                  </span>
                </div>
                {user.email && <div className="truncate text-xs text-slate-500">{user.email}</div>}
                <div className="mt-1 text-[11px] font-semibold" role="status" aria-live="polite">
                  {syncStatus === 'offline' ? (
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <CloudOff className="h-3 w-3" aria-hidden="true" /> Offline · saved in this browser
                    </span>
                  ) : syncStatus === 'syncing' ? (
                    <span className="inline-flex items-center gap-1 text-indigo-700">
                      <RefreshCw className="h-3 w-3 animate-spin" aria-hidden="true" /> Syncing…
                    </span>
                  ) : syncStatus === 'error' ? (
                    <span className="inline-flex items-center gap-1 text-rose-700">
                      <TriangleAlert className="h-3 w-3" aria-hidden="true" /> Sync problem
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Synced
                      {lastSyncedAt &&
                        ` · ${new Date(lastSyncedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {syncStatus === 'error' && syncError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
                {syncError}
              </div>
            )}

            <button
              type="button"
              onClick={handleSync}
              disabled={syncStatus === 'syncing'}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Sync now
            </button>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  downloadFile(exportPortfolioMarkdown(), 'ai-pm-portfolio-dossier.md', 'text/markdown;charset=utf-8')
                }
                className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100"
              >
                <FileText className="h-3.5 w-3.5" aria-hidden="true" /> Portfolio (.md)
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadFile(exportProgressJson(), 'ai-odin-project-progress.json', 'application/json')
                }
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" /> Backup (.json)
              </button>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Sign out (keep copy in this browser)
              </button>

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete my cloud data
                </button>
              ) : (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center">
                  <p className="text-[11px] font-semibold text-rose-900">
                    Permanently delete your cloud copy and sign out? Progress in this browser stays.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleDelete}
                      className="flex-1 rounded-lg bg-rose-600 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {error && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
            {error}
          </div>
        )}
        {statusMsg && (
          <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
            {statusMsg}
          </div>
        )}
      </div>
    </Modal>
  );
}
