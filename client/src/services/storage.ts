/**
 * Thin, typed wrapper around localStorage — the only place components/hooks
 * should touch it directly, so a schema change (versioning) or a swap to
 * another persistence mechanism happens in one place.
 */
const PREFIX = "marketverse:";
const VERSION = "v1";

function key(name: string): string {
  return `${PREFIX}${VERSION}:${name}`;
}

export const storage = {
  get<T>(name: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key(name));
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(name: string, value: T): void {
    try {
      localStorage.setItem(key(name), JSON.stringify(value));
    } catch {
      // Storage full/unavailable (private browsing) — non-fatal, value just won't persist.
    }
  },
  remove(name: string): void {
    localStorage.removeItem(key(name));
  },
};
