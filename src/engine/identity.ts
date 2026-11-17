import type { ConflictGroup, IncidentEvent } from "./types";

const MAX_CANONICAL_DEPTH = 64;

/** Stable JSON with recursively sorted object keys. Optionally omits keys at the top level only. */
export function canonicalJson(value: unknown, omitTopLevel?: ReadonlySet<string>, depth = 0): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") return Number.isFinite(value) ? JSON.stringify(value) : "null";
  if (typeof value !== "object") return "null";
  if (depth > MAX_CANONICAL_DEPTH) return '"[too-deep]"';
  if (Array.isArray(value)) {
    return "[" + value.map((v) => canonicalJson(v, undefined, depth + 1)).join(",") + "]";
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined && !(omitTopLevel && omitTopLevel.has(k)))
    .sort();
  return (
    "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalJson(obj[k], undefined, depth + 1)).join(",") + "}"
  );
}

const DELIVERY_INDEX_ONLY: ReadonlySet<string> = new Set(["deliveryIndex"]);

/** Canonical identity of an event: every field except deliveryIndex (unknown payload fields included). */
export function canonicalEventContent(event: IncidentEvent): string {
  return canonicalJson(event, DELIVERY_INDEX_ONLY);
}

/**
 * Same eventId with different canonical content is a hard conflict, independent of repairs.
 * Evaluated before any execution. Deterministic: groups ordered by first deliveryIndex.
 */
export function detectConflicts(events: readonly IncidentEvent[]): ConflictGroup[] {
  const sorted = [...events].sort((a, b) => a.deliveryIndex - b.deliveryIndex);
  const first = new Map<string, string>();
  const all = new Map<string, number[]>();
  const conflicting = new Set<string>();
  for (const e of sorted) {
    const canon = canonicalEventContent(e);
    const known = first.get(e.eventId);
    if (known === undefined) first.set(e.eventId, canon);
    else if (known !== canon) conflicting.add(e.eventId);
    const list = all.get(e.eventId);
    if (list) list.push(e.deliveryIndex);
    else all.set(e.eventId, [e.deliveryIndex]);
  }
  const groups: ConflictGroup[] = [];
  for (const [eventId, indexes] of all) {
    if (conflicting.has(eventId)) groups.push({ eventId, deliveryIndexes: indexes });
  }
  return groups.sort((a, b) => (a.deliveryIndexes[0] ?? 0) - (b.deliveryIndexes[0] ?? 0));
}

/**
 * Applied-only idempotency: a delivery is a skippable duplicate only when deduplication is on
 * AND an earlier delivery with the same eventId was successfully applied.
 * Rejected deliveries never add to `appliedEventIds`.
 */
export function isSkippableDuplicate(
  appliedEventIds: ReadonlySet<string>,
  eventId: string,
  deduplicate: boolean,
): boolean {
  return deduplicate && appliedEventIds.has(eventId);
}
