# Agent Builder Starter Prompt

## Build your first cloud-run AI employee

This is a construction contract for one useful AI employee. It is intentionally not a fleet blueprint, a vendor tutorial, or permission to let an agent operate without review.

At the end of this exercise, you should have one agent that:

1. Runs from the cloud on a defined schedule or event.
2. Reads one approved source of truth.
3. Produces one reviewable output in one approved destination.
4. Records what happened, including failures.
5. Stops at the human authority boundary.

**Build rule:** Start with one job, one source, one output, and one approver. Earn additional autonomy with evidence.

## 1. Fill in the agent contract before you build

Replace every bracketed value. If you cannot answer a field, do not code yet. Resolve the operating decision first.

| Field | Your answer |
| --- | --- |
| Agent name | `[AGENT_NAME]` |
| Role title | `[ROLE_TITLE]` |
| Business outcome | `[ONE_SENTENCE_OUTCOME]` |
| Human owner | `[HUMAN_OWNER]` |
| One approved input source | `[SOURCE_OF_TRUTH]` |
| Output and destination | `[REVIEWABLE_OUTPUT]` sent to `[OUTPUT_SURFACE]` |
| Cadence or trigger | `[SCHEDULE_OR_EVENT]` |
| Approval boundary | `[WHAT_REQUIRES_APPROVAL]` |
| Risk tier | `[LOW_OR_MEDIUM_OR_HIGH]` |
| Non-goals | `[WHAT_THIS_AGENT_MUST_NOT_DO]` |
| Alert destination | `[ALERT_OWNER_AND_CHANNEL]` |
| Budget ceiling per run | `[MAX_COST_OR_TOKEN_BUDGET]` |
| Runtime choice | `[CLOUD_RUNTIME]` |
| Durable state location | `[RUN_LEDGER_AND_MEMORY_LOCATION]` |

### The first-job test

Your first job is small enough if you can say this sentence without adding "and also":

> Every `[SCHEDULE]`, `[AGENT_NAME]` reads `[ONE_SOURCE]`, creates `[ONE_OUTPUT]`, sends it to `[ONE_HUMAN]` for `[APPROVE / REJECT / REVISE]`, and records the run.

If your job needs several unrelated sources, several outputs, several approvers, or an unattended external action, cut the scope until it passes this test.

## 2. A completed example: Morning Market Brief

Use this as a model, not as a requirement to build a market agent.

| Field | Filled example |
| --- | --- |
| Agent name | `Signal` |
| Role title | `Morning Market Brief Analyst` |
| Outcome | Give the CEO a decision-ready morning brief from one approved market-data source. |
| Human owner | `CEO` |
| Source | A scoped read-only market-data API. |
| Output | A short draft email with changes, implications, and source links. |
| Cadence | Every weekday at 8:00 AM in the owner’s timezone. |
| Approval boundary | The agent may draft and send only to the review inbox. It may not publish, trade, spend money, or contact customers. |
| Alert destination | `#agent-alerts` and the CEO’s email. |
| Budget ceiling | A low fixed ceiling per run. Stop and alert if exceeded. |
| Durable state | A run ledger and a separate reviewed-lessons store. |

**Expected run:** Trigger → authenticate with a scoped read-only credential → read the current data → validate freshness and required fields → use a deterministic transform where possible → use a judgment model only for the written synthesis → create the draft → verify the draft exists and contains source references → send it to the review inbox → persist the run record.

**If the source is unavailable:** do not invent a brief. Mark the run failed, preserve the provider response, make only safe bounded retries, and send one alert saying the failed step, the run ID, the last safe action, and what the owner should do next.

## 3. Required project package

Ask your build assistant to create and keep these files in the repository. The names are an example. Preserve their purposes even if your platform uses a different convention.

```text
docs/
  PRD.md                 # Job, scope, acceptance criteria, approval boundary
  architecture.md        # Trigger, data path, state, tools, authority boundaries
  runbook.md             # Normal operation, alerting, recovery, escalation
.agent/
  personality.md         # Voice, role, behavioral rules, prohibited behavior
  skills/
    [skill-name].md      # One repeatable capability and its tool constraints
  evals/
    first-job.md         # Pass and fail examples for the first job
runtime/
  [scheduled-job]        # Trigger and execution implementation
tests/
  [agent-tests]          # Happy path and failure-path tests
```

### Minimum contents for each file

