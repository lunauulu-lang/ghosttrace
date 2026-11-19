export const REDACTED = "[REDACTED]";
export const TOO_DEEP = "[MAX_DEPTH_EXCEEDED]";

// Fragments matched anywhere in the normalized key (lowercase, `-` and `_` removed).
const SENSITIVE_PARTS = [
  "token",
  "secret",
  "cookie",
  "authorization",
  "apikey",
  "cardnumber",
  "signature",
  "password",
  "passwd",
  "privatekey",
  "hmac",
  "session",
];
// Short words matched only as a whole word of the key, so "pan" does not hit "company" or "panel".
const SENSITIVE_WORDS = ["cvv", "cvc", "card", "pan"];

function keyWords(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 0);
}

/** True when the key names a secret: a sensitive fragment or a sensitive whole word. */
export function isSensitiveKey(key: string): boolean {
  const k = key.toLowerCase().replace(/[-_]/g, "");
  if (SENSITIVE_PARTS.some((p) => k.includes(p))) return true;
  return keyWords(key).some((w) => SENSITIVE_WORDS.includes(w));
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
