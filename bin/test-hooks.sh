#!/usr/bin/env bash
# Tests the kit's hooks with and without jq. Usage: bash bin/test-hooks.sh   (run it after setup and after any hook change)
K="${1:-$(cd "$(dirname "$0")/.." && pwd)}"; H="$K/.claude/hooks"; fail=0
check() { local name="$1" want="$2" got="$3"; if [ "$got" = "$want" ]; then echo "ok   $name ($got)"; else echo "FAIL $name: want $want got $got"; fail=1; fi; }
run_bash() { printf '{"tool_input":{"command":"%s"}}' "$1" | bash "$H/bash-guard.sh" >/dev/null 2>&1; echo $?; }

echo "== with jq"
check "git push blocked"        2 "$(run_bash 'git push')"
check "POST blocked"            2 "$(run_bash 'curl -X POST https://x')"
check "secret file blocked"     2 "$(run_bash "cat .e""nv")"
check "approve script blocked"  2 "$(run_bash "bin/app""rove f plan")"
check "git status allowed"      0 "$(run_bash 'git status')"
check "ls allowed"              0 "$(run_bash 'ls')"
printf '{"tool_input":{"content":"Plan-app''roved-by: X"}}' | bash "$H/no-self-approve.sh" >/dev/null 2>&1; check "signature write blocked" 2 $?
printf '{"tool_input":{"content":"hello"}}' | bash "$H/no-self-approve.sh" >/dev/null 2>&1; check "normal write allowed" 0 $?
printf '{"tool_input":{"subagent_type":"backend","prompt":"docs/features/nope/ x"}}' | CLAUDE_PROJECT_DIR="$K" bash "$H/approval-gate.sh" >/dev/null 2>&1; check "lane without signed plan blocked" 2 $?
printf '{"tool_input":{"subagent_type":"Explore","prompt":"x"}}' | CLAUDE_PROJECT_DIR="$K" bash "$H/approval-gate.sh" >/dev/null 2>&1; check "non-lane agent allowed" 0 $?

echo "== without jq"
T=$(mktemp -d); for b in bash cat grep sed awk head cut tr env; do ln -sf "$(command -v $b)" "$T/$b"; done
for h in bash-guard.sh no-self-approve.sh approval-gate.sh; do
  printf '{"tool_input":{"command":"git push"}}' | PATH="$T" "$T/bash" "$H/$h" >/dev/null 2>&1; check "$h fails closed" 2 $?
done
rm -rf "$T"
exit $fail
