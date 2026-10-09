Repo: <dir>

# Lane <id> — <feature> (<agent>)

Read this file, `decisions.md` and your own rules file. Nothing else unless a line below points to it.

- **Owns (only you edit):** <files>
- **Do not edit:** everything else. Shared need → `NEEDS L0: <file> — <what>`.
- **ACs:** <AC numbers + one-line text each>
- **Exact values:** <copied from spec.md: sizes, spacing, copy, Mobile line, Interactions line>
- **Reuse / copy:** <existing components, helpers or endpoints with file:line>
- **Design cache:** <design/figma/... files, if a value is unclear>; never call Figma yourself.
- **Test:** <the repo's test command from workspace.md, filtered to your ACs, e.g. `npm test -- export` or `npx playwright test e2e/<name>/q1.spec.ts`>
- **Stuck rule:** the same error twice → stop and report. No third try, no raised timeouts.
- **Report (max 15 lines):** changed files · AC → test · NEEDS L0 / BUG / ASSUMED / DECISION? lines · failures only.
