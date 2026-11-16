import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { ProgressState } from '@/context/ProgressContext';
import type { PathSlug } from '@/data/curriculum';

export const runtime = 'nodejs';

type AuthProvider = 'email' | 'github' | 'google';
type AuthMode = 'auto' | 'signin' | 'register';

export interface SyncHistoryEvent {
  action: string;
  timestamp: string;
  modulesCompleted: number;
}

interface StoredRecord {
  email: string;
  name: string;
  roleTitle?: string;
  provider: AuthProvider;
  passcodeHash?: string;
  syncToken: string;
  recoveryCode: string;
  revision: number;
  syncHistory: SyncHistoryEvent[];
  updatedAt: string;
  state: ProgressState;
}

const LOCAL_STORE_PATH = path.join('/tmp', 'ai-odin-cloud-progress.json');

const DEFAULT_PROGRESS_STATE: ProgressState = {
  completedLessons: [],
  activePathSlug: 'foundations',
  quizScores: {},
  projectSubmissions: {},
  lastVisitedLessonSlug: null,
  lessonNotes: {},
  bookmarkedLessons: [],
};

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function hashLegacyPasscode(passcode: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(passcode).digest('hex');
}

function hashPasscodeScrypt(passcode: string, email: string): string {
  const derived = crypto.scryptSync(passcode, `ai-odin-salt:${email}`, 32).toString('hex');
  return `scrypt:${derived}`;
}

function verifyPasscode(passcode: string, email: string, storedHash?: string): boolean {
  if (!storedHash) return true;
  if (!passcode) return false;
  if (storedHash.startsWith('scrypt:')) {
    const candidate = hashPasscodeScrypt(passcode, email);
    try {
      return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(storedHash));
    } catch {
      return false;
    }
  }
  const legacy = hashLegacyPasscode(passcode, email);
  try {
    return crypto.timingSafeEqual(Buffer.from(legacy), Buffer.from(storedHash));
  } catch {
    return false;
  }
}

function makeSyncToken(email: string): string {
  const secret = process.env.PROGRESS_SYNC_SECRET || 'ai-odin-local-sync-secret-v1';
  const nonce = crypto.randomBytes(12).toString('hex');
  return crypto.createHmac('sha256', secret).update(`${email}:${nonce}`).digest('hex');
}

function makeRecoveryCode(email: string): string {
  const seed = crypto
    .createHash('sha256')
    .update(`${email}:${crypto.randomBytes(8).toString('hex')}:${Date.now()}`)
    .digest('hex')
    .toUpperCase();
  return `ODIN-${seed.slice(0, 4)}-${seed.slice(4, 8)}`;
}

function appendSyncHistory(
  history: SyncHistoryEvent[] | undefined,
  action: string,
  timestamp: string,
  state: ProgressState
): SyncHistoryEvent[] {
  const next: SyncHistoryEvent = {
    action,
    timestamp,
    modulesCompleted: state.completedLessons.length,
  };
  return [next, ...(Array.isArray(history) ? history : [])].slice(0, 8);
}

function sanitizeProgressState(candidate?: Partial<ProgressState> | null): ProgressState {
  if (!candidate || typeof candidate !== 'object') {
    return { ...DEFAULT_PROGRESS_STATE };
  }
  const validPaths = new Set(['foundations', 'ai-product-strategy', 'technical-ai-pm']);
  return {
    completedLessons: Array.isArray(candidate.completedLessons)
      ? Array.from(new Set(candidate.completedLessons.filter((x): x is string => typeof x === 'string')))
      : [],
    activePathSlug:
      typeof candidate.activePathSlug === 'string' && validPaths.has(candidate.activePathSlug)
        ? (candidate.activePathSlug as PathSlug)
        : 'foundations',
    quizScores:
      candidate.quizScores && typeof candidate.quizScores === 'object' ? candidate.quizScores : {},
    projectSubmissions:
      candidate.projectSubmissions && typeof candidate.projectSubmissions === 'object'
        ? candidate.projectSubmissions
        : {},
    lastVisitedLessonSlug:
      typeof candidate.lastVisitedLessonSlug === 'string' ? candidate.lastVisitedLessonSlug : null,
    lessonNotes:
      candidate.lessonNotes && typeof candidate.lessonNotes === 'object' ? candidate.lessonNotes : {},
    bookmarkedLessons: Array.isArray(candidate.bookmarkedLessons)
      ? Array.from(new Set(candidate.bookmarkedLessons.filter((x): x is string => typeof x === 'string')))
      : [],
  };
}

