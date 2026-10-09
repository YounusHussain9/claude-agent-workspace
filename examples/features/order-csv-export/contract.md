# Contract: order-csv-export

Taken from the real backend code (`src/orders/list.controller.ts`), never invented.

## GET /api/orders/export
Query: `status` (optional, `paid|refunded|cancelled`), `from`, `to` (optional, `YYYY-MM-DD`).
Auth: logged-in shop admin; only their own shop's orders.

**200** `text/csv`, header `Content-Disposition: attachment; filename="orders-2026-01-20.csv"`
```
Order no,Date,Status,Total
10231,2026-01-19,paid,49.90
10232,2026-01-19,refunded,12.00
```

| Code | When | Body |
|---|---|---|
| 401 | not logged in | `{ "message": "Unauthenticated." }` |
| 403 | another shop's filter | `{ "message": "Forbidden." }` |
| 422 | bad date | `{ "message": "The given data was invalid.", "errors": { "from": ["The from is not a valid date."] } }` |
