#!/usr/bin/env bash
# PreToolUse (Edit|Write|MultiEdit): Claude never signs a gate. "<Gate>-approved-by:" lines are
# added only by the approver running bin/approve in their own terminal.
# Fail closed: without jq this hook can't read the tool call, so it blocks instead of allowing.
command -v jq >/dev/null 2>&1 || { echo "Blocked: jq is not installed, so the safety hooks can't run. Install it (brew/apt/winget install jq) and retry." >&2; exit 2; }
input=$(cat)
text=$(echo "$input" | jq -r '[.tool_input.content, .tool_input.new_string, (.tool_input.edits // [] | map(.new_string) | join("\n"))] | map(select(. != null)) | join("\n")') || { echo "Blocked: no-self-approve could not read the tool call." >&2; exit 2; }
if echo "$text" | grep -qiE '^[[:space:]]*(requirement|plan|design|release)-approved-by:'; then
  echo "Blocked: only the approver signs gates. Ask them to run in their own terminal: bin/approve <feature> <requirement|design|plan>" >&2
  exit 2
fi
exit 0
