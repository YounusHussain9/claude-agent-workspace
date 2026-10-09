# Tracker ticket (Shortcut, Jira, Linear, GitHub Issues…)

Only when plan.md says `Tracker: yes` or `Tracker: <ticket-id>`. `Tracker: no` → nothing goes to the tracker.

## Rules
- One feature = one ticket. Lanes become tasks (checklist) inside it, never their own tickets.
- Ticket already exists → update it. Before creating, search by title words; a match → use it.
- Show the exact text in chat and create only after the user says "ok".
- Team: the default team in `workspace.md` (`Tracker team:`), unless the user names another.
  Owner: the person doing the work. Type: feature | bug | chore.
- Plain, short English. No headings like "Description:", no filler, no internal file paths,
  no customer data (names, emails, phones, ID numbers).

## Ticket
```
Title: <Product/page>: <what changes, ≤ 10 words>

<1–3 sentences: what is wrong or missing, and what it should do.>

Done when:
- <AC1 in plain words>
- <AC2>

Repo: <dir>[, <dir>]
```

## Tasks (only when there are 2+ lanes)
```
Backend: <one line>
Frontend: <one line>
QA: tests for AC1–ACn
```

## States
| When | State | Who |
|---|---|---|
| Plan signed | To Do (ticket created) | Claude, after "ok" |
| Build starts | In Development | Claude |
| Tests pass and the requester tested it themselves | In QA + one ≤ 2-line comment | Claude, after the requester confirms |
| After merge | Ready for Release / Done | A person, never Claude |

Comment example: `QA: 8/8 tests pass. Open: 1 bug (<ticket-id>).`
