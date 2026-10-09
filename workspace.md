# Workspace registry

The map Claude reads first: which repo owns what, and which API serves which data.
The table between the AUTO markers is rewritten by `node bin/scan-repos.js`; edit everything else by hand.

<!-- Put the approver's exact `git config --global user.name` here. Only that person can sign gates. -->
Approver: Your Name
Tracker team: your-team

## Products → repos → APIs (hand-written; replace the example rows)

| Product / module | Frontend repo | Backend / API | API service key (tokens.env) | Notes |
|---|---|---|---|---|
| Shop (example) | shop-web | shop-api (Express) `/api/…` | SHOP | Orders list = `GET /api/orders` |
| Admin (example) | admin-web | shop-api | SHOP | |

## Test commands per repo
"Runs in" is `native` (run the command inside the repo folder) or `docker` (run it with `bin/dev test <repo>`).
No Docker on this laptop? Use `native` everywhere.

| Repo | Test command | Runs in |
|---|---|---|
| shop-web (example) | `npm test` | native |
| shop-api (example) | `php artisan test` | docker |

## Themes (use the owning product's look for every page Claude makes)
| Product | Theme source |
|---|---|
| Shop (example) | `shop-web/tailwind.config.js`, `shop-web/app/globals.css` |

## Data sources (read-only)
| Source | What | How to use | Status |
|---|---|---|---|
| Read-only DB MCP (example) | `list_tables`, `describe_table`, `run_select` | `/mcp` → log in once | not set up |
| Team APIs | GET endpoints in `apis/*.md` | `node bin/api-get.js` + `.secrets/tokens.env` | tokens not set |

## Data rules
- Reports show counts and groups, never names, emails, phones or ID numbers in chat.
- Every number says its source: service, environment, endpoint, fetch time.
- A report is **UNVERIFIED** until the approver spot-checks it (2–3 values against the real app).

<!-- AUTO:START (node bin/scan-repos.js rewrites this block) -->
_Run `node bin/scan-repos.js` to fill this table._
<!-- AUTO:END -->
