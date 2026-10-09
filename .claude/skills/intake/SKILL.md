---
name: intake
description: First step for every request in the workspace. Sorts it into DATA, QUESTION, CHANGE or FEATURE, finds the repo(s) and API, and routes it. Use for any new ask from anyone, in any language - "how many users signed up…", "where is X done?", "fix this", "build this", "the PM wants…", or a pasted ticket link.
---

# Intake

1. **Read the ask** (typed text, or a ticket via the tracker MCP if a link/ID is given).
2. **Find where it lives.** Grep `workspace.md` and `apis/*.md` for the product/module words (grep only: the
   catalogs can be large), then grep the likely repos; read only the matching line ranges. Note `repo:file:line`
   for what you found. Unknown product → ask, don't guess.
3. **Classify** and print the first line:
   `Type: DATA | QUESTION | CHANGE (S/M/L) | FEATURE (L) — repo(s): … — reason.`
   - DATA: wants numbers, lists or a report from live data → `data` skill.
   - QUESTION: how/where something works → answer with `file:line`, no edits.
   - CHANGE S: one repo, ≤ 2 files, no API/contract change → do it with a test, list changed files.
     Tracker on → same rules as `feature/templates/ticket.md` (In Development at start, In QA + one
     comment only after the requester has tested it).
   - CHANGE M / FEATURE L: new API call, new screen/form, 3+ files, 2+ repos, auth/payments/data writes → `feature` skill.
4. **Ask once.** All open questions in ONE numbered message, each with a default
   ("reply 'defaults ok' + numbers to change"). Then wait.
   For CHANGE and FEATURE, always add the tracker question (see `feature/templates/ticket.md`):
   - No ticket given → "Track this in the tracker? (default: no, local only)"
   - Ticket given (link/ID) → "Update <ticket> as work moves? (default: yes)"
   DATA and QUESTION never touch the tracker. The answer is final unless the user changes it.
5. **Never** start M/L work before the requirement gate is signed (see `feature`).
6. **A question is not an instruction.** "Why should we revert X?" asks for reasons. Answer, recommend, and wait
   for a clear "do it" before changing code, git or tickets.
