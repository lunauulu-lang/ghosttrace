# MCP call evidence (Slice 4)

Date: 2026-11-19 18:48 (local, Windows host). Surface: Kiro IDE, session sess_07de11ed-1d1a-4df5-9048-492fd931d4d3.
Server: `ghosttrace` (`npx tsx mcp/server.ts`, registered in `.kiro/settings/mcp.json`), shown as Connected with 3 tools.
All three calls were made through the MCP tool interface (`tool_call` on `tool::ghosttrace::*`), not through the shell. The calls were issued in one batch. Each output below is the tool result exactly as returned, with its original line breaks and indentation. The calls were not re-run.

## Call 1: replay_incident, no repairs
Tool: `replay_incident`
Input: `{"path": "fixtures/haunted-checkout.json"}`
Output:
```json
{
  "result": "FAIL",
  "config": {
    "normalizeV2Amount": false,
    "deduplicateDeliveries": false,
    "causalCheckoutOrder": false
  },
  "halted": false,
  "capturedMinor": 0,
  "totalMinor": 4900,
  "fulfilled": [
    {
      "checkoutId": "demo-001",
      "fulfilled": false
    }
  ],
  "violations": [
    {
      "code": "schema_drift",
      "deliveryIndex": 1,
      "eventId": "evt-payment-001",
      "message": "v2 payment carries amount_minor but the legacy consumer reads amount_cents."
    },
    {
      "code": "order_violation",
      "deliveryIndex": 1,
      "eventId": "evt-payment-001",
      "message": "Payment arrived before checkout demo-001 existed."
    },
    {
      "code": "schema_drift",
      "deliveryIndex": 3,
      "eventId": "evt-payment-001",
      "message": "v2 payment carries amount_minor but the legacy consumer reads amount_cents."
    },
    {
      "code": "fulfillment_without_capture",
      "deliveryIndex": 4,
      "eventId": "evt-fulfillment-001",
      "message": "Fulfillment requested with no captured payment."
    }
  ],
  "firstViolation": {
    "code": "schema_drift",
    "deliveryIndex": 1,
    "eventId": "evt-payment-001"
  },
  "firstDivergenceVsBaseline": null,
  "inputHash": "cyrb53-0ed5aa239567c4"
}
```

## Call 2: replay_incident, all repairs
Tool: `replay_incident`
Input: `{"path": "fixtures/haunted-checkout.json", "repairs": "M,O,D"}`
Output:
```json
{
  "result": "PASS",
  "config": {
    "normalizeV2Amount": true,
    "deduplicateDeliveries": true,
    "causalCheckoutOrder": true
  },
  "halted": false,
  "capturedMinor": 4900,
  "totalMinor": 4900,
  "fulfilled": [
    {
      "checkoutId": "demo-001",
      "fulfilled": true
    }
  ],
  "violations": [],
  "firstViolation": null,
  "firstDivergenceVsBaseline": {
    "eventId": "evt-payment-001",
    "deliveryIndex": 1,
    "baseline": "rejected",
    "repaired": "applied"
  },
  "inputHash": "cyrb53-0ed5aa239567c4"
}
```

## Call 3: diff_runs, no repairs vs all repairs
Tool: `diff_runs`
Input: `{"path": "fixtures/haunted-checkout.json", "repairsA": "", "repairsB": "M,O,D"}`
Output:
```json
{
  "a": {
    "config": {
      "normalizeV2Amount": false,
      "deduplicateDeliveries": false,
      "causalCheckoutOrder": false
    },
    "result": "FAIL"
  },
  "b": {
    "config": {
      "normalizeV2Amount": true,
      "deduplicateDeliveries": true,
      "causalCheckoutOrder": true
    },
    "result": "PASS"
  },
  "identical": false,
  "divergenceCount": 3,
  "firstDivergence": {
    "eventId": "evt-payment-001",
    "deliveryIndex": 1,
    "a": {
      "decision": "rejected",
      "violations": [
        "schema_drift",
        "order_violation"
      ],
      "after": {
        "checkouts": []
      }
    },
    "b": {
      "decision": "applied",
      "violations": [],
      "after": {
        "checkouts": [
          {
            "checkoutId": "demo-001",
            "totalMinor": 4900,
            "capturedMinor": 4900,
            "fulfilled": false
          }
        ]
      }
    }
  }
}
```

