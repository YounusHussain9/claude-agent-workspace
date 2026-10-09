---
name: feature
description: Gated multi-repo feature flow for a multi-repo workspace: requirement, design and plan each signed by the approver, then parallel frontend/backend/QA lanes per repo, then review. Use for "build this", "new feature", "the PM sent a requirement", "the owner wants…", any CHANGE M or FEATURE L from intake.
---

# Feature flow (workspace)

Never skip a gate. Never sign a gate. Never run state-changing git.
Gate = write `docs/features/<name>/APPROVAL.md` → tell the requester "send this to the approver" → wait for
"<gate> approved" → check the signature line exists in plan.md before going on.

1. **Requirement.** `planner` (Sonnet; Opus for auth/payments/data writes) gets the ask + repo pointers from
   intake. It returns ≤ 5 gap questions (one message, with defaults). After answers it writes `plan.md` with
   `## Goal`, `## Acceptance criteria` (AC1…n, each testable), `## Repos touched`, `## Context map` (per repo),
   and the intake answer as one line: `Tracker: no` | `Tracker: yes` | `Tracker: <ticket-id>`.
   APPROVAL.md = goal + ACs + repos + open risks. **Gate: requirement.**
2. **Design** (only if there is new UI). Figma/image given → `designer` writes `design/spec.md`, gaps go to the
   requester as text questions. Words only → `designer` builds `design/mockup.html` + screenshots in the repo's
   existing look. APPROVAL.md = screenshots list + what changed. **Gate: design.**
3. **Contract + plan.** If FE and BE both change: `docs/features/<name>/contract.md` (endpoints, request/response
   samples, errors) from the real backend code, never invented. Then `## Work breakdown` in plan.md:
   `| Lane | Agent | Repo | Owns (files) | ACs | Wave |`. One file = one lane; shared files = L0, built first.
   APPROVAL.md = contract summary + lanes + branch names per repo. **Gate: plan.**
4. **Branches.** Give the commands; the user runs them: `git -C <repo> switch -c feature/<name>`. Wait.
5. **Build.** Lane briefs `docs/features/<name>/lanes/<id>.md` from `templates/lane-brief.md`, each starting with
   `Repo: <dir>`. Spawn lanes in the background, as many at once as the Budget line in `CLAUDE.md` allows. Every prompt names
   `docs/features/<name>/` and the brief path (the approval hook checks it). QA lanes write specs from the ACs and
   contract while the build runs, then run them on "build done". Bugs go back to the owning lane.
6. **Verify.** Each repo's own test command (from `workspace.md`, `bin/dev test <repo>`), failures only. Every AC has a passing test
   (happy path + one error case).
7. **Review.** `reviewer` (lens A correctness/security, Opus for sensitive; lens B consistency/rules, Sonnet).
   HIGH findings → fresh agent on Opus for that fix only.
8. **Hand-off.** Per repo: changed files, ACs → test names, and the commands for the approver:
   `git -C <repo> add …`, `git -C <repo> commit -m "feat(<name>): …"`, `git -C <repo> push -u origin feature/<name>`,
   then open the PR. The approver merges.

**Tracker** (only when plan.md says `Tracker: yes` or `<ticket-id>`; `no` → never call a tracker write tool).
Follow `templates/ticket.md`. One feature = one story; lanes are tasks inside it, never separate stories.
- Plan signed, `yes` → search first (no duplicates), show the story text, create only after "ok". Write the new
  ID into plan.md (`Tracker: <ticket-id>`). Existing ticket → add the lane tasks to it instead.
- Build starts → In Development. QA lanes pass AND the requester has tested it themselves → In QA + one comment (≤ 2 lines: tests passed, open bugs).
- Bugs still open at hand-off → one sub-story each. Bugs fixed during the build get no ticket.
- Never move a story to Ready for Release or Done; a person does that after merge.

Mid-build requests: inside a lane's files/ACs → note in `decisions.md` and message that lane; changes an approved
AC, design or contract → stop affected lanes, update plan, new APPROVAL.md, re-sign that gate.