- **`docs/PRD.md`**: the one job, approved source, output, owner, non-goals, acceptance criteria, launch gate, and change history.
- **`docs/architecture.md`**: trigger, source authentication scope, data flow, model decision, cache policy, run record, approval path, retries, and rollback.
- **`docs/runbook.md`**: where to find a run, how to read an alert, when a retry is safe, when to stop, how to resume, and who owns escalation.
- **`.agent/personality.md`**: the agent’s role, concise voice, assumptions it may make, assumptions it must escalate, and explicit human authority boundary.
- **`.agent/skills/`**: one skill per capability. A skill states its goal, allowed inputs, tools, validation, output format, and stop conditions.
- **`.agent/evals/first-job.md`**: examples of acceptable and unacceptable outputs plus failure scenarios.

## 4. Cloud runtime contract

Run the agent in a managed cloud runtime, not only on a laptop. A scheduled routine is a cloud job that runs at a defined time. An event trigger runs after a defined change. Keep configuration in source control and test the trigger before release.

Every run follows this sequence:

```text
trigger
  → authenticate with least privilege
  → read only approved, scoped context
  → validate freshness and required fields
  → choose deterministic or model path
  → execute safe tool calls idempotently
  → verify the output and its delivery
  → request human review when required
  → write a durable run record
  → capture approved or corrected lesson
```

**Idempotent** means a retried run cannot create a duplicate email, duplicate ticket, duplicate charge, or duplicate external action. Use a run ID and a delivery key before every external write.

### Secrets and access

- Use scoped service credentials stored in the runtime’s secret manager. Never put secrets in prompts, source files, logs, or chat.
- Give the agent the smallest set of permissions that completes the first job.
- Fail closed: when authorization, source scope, or identity is unclear, stop, record the reason, and alert the owner.
- Record the secret owner and rotation responsibility in the runbook. Do not record secret values.

## 5. Model routing and cache policy

Routing is an operating policy, not a brand preference.

1. Use deterministic code for transforms, validation, dates, routing, and known calculations.
2. Use the least expensive capable model for bounded extraction, classification, and formatting.
3. Use a stronger reasoning model only for ambiguity, risk, synthesis, or review.
4. Require an independent review path for protected code or consequential production decisions.
5. Record the selected route, model tier, reason, cost, and fallback in the run record.

Keep stable instructions, personality, skills, and durable rules separate from dynamic task data. Cache only safe, stable context. Match cache lifetime to the job cadence. Do not cache secrets, private data outside its approved retention policy, or stale instructions. Log whether a cache was used or bypassed.

## 6. Observability and loud failure

Observability means you can answer "what happened to this run?" without guessing. Every run needs a unique ID and a durable record with:

```text
run_id
started_at / completed_at / duration
trigger and schedule version
source name, source version, freshness check, and access result
input fingerprint (not sensitive raw content)
model route, cache decision, token or cost estimate, and budget state
tool calls, retry count, idempotency key, and verification results
output location and delivery status
approval state and reviewer decision
error class, alert status, escalation owner, and next action
lesson captured after a confirmed correction
```

Use correlated logs, metrics, and traces where your platform supports them. A log says what happened at a moment. A metric shows a trend, such as error rate or duration. A trace shows the path a single run took across services.

### Failure table

| Situation | Safe agent behavior |
| --- | --- |
| Temporary provider timeout | Retry only within the documented limit, using the same run ID and idempotency key. |
| Missing required input | Stop. Do not infer missing facts. Create an actionable alert. |
| Duplicate trigger | Detect the existing run or delivery key. Do not duplicate the action. |
| Access denied | Fail closed, record the scope issue, and alert the credential owner. |
| Stale context | Mark the output as unsafe to send, re-read approved state if possible, otherwise escalate. |
| Output rejected by the reviewer | Preserve the rejection reason, update the reviewed-lessons store only after confirmation, and queue a bounded improvement. |

Nothing fails silently. A failed run is never reported as a successful run. A successful execution is not a successful run until output and delivery are verified.

## 7. Bounded self-healing and delivery

Self-healing is not unrestricted autonomy. The agent may:

- retry a transient, safe, idempotent operation within a small limit;
- re-read missing or stale state from an approved source;
- collect diagnostics and create a structured issue;
- draft a repair plan or pull request for independent review.

The agent must not deploy, alter permissions, rotate secrets, spend money, change policy, impersonate a human, contact an unapproved audience, or merge its own changes without explicit human approval.

For code changes, use this loop:

```text
observed issue → structured ticket → branch → pull request → independent review
→ merge approval → deploy verification → rollback if verification fails → documented lesson
```

## 8. First-production-run scorecard

Do not add a second job until all of these are true:

