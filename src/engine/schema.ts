import type { EventType, IncidentBundle, ParseResult, ValidationError } from "./types";

export const MAX_BYTES = 1_048_576;
export const MAX_EVENTS = 500;
export const MAX_DEPTH = 32;
export const MAX_EVENT_JSON_CHARS = 16_384;
const MAX_ERRORS = 50;
const MAX_WALK_NODES = 200_000;

const EVENT_TYPES: readonly EventType[] = [
  "checkout.created",
  "payment.captured",
  "fulfillment.requested",
];

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isPositiveMinor(v: unknown): v is number {
  return typeof v === "number" && Number.isSafeInteger(v) && v > 0;
}

export function isValidIsoTimestamp(s: string): boolean {
  const m = ISO_RE.exec(s);
  if (!m) return false;
  const [y, mo, d, h, mi, se] = [1, 2, 3, 4, 5, 6].map((i) => Number(m[i]));
  if (y === undefined || mo === undefined || d === undefined) return false;
  if (h === undefined || mi === undefined || se === undefined) return false;
  const dt = new Date(Date.UTC(y, mo - 1, d, h, mi, se));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === mo - 1 &&
    dt.getUTCDate() === d &&
    dt.getUTCHours() === h &&
    dt.getUTCMinutes() === mi &&
    dt.getUTCSeconds() === se
  );
}

/** Iterative nesting depth of JSON text (never recurses, never parses). Stops early above MAX_DEPTH. */
export function measureTextDepth(text: string): number {
  let depth = 0;
  let max = 0;
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === "{" || c === "[") {
      depth++;
      if (depth > max) max = depth;
      if (max > MAX_DEPTH) return max;
    } else if ((c === "}" || c === "]") && depth > 0) depth--;
  }
  return max;
}

/** Iterative nesting depth of a parsed value. Returns Infinity when the walk exceeds its node budget. */
export function measureValueDepth(value: unknown): number {
  const stack: Array<[unknown, number]> = [[value, 1]];
  let max = 0;
  let visited = 0;
  while (stack.length > 0) {
    const item = stack.pop();
    if (!item) break;
    const [v, depth] = item;
    if (typeof v !== "object" || v === null) continue;
    if (++visited > MAX_WALK_NODES) return Infinity;
    if (depth > max) max = depth;
    if (max > MAX_DEPTH) return max;
    const children = Array.isArray(v) ? v : Object.values(v);
    for (const child of children) stack.push([child, depth + 1]);
  }
  return max;
}

function validateEventShape(
  e: unknown,
  i: number,
  currency: string,
  seenIndexes: Set<number>,
  errors: ValidationError[],
): void {
  const p = `events[${i}]`;
  const add = (path: string, code: string, message: string) => {
    if (errors.length < MAX_ERRORS) errors.push({ path, code, message });
  };
  if (!isObject(e)) {
    add(p, "invalid_event", "Event must be an object.");
    return;
  }
  if (JSON.stringify(e).length > MAX_EVENT_JSON_CHARS) {
    add(p, "event_too_large", `Event exceeds ${MAX_EVENT_JSON_CHARS} characters.`);
    return;
  }
  if (typeof e.eventId !== "string" || e.eventId.length === 0 || e.eventId.length > 200) {
    add(`${p}.eventId`, "invalid_event_id", "eventId must be a non-empty string (max 200 chars).");
  }
  if (typeof e.deliveryIndex !== "number" || !Number.isSafeInteger(e.deliveryIndex) || e.deliveryIndex < 1) {
    add(`${p}.deliveryIndex`, "invalid_delivery_index", "deliveryIndex must be an integer >= 1.");
  } else if (seenIndexes.has(e.deliveryIndex)) {
    add(`${p}.deliveryIndex`, "duplicate_delivery_index", `deliveryIndex ${e.deliveryIndex} is reused.`);
  } else {
    seenIndexes.add(e.deliveryIndex);
  }
  if (typeof e.occurredAt !== "string" || !isValidIsoTimestamp(e.occurredAt)) {
    add(`${p}.occurredAt`, "invalid_timestamp", "occurredAt must be a valid ISO-8601 UTC timestamp (YYYY-MM-DDTHH:mm:ss[.SSS]Z).");
  }
  const typeOk = typeof e.type === "string" && (EVENT_TYPES as readonly string[]).includes(e.type);
  if (!typeOk) add(`${p}.type`, "unknown_event_type", `type must be one of ${EVENT_TYPES.join(", ")}.`);
  if (e.version !== 1 && e.version !== 2) {
    add(`${p}.version`, "unknown_event_version", "version must be 1 or 2.");
  }
  if (typeof e.checkoutId !== "string" || e.checkoutId.length === 0 || e.checkoutId.length > 200) {
    add(`${p}.checkoutId`, "invalid_checkout_id", "checkoutId must be a non-empty string (max 200 chars).");
  }
  if (!isObject(e.payload)) {
    add(`${p}.payload`, "invalid_payload", "payload must be an object.");
    return;
  }
  const payload = e.payload;
  const money = (key: string) => {
    if (!isPositiveMinor(payload[key])) {
      add(`${p}.payload.${key}`, "invalid_money", `${key} must be a positive integer in minor currency units.`);
    }
  };
  const needCurrency = () => {
    if (typeof payload.currency !== "string" || payload.currency.length === 0) {
      add(`${p}.payload.currency`, "missing_currency", "payload.currency is required.");
    } else if (payload.currency !== currency) {
      add(`${p}.payload.currency`, "invalid_currency", `payload.currency must equal bundle currency ${currency}.`);
    }
  };
  if (e.type === "checkout.created") {
    if (e.version !== 1) add(`${p}.version`, "unknown_event_version", "checkout.created supports version 1 only.");
    money("total_minor");
    needCurrency();
  } else if (e.type === "payment.captured") {
    if (e.version === 2) money("amount_minor");
    else if (e.version === 1) money("amount_cents");
    needCurrency();
  } else if (e.type === "fulfillment.requested") {
    if (e.version !== 1) add(`${p}.version`, "unknown_event_version", "fulfillment.requested supports version 1 only.");
  }
}