function mergeProgressStates(cloud: ProgressState, guest: ProgressState): ProgressState {
  const completedLessons = Array.from(
    new Set([...cloud.completedLessons, ...guest.completedLessons])
  );
  const bookmarkedLessons = Array.from(
    new Set([...cloud.bookmarkedLessons, ...guest.bookmarkedLessons])
  );

  const quizScores = { ...cloud.quizScores };
  for (const [slug, attempt] of Object.entries(guest.quizScores)) {
    const existing = quizScores[slug];
    if (!existing || new Date(attempt.passedAt).getTime() >= new Date(existing.passedAt).getTime()) {
      quizScores[slug] = attempt;
    }
  }

  const projectSubmissions = { ...cloud.projectSubmissions };
  for (const [slug, sub] of Object.entries(guest.projectSubmissions)) {
    const existing = projectSubmissions[slug];
    if (!existing || new Date(sub.savedAt).getTime() >= new Date(existing.savedAt).getTime()) {
      projectSubmissions[slug] = sub;
    }
  }

  const lessonNotes = { ...cloud.lessonNotes };
  for (const [slug, note] of Object.entries(guest.lessonNotes)) {
    if (typeof note === 'string' && note.trim().length > 0) {
      lessonNotes[slug] = note;
    }
  }

  return {
    completedLessons,
    bookmarkedLessons,
    activePathSlug:
      guest.completedLessons.length > 0 ? guest.activePathSlug : cloud.activePathSlug,
    quizScores,
    projectSubmissions,
    lessonNotes,
    lastVisitedLessonSlug: guest.lastVisitedLessonSlug ?? cloud.lastVisitedLessonSlug,
  };
}

function formatPublicUser(record: StoredRecord, backend: string) {
  return {
    email: record.email,
    name: record.name,
    roleTitle: record.roleTitle || '',
    provider: record.provider,
    syncToken: record.syncToken,
    recoveryCode: record.recoveryCode,
    revision: record.revision ?? 1,
    backend,
    syncHistory: record.syncHistory ?? [],
    lastSyncedAt: record.updatedAt,
  };
}

/* -------------------------------------------------------------------------- */
/* 3-Tier Persistence Adapter: Vercel KV (Upstash) -> Vercel Blob -> /tmp     */
/* -------------------------------------------------------------------------- */

function getStorageKey(email: string): string {
  const hash = crypto.createHash('sha256').update(email).digest('hex').slice(0, 24);
  return `ai-odin-user:${hash}`;
}

async function readLocalStore(): Promise<Record<string, StoredRecord>> {
  try {
    const raw = await fs.readFile(LOCAL_STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, StoredRecord>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeLocalStore(store: Record<string, StoredRecord>): Promise<void> {
  await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

async function readUserRecord(email: string): Promise<{ record: StoredRecord | null; backend: string }> {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  const key = getStorageKey(email);

  if (kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${kvToken}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = (await res.json()) as { result?: string | null };
        if (data.result) {
          return { record: JSON.parse(data.result) as StoredRecord, backend: 'vercel-kv' };
        }
        return { record: null, backend: 'vercel-kv' };
      }
    } catch {
      // Fall through to Blob or local store
    }
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const prefix = `ai-odin-progress/${key}.json`;
      const listRes = await fetch(
        `https://blob.vercel-storage.com?prefix=${encodeURIComponent(prefix)}&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${blobToken}`,
            'x-api-version': '7',
          },
          cache: 'no-store',
        }
      );
      if (listRes.ok) {
        const listed = (await listRes.json()) as { blobs?: { url: string; pathname: string }[] };
        const match = listed.blobs?.find((b) => b.pathname === prefix) ?? listed.blobs?.[0];
        if (match?.url) {
          const sep = match.url.includes('?') ? '&' : '?';
          const objRes = await fetch(`${match.url}${sep}t=${Date.now()}`, { cache: 'no-store' });
          if (objRes.ok) {
            return { record: (await objRes.json()) as StoredRecord, backend: 'vercel-blob' };
          }
        }
        return { record: null, backend: 'vercel-blob' };
      }
    } catch {
      // Fall through to local store
    }
  }

  const store = await readLocalStore();
  return { record: store[email] ?? null, backend: 'local-tmp' };
}

