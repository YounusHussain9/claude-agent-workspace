---
name: data
description: Answer a data request from live data, read-only, as a sourced report with counts only. Use for "how many users/orders/jobs…", "group by company", "give me a report", "export these numbers", "the owner wants a report".
---

# Data report (read-only)

1. **Pin the definition first.** Write the question as one precise sentence: what is counted, grouped by what,
   which time window, which environment (staging/prod). If a word is ambiguous ("active" = logged in this month?
   any row? not deleted?), ask with a default and wait. Never guess a definition.
2. **Pick the source** (in this order, as listed under "Data sources" in `workspace.md`):
   - A **read-only database MCP** (for example `list_tables` → `describe_table` → `run_select`).
     Not authenticated? Tell the user: run `/mcp`, pick the connector, log in.
   - `node bin/api-get.js <service> <GET path>` with endpoints from `apis/<repo>.md`, then
     `node bin/data-count.js <saved file> --by <field>`. Missing token → ask the approver; never ask for it in chat.
   - Neither covers it → say so, and offer a FEATURE: a read-only report endpoint (via `intake`).
3. **Query for aggregates, not rows.** Every result row lands in the context, so a 200-row result costs
   10–20k tokens; a `GROUP BY` result costs a few hundred. `SELECT org, COUNT(*) … GROUP BY org`. If the MCP caps
   rows, paging through rows to count them gives wrong totals. Check the counts add up (total = sum of groups).
4. **Sanity checks** before reporting: totals vs a plain `COUNT(*)`, nulls/empty groups, duplicates (same person
   twice?), soft-deleted rows (`deleted_at`), test/demo accounts. Write what you found.
5. **Write** `docs/data/<YYYY-MM-DD>-<slug>.md`:
   - `Status: UNVERIFIED (approver spot-check pending)`
   - Question (the precise sentence), Answer (table of counts), Source (tool/endpoint, env, time, exact SQL or
     path), Checks done, Caveats.
   No personal data (names, emails, phones, ID numbers, addresses) in the file or the chat.
6. **Reply** with the answer table + the file path + "Spot-check 2–3 numbers in the app, then share."
