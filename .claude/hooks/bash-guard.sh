#!/usr/bin/env bash
# PreToolUse (Bash): workspace safety rules that the permission deny-list can't express.
#  1. Team APIs are read-only: no curl/wget/httpie call that writes (POST/PUT/PATCH/DELETE, -d, -F, --data).
#  2. Secrets stay unread: no shell access to .secrets/ or .env files (bin/api-get.js reads them itself).
#  3. Gates are signed by the approver only: Claude never runs bin/approve or writes "-approved-by:".
#  4. Git stays read-only: commits, pushes, merges and branch switches are the user's.
block() { echo "Blocked by workspace rules: $1" >&2; exit 2; }
# Fail closed: without jq this hook can't read the command, so it blocks instead of allowing.
command -v jq >/dev/null 2>&1 || block "jq is not installed, so the safety hooks can't run. Install it (brew/apt/winget install jq) and retry."
input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command // empty') || block "bash-guard could not read the command."
[ -z "$cmd" ] && exit 0

# Heredoc bodies are file contents: check only the line that opens the heredoc for rules 1, 2 and 4.
head_cmd=$(printf '%s\n' "$cmd" | awk '/<</ { print; exit } { print }')

if echo "$head_cmd" | grep -qE '(^|[;&|( ])(curl|wget|http|https|xh)([[:space:]]|$)'; then
  echo "$head_cmd" | grep -qiE '(-X|--request|--method)[[:space:]=]*["'"'"']?(POST|PUT|PATCH|DELETE)|[[:space:]](-d|--data[a-z-]*|-F|--form|-T|--upload-file)([[:space:]=]|$)|[[:space:]](POST|PUT|PATCH|DELETE)[[:space:]]' \
    && block "team APIs are read-only from Claude. Use: node bin/api-get.js <service> <path> (GET only)."
fi

if echo "$head_cmd" | grep -qE '\.secrets(/|[[:space:]]|$)|(^|[/[:space:]])\.env([.a-zA-Z0-9_-]*)?([[:space:]]|$|["'"'"'])'; then
  echo "$head_cmd" | grep -qE '^[[:space:]]*node[[:space:]]+(\./)?bin/api-get\.js[[:space:]]' || block "secrets and .env files are not read by Claude. bin/api-get.js loads the token itself."
fi

echo "$cmd" | grep -qiE '(^|[/[:space:]])bin/approve([[:space:]]|$)|(requirement|plan|design|release)-approved-by:' \
  && block "only the approver signs gates, in their own terminal: bin/approve <feature> <gate>."

echo "$head_cmd" | grep -qE '(^|[;&|( ])git[[:space:]]+(-C[[:space:]]+[^[:space:]]+[[:space:]]+)?(commit|push|merge|rebase|pull|reset|stash|cherry-pick|checkout|switch|apply|revert|tag|branch[[:space:]]+-[dDmM])([[:space:]]|$)' \
  && block "git writes are done by the user. Read-only git only (status, diff, log, show, blame)."
exit 0
