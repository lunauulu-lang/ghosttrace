export const REDACTED = "[REDACTED]";
export const TOO_DEEP = "[MAX_DEPTH_EXCEEDED]";

const SENSITIVE_PARTS = ["token", "secret", "cookie", "authorization", "apikey", "cardnumber", "signature"];

/** Lowercase, drop `-` and `_`, then check for a sensitive fragment. */
export function isSensitiveKey(key: string): boolean {
  const k = key.toLowerCase().replace(/[-_]/g, "");
  return SENSITIVE_PARTS.some((p) => k.includes(p));
}

function setOwn(target: Record<string, unknown>, key: string, value: unknown): void {
  // defineProperty keeps keys like "__proto__" as plain data instead of changing the prototype.
  Object.defineProperty(target, key, { value, enumerable: true, writable: true, configurable: true });
}

function walk(value: unknown, depth: number, maxDepth: number): unknown {
  if (typeof value !== "object" || value === null) return value;
  // Depth counts containers like schema.ts: the root container is depth 1.
  if (depth > maxDepth) return TOO_DEEP;
  if (Array.isArray(value)) {
    return value.map((item) => walk(item, depth + 1, maxDepth));
  }
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    const child = (value as Record<string, unknown>)[key];
    setOwn(out, key, isSensitiveKey(key) ? REDACTED : walk(child, depth + 1, maxDepth));
  }
  return out;
}

/**
 * Returns a redacted copy. Never mutates the input, never throws for plain data.
 * Recursion is bounded by maxDepth (default 32, same counting as schema.ts), so a
 * very deep input cannot overflow the stack.
 */
export function redact(value: unknown, maxDepth = 32): unknown {
  return walk(value, 1, maxDepth);
}
