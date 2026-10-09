# Orders by status, last 30 days

Status: UNVERIFIED (approver spot-check pending)

**Question:** How many orders were placed in the last 30 days (2025-12-21 to 2026-01-20), grouped by status,
in production, excluding test shops?

| Status | Orders |
|---|---|
| paid | 1,284 |
| refunded | 37 |
| cancelled | 112 |
| **total** | **1,433** |

**Source:** read-only DB MCP `run_select`, production, 2026-01-20 09:14 UTC.
```sql
SELECT status, COUNT(*) FROM orders
WHERE created_at >= NOW() - INTERVAL 30 DAY AND deleted_at IS NULL AND shop_id NOT IN (SELECT id FROM shops WHERE is_test = 1)
GROUP BY status;
```

**Checks:** total matches a plain `COUNT(*)` (1,433). 0 null statuses. 4 test shops excluded (52 orders).

**Caveats:** "placed" = `created_at`, not payment date.
