#!/usr/bin/env bash
# PreToolUse (Agent): build/QA lanes start only after the approver signed the gates in plan.md.
# A lane prompt must name docs/features/<name>/. That plan.md needs these lines, each written
# by the approver named in workspace.md ("Approver: <name>"):
#   Requirement-approved-by: <name> <date>
#   Plan-approved-by: <name> <date>
#   Design-approved-by: <name> <date>    (only when docs/features/<name>/design/ exists)
# Fail closed: without jq this hook can't read the tool call, so it blocks instead of allowing.
command -v jq >/dev/null 2>&1 || { echo "Blocked: jq is not installed, so the safety hooks can't run. Install it (brew/apt/winget install jq) and retry." >&2; exit 2; }
input=$(cat)
agent=$(echo "$input" | jq -r '.tool_input.subagent_type // empty') || { echo "Blocked: approval-gate could not read the tool call." >&2; exit 2; }
case "$agent" in frontend|backend|qa) ;; *) exit 0 ;; esac

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
prompt=$(echo "$input" | jq -r '.tool_input.prompt // empty')
feature=$(echo "$prompt" | grep -oE 'docs/features/[A-Za-z0-9_-]+' | head -1 | cut -d/ -f3)
approver=$(grep -m1 -E '^Approver:' "$root/workspace.md" 2>/dev/null | sed -E 's/^Approver:[[:space:]]*//; s/[[:space:]]*$//')

block() { echo "Blocked by the approval gate: $1" >&2; echo "Show the approver docs/features/${feature:-<name>}/APPROVAL.md and wait. Lanes never start without their sign-off." >&2; exit 2; }

[ -z "$approver" ] && block "workspace.md has no 'Approver: <name>' line."
[ -z "$feature" ] && block "the $agent lane prompt must name its feature folder (docs/features/<name>/)."
plan="$root/docs/features/$feature/plan.md"
[ -f "$plan" ] || block "$plan does not exist."

need="Requirement Plan"
[ -d "$root/docs/features/$feature/design" ] && need="$need Design"
for gate in $need; do
  grep -qE "^${gate}-approved-by:[[:space:]]*${approver}([[:space:]]|$)" "$plan" || block "$gate is not approved by $approver in plan.md."
done
exit 0
