# Order CSV export

Tracker: no

## Goal
Shop admins can download the orders they see on the Orders page as a CSV file.

## User stories
- As a shop admin, I want to export the filtered order list, so that I can share it with accounting.

## Acceptance criteria
- AC1: The Orders page shows an "Export CSV" button next to the filters.
- AC2: Clicking it downloads `orders-<YYYY-MM-DD>.csv` with the columns Order no, Date, Status, Total.
- AC3: The file contains only the orders that match the current filters.
- AC4: With no matching orders the button is disabled and shows "Nothing to export".
- AC5: A user from another shop gets 403 from the export endpoint.

## Edge cases
Empty list, 10,000+ rows (streamed), slow network (button shows a spinner), commas and quotes inside values.

## API contract
See `contract.md`.

## Repos touched
- shop-api: new `GET /api/orders/export`
- shop-web: button on `app/orders/page.tsx`

## Work breakdown
| Lane | Agent | Repo | Owns (files) | ACs | Wave |
|---|---|---|---|---|---|
| B1 | backend | shop-api | `src/orders/export.controller.ts`, `src/orders/export.service.ts` | AC2, AC3, AC5 | 1 |
| F1 | frontend | shop-web | `app/orders/ExportButton.tsx` | AC1, AC4 | 1 |
| Q1 | qa | shop-web | `e2e/order-csv-export/q1.spec.ts` | AC1–AC5 | 1 |

## Context map
- Copy `src/orders/list.controller.ts:12-60` (same filters, same ownership check `assertShopOwner`).
- Button: reuse `components/ui/Button.tsx` variant `secondary`; spinner = `components/ui/Spinner.tsx`.
- Filters live in `app/orders/useOrderFilters.ts:8`.

## Open questions
None.

<!--
Signatures go below this line. Claude cannot write them (the no-self-approve hook blocks it).
The approver runs `bin/approve order-csv-export requirement` and later `... plan` in their own terminal,
and the script appends one signature line per gate here, with their name and the date.
-->
