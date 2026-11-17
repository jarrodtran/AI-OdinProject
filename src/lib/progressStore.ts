import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';
import type { ProgressState } from './progress';

export interface StoredProgress {
  state: ProgressState;
  revision: number;
  updatedAt: string;
}

export type PutResult =
  | { ok: true; record: StoredProgress }
  | { ok: false; conflict: StoredProgress | null };

export interface ProgressStore {
  readonly name: string;
  get(userKey: string): Promise<StoredProgress | null>;
  /** Writes only if the stored revision equals `baseRevision` (0 = no record yet). */
  put(userKey: string, state: ProgressState, baseRevision: number): Promise<PutResult>;
  delete(userKey: string): Promise<void>;
}

export class StoreUnavailableError extends Error {
  constructor(message = 'Progress storage is not configured.') {
    super(message);
    this.name = 'StoreUnavailableError';
  }
}

const KEY_PREFIX = 'ai-odin:progress:v2:';

/* ---------------------------------- Redis --------------------------------- */

// Atomic compare-and-set on the stored revision. Returns {'ok'} on success or
// {'conflict', <current json or ''>} when the caller's base revision is stale.
const CAS_SCRIPT = `
local cur = redis.call('GET', KEYS[1])
local rev = 0
if cur then rev = tonumber(cjson.decode(cur)['revision']) or 0 end
if rev ~= tonumber(ARGV[1]) then
  if cur then return {'conflict', cur} end
  return {'conflict', ''}
end
redis.call('SET', KEYS[1], ARGV[2])
return {'ok'}
`;

function createRedisStore(url: string, token: string): ProgressStore {
  const redis = new Redis({ url, token, automaticDeserialization: false });
  return {
    name: 'redis',
    async get(userKey) {
      const raw = await redis.get<string>(KEY_PREFIX + userKey);
      return raw ? (JSON.parse(raw) as StoredProgress) : null;
    },
    async put(userKey, state, baseRevision) {
      const record: StoredProgress = {
        state,
        revision: baseRevision + 1,
        updatedAt: new Date().toISOString(),
      };
      const res = await redis.eval<[string, string], string[]>(
        CAS_SCRIPT,
        [KEY_PREFIX + userKey],
        [String(baseRevision), JSON.stringify(record)]
      );
      if (res[0] === 'ok') return { ok: true, record };
      return { ok: false, conflict: res[1] ? (JSON.parse(res[1]) as StoredProgress) : null };
    },
    async delete(userKey) {
      await redis.del(KEY_PREFIX + userKey);
    },
  };
}

/* ------------------------- Local file (development) ------------------------ */

export function createFileStore(file: string): ProgressStore {
  // Serialise writes inside this process so read-modify-write stays atomic.
  let queue: Promise<unknown> = Promise.resolve();
  const locked = <T>(fn: () => Promise<T>): Promise<T> => {
    const run = queue.then(fn, fn);
    queue = run.catch(() => undefined);
    return run;
  };

  const readAll = async (): Promise<Record<string, StoredProgress>> => {
    try {
      return JSON.parse(await fs.readFile(file, 'utf8')) as Record<string, StoredProgress>;
    } catch {
      return {};
    }
  };
  const writeAll = async (data: Record<string, StoredProgress>) => {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
  };

  return {
    name: 'local-file',
    async get(userKey) {
      return (await readAll())[userKey] ?? null;
    },
    put(userKey, state, baseRevision) {
      return locked(async () => {
        const all = await readAll();
        const current = all[userKey] ?? null;
        if ((current?.revision ?? 0) !== baseRevision) return { ok: false as const, conflict: current };
        const record: StoredProgress = {
          state,
          revision: baseRevision + 1,
          updatedAt: new Date().toISOString(),
        };
        all[userKey] = record;
        await writeAll(all);
        return { ok: true as const, record };
      });
    },
    delete(userKey) {
      return locked(async () => {
        const all = await readAll();
        delete all[userKey];
        await writeAll(all);
      });
    },
  };
}

/* --------------------------------- Factory -------------------------------- */

let cached: ProgressStore | null = null;

export function getProgressStore(): ProgressStore {
  if (cached) return cached;

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    cached = createRedisStore(url, token);
  } else if (process.env.NODE_ENV !== 'production') {
    cached = createFileStore(path.join(process.cwd(), '.data', 'progress.json'));
  } else {
    // Never silently fall back to ephemeral disk in production.
    throw new StoreUnavailableError();
  }
  return cached;
}