## Consistency check
These match the golden outcomes: G000 FAIL with 0 captured, G111 PASS with 4900 captured, and a first divergence at d1 (rejected vs applied).

## Call 4: export_regression, repairs M,O,D (Slice 7, 2026-11-19, ~22:56 +06:00)
Called through the Kiro MCP tool `ghosttrace` / `export_regression` (not the shell), in the Slice 7 session (session ID sess_c01bf788-e278-4014-97b2-34d1afd9f879).
Input:
```json
{"path": "fixtures/haunted-checkout.json", "repairs": "M,O,D"}
```
Output (exact; the tool writes nothing to disk):
```json
{
  "preset": {
    "config": {
      "normalizeV2Amount": true,
      "deduplicateDeliveries": true,
      "causalCheckoutOrder": true
    }
  },
  "exportFile": {
    "format": "ghosttrace-export",
    "formatVersion": 1,
    "preset": {
      "config": {
        "normalizeV2Amount": true,
        "deduplicateDeliveries": true,
        "causalCheckoutOrder": true
      }
    },
    "bundle": {
      "schemaVersion": 1,
      "incidentId": "incident-haunted-checkout-001",
      "title": "The Haunted Checkout (synthetic, no actual payments)",
      "currency": "USD",
      "events": [
        {
          "eventId": "evt-payment-001",
          "deliveryIndex": 1,
          "occurredAt": "2026-11-16T10:00:02.000Z",
          "type": "payment.captured",
          "version": 2,
          "checkoutId": "demo-001",
          "payload": {
            "amount_minor": 4900,
            "currency": "USD"
          }
        },
        {
          "eventId": "evt-checkout-001",
          "deliveryIndex": 2,
          "occurredAt": "2026-11-16T10:00:00.000Z",
          "type": "checkout.created",
          "version": 1,
          "checkoutId": "demo-001",
          "payload": {
            "total_minor": 4900,
            "currency": "USD"
          }
        },
        {
          "eventId": "evt-payment-001",
          "deliveryIndex": 3,
          "occurredAt": "2026-11-16T10:00:02.000Z",
          "type": "payment.captured",
          "version": 2,
          "checkoutId": "demo-001",
          "payload": {
            "amount_minor": 4900,
            "currency": "USD"
          }
        },
        {
          "eventId": "evt-fulfillment-001",
          "deliveryIndex": 4,
          "occurredAt": "2026-11-16T10:00:04.000Z",
          "type": "fulfillment.requested",
          "version": 1,
          "checkoutId": "demo-001",
          "payload": {
            "destination": "synthetic-demo-only"
          }
        }
      ]
    }
  },
  "exportText": "(string field: the same exportFile serialized as pretty-printed JSON with 2-space indent and a trailing newline; omitted here to avoid duplicating it)",
  "repairSpec": "# Kiro repair spec: The Haunted Checkout (synthetic, no actual payments)\n\nAll amounts are simulated synthetic values. No real payment occurred.\n\n## Failing invariants (all repairs off)\n\n| Code | Delivery | Message |\n|---|---|---|\n| schema_drift | d1 | v2 payment carries amount_minor but the legacy consumer reads amount_cents. |\n| order_violation | d1 | Payment arrived before checkout demo-001 existed. |\n| schema_drift | d3 | v2 payment carries amount_minor but the legacy consumer reads amount_cents. |\n| fulfillment_without_capture | d4 | Fulfillment requested with no captured payment. |\n\n## Repairs applied\n\n- [x] Schema mapping (v2 amount)\n- [x] Causal ordering\n- [x] Deduplicate applied deliveries\n\n## Fixed\n\n- schema_drift\n- order_violation\n- fulfillment_without_capture\n\n## Still failing\n\nNone.\n\n## Result\n\n**PASS**\n\n- Checkout demo-001: captured $49.00 of $49.00, fulfilled yes\n"
}
```
Note on the `exportText` field: I shortened that one field in this file because it repeats `exportFile` verbatim; every other field is exactly as returned. This is the only edit.
Secret check: the output contains only synthetic fixture values. No key, token, signature, cookie or card data appears; the only free-text value is `destination: synthetic-demo-only`.
Meaning: this synthetic replay passes with all three repairs on. It is not a production repair claim.