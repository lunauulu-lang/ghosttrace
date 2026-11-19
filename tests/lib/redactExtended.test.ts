import { describe, expect, it } from "vitest";
import { REDACTED, isSensitiveKey, redact } from "../../src/lib/redact";

describe("redact: extended secret keys", () => {
  it("redacts password, passwd, private_key, cvv, cvc, card, pan, session, hmac, signature, cookie", () => {
    const input = {
      password: "a",
      passwd: "b",
      private_key: "c",
      privateKey: "c2",
      cvv: "d",
      CVC: "e",
      card: { last4: "4242" },
      pan: "f",
      session: "g",
      session_id: "g2",
      hmac: "h",
      signature: "i",
      cookie: "j",
      keep: "ok",
    };
    expect(redact(input)).toEqual({
      password: REDACTED,
      passwd: REDACTED,
      private_key: REDACTED,
      privateKey: REDACTED,
      cvv: REDACTED,
      CVC: REDACTED,
      card: REDACTED,
      pan: REDACTED,
      session: REDACTED,
      session_id: REDACTED,
      hmac: REDACTED,
      signature: REDACTED,
      cookie: REDACTED,
      keep: "ok",
    });
  });

  it("matches nested keys, keys in arrays, and word forms like card_pan and cardCvv", () => {
    const out = redact({ a: [{ card_pan: "1", cardCvv: "2", x: { user_password: "3", HMAC_SHA: "4" } }] });
    expect(out).toEqual({ a: [{ card_pan: REDACTED, cardCvv: REDACTED, x: { user_password: REDACTED, HMAC_SHA: REDACTED } }] });
  });

  it("short words match only as whole words: no false positives on company, panel, discard, cvvx", () => {
    for (const k of ["company", "panel", "expand", "discard", "cardinality", "span", "amount_minor", "currency"]) {
      expect(isSensitiveKey(k)).toBe(false);
    }
    expect(redact({ company: "c", panel: "p" })).toEqual({ company: "c", panel: "p" });
  });

  it("does not mutate its input", () => {
    const input = Object.freeze({ password: "p", nested: Object.freeze({ cvv: "1" }) });
    redact(input);
    expect(input).toEqual({ password: "p", nested: { cvv: "1" } });
  });
});
