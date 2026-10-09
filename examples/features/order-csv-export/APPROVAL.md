# Approve: order-csv-export · Plan gate

**What you are approving:** the API contract and how the work is split. No code exists yet.

## Contract (summary)
- `GET /api/orders/export?status=&from=&to=` → `text/csv`, streamed.
- Same filters as `GET /api/orders`. Same ownership check: other shops get `403`.
- Errors: `401` not logged in, `403` other shop, `422` bad date.

## Lanes
| Lane | Repo | What |
|---|---|---|
| B1 backend | shop-api | export endpoint + tests (happy, 403, 422) |
| F1 frontend | shop-web | "Export CSV" button, disabled state, spinner |
| Q1 qa | shop-web | Playwright tests for AC1–AC5 at 375/768/1280 |

## Branches (you run these)
```
git -C shop-api switch -c feature/order-csv-export
git -C shop-web switch -c feature/order-csv-export
```

## Risks
- 10,000+ orders: streamed, so memory stays flat. Response time target: first byte < 500 ms.

To approve, run in your own terminal: `bin/approve order-csv-export plan`