/** Validate an already-parsed value. Never throws for bad data. Returns a deep clone on success. */
export function validateBundle(value: unknown): ParseResult {
  const errors: ValidationError[] = [];
  const fail = (path: string, code: string, message: string): ParseResult => ({
    ok: false,
    errors: [...errors, { path, code, message }],
  });

  if (measureValueDepth(value) > MAX_DEPTH) {
    return fail("$", "too_deep", `JSON nesting depth exceeds ${MAX_DEPTH}.`);
  }
  if (!isObject(value)) return fail("$", "invalid_bundle", "Bundle must be a JSON object.");
  if (value.schemaVersion !== 1) {
    return fail("schemaVersion", "unknown_schema_version", "schemaVersion must be 1.");
  }
  if (typeof value.incidentId !== "string" || value.incidentId.length === 0) {
    errors.push({ path: "incidentId", code: "invalid_incident_id", message: "incidentId must be a non-empty string." });
  }
  if (typeof value.title !== "string") {
    errors.push({ path: "title", code: "invalid_title", message: "title must be a string." });
  }
  if (value.currency !== "USD") {
    errors.push({ path: "currency", code: "invalid_currency", message: 'Bundle currency must be "USD".' });
  }
  if (!Array.isArray(value.events)) {
    return fail("events", "invalid_events", "events must be an array.");
  }
  if (value.events.length > MAX_EVENTS) {
    return fail("events", "too_many_events", `A bundle may contain at most ${MAX_EVENTS} events.`);
  }
  if (value.events.length === 0) {
    errors.push({ path: "events", code: "no_events", message: "events must not be empty." });
  }
  const seen = new Set<number>();
  value.events.forEach((e: unknown, i: number) => validateEventShape(e, i, "USD", seen, errors));
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, bundle: structuredClone(value) as IncidentBundle };
}

/** Parse and validate JSON text. Never throws, never executes content, never touches the network. */
export function parseBundleText(text: string): ParseResult {
  if (typeof text !== "string") {
    return { ok: false, errors: [{ path: "$", code: "invalid_input", message: "Input must be text." }] };
  }
  if (text.length > MAX_BYTES || new TextEncoder().encode(text).length > MAX_BYTES) {
    return { ok: false, errors: [{ path: "$", code: "too_large", message: `File exceeds ${MAX_BYTES} bytes.` }] };
  }
  if (measureTextDepth(text) > MAX_DEPTH) {
    return { ok: false, errors: [{ path: "$", code: "too_deep", message: `JSON nesting depth exceeds ${MAX_DEPTH}.` }] };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, errors: [{ path: "$", code: "malformed_json", message: "File is not valid JSON." }] };
  }
  return validateBundle(parsed);
}
