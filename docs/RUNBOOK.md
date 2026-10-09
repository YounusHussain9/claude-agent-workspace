# Visual runbook

Every flow in this workspace as a picture. GitHub draws these diagrams for you.
Read top to bottom the first time; later, jump to the flow you need.

1. [The big picture](#1-the-big-picture)
2. [Intake: how a request is sorted](#2-intake-how-a-request-is-sorted)
3. [A data request](#3-a-data-request)
4. [A small change](#4-a-small-change)
5. [A feature, end to end](#5-a-feature-end-to-end)
6. [Who does what, and when (sequence)](#6-who-does-what-and-when)
7. [Lanes and waves](#7-lanes-and-waves)
8. [What the guards check on every tool call](#8-what-the-guards-check)
9. [When something fails](#9-when-something-fails)
10. [Ticket states](#10-ticket-states)

---

## 1. The big picture

```mermaid
flowchart TB
    subgraph People
        REQ["👤 Requester<br/>(anyone on the team)"]
        APP["👤 Approver<br/>(one named person)"]
    end
    subgraph Workspace["~/work (this kit)"]
        CL["Claude Code<br/>reads CLAUDE.md + workspace.md"]
        SK["Skills<br/>intake · data · feature"]
        AG["Agents<br/>planner · designer · frontend<br/>backend · qa · reviewer"]
        HK["Hooks<br/>guards on every tool call"]
    end
    subgraph Repos["Your linked repos"]
        R1["web"]
        R2["api"]
        R3["mobile"]
    end
    REQ -- "plain words" --> CL
    CL --> SK --> AG
    HK -. "block / allow" .-> AG
    AG -- "edits working tree only" --> Repos
    CL -- "APPROVAL.md" --> APP
    APP -- "bin/approve (own terminal)" --> CL
    Repos -- "you commit + PR" --> GH[("GitHub<br/>branch protection")]
    APP -- "reviews + merges" --> GH
```

---

## 2. Intake: how a request is sorted

```mermaid
flowchart TD
    A["Request arrives<br/>(text or ticket link)"] --> B["Grep workspace.md + apis/*.md<br/>find repo + file:line"]
    B --> C{"Unknown product?"}
    C -->|yes| Q["Ask. Never guess."]
    C -->|no| D{"What does it want?"}
    D -->|"numbers, report"| DATA["DATA → data skill"]
    D -->|"how / where"| QUE["QUESTION → answer with file:line"]
    D -->|"1 repo, ≤ 2 files,<br/>no API change"| S["CHANGE S → edit + test"]
    D -->|"new API, new screen,<br/>3+ files, 2+ repos,<br/>auth / payments / data writes"| F["CHANGE M/L or FEATURE → feature skill"]
    S --> T{"Track in tracker?<br/>(default: no)"}
    F --> T
    T --> GO["Ask all open questions ONCE,<br/>each with a default"]
```

The first line of every answer shows the result:
`Type: CHANGE (S) — repo(s): shop-web — one file, copy fix.`

---

## 3. A data request

```mermaid
flowchart TD
    A["'How many active users per country?'"] --> B["Pin the definition<br/>'active' = logged in last 30 days?"]
    B --> C{"Clear?"}
    C -->|no| ASK["Ask with a default, wait"]
    C -->|yes| D{"Source"}
    D -->|"1st choice"| MCP["Read-only DB MCP<br/>SELECT … COUNT(*) … GROUP BY"]
    D -->|"fallback"| API["bin/api-get.js (GET only)<br/>→ bin/data-count.js"]
    D -->|"neither"| FEAT["Offer a FEATURE:<br/>read-only report endpoint"]
    MCP --> CHK["Sanity checks<br/>total = sum of groups · nulls<br/>duplicates · deleted · test accounts"]
    API --> CHK
    CHK --> REP["docs/data/&lt;date&gt;-&lt;slug&gt;.md<br/>Status: UNVERIFIED"]
    REP --> SPOT["👤 Approver spot-checks 2–3 numbers<br/>in the real app → share"]
```

Chat shows **counts only**. Raw rows stay in git-ignored files. Example: [`examples/data/`](../examples/data/).

---

## 4. A small change

```mermaid
flowchart LR
    A["CHANGE S"] --> B["Find the closest<br/>existing file"]
    B --> C["Edit in the same place,<br/>same style"]
    C --> D["Write / run the<br/>repo's test"]
    D --> E{"Pass?"}
    E -->|no| F["Read the real error first<br/>(see flow 9)"]
    F --> C
    E -->|yes| G["Report: changed files,<br/>what ran, git commands"]
    G --> H["👤 You test it yourself,<br/>commit, push, PR"]
```

---

## 5. A feature, end to end

```mermaid
flowchart TD
    subgraph G1["Gate 1 · Requirement"]
        R1["planner: ≤ 5 gap questions<br/>(one message, with defaults)"] --> R2["plan.md<br/>goal · ACs · repos · context map"]
        R2 --> R3["APPROVAL.md"] --> R4{{"🚦 bin/approve &lt;f&gt; requirement"}}
    end
    subgraph G2["Gate 2 · Design (only new UI)"]
        D0{"Design given?"} -->|"Figma / image / URL"| D1["designer: spec.md + reference PNGs"]
        D0 -->|"none"| D2["Ask: reuse existing UI?<br/>then mockup in that look"]
        D1 --> D3["APPROVAL.md"]
        D2 --> D3
        D3 --> D4{{"🚦 bin/approve &lt;f&gt; design"}}
    end
    subgraph G3["Gate 3 · Plan"]
        P1["contract.md from REAL backend code"] --> P2["Work breakdown:<br/>1 file = 1 lane · shared = L0"]
        P2 --> P3["APPROVAL.md + branch names"] --> P4{{"🚦 bin/approve &lt;f&gt; plan"}}
    end
    subgraph Build
        B1["👤 You create branches"] --> B2["Lanes in parallel (max 2–4)"]
        B2 --> B3["Each repo's tests<br/>every AC: happy + error"]
        B3 --> B4["reviewer: correctness · security · consistency"]
        B4 --> B5["Hand-off: files per repo + git commands"]
    end
    R4 --> D0
    D4 --> P1
    R4 -. "no new UI" .-> P1
    P4 --> B1
    B5 --> END["👤 Commit · PR · approver merges"]
```

A change to an approved AC, design or contract during the build stops the affected lanes and re-opens that gate.

---

## 6. Who does what, and when

```mermaid
sequenceDiagram
    autonumber
    actor Req as Requester
    participant C as Claude (lead)
    participant P as planner
    actor App as Approver
    participant L as Lanes (frontend · backend · qa)
    participant Rv as reviewer

    Req->>C: "Add CSV export to orders"
    C->>C: intake → FEATURE (shop-web, shop-api)
    C->>P: brief + repo pointers
    P-->>Req: up to 5 questions with defaults
    Req-->>P: "defaults ok"
    P->>C: plan.md
    C-->>Req: APPROVAL.md (requirement)
    Req->>App: please review
    App->>App: bin/approve export requirement
    App-->>Req: signed
    Req->>C: "requirement approved"
    Note over C: design gate (if UI) and plan gate work the same way
    C-->>Req: git -C <repo> switch -c feature/export
    Req->>Req: runs the branch commands
    C->>L: lane briefs (Repo: <dir> first)
    Note over C,L: approval-gate hook checks the signatures before any lane starts
    L-->>C: ≤ 15-line reports (failures only)
    C->>Rv: review the diff
    Rv-->>C: findings
    C-->>Req: changed files + git commands
    Req->>App: pull request
    App->>App: review + merge
```

---

## 7. Lanes and waves

```mermaid
flowchart LR
    subgraph W1["Wave 1"]
        L0["L0: shared files<br/>(schema, config, API client)"]
        Q["QA lane writes specs<br/>from the ACs (no app code needed)"]
    end
    subgraph W2["Wave 2 (parallel)"]
        BE["backend lane<br/>Repo: api"]
        FE["frontend lane<br/>Repo: web"]
    end
    subgraph W3["Wave 3"]
        RUN["QA runs specs<br/>375 · 768 · 1280"]
        REV["reviewer"]
    end
    L0 --> BE
    L0 --> FE
    Q --> RUN
    BE --> RUN
    FE --> RUN
    RUN --> REV
```

- A lane edits **only** the files it owns. Needs a shared file → reports `NEEDS L0: <file> — <what>`.
- **Stuck rule:** the same error twice → stop and report. No third try.
- A lane report is at most 15 lines and shows failures only.

---

## 8. What the guards check

```mermaid
flowchart TD
    T["Claude wants to use a tool"] --> J{"jq installed?"}
    J -->|no| X0["⛔ Blocked: install jq<br/>(guards fail closed)"]
    J -->|yes| K{"Which tool?"}
    K -->|"Agent (frontend/backend/qa)"| AG{"plan.md signed by<br/>the approver?"}
    AG -->|no| X1["⛔ Blocked:<br/>show APPROVAL.md and wait"]
    AG -->|yes| OK["✅ Allowed"]
    K -->|"Edit / Write"| SIG{"Writes a signature line?"}
    SIG -->|yes| X2["⛔ Blocked: only the approver signs"]
    SIG -->|no| OK
    K -->|"Bash"| B1{"POST/PUT/PATCH/DELETE<br/>with curl/wget?"}
    B1 -->|yes| X3["⛔ APIs are read-only"]
    B1 -->|no| B2{"Touches .secrets/ or .env?"}
    B2 -->|yes| X4["⛔ Secrets stay unread"]
    B2 -->|no| B3{"git commit / push / merge /<br/>switch / reset …?"}
    B3 -->|yes| X5["⛔ People own git"]
    B3 -->|no| OK
```

Plus the deny list in `.claude/settings.json`: Claude cannot edit the hooks or the settings themselves.
Prove it on your laptop with `bash bin/test-hooks.sh` (every line should say `ok`).

These guards keep **Claude** inside the rules. People can still change their own laptop, so GitHub branch
protection and PR review stay the real lock.

---

## 9. When something fails

```mermaid
flowchart TD
    F["Something fails<br/>(test, staging, browser)"] --> E["Get the REAL error first<br/>app log · error tracker ·<br/>FIRST request in Network tab (Preserve log)"]
    E --> I{"Infra?<br/>DB · cache · queue · env · deploy"}
    I -->|yes| OPS["Fix infra first<br/>(often not a code problem)"]
    I -->|no| C["Confirm the cause in code<br/>with file:line"]
    C --> R["Reproduce locally<br/>with REAL-looking data"]
    R --> FX["Smallest fix, same place,<br/>same style as the file"]
    FX --> V["Re-run what failed,<br/>say exactly what ran"]
    OPS --> V
```

Don't guess causes before reading the error. Don't change code until the cause is confirmed.

---

## 10. Ticket states

```mermaid
stateDiagram-v2
    [*] --> ToDo: plan signed + "ok" to create
    ToDo --> InDevelopment: build starts
    InDevelopment --> InQA: tests pass AND requester tested it
    InQA --> ReadyForRelease: a person, after merge
    ReadyForRelease --> Done: a person
    note right of InQA
        Claude never moves a ticket
        to Ready for Release or Done
    end note
```

Only when the requester said "track this". Local-only work never touches the tracker.
