import { describe, expect, it } from "vitest";
import fixtureJson from "../../fixtures/haunted-checkout.json";
import { REDACTED, TOO_DEEP, redact } from "../../src/lib/redact";
import { deepFreeze } from "../engine/helpers";

function chain(levels: number): unknown {
  let v: unknown = "leaf";
  for (let i = 0; i < levels; i++) v = { n: v };
  return v;
}

describe("redact", () => {
  it("F12: sensitive keys at several depths, inside arrays, are redacted; siblings kept", () => {
    const input = {
      token: "t",
      keep: "ok",
      a: {
        secret: "s",
        keep: 1,
        b: [{ cookie: "c", keep: true }, { c: { authorization: "Bearer x", api_key: "k", keep: null } }],
      },
      apiKey: "k2",
      payment: { card_number: "4242424242424242", amount: 100 },
    };
    expect(redact(input)).toEqual({
      token: REDACTED,
      keep: "ok",
      a: {
        secret: REDACTED,
        keep: 1,
        b: [{ cookie: REDACTED, keep: true }, { c: { authorization: REDACTED, api_key: REDACTED, keep: null } }],
      },
      apiKey: REDACTED,
      payment: { card_number: REDACTED, amount: 100 },
    });
  });

  it("a sensitive key with an object value redacts the whole value", () => {
    expect(redact({ secret: { inner: 1 }, API_KEY: [1, 2] })).toEqual({ secret: REDACTED, API_KEY: REDACTED });
  });

  it("F22: signature header variants", () => {
    const out = redact({
      signature: "a",
      "x-signature": "b",
      "Webhook-Signature": "c",
      "X-SIGNATURE": "d",
      "API-KEY": "e",
      ok: "f",
    });
    expect(out).toEqual({
      signature: REDACTED,
      "x-signature": REDACTED,
      "Webhook-Signature": REDACTED,
      "X-SIGNATURE": REDACTED,
      "API-KEY": REDACTED,
      ok: "f",
    });
  });

  it("depth: containers deeper than 32 become TOO_DEEP; no throw even at 10 000 levels", () => {
    let out = redact(chain(40)) as Record<string, unknown>;
    for (let i = 1; i < 32; i++) out = out.n as Record<string, unknown>;
    expect(out).toEqual({ n: TOO_DEEP }); // 32nd container kept, 33rd cut
    expect(() => redact(chain(10_000))).not.toThrow();
    expect(JSON.stringify(redact(chain(10_000)))).toContain(TOO_DEEP);
    expect(redact(chain(31))).toEqual(chain(31));
    expect(redact(chain(32))).toEqual(chain(32));
  });

  it("fixture passes unchanged (no false positives)", () => {
    expect(redact(fixtureJson)).toEqual(fixtureJson);
  });

  it("does not mutate a deep-frozen input and returns a new object", () => {
    const input = deepFreeze({ token: "t", list: [{ secret: "s", v: 1 }], v: 2 });
    const before = JSON.stringify(input);
    const out = redact(input);
    expect(JSON.stringify(input)).toBe(before);
    expect(out).not.toBe(input);
  });

  it("copies primitives and keeps a __proto__ key as plain data", () => {
    expect(redact("s")).toBe("s");
    expect(redact(5)).toBe(5);
    expect(redact(null)).toBeNull();
    const parsed = JSON.parse('{"__proto__": {"x": 1}, "a": 1}');
    const out = redact(parsed) as Record<string, unknown>;
    expect(Object.getPrototypeOf(out)).toBe(Object.prototype);
    expect(Object.keys(out)).toEqual(["__proto__", "a"]);
  });
});