async function writeUserRecord(record: StoredRecord): Promise<string> {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  const key = getStorageKey(record.email);

  if (kvUrl && kvToken) {
    const res = await fetch(`${kvUrl}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(record)),
    });
    if (res.ok) return 'vercel-kv';
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const pathname = `ai-odin-progress/${key}.json`;
    const res = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${blobToken}`,
        'Content-Type': 'application/json',
        'x-api-version': '7',
        'x-add-random-suffix': '0',
        'x-allow-overwrite': '1',
      },
      body: JSON.stringify(record),
    });
    if (res.ok) return 'vercel-blob';
  }

  const store = await readLocalStore();
  store[record.email] = record;
  await writeLocalStore(store);
  return 'local-tmp';
}

async function deleteUserRecord(email: string): Promise<string> {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  const key = getStorageKey(email);

  if (kvUrl && kvToken) {
    const res = await fetch(`${kvUrl}/del/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}` },
    });
    if (res.ok) return 'vercel-kv';
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const prefix = `ai-odin-progress/${key}.json`;
    const listRes = await fetch(
      `https://blob.vercel-storage.com?prefix=${encodeURIComponent(prefix)}&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${blobToken}`,
          'x-api-version': '7',
        },
        cache: 'no-store',
      }
    );
    if (listRes.ok) {
      const listed = (await listRes.json()) as { blobs?: { url: string; pathname: string }[] };
      const urls = (listed.blobs ?? [])
        .filter((b) => b.pathname === prefix)
        .map((b) => b.url);
      if (urls.length > 0) {
        await fetch('https://blob.vercel-storage.com/delete', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${blobToken}`,
            'Content-Type': 'application/json',
            'x-api-version': '7',
          },
          body: JSON.stringify({ urls }),
        });
      }
      return 'vercel-blob';
    }
  }

  const store = await readLocalStore();
  delete store[email];
  await writeLocalStore(store);
  return 'local-tmp';
}

function normalizeRecordDefaults(record: StoredRecord): StoredRecord {
  return {
    ...record,
    recoveryCode: record.recoveryCode || makeRecoveryCode(record.email),
    revision: typeof record.revision === 'number' ? record.revision : 1,
    syncHistory: Array.isArray(record.syncHistory) ? record.syncHistory : [],
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  if (searchParams.get('action') === 'health') {
    const backend =
      process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
        ? 'vercel-kv'
        : process.env.BLOB_READ_WRITE_TOKEN
        ? 'vercel-blob'
        : 'local-tmp';
    return NextResponse.json({ ok: true, backend });
  }

  const rawEmail = searchParams.get('email');
  const syncToken = searchParams.get('syncToken');
  if (!rawEmail || !syncToken) {
    return NextResponse.json({ ok: false, error: 'Missing email or syncToken.' }, { status: 400 });
  }

  const email = normalizeEmail(rawEmail);
  const { record, backend } = await readUserRecord(email);
  if (!record || record.syncToken !== syncToken) {
    return NextResponse.json({ ok: false, error: 'Invalid session or account not found.' }, { status: 401 });
  }

  const normalized = normalizeRecordDefaults(record);
  return NextResponse.json({
    ok: true,
    backend,
    user: formatPublicUser(normalized, backend),
    state: normalized.state,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      action?:
        | 'signin'
        | 'sync'
        | 'restore'
        | 'recover'
        | 'update-profile'
        | 'rotate-token'
        | 'delete-account';
      authMode?: AuthMode;
      email?: string;
      name?: string;
      roleTitle?: string;
      passcode?: string;
      newPasscode?: string;
      recoveryCode?: string;
      provider?: AuthProvider;
      syncToken?: string;
      mergeWithCloud?: boolean;
      state?: Partial<ProgressState>;
    };

    const action = body.action ?? 'sync';
    const rawEmail = body.email ?? '';
    if (!rawEmail.includes('@')) {
      return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }
    const email = normalizeEmail(rawEmail);
    const provider: AuthProvider =
      body.provider === 'github' || body.provider === 'google' ? body.provider : 'email';

    if (action === 'signin') {
      const authMode: AuthMode = body.authMode ?? 'auto';
      const { record: existingRaw } = await readUserRecord(email);
      const existing = existingRaw ? normalizeRecordDefaults(existingRaw) : null;
      const passcode = body.passcode?.trim() ?? '';

      if (authMode === 'signin' && !existing) {
        return NextResponse.json(
          { ok: false, error: 'No account found for this email. Switch to Create Account to register.' },
          { status: 404 }
        );
      }

      if (authMode === 'register' && existing) {
        return NextResponse.json(
          { ok: false, error: 'An account already exists for this email. Switch to Sign In instead.' },
          { status: 409 }
        );
      }

      if (existing?.passcodeHash && provider === 'email') {
        if (!verifyPasscode(passcode, email, existing.passcodeHash)) {
          return NextResponse.json(
            { ok: false, error: 'Incorrect passcode for this account.' },
            { status: 401 }
          );
        }
      }

      const guestState = sanitizeProgressState(body.state);
      const mergedState = existing
        ? mergeProgressStates(sanitizeProgressState(existing.state), guestState)
        : guestState;

      const now = new Date().toISOString();
      const syncToken = existing?.syncToken ?? makeSyncToken(email);
      const recoveryCode = existing?.recoveryCode ?? makeRecoveryCode(email);
      const displayName =
        body.name?.trim() || existing?.name || email.split('@')[0] || 'AI PM Learner';
      const roleTitle = body.roleTitle?.trim() || existing?.roleTitle;

      // Upgrade legacy HMAC hashes cleanly on valid sign-in or store scrypt for new passcodes
      let nextPasscodeHash = existing?.passcodeHash;
      if (passcode) {
        nextPasscodeHash = hashPasscodeScrypt(passcode, email);
      }

      const nextRecord: StoredRecord = {
        email,
        name: displayName,
        roleTitle,
        provider: existing?.provider ?? provider,
        passcodeHash: nextPasscodeHash,
        syncToken,
        recoveryCode,
        revision: (existing?.revision ?? 0) + 1,
        syncHistory: appendSyncHistory(
          existing?.syncHistory,
          existing ? `signin-merge (${provider})` : `account-created (${provider})`,
          now,
          mergedState
        ),
        updatedAt: now,
        state: mergedState,
      };

      const backend = await writeUserRecord(nextRecord);
      return NextResponse.json({
        ok: true,
        backend,
        user: formatPublicUser(nextRecord, backend),
        state: nextRecord.state,
      });
    }

    if (action === 'recover') {
      const { record: existingRaw } = await readUserRecord(email);
      if (!existingRaw) {
        return NextResponse.json({ ok: false, error: 'Account not found.' }, { status: 404 });
      }
      const existing = normalizeRecordDefaults(existingRaw);
      const candidateCode = (body.recoveryCode ?? '').trim().toUpperCase();
      if (!candidateCode || candidateCode !== existing.recoveryCode.toUpperCase()) {
        return NextResponse.json(
          { ok: false, error: 'Recovery key did not match this account.' },
          { status: 401 }
        );
      }

      const guestState = sanitizeProgressState(body.state);
      const mergedState = mergeProgressStates(sanitizeProgressState(existing.state), guestState);
      const now = new Date().toISOString();
      const nextPasscode = body.newPasscode?.trim() || body.passcode?.trim() || '';

      const updated: StoredRecord = {
        ...existing,
        passcodeHash: nextPasscode
          ? hashPasscodeScrypt(nextPasscode, email)
          : existing.passcodeHash,
        revision: existing.revision + 1,
        syncHistory: appendSyncHistory(existing.syncHistory, 'account-recovered', now, mergedState),
        updatedAt: now,
        state: mergedState,
      };

      const backend = await writeUserRecord(updated);
      return NextResponse.json({
        ok: true,
        backend,
        user: formatPublicUser(updated, backend),
        state: updated.state,
      });
    }

    if (action === 'restore') {
      const { record: existingRaw, backend } = await readUserRecord(email);
      if (!existingRaw) {
        return NextResponse.json({ ok: false, error: 'Account not found.' }, { status: 404 });
      }
      const record = normalizeRecordDefaults(existingRaw);
      const validToken = Boolean(body.syncToken && record.syncToken === body.syncToken);
      const validRecovery = Boolean(
        body.recoveryCode &&
          body.recoveryCode.trim().toUpperCase() === record.recoveryCode.toUpperCase()
      );
      if (!validToken && !validRecovery) {
        return NextResponse.json({ ok: false, error: 'Invalid sync token or recovery key.' }, { status: 401 });
      }
      return NextResponse.json({
        ok: true,
        backend,
        user: formatPublicUser(record, backend),
        state: record.state,
      });
    }

    if (action === 'update-profile') {
      const { record: existingRaw } = await readUserRecord(email);
      if (!existingRaw || existingRaw.syncToken !== body.syncToken) {
        return NextResponse.json({ ok: false, error: 'Unauthorized sync session.' }, { status: 401 });
      }
      const existing = normalizeRecordDefaults(existingRaw);
      const now = new Date().toISOString();
      const newPass = body.newPasscode?.trim() ?? '';

      const updated: StoredRecord = {
        ...existing,
        name: body.name?.trim() || existing.name,
        roleTitle: body.roleTitle !== undefined ? body.roleTitle.trim() : existing.roleTitle,
        passcodeHash: newPass ? hashPasscodeScrypt(newPass, email) : existing.passcodeHash,
        revision: existing.revision + 1,
        syncHistory: appendSyncHistory(existing.syncHistory, 'profile-updated', now, existing.state),
        updatedAt: now,
      };
      const backend = await writeUserRecord(updated);
      return NextResponse.json({
        ok: true,
        backend,
        user: formatPublicUser(updated, backend),
      });
    }

    if (action === 'rotate-token') {
      const { record: existingRaw } = await readUserRecord(email);
      if (!existingRaw || existingRaw.syncToken !== body.syncToken) {
        return NextResponse.json({ ok: false, error: 'Unauthorized sync session.' }, { status: 401 });
      }
      const existing = normalizeRecordDefaults(existingRaw);
      const now = new Date().toISOString();
      const updated: StoredRecord = {
        ...existing,
        syncToken: makeSyncToken(email),
        recoveryCode: makeRecoveryCode(email),
        revision: existing.revision + 1,
        syncHistory: appendSyncHistory(existing.syncHistory, 'keys-rotated', now, existing.state),
        updatedAt: now,
      };
      const backend = await writeUserRecord(updated);
      return NextResponse.json({
        ok: true,
        backend,
        user: formatPublicUser(updated, backend),
      });
    }

    if (action === 'delete-account') {
      const { record: existingRaw } = await readUserRecord(email);
      if (!existingRaw || existingRaw.syncToken !== body.syncToken) {
        return NextResponse.json({ ok: false, error: 'Unauthorized sync session.' }, { status: 401 });
      }
      const backend = await deleteUserRecord(email);
      return NextResponse.json({ ok: true, deleted: true, backend });
    }

    // action === 'sync'
    const { record: existingRaw } = await readUserRecord(email);
    if (!existingRaw || existingRaw.syncToken !== body.syncToken) {
      return NextResponse.json({ ok: false, error: 'Unauthorized sync token.' }, { status: 401 });
    }
    const existing = normalizeRecordDefaults(existingRaw);
    const now = new Date().toISOString();
    const incomingState = sanitizeProgressState(body.state);
    const nextState = body.mergeWithCloud
      ? mergeProgressStates(sanitizeProgressState(existing.state), incomingState)
      : incomingState;

    const updated: StoredRecord = {
      ...existing,
      revision: existing.revision + 1,
      syncHistory: appendSyncHistory(existing.syncHistory, 'cloud-sync', now, nextState),
      updatedAt: now,
      state: nextState,
    };
    const backend = await writeUserRecord(updated);

    return NextResponse.json({
      ok: true,
      backend,
      syncedAt: now,
      revision: updated.revision,
      syncHistory: updated.syncHistory,
      state: updated.state,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Failed to process progress sync.' },
      { status: 500 }
    );
  }
}
