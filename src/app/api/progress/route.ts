import { NextRequest, NextResponse } from 'next/server';
import { auth, authEnabled } from '@/auth';
import { LESSONS } from '@/data/curriculum';
import { LIMITS, sanitizeProgress } from '@/lib/progress';
import { getProgressStore, StoreUnavailableError } from '@/lib/progressStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_LESSONS = new Set(LESSONS.map((l) => l.slug));
const isValidLesson = (slug: string) => VALID_LESSONS.has(slug);

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** Resolve the signed-in user's storage key, or a ready-made error response. */
async function requireUser(): Promise<{ key: string } | { error: NextResponse }> {
  if (!authEnabled) return { error: json({ error: 'Cloud sync is not configured.' }, 503) };
  const session = await auth();
  const key = session?.user?.id;
  if (!key) return { error: json({ error: 'Not signed in.' }, 401) };
  return { key };
}

function failure(err: unknown) {
  if (err instanceof StoreUnavailableError) {
    return json({ error: 'Cloud storage is unavailable.' }, 503);
  }
  console.error('[api/progress]', err);
  return json({ error: 'Something went wrong. Your progress is still saved in this browser.' }, 500);
}

export async function GET() {
  const user = await requireUser();
  if ('error' in user) return user.error;
  try {
    const record = await getProgressStore().get(user.key);
    return json({ record });
  } catch (err) {
    return failure(err);
  }
}

export async function PUT(req: NextRequest) {
  const user = await requireUser();
  if ('error' in user) return user.error;

  const raw = await req.text();
  if (Buffer.byteLength(raw, 'utf8') > LIMITS.requestBytes) {
    return json({ error: 'Progress payload is too large.' }, 413);
  }

  let body: { state?: unknown; baseRevision?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'Invalid JSON.' }, 400);
  }
  const baseRevision = body.baseRevision;
  if (typeof baseRevision !== 'number' || !Number.isInteger(baseRevision) || baseRevision < 0) {
    return json({ error: 'baseRevision must be a non-negative integer.' }, 400);
  }
  if (typeof body.state !== 'object' || body.state === null) {
    return json({ error: 'state is required.' }, 400);
  }

  try {
    const state = sanitizeProgress(body.state, isValidLesson);
    const result = await getProgressStore().put(user.key, state, baseRevision);
    if (!result.ok) return json({ error: 'conflict', record: result.conflict }, 409);
    return json({ revision: result.record.revision, updatedAt: result.record.updatedAt });
  } catch (err) {
    return failure(err);
  }
}

export async function DELETE() {
  const user = await requireUser();
  if ('error' in user) return user.error;
  try {
    await getProgressStore().delete(user.key);
    return json({ deleted: true });
  } catch (err) {
    return failure(err);
  }
}
