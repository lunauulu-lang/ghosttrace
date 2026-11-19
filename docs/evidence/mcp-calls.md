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
