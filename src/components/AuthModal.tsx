'use client';

import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Cloud,
  CloudDownload,
  CloudOff,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  X,
} from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type SignedOutTab = 'email' | 'oauth' | 'recover';
type SignedInTab = 'sync' | 'security' | 'exports';

export function AuthModal({ open, onClose }: AuthModalProps) {
  const {
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
    completedLessons,
    quizScores,
    projectSubmissions,
    lessonNotes,
    exportPortfolioMarkdown,
    exportProgressJson,
  } = useProgress();

  // Signed-out state
  const [signedOutTab, setSignedOutTab] = useState<SignedOutTab>('email');
  const [authMode, setAuthMode] = useState<'auto' | 'signin' | 'register'>('auto');
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);

  // Social OAuth profile builder state
  const [oauthName, setOauthName] = useState('');
  const [oauthEmail, setOauthEmail] = useState('');

  // Recovery key sign-in state
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverKey, setRecoverKey] = useState('');
  const [recoverNewPasscode, setRecoverNewPasscode] = useState('');

  // Signed-in tabs & profile editing
  const [signedInTab, setSignedInTab] = useState<SignedInTab>('sync');
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editNewPasscode, setEditNewPasscode] = useState('');
  const [copiedRecovery, setCopiedRecovery] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setStatusMsg(null);
      setConfirmDelete(false);
      if (user) {
        setEditName(user.name);
        setEditRole(user.roleTitle ?? '');
        setEditNewPasscode('');
      }
    }
  }, [open, user]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMsg(null);
    setSubmitting(true);
    const res = await signIn({
      email,
      name,
      roleTitle,
      passcode,
      provider: 'email',
      authMode,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error || 'Could not sign in.');
      return;
    }
    setStatusMsg('Signed in & progress merged with cloud backup!');
  };

  const handleProviderConnect = async (
    provider: 'github' | 'google',
    chosenName?: string,
    chosenEmail?: string
  ) => {
    const targetEmail = (chosenEmail ?? oauthEmail).trim();
    const targetName =
      (chosenName ?? oauthName).trim() ||
      (provider === 'github' ? 'GitHub AI PM' : 'Google AI PM');

    if (!targetEmail || !targetEmail.includes('@')) {
      setError(`Enter a valid ${provider === 'github' ? 'GitHub' : 'Google'} email or use the 1-click preset below.`);
      return;
    }
    setError(null);
    setStatusMsg(null);
    setSubmitting(true);
    const res = await signIn({
      email: targetEmail,
      name: targetName,
      provider,
      authMode: 'auto',
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error || 'Could not connect profile.');
      return;
    }
    setStatusMsg(`Signed in via ${provider === 'github' ? 'GitHub' : 'Google'} profile!`);
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMsg(null);
    setSubmitting(true);
    const res = await recoverAccount({
      email: recoverEmail,
      recoveryCode: recoverKey,
      newPasscode: recoverNewPasscode,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error || 'Account recovery failed.');
      return;
    }
    setStatusMsg('Account recovered & merged to this device!');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMsg(null);
    setSubmitting(true);
    const res = await updateProfile({
      name: editName,
      roleTitle: editRole,
      newPasscode: editNewPasscode,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error || 'Profile update failed.');
      return;
    }
    setEditNewPasscode('');
    setStatusMsg('Profile & security settings updated!');
  };

  const handleManualSync = async () => {
    setError(null);
    const res = await syncNow();
    if (res.ok) {
      setStatusMsg('Progress pushed & merged to cloud!');
      setTimeout(() => setStatusMsg(null), 2500);
    } else {
      setError(res.error || 'Sync failed.');
    }
  };

  const handlePull = async () => {
    setError(null);
    const res = await pullFromCloud();
    if (res.ok) {
      setStatusMsg('Pulled latest progress from cloud!');
      setTimeout(() => setStatusMsg(null), 2500);
    } else {
      setError(res.error || 'Pull failed.');
    }
  };

  const handleRotateKeys = async () => {
    setError(null);
    setSubmitting(true);
    const res = await rotateSyncCredentials();
    setSubmitting(false);
    if (res.ok) {
      setStatusMsg('Generated fresh Sync Token & Recovery Key!');
    } else {
      setError(res.error || 'Key rotation failed.');
    }
  };

  const handleDeleteCloud = async () => {
    setError(null);
    setSubmitting(true);
    const res = await deleteCloudAccount();
    setSubmitting(false);
    if (res.ok) {
      onClose();
    } else {
      setError(res.error || 'Delete failed.');
    }
  };

  const handleCopyRecovery = async () => {
    if (!user?.recoveryCode) return;
    try {
      await navigator.clipboard.writeText(user.recoveryCode);
      setCopiedRecovery(true);
      setTimeout(() => setCopiedRecovery(false), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'PM';

  const passcodeStrength =
    passcode.length === 0
      ? null
      : passcode.length < 6
      ? { label: 'Short (6+ chars recommended)', color: 'text-amber-600' }
      : passcode.length < 10
      ? { label: 'Good', color: 'text-teal-700' }
      : { label: 'Strong (scrypt encrypted)', color: 'text-emerald-700' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Account and cloud sync center"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-slate-50/95 px-6 py-4 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <Cloud className="h-4 w-4 text-amber-600" />
            {user ? 'Cloud Account & Sync Center' : 'Sign In or Create Free Cloud Account'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
            aria-label="Close account modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          {!user ? (
            <div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-950">
                <strong className="font-bold">Zero-Loss Guest Merge:</strong> Signing in merges your{' '}
                <strong>{completedLessons.length}</strong> modules,{' '}
                <strong>{Object.keys(quizScores).length}</strong> quizzes,{' '}
                <strong>{Object.keys(projectSubmissions).length}</strong> project drafts, and{' '}
                <strong>{Object.keys(lessonNotes).length}</strong> study notes directly into persistent
                cloud storage.
              </div>

              {/* 3 Signed-Out Auth Tabs */}
              <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
                {[
                  { id: 'email' as const, label: 'Email & Passcode' },
                  { id: 'oauth' as const, label: 'GitHub / Google' },
                  { id: 'recover' as const, label: 'Recovery Key' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSignedOutTab(t.id);
                      setError(null);
                      setStatusMsg(null);
                    }}
                    className={`rounded-lg px-2 py-1.5 text-[11px] font-bold transition ${
                      signedOutTab === t.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {signedOutTab === 'email' && (
                <form onSubmit={handleEmailSubmit} className="mt-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="font-semibold text-slate-500">Mode:</span>
                    {(
                      [
                        { id: 'auto' as const, label: 'Auto (Sign In or Register)' },
                        { id: 'signin' as const, label: 'Existing Account' },
                        { id: 'register' as const, label: 'New Account' },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setAuthMode(m.id)}
                        className={`rounded-md px-2 py-0.5 font-semibold transition ${
                          authMode === m.id
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {authMode !== 'signin' && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Alex Rivera"
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          Role / Target Title
                        </label>
                        <input
                          type="text"
                          value={roleTitle}
                          onChange={(e) => setRoleTitle(e.target.value)}
                          placeholder="Senior AI PM"
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        Passcode{' '}
                        <span className="font-normal text-slate-400">(optional PIN/password)</span>
                      </label>
                      {passcodeStrength && (
                        <span className={`text-[10px] font-bold ${passcodeStrength.color}`}>
                          {passcodeStrength.label}
                        </span>
                      )}
                    </div>
                    <div className="relative mt-1">
                      <input
                        type={showPasscode ? 'text' : 'password'}
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="Protect your cross-device cloud backup"
                        className="w-full rounded-xl border border-slate-200 py-2 pr-10 pl-3.5 text-sm text-slate-900 outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasscode((v) => !v)}
                        className="absolute top-2.5 right-3 text-slate-400 hover:text-slate-700"
                        aria-label="Toggle passcode visibility"
                      >
                        {showPasscode ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-amber-700 disabled:opacity-50"
                  >
                    {submitting
                      ? 'Authenticating & Merging...'
                      : authMode === 'signin'
                      ? 'Sign In & Sync Progress'
                      : authMode === 'register'
                      ? 'Create Cloud Account'
                      : 'Sign In / Create Free Account'}
                  </button>
                </form>
              )}

              {signedOutTab === 'oauth' && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs leading-relaxed text-slate-600">
                    Connect using your own GitHub/Google email identity or launch a 1-click learner
                    sandbox profile synced to Vercel Blob storage.
                  </p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <input
                      type="text"
                      value={oauthName}
                      onChange={(e) => setOauthName(e.target.value)}
                      placeholder="Your Display Name"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-amber-500"
                    />
                    <input
                      type="email"
                      value={oauthEmail}
                      onChange={(e) => setOauthEmail(e.target.value)}
                      placeholder="you@github-or-gmail.com"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleProviderConnect('github')}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      <UserCheck className="h-3.5 w-3.5" /> Continue w/ GitHub
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleProviderConnect('google')}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-bold text-indigo-900 hover:bg-indigo-100"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /> Continue w/ Google
                    </button>
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-[10px] font-semibold text-slate-400">
                    <div className="h-px flex-1 bg-slate-200" />
                    OR INSTANT DEMO PROFILES
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() =>
                        handleProviderConnect(
                          'github',
                          'GitHub AI PM',
                          'github-learner@aiodin.dev'
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Demo GitHub Learner
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() =>
                        handleProviderConnect(
                          'google',
                          'Google AI PM',
                          'google-learner@aiodin.dev'
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Demo Google Learner
                    </button>
                  </div>
                </div>
              )}

              {signedOutTab === 'recover' && (
                <form onSubmit={handleRecoverSubmit} className="mt-4 space-y-3">
                  <p className="text-xs leading-relaxed text-slate-600">
                    Forgot your passcode or switching laptops? Enter your account email and your{' '}
                    <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px]">
                      ODIN-XXXX-XXXX
                    </code>{' '}
                    Recovery Key to restore and optionally reset your passcode.
                  </p>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Account Email *</label>
                    <input
                      type="email"
                      required
                      value={recoverEmail}
                      onChange={(e) => setRecoverEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Recovery Key *</label>
                    <input
                      type="text"
                      required
                      value={recoverKey}
                      onChange={(e) => setRecoverKey(e.target.value)}
                      placeholder="ODIN-A1B2-C3D4"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 font-mono text-sm uppercase text-slate-900 outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Set New Passcode <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="password"
                      value={recoverNewPasscode}
                      onChange={(e) => setRecoverNewPasscode(e.target.value)}
                      placeholder="Leave blank to keep existing passcode"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    <KeyRound className="h-4 w-4 text-amber-400" />
                    {submitting ? 'Recovering Account...' : 'Restore Account via Recovery Key'}
                  </button>
                </form>
              )}

              {error && (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
                  {error}
                </div>
              )}
              {statusMsg && (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                  {statusMsg}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Signed-In Identity Card */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-amber-400">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-sm font-extrabold text-slate-900">{user.name}</div>
                    <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                      {user.provider}
                    </span>
                    {user.backend && (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                        {user.backend}
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {user.email}
                    {user.roleTitle ? ` · ${user.roleTitle}` : ''}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold">
                    {syncStatus === 'offline' ? (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <CloudOff className="h-3 w-3" /> Local mode (offline)
                      </span>
                    ) : syncStatus === 'syncing' ? (
                      <span className="inline-flex items-center gap-1 text-indigo-700">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Syncing progress...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Synced ·{' '}
                        {new Date(user.lastSyncedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {user.revision ? ` · Rev #${user.revision}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 Signed-In Sub-Tabs */}
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
                {[
                  { id: 'sync' as const, label: 'Cloud Sync', icon: Cloud },
                  { id: 'security' as const, label: 'Profile & Keys', icon: UserCog },
                  { id: 'exports' as const, label: 'Exports & Privacy', icon: FileText },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSignedInTab(t.id);
                        setError(null);
                        setStatusMsg(null);
                      }}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold transition ${
                        signedInTab === t.id
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-3 w-3" /> {t.label}
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
                  {error}
                </div>
              )}
              {statusMsg && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                  {statusMsg}
                </div>
              )}

              {signedInTab === 'sync' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleManualSync}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Push &amp; Sync
                    </button>
                    <button
                      type="button"
                      onClick={handlePull}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-50"
                    >
                      <CloudDownload className="h-3.5 w-3.5 text-indigo-600" /> Pull &amp; Merge
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                    <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                      Recent Cloud Sync Activity
                    </div>
                    {user.syncHistory && user.syncHistory.length > 0 ? (
                      <div className="mt-2 max-h-40 space-y-1.5 overflow-y-auto">
                        {user.syncHistory.map((ev, idx) => (
                          <div
                            key={`${ev.timestamp}-${idx}`}
                            className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-[11px] ring-1 ring-slate-200/70"
                          >
                            <span className="font-semibold text-slate-800">{ev.action}</span>
                            <span className="font-mono text-slate-500">
                              {ev.modulesCompleted} done ·{' '}
                              {new Date(ev.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1.5 text-xs text-slate-500">
                        Cloud log updates automatically as you complete modules or click Push &amp; Sync.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {signedInTab === 'security' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-amber-950">
                        Cross-Device Recovery Key
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyRecovery}
                        className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100"
                      >
                        {copiedRecovery ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copiedRecovery ? 'Copied' : 'Copy Key'}
                      </button>
                    </div>
                    <div className="mt-1.5 font-mono text-sm font-extrabold tracking-wider text-slate-900">
                      {user.recoveryCode || 'Sign out & back in to generate'}
                    </div>
                    <p className="mt-1 text-[11px] text-amber-900/80">
                      Save this key to recover your cloud progress on another browser if you forget
                      your passcode.
                    </p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-2.5">
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700">Display Name</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700">Role Title</label>
                        <input
                          type="text"
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          placeholder="Senior AI PM"
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700">
                        Update Passcode <span className="font-normal text-slate-400">(optional)</span>
                      </label>
                      <input
                        type="password"
                        value={editNewPasscode}
                        onChange={(e) => setEditNewPasscode(e.target.value)}
                        placeholder="Leave blank to keep unchanged"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50"
                      >
                        Save Profile Changes
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleRotateKeys}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Rotate Keys
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {signedInTab === 'exports' && (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(
                        exportPortfolioMarkdown(),
                        'ai-pm-portfolio-dossier.md',
                        'text/markdown;charset=utf-8'
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-2.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
                  >
                    <FileText className="h-3.5 w-3.5" /> Export Portfolio Dossier (.md)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(
                        exportProgressJson(),
                        'ai-odin-project-progress.json',
                        'application/json'
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" /> Download JSON Backup
                  </button>

                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        onClose();
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sign Out (Keep Local Copy)
                    </button>

                    {!confirmDelete ? (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Cloud Account Record
                      </button>
                    ) : (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center">
                        <p className="text-[11px] font-semibold text-rose-900">
                          Permanently delete your cloud backup record? Local browser progress remains.
                        </p>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={handleDeleteCloud}
                            className="flex-1 rounded-lg bg-rose-600 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                          >
                            Confirm Delete
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
