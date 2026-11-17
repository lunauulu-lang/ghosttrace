import fixtureJson from "../../fixtures/haunted-checkout.json";
import { validateBundle } from "../../src/engine/schema";
import type { IncidentBundle, RepairConfig } from "../../src/engine/types";

export function loadFixture(): IncidentBundle {
  const r = validateBundle(fixtureJson);
  if (!r.ok) throw new Error("fixture invalid: " + JSON.stringify(r.errors));
  return r.bundle;
}

export function cfg(m: 0 | 1, o: 0 | 1, d: 0 | 1): RepairConfig {
  return { normalizeV2Amount: m === 1, causalCheckoutOrder: o === 1, deduplicateDeliveries: d === 1 };
}

export function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value)) deepFreeze(v);
  }
  return value;
}
