# Workspace

One place for every team repo. Anyone on the team opens Claude here (`cd <this folder> && claude`) and asks for
data or work in plain words, in any language. Claude finds the right repo and API, and the approver signs every gate.

## Read first
- `workspace.md`: products → repos → APIs, the approver, themes, data sources, test commands.
  Refresh the repo table with `node bin/scan-repos.js`.
- `apis/<repo>.md`: endpoints each repo calls or serves (`node bin/api-scan.js <repo>` regenerates).
  **Grep these, never read them whole**: `grep -i invoice apis/*.md`.
- Each repo's own `CLAUDE.md` and `.claude/rules/` apply when working inside it.

## Every request starts with the `intake` skill
It sorts the request into one of four types and says so in the first line:
`Type: DATA | QUESTION | CHANGE (S/M/L) | FEATURE (L) — repo(s): … — reason.`
- **DATA** ("how many…", "report") → `data` skill. No code changes.
- **QUESTION** ("how does this work", "where is it") → answer from code with `file:line`. No changes.
- **CHANGE** S (one repo, ≤ 2 files, no API change) → just do it with a test. M/L → `feature` flow.
- **FEATURE** → `feature` skill: requirement → design → plan gates, each signed by the approver.
- A question ("why should we X?") is not an instruction. Answer it and wait for "do it".

## Tracker (opt-in per task)
Intake asks for every CHANGE/FEATURE: "Track this in the tracker?" (default no; yes by default when a ticket was
given). Local-only work never touches the tracker. When on: one ticket per feature, lanes as tasks, plain short
English, preview before create, In QA only after the requester tested it, never Ready for Release/Done.
Format: `.claude/skills/feature/templates/ticket.md`.

## Output = shareable page, in the product's theme
Data reports, answers worth keeping, gate summaries, prototypes and final reports are published as a private
shareable page (a Claude Artifact) when the host supports it, otherwise as a Markdown file in `docs/`.
Make it interactive where it helps. Style it with the theme of the product it belongs to (see Themes in
`workspace.md`). Data rules still apply inside: counts only.

## Follow the existing code (every repo)
- Copy the closest existing file in the same area. Same libraries, classes, components, layers and patterns.
- Same place: fix code where it already lives. Don't move logic to another layer.
- Same file style: that file's comment density, imports and line length.
- Only optimisation may differ (lazy loading, memoising, eager loading, a missing index).
- Name the file you copied in your report.

## Design source (every UI change)
- No design given (no Figma, image, URL or mockup) → **ask before building**: "Use the existing <product> UI, or do
  you have a design?" The user decides; never invent a look.
- "Existing" → reuse the repo's own components for that element. Name the reused component in the lane report.
- Check every UI change at mobile 375, tablet 768 and desktop 1280: no side-scroll, no clipped text, no layout jerk.

## Gates and approval (enforced by hooks, not by trust)
- The approver is the `Approver:` line in `workspace.md`. Only they sign, by running
  `bin/approve <feature> <requirement|design|plan>` in their own terminal. Claude never writes `*-approved-by:` lines.
- Before each gate Claude writes `docs/features/<name>/APPROVAL.md` (what is being approved, ≤ 40 lines) and tells
  the requester: "Send this to the approver; continue when they say it's signed."
- frontend/backend/qa lanes are blocked until plan.md carries the signatures (`.claude/hooks/approval-gate.sh`).
- Release: Claude never commits, pushes or merges. It ends with the changed files per repo and the commands.

## Data rules
- Live data is read-only. Preferred source: a read-only database MCP. Fallback: `node bin/api-get.js` (GET only).
  Never curl a team API, never read `.secrets/` or `.env`.
- In chat: counts and groups only. No names, emails, phones, ID numbers or addresses. Raw rows stay in files.
- Prefer aggregate SQL (`COUNT … GROUP BY`); row caps make row-by-row counting wrong.
- Every number carries its source (tool or endpoint, environment, time, the exact query).
- Every report is **UNVERIFIED** until the approver spot-checks 2–3 values against the real app.
- Unsure what a word means in the data ("active", "paid")? Ask; never guess a definition.

## Testing and debugging
- Say "tested" only for what really ran, and name it ("PHPUnit + API call, no browser flow").
- On a failure, get the real error first (app log, error tracker, the FIRST request in the browser Network tab).
- Check infra (DB, cache, queue, env, deploy) before changing code. Don't change code until the cause is confirmed.
- Test data must look like real data (for example an organisation that already has members).

## Working across repos
- Feature docs live here: `docs/features/<name>/` (plan, APPROVAL, contract, design, lanes, decisions).
- Every lane brief names `Repo: <dir>`; the agent edits only inside that repo and runs that repo's test command
  exactly as `workspace.md` says (`native` = in the repo folder, `docker` = `bin/dev test <repo>`).
  Shared contract first (FE ↔ BE), then lanes in parallel.
- Branches: tell the user the command per repo (`git -C <repo> switch -c feature/<name>`); never switch yourself.

## Budget
Budget: 2 agents at once (set 4 on a Max plan). Use a mid-size model by default and the strongest model only for
planning or reviewing auth, payments or data writes. Lane reports ≤ 15 lines. Show only failures.
One large feature at a time. Near a usage limit → finish the current wave, write `docs/features/<name>/resume.md`
(done, next), stop.

## Git
Read-only git only (status, diff, log, show, blame). At the end list changed files per repo + the exact commands.
