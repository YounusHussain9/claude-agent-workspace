# Contributing

Thanks for helping. Keep changes small and easy to read.

## Good contributions
- A fix to a hook, script or agent that you hit in real use. Say what happened and how to repeat it.
- Support for another stack in `bin/api-scan.js` or `bin/scan-repos.js` (Django, Rails, Go, Spring…).
- A clearer sentence in the README or runbook. Simple English wins.
- Translations of the README (put them in `docs/i18n/<language>/README.md`).

## Rules
- **Short beats complete.** Agents ignore long rule files. If you add a rule, remove or merge an older one.
- **No company data.** No real names, domains, tokens, endpoints or customer data in examples.
- **Test hooks before sending.** Run the hook test suite; add a case to it when you change a hook:
  ```bash
  bash bin/test-hooks.sh   # every line must say ok
  ```
- One topic per pull request.

## Reporting a problem
Open an issue with: what you typed, what Claude did, what you expected, and your OS + Claude Code version.