- [ ] The scheduled or event trigger ran from the cloud.
- [ ] The agent read only the approved source with least-privilege access.
- [ ] The output was generated, verified, and delivered to the review surface.
- [ ] A human approved, rejected, or revised the output.
- [ ] The run record contains the required evidence.
- [ ] An empty-input test passed.
- [ ] An unavailable-source test created a useful alert, not fake success.
- [ ] A provider-timeout test respected the retry ceiling.
- [ ] A duplicate-trigger test did not create a duplicate external action.
- [ ] An access-denied test failed closed.
- [ ] A stale-context test stopped unsafe delivery.
- [ ] A rejected-output test preserved feedback and did not overwrite approved memory.
- [ ] Budget and rollback behavior were tested.

## 9. Copy this master prompt into your build assistant

```text
You are helping me build one real cloud-run AI employee. Do not start by writing production code. First, turn the contract below into a constrained MVP plan, a file tree, acceptance criteria, and a test plan. Ask no more than five essential clarifying questions. If a field is blank, identify the decision that must be made and propose a safe default rather than inventing private data, credentials, or permissions.

AGENT CONTRACT
- Agent name: [AGENT_NAME]
- Role title: [ROLE_TITLE]
- One business outcome: [ONE_SENTENCE_OUTCOME]
- Human owner: [HUMAN_OWNER]
- One approved source of truth: [SOURCE_OF_TRUTH]
- One reviewable output: [REVIEWABLE_OUTPUT]
- Output surface: [OUTPUT_SURFACE]
- Schedule or event trigger: [SCHEDULE_OR_EVENT]
- Approval boundary: [WHAT_REQUIRES_APPROVAL]
- Explicit non-goals: [WHAT_THIS_AGENT_MUST_NOT_DO]
- Alert owner and destination: [ALERT_OWNER_AND_CHANNEL]
- Cloud runtime: [CLOUD_RUNTIME]
- Durable run ledger and reviewed-memory location: [RUN_LEDGER_AND_MEMORY_LOCATION]
- Budget ceiling: [MAX_COST_OR_TOKEN_BUDGET]

BUILD REQUIREMENTS
1. Build one job, one source, one output, and one human approver. Do not expand scope.
2. Create and maintain: docs/PRD.md, docs/architecture.md, docs/runbook.md, .agent/personality.md, .agent/skills/, .agent/evals/, runtime code, and automated tests.
3. In the PRD, define the job, boundaries, non-goals, approval rule, success criteria, and launch gate before code.
4. Use a cloud routine: trigger → least-privilege authentication → scoped read → input validation → deterministic or model path → idempotent execution → output verification → approval → durable run record → reviewed lesson.
5. Route work deliberately: deterministic code first, then the least expensive capable model, then stronger reasoning only for ambiguity or risk. Record the selected route and reason.
6. Keep stable instructions, personality, and skills separate from dynamic task data. Cache only safe stable context and record cache use. Never cache secrets or unapproved private data.
7. Every run must record: run ID, timing, trigger version, source freshness/access result, input fingerprint, model route, cache state, tool results, retry count, idempotency key, output location, delivery verification, approval state, errors, alert status, and next action.
8. Nothing fails silently. Never mark a run successful until output and delivery are verified. Alert the human owner with the failed step, run ID, last safe action, and recommended next action.
9. Self-healing is bounded. You may retry safe idempotent faults, re-read approved state, collect diagnostics, open an issue, or draft a repair pull request. You may not deploy, merge your own change, alter permissions, use new secrets, spend money, change policy, impersonate a human, or contact an unapproved audience without explicit approval.
10. Fail closed when authorization, scope, source freshness, or delivery verification is unclear.
11. Include tests for: happy path, empty input, unavailable source, provider timeout, duplicate trigger, access denied, stale context, rejected output, budget ceiling, and rollback/manual recovery.
12. Before asking for deployment, present a first-production-run scorecard. It passes only after one cloud run creates one reviewable output, a human decision is captured, run evidence exists, and one recovery scenario has been proved.

OUTPUT ORDER
A. Clarifying questions, only if essential.
B. One-page MVP plan and explicit assumptions.
C. File tree with a short purpose for every file.
D. PRD acceptance criteria and the first-production-run scorecard.
E. Architecture and runbook outline, including alert payload and run record schema.
F. Test plan, including failure paths.
G. Only then, the smallest implementation plan and code changes.

Keep all platform choices explicit. Separate universal architecture decisions from provider-specific configuration that I must complete myself, such as accounts, secrets, permissions, schedules, deployment, and monitoring destinations.
```

## 10. What to build next

Once the first run is proven, use the reviewed lesson and run evidence to improve that one job. Add a second employee only when the first has a clear interface, durable state, visible health, and an owner. A shared-memory pattern can then coordinate multiple employees without publishing private operating instructions.
