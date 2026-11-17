import { mkdtempSync, rmSync } from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PROGRESS_STATE } from '@/lib/progress';
import { createFileStore, type ProgressStore } from '@/lib/progressStore';

let dir: string;
let store: ProgressStore;
const s1 = { ...DEFAULT_PROGRESS_STATE, completedLessons: ['a'] };
const s2 = { ...DEFAULT_PROGRESS_STATE, completedLessons: ['b'] };

beforeEach(() => {
  dir = mkdtempSync(path.join(os.tmpdir(), 'odin-store-'));
  store = createFileStore(path.join(dir, 'progress.json'));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe('file progress store (revision compare-and-set)', () => {
  it('creates a record only from revision 0', async () => {
    expect(await store.get('u')).toBeNull();
    const stale = await store.put('u', s1, 3);
    expect(stale).toEqual({ ok: false, conflict: null });
    const created = await store.put('u', s1, 0);
    expect(created.ok && created.record.revision).toBe(1);
  });

  it('rejects a stale write and returns the current record', async () => {
    await store.put('u', s1, 0);
    await store.put('u', s2, 1);
    const res = await store.put('u', s1, 1);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.conflict?.revision).toBe(2);
      expect(res.conflict?.state.completedLessons).toEqual(['b']);
    }
  });

  it('lets exactly one of two concurrent writers win', async () => {
    await store.put('u', s1, 0);
    const [a, b] = await Promise.all([store.put('u', s1, 1), store.put('u', s2, 1)]);
    expect([a.ok, b.ok].filter(Boolean)).toHaveLength(1);
    expect((await store.get('u'))?.revision).toBe(2);
  });

  it('isolates users and deletes', async () => {
    await store.put('u1', s1, 0);
    expect(await store.get('u2')).toBeNull();
    await store.delete('u1');
    expect(await store.get('u1')).toBeNull();
  });
});
