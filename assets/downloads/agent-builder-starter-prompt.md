# Agent Builder Starter Prompt

## Build your first cloud-run AI employee

This is a construction contract for one useful AI employee. It is not a fleet blueprint, not a vendor tutorial, and not permission to let an agent operate without review.

At the end of this exercise you should have one agent that:

1. Runs from the cloud on a defined schedule or event.
2. Reads one approved source of truth.
3. Produces one reviewable output in one approved destination.
4. Records what happened, including the runs that did not happen.
5. Stops at the human authority boundary, because the tool to cross it does not exist.
6. Learns in a way that can be reviewed, corrected, and retired.

**Build rule:** one job, one source, one output, one approver. Earn additional autonomy with evidence.

**Never built one before? Go straight to section 12 and paste it into a build assistant.** It is not a specification you have to understand. It is a conversation: it introduces itself, asks you about ten plain questions about your business one at a time, fills in the rest of this document on your behalf, shows you what it decided versus what you decided, and then builds the agent with you in stages, stopping every time it needs something only you can do. You never have to read section 1 to answer it, and "I don't know" is an acceptable answer to any question it asks.

**In a hurry?** Same place. Everything before it explains why each line of that prompt is there, and every one of those lines was bought by an incident somewhere. Read section 0 at minimum; it is the idea the other twelve sections apply.

**Contents**

| | Section | What it is for |
| --- | --- | --- |
| 0 | The one law | Why an instruction is not a control |
| 1 | The agent contract | The fields to settle before you write code, or have the interview settle for you |
| 2 | A worked example | The contract, filled in |
| 3 | Project package | The files, and where the instructions live |
| 4 | Cloud runtime contract | The run sequence, DST, secrets |
| 5 | Model routing and cache | What to spend, and on what |
| 6 | Duplicates and blast radius | The pair that causes the worst first-month incident |
| 7 | Observability and loud failure | Telling quiet apart from healthy |
| 8 | The canary | Earning a wider audience |
| 9 | Shared memory | Learning without drifting |
| 10 | Bounded self-healing | Fixing itself without shipping itself |
| 11 | Launch gate | The one gate, enforced by CI |
| 12 | The master prompt | The interview, then the build. Paste this into your build assistant |
| 13 | What to build next | When a second agent is safe |

**If you build only four controls, build these four.** They are the ones whose absence caused the incidents behind most of this document, and each is a few lines rather than a project:

1. **A period claim, persisted before the first external action**, in a store that outlives the process. Stops the duplicate send. (Section 6.)
2. **A declared audience and a declared maximum number of external actions per run, checked at one call site that throws.** Stops the run that goes further or louder than intended. (Section 6.)
3. **A run record on every run, and one separate job that reads the ledger and alerts.** Stops the failure nobody notices, including the run that never happened. (Section 7.)
4. **A stop button that parks this one agent without a deploy.** Stops the runaway without taking everything else down with it. (Sections 1 and 4.)

Everything else in this document is worth doing and none of it substitutes for those four.

**Two terms, used precisely throughout.** A **run record** is what one run writes about itself: one entry, always written, whether the run succeeded, failed, or was parked. The **run ledger** is the durable store those entries go to, and it is what the monitoring layer reads. Some platforms call the entry a heartbeat; it is the same thing.

---

## 0. The one law: a rule in the prompt is not a control

Read this before anything else, because every other section is an application of it.

An instruction in a system prompt is a request to a probabilistic system. It is advisory. A control is a check in the code path that performs the act, at a single chokepoint, that throws when the rule is violated.

Three ways this fails in practice, all of them expensive:

- **The prompt rule is not seen by every path.** A "dry run" implemented as a sentence inside the model's instructions is invisible to any deterministic pipeline that does not run the model. The pipeline that ignores it is usually the one that does the highest-volume writing.
- **The control has a second door.** A per-run send limit enforced in one function is not a limit if a second function also sends. Have exactly one call site for each external action, and add a build-time scan that fails when a second one appears.
- **The gate is prose.** A checklist a human or a model confirms in a ship note is a promise. The same checklist run by CI as a required status check is a gate. An advisory gate is not a gate: things ship with an item written down as unmet, and shipping proceeds anyway.

So, for every rule in this document, ask: what refuses when this is violated, and where does it live? If the answer is "the agent has been told not to," you do not have the rule yet.

The corollary that saves the most trouble: **do not restrict a dangerous capability in prose, remove the tool.** An agent that must not merge its own code should not have a merge tool. An agent that must not spend money should hold no payment credential. Prohibition by absence needs no enforcement and cannot be talked out of.

---

## 1. Fill in the agent contract before you build

**If you are building your first agent, do not start here.** Most of these fields are not answerable by someone who has not built one before, and guessing at them is worse than leaving them blank, because a guess gets recorded as a decision. Paste the master prompt in section 12 instead: it opens with an interview that asks you ten plain questions about your business and fills this table for you, then shows you what it derived before anything gets built.

Come back to this table to check its work. That is what it is for.

Replace every bracketed value. If you cannot answer a field, do not code yet. Resolve the operating decision first: either decide it, or let the interview derive it from a question you can answer.

| Field | Your answer |
| --- | --- |
| Agent name | `[AGENT_NAME]` |
| Role title | `[ROLE_TITLE]` |
| Business outcome | `[ONE_SENTENCE_OUTCOME]` |
| Human owner | `[HUMAN_OWNER]` |
| One approved input source | `[SOURCE_OF_TRUTH]` |
| Output and destination | `[REVIEWABLE_OUTPUT]` sent to `[OUTPUT_SURFACE]` |
| Cadence or trigger | `[SCHEDULE_OR_EVENT]` |
| Timezone and DST handling | `[LOCAL_WALL_CLOCK_TIME]`, held across DST by `[HOW]` |
| Approval boundary | `[WHAT_REQUIRES_APPROVAL]` |
| Capabilities deliberately NOT granted | `[TOOLS_THAT_DO_NOT_EXIST_FOR_THIS_AGENT]` |
| Risk tier | `[LOW_OR_MEDIUM_OR_HIGH]` |
| Non-goals | `[WHAT_THIS_AGENT_MUST_NOT_DO]` |
| **Widest audience it may reach** | `[INTERNAL_OR_TEAM_OR_PUBLIC]` |
| **Max external actions per run** | `[N]`, because `[REASON]` |
| **Idempotency window and store** | one run per `[PERIOD]`, claimed in `[DURABLE_STORE]` |
| Alert destination and who reads it | `[CHANNEL]`, read by `[PERSON]` within `[TIME]` |
| Budget ceiling per run | `[MAX_COST_OR_TOKEN_BUDGET]` |
| **Stop button** | `[HOW_AN_OPERATOR_PARKS_THIS_AGENT_WITHOUT_A_DEPLOY]` |
| Runtime choice | `[CLOUD_RUNTIME]` |
| Durable state location | `[RUN_LEDGER_AND_MEMORY_LOCATION]` |
| Instruction store | `[WHERE_THE_AGENT_READS_WHAT_IT_SAYS_AND_DOES]` |

Five of these are new relative to the obvious version of this table, and each one exists because a cost ceiling and an approval boundary do not cover it.

- **Widest audience** and **max actions per run** are a different axis from cost. A hundred short messages into a customer-facing channel is a serious incident and costs almost nothing. A token budget would not have stopped it.
- **Idempotency window** is where new agents actually fail, and the window is almost never "per hour." See section 6.
- **Alert destination and who reads it** is one field on purpose. A destination nobody monitors is silence with extra steps. If you cannot name the person and the response time, you have not built alerting.
- **Stop button** is the field everyone skips until the first runaway. A platform-wide "disable all scheduled jobs" switch is not a stop button for one agent, it is an outage for everything else.
- **Capabilities not granted** turns your non-goals from prose into a tool list. Write the non-goal, then write which tool you are therefore not building.

### The first-job test

Your first job is small enough if you can say this sentence without adding "and also":

> Every `[SCHEDULE]`, `[AGENT_NAME]` reads `[ONE_SOURCE]`, creates `[ONE_OUTPUT]`, sends it to `[ONE_HUMAN]` for approve / reject / revise, and records the run.

If the job needs several unrelated sources, several outputs, several approvers, or an unattended external action, cut the scope until it passes.

---

## 2. A completed example: Inbound Inquiry Brief

Use this as a model of the shape, not as a requirement to build this agent.

| Field | Filled example |
| --- | --- |
| Agent name | `Scout` |
| Role title | `Inbound Inquiry Analyst` |
| Outcome | Give the owner a decision-ready summary of yesterday's inbound inquiries, so nothing sits unanswered. |
| Human owner | Head of Sales |
| Source | One read-only, scoped query against the shared inbound mailbox. |
| Output | One draft summary: who wrote in, what they asked, the suggested next step, and a link to each original message. |
| Cadence | Weekdays, 08:00 local. |
| Timezone and DST | Held at 08:00 local year-round by registering both UTC expressions and no-opping on the wrong one. |
| Approval boundary | May draft and deliver to the owner's review surface only. May not reply to any inquirer, publish, spend, or change CRM records. |
| Capabilities not granted | No send-to-external-recipient tool. No CRM write tool. No payment credential. |
| Widest audience | `team`. It can reach the owner and the internal review channel, and nothing customer-facing. |
| Max actions per run | 1 delivery, because the job produces exactly one brief. A second delivery in one run is a defect, not a busy day. |
| Idempotency | One run per local business day, claimed in a durable store before the first delivery. |
| Alert destination | The owner's direct messages, read same business day. |
| Stop button | An environment flag the operator sets without a deploy; the job then records a `parked` run and returns success. |
| Risk tier | Low. It reads one internal mailbox and writes one internal draft. |
| Non-goals | Never replies to an inquirer. Never edits the CRM. Never scores or ranks a person. |
| Budget ceiling | A low fixed ceiling per run, checked before each model call, not after the run. |
| Durable state | A run ledger, plus a separate reviewed-lessons store. |
| Instruction store | An editable document loaded by stable ID, so the owner can change the brief's wording without a deploy. |

**Expected run:** trigger, check the stop button, claim the day, authenticate with a scoped read-only credential, read yesterday's inquiries, validate freshness and required fields, transform deterministically where possible, use a judgment model only for the written synthesis, create the draft, verify the draft exists and carries a link per inquiry, deliver it once, verify delivery, write the run record.

**If the source is unavailable:** do not invent a brief, and do not report an empty day. Mark the run failed, preserve the provider response, retry only within the documented limit, and send one alert naming the failed step, the run ID, the last safe action, and the owner's next step.

**The case that teaches the most:** yesterday there were zero inquiries. That is a real, correct, empty brief. It must be impossible to confuse with "the mailbox could not be read." These two produce identical output in almost every naive implementation, and the difference is the whole value of the agent. See section 7.

---

## 3. Required project package

Ask your build assistant to create and keep these files. The names are an example; preserve their purposes even if your platform uses another convention.

```text
docs/
  PRD.md                 # Job, scope, acceptance criteria, approval boundary
  architecture.md        # Trigger, data path, state, tools, authority boundaries
  runbook.md             # Normal operation, alerting, recovery, escalation, the stop button
  launch-gate.md         # The gate every change confirms, and the script that enforces it
.agent/
  personality.md         # Voice, role, behavioral rules, prohibited behavior
  skills/
    [skill-name].md      # One repeatable capability and its tool constraints
  evals/
    first-job.md         # Pass and fail examples for the first job
runtime/
  [scheduled-job]        # Trigger and execution implementation
  guards/                # Kill switch, day claim, action ceiling, audience check
scripts/
  gate.[ext]             # Runs in CI, fails the build when a gate item is unconfirmed
tests/
  [agent-tests]          # Happy path and, mostly, failure-path tests
```

### Minimum contents

- **`docs/PRD.md`**: the one job, approved source, output, owner, non-goals, acceptance criteria, launch gate, and change history.
- **`docs/architecture.md`**: trigger, authentication scope, data flow, model routing, cache policy, run record schema, approval path, retries, rollback.
- **`docs/runbook.md`**: how to find a run, how to read an alert, when a retry is safe, when to stop, **how to park this agent without a deploy**, how to resume, who owns escalation.
- **`docs/launch-gate.md`**: the single source of truth for the gate. Everything else references it rather than restating it, so the two cannot drift.
- **`.agent/personality.md`**: role, voice, assumptions it may make, assumptions it must escalate, the human authority boundary, and the requirement to self-identify by name in every output.
- **`.agent/skills/`**: one skill per capability, each stating goal, allowed inputs, tools, validation, output format, and stop conditions.
- **`.agent/evals/first-job.md`**: acceptable and unacceptable outputs, plus the failure scenarios from section 8.

### Where the instructions live is a decision, so make it out loud

Two workable designs, and picking by accident is the failure.

- **In the repository** (shown above). Simple, versioned, reviewed. Every wording change needs a commit and a deploy, so a non-engineer owner cannot adjust what the agent says.
- **In an editable document store** loaded at runtime by stable ID. The repository becomes the body (scheduling, auth, the loop, the clients) and the instruction store becomes the brain. The owner can change behavior without a deploy. The cost is that the instructions are outside code review, and that **the agent loads by ID, so instructions must be edited in place; replacing a document with a new one orphans every pointer to it.**

Whichever you choose, one rule applies to both: **if a change alters what the agent is told to do, its instruction file is stale until you edit it, in the same change.** The README is not where the agent reads its instructions. This is the single most repeated miss in operating a fleet, so make it a required line in every ship note:

    Instructions synced: <files>        (or)        No agent-facing change

and have CI fail when that line is absent.

---

## 4. Cloud runtime contract

Run the agent in a managed cloud runtime, not only on a laptop. Keep configuration in source control and test the trigger before release.

Every run follows this sequence. The order is the safety property, not a style preference.

```text
trigger
  -> check the stop button (park and return success if set)
  -> confirm this is the right wall-clock slot
  -> claim the run for this period, in a durable store, BEFORE any side effect
  -> begin the run boundary: reset the action budget, load the declared audience
  -> authenticate with least privilege
  -> read only approved, scoped context
  -> validate freshness and required fields; distinguish empty from unreadable
  -> choose the deterministic or the model path
  -> execute safe tool calls idempotently, through single chokepoints
  -> verify the output exists and the delivery actually happened
  -> request human review when required
  -> write a durable run record, success or failure
  -> capture a reviewable lesson only after a confirmed correction
```

**Idempotent** means a retried or duplicated run cannot create a second email, ticket, charge, or post. A run ID and a delivery key before every external write are the mechanism; section 6 is where the details that actually bite live.

### Scheduling across daylight saving time

A cloud scheduler almost always runs in UTC, and a job pinned to a UTC expression drifts by an hour twice a year. If the job must fire at one local wall-clock time all year, pick one:

- register the job at both the standard-time and the daylight-time UTC expression, and have the handler no-op on the wrong one; or
- use a scheduler that accepts a timezone and verify it across a DST boundary before you trust it.

State in the runbook which local time the job must hold and which DST state you assumed. Never hardcode an offset, and never derive the current time from a filename or a cached value.

### Secrets and access

- Use scoped service credentials from the runtime's secret manager. Never put secrets in prompts, source files, logs, or chat.
- Grant the smallest permission set that completes the first job.
- Fail closed: when authorization, source scope, or identity is unclear, stop, record the reason, and alert the owner.
- **Identity fails closed, always.** If the agent's own credential is missing, the action must throw. It must never fall back to acting under a human's credential. An agent posting as a person is worse than an agent that did not post.
- Record the secret owner and rotation responsibility in the runbook. Never record secret values.
- **Before an alert claims a credential is missing, it must name where it looked.** Most "missing credential" escalations are lookups, not blockers, and a tool failing is not the same as a capability failing: a permission error from one connector says nothing about whether another route to the same data works. Require the alert to list the places checked.

---

## 5. Model routing and cache policy

Routing is an operating policy, not a brand preference.

1. Use deterministic code for transforms, validation, dates, routing, and known calculations.
2. Use the least expensive capable model for bounded extraction, classification, and formatting.
3. Use a stronger reasoning model only for ambiguity, risk, synthesis, or review.
4. Require an independent review path for protected code or consequential production decisions.
5. Record the selected route, tier, reason, cost, and fallback in the run record.

Implement routing and caching **once**, in the shared loop every job calls. Hand-rolling it per feature is how the policy stops being true.

Cache policy, in one rule: **the cached prefix must be byte-identical from call to call.** Stable instructions, personality, skills, and durable rules belong in the cached prefix. Anything that changes per run, including timestamps and live counts, belongs in the user turn. A single live number in the prefix silently disables the cache and nothing errors. Match cache lifetime to the job cadence. Never cache secrets or private data outside its retention policy. Log whether the cache was used or bypassed, and measure the savings, or you will not notice the day it stops working.

The budget ceiling deserves one honest note: a ceiling you only measure after the run cannot stop the run. Bound payloads before the expensive call, check remaining budget before each model call, and treat a fleet-wide ceiling as a lever that can only ever **lower** a job's limit. Raising a limit during an incident must not quietly widen every other job.

---

## 6. Duplicate suppression and blast radius

> **Prevents:** the same output being delivered twice, and any single run reaching further or louder than you intended.

These two are separated out because they are the pair that produces the worst first-month incident, and neither is covered by "approval boundary" or "budget."

### Duplicate suppression, done properly

The naive version, a guard keyed on the hour, has failed in production: a job fired at 09:15 and again at 09:33, both inside the same hour, and the second run republished the entire first run's output. Four requirements:

1. **Claim the period, not the hour.** If the job's intended cadence is daily, the claim is per local business day. Pick the window from the cadence, and say why.
2. **Persist the claim in a store that outlives the process.** In-process deduplication cannot see a sibling instance, and a sibling instance is exactly the case. A small durable file or row is enough.
3. **Persist the claim BEFORE the first external action.** The ordering is the guard. A claim written at the end of the run means a run that published and then failed its final write leaves no trace it ran, and the next invocation publishes the same thing again.
4. **Fail closed.** An unreadable claim is UNKNOWN, not "has not run today." Degrading it to "not run" disarms the guard on precisely the day the store is flaky. The cost is a job that does not run, which is acceptable only because it is loud: record the error and let the alerting layer turn it red the same day.

And the part that is always forgotten: **every retry, reconcile, and catch-up path states its cap, and never re-emits work that has not passed the agent's own vetting step.** Keep "not yet reviewed" and "reviewed, awaiting delivery" as distinct states. A catch-up path that replays everything pending will happily publish work the agent itself rejected.

Legitimate exemptions exist, and each must be recorded as a decision rather than a to-do:

- a job whose intended cadence is genuinely intraday (its correct guard is per slot);
- a job that writes to no human surface at all (there is no duplicate publication to prevent, and adding a fail-closed dependency only creates a new way to go silent);
- a watchdog (a duplicate alert is not a duplicate publication, and a fail-closed claim store would silence the alarm at the same moment the storage trouble it exists to report begins).

### Blast radius

**Declare, in code, the widest audience the job may reach and the maximum number of external actions one run may perform. An undeclared job is refused, not given a default budget.**

- Classify destinations as `internal` (private, unmonitored, agent-to-agent), `team` (a human colleague or internal channel), `public` (customer or member facing). A `public` destination raises the review bar.
- Check the declaration **at the run boundary**, so a misconfigured job fails on its first invocation, in its own logs, before it can act.
- The action path refuses the (N+1)th action: **record the error and throw. Never truncate silently.** A run that quietly does nothing looks exactly like a run with nothing to do, and that ambiguity is the failure class you will keep paying for.
- Refuse any action toward a destination positively classified wider than the declaration. A destination you cannot classify is UNKNOWN, not safe and not public; let it fall through to the count ceiling rather than guessing either way.
- **Arm this on every path, not just the scheduled one.** Event handlers, manual triggers, and reply surfaces all reach the same chokepoint. A guard that silently skips when a variable is unset is worse than no guard, because it buys false confidence. Give the non-scheduled paths a declared default.
- **Exactly one call site per external action, with a build-time scan that fails on a second.** A ceiling with a path around it is not a ceiling.

Every maximum states why it is that number. If it is an unmeasured default, say so in the declaration. A fabricated tight cap fails toward an outage, and the registry must not make that trade quietly.

---

## 7. Observability, loud failure, and the difference between quiet and healthy

> **Prevents:** the agent that stopped working weeks ago and nobody noticed, because a broken agent and a quiet one look identical.

Observability means you can answer "what happened to this run?" without guessing, and "did the 9 a.m. run happen at all?" without a human noticing its absence.

Every run writes one run record to the run ledger, success, failure, or parked. **If you implement only six fields, implement these:** run ID, outcome, the period claim and whether it preceded any side effect, external actions performed against the ceiling, delivery verification, and next action. The rest earn their place as the agent grows.

```text
run_id
started_at / completed_at / duration
trigger, schedule version, and which DST expression fired
stop-button state (running | parked)
period claim: claimed_at, store, and whether it was persisted before any side effect
source name, source version, freshness check, access result
input fingerprint (not sensitive raw content)
model route, cache decision (hit | miss | bypassed), token or cost estimate, budget state
tool calls, retry count, idempotency key, verification results
external actions attempted / permitted / performed, and the declared ceiling
output location and delivery verification
approval state and reviewer decision
error class, alert status, escalation owner, next action
lesson captured after a confirmed correction
```

### The run record is the signal, not the crash

Do not have each run alert on its own failure and call that monitoring. A crash-only design cannot see the run that never started, and a job that never fires throws nothing. Instead:

- every run writes its run record;
- **one** monitoring job reads the ledger on a schedule and is the single alerting layer;
- it distinguishes three states that must never collapse into each other: **healthy**, **parked**, and **broken**. A parked job is a normal, successful, deliberately empty run.

### Who checks the checker

The monitoring job's own silence is the one silence that means all alerting is gone, and it is invisible to itself. Add an **independent** path, on a different trigger, that asserts a monitoring record exists at or after each expected slot, and alerts once per missed slot. Any run record proves the job fired, including one recording an error.

Fail honest at every step: an unreadable ledger is UNKNOWN, not stale. Log loudly, do not alert. A false alarm from the layer that exists to be trusted costs more than the outage.

### Silence looks exactly like health

The most expensive failure in this whole document is the run that succeeds and does nothing. No error, no truncation, a clean success code, and the answer written as text that is then discarded because the model never called the delivery tool. This is invisible for as long as nobody happens to check, and it has killed a live reply surface for a week while a slower path masked it with late answers.

Two rules:

- **Never leave delivery to the model's discretion.** If the run finished and the surface owes a human a response, deliver the model's final text yourself, record that the rescue happened, and let the monitoring layer escalate it. A rescue that quietly papers over a broken primary is the same failure one layer up.
- **A run that performed zero external actions on a surface that owed one is a failed run**, and must be recorded as such.

### Absence is never inferred from an empty result

This is the discipline that makes an agent trustworthy on negative claims, and it is where most of them lie without meaning to. "It did not happen" and "I could not check" are indistinguishable unless the code keeps them apart.

- Any tool that can return nothing for two different reasons must say which. Return `null` (or an explicit `unknown`) on an unreadable source, and an empty list only for a source that was read and was genuinely empty. An empty array is the field that makes an unknown look like a clean queue.
- Any list that may be cut short carries a `truncated` flag, and the agent may not conclude anything from a truncated list.
- **Gate the negative claim at the point of assertion, on every path it can travel.** Before the agent states that something did not happen, a check runs that refuses on disproven, refuses on unknown, and refuses on a claim too vague to verify. A claim that survives travels with its evidence attached: what was checked, when, against what, and what was found.
- Enumerate those paths in code, not in prose, and have a test fail when a new outward path exists that the registry does not name. A sentence saying "there are exactly two ways a claim can reach a human" goes on looking true for every month in which it is not.

### The escalation contract

A vague alarm in the owner's inbox is worse than a crash in your logs. Every escalation to a human carries:

- **one** specific action the human should take;
- the cause, labelled **measured** or **inferred**, with an inferred cause rendered explicitly as a hypothesis;
- the failed step, the run ID, and the last safe action;
- what was checked before deciding a human was needed.

Two hard rules on top:

- **One human-actionable escalation per run, maximum.** If several things need attention, escalate the highest-priority one and say in one clause how many others are waiting and where they can be seen. Two alarms competing for attention is the failure, not the fix. A suppressed item must still be visible somewhere; it is never silently dropped.
- **A malformed escalation throws and sends nothing.** If your alert cannot state one action and an evidence label, it is not ready to be sent.
- **Do not route work the human cannot do.** Stack traces, runtime logs, and infrastructure toggles belong to whoever maintains the agent. If your owner is a non-engineer, an alert asking them to read logs is a defect in the alert.

### Failure table

| Situation | Safe agent behavior |
| --- | --- |
| Temporary provider timeout | Retry only within the documented limit, same run ID and idempotency key. |
| Missing required input | Stop. Do not infer missing facts. Create an actionable alert. |
| Source read fails | Report unreadable. Never report an empty result. |
| Duplicate trigger | Detect the existing period claim. Do not repeat the action. |
| Claim store unreadable | Treat as UNKNOWN, do not run, record the error loudly. |
| Access denied | Fail closed, record the scope issue, name where you looked, alert the credential owner. |
| Stale context | Mark the output unsafe to send, re-read approved state if possible, otherwise escalate. |
| Action ceiling reached | Record the error and throw. Never truncate silently. |
| Destination wider than declared | Refuse the action and record why. |
| Run finished having delivered nothing | Deliver the final text, record the rescue, escalate. |
| Stop button set | Record a parked run, return success, change nothing. |
| Output rejected by the reviewer | Preserve the rejection reason, update the lessons store only after confirmation, queue a bounded improvement. |

Nothing fails silently. A failed run is never reported as successful. **A successful execution is not a successful run until the output and its delivery are verified.**

---

## 8. Progressive exposure: the canary

> **Prevents:** a first-week defect meeting your customers.

Do not let a new agent's first live output reach its widest audience. One clean run proves the happy path, and the happy path is not where new agents fail.

- **A new agent is confined until it is explicitly promoted, and absence from the promoted list means confined.** The safe state is the default: an agent is confined by forgetting, never exposed by forgetting.
- **Confinement redirects, it does not refuse.** Send the real output to a narrow destination, and say in the output that it was redirected. A refusal proves the guard works and proves nothing about the agent. You want to watch it compose real output, hit real sources, and stake its real period claim, with only the audience narrowed.
- **Confinement narrows who, not how much.** The action ceiling from section 6 still applies on top.
- **Promotion is earned and reviewed.** Three consecutive clean runs, and at least one clean run of every distinct job shape the agent owns. Three, not one, because one run cannot demonstrate idempotency. Every shape, because three clean runs of the daily job say nothing about the weekly one.
- **Define clean before you need to argue about it:** a healthy run record, zero actions outside the confined destination, no human escalation, and the period claim persisted before any side effect. A run that produced no output because a guard held is clean. A run that errored is not, and it **resets the count to zero**.
- Compute readiness from the run ledger, so the promotion decision is written against a record rather than a recollection, and keep promotion itself a reviewed change.

Note the distinction from the stop button. The stop button means "do not run." The canary means "run, and let us watch." Building the canary out of the stop button means flipping the stop button constantly, which is how a stop button stops being trusted.

---

## 9. Shared memory: how the agent learns without drifting

> **Prevents:** repeating last month's mistake, and its opposite, an agent quietly teaching itself something wrong.

An agent that cannot carry a lesson forward makes the same mistake weekly. An agent that writes to its own memory unsupervised drifts, and drift compounds silently. The shape that survives both is a single reviewed ledger with four verbs and an owner.

**One store, not one per agent.** A single durable JSON document, pinned by a stable ID so it resolves identically from every machine and every harness. This is what makes a lesson one agent learns available to the next one, and it is what makes a second agent cheap to add later.

**Four verbs:**

- **RECALL.** At the start of every run, the runtime reads the ledger once (cache it briefly so a burst is one read) and injects the **promoted** rules into the cached system prefix, plus any short daily digest into the user turn.
- **CAPTURE.** At the end of a run, a confirmed lesson is emitted in a parseable form, along with a way to flag a rule as wrong. Folding it into the ledger is entirely fail-soft: a memory hiccup must never fail the run.
- **SYNTHESIZE.** One scheduled, bounded, cheap pass per day turns the day's records into a short digest: what happened, blind spots, what to do first. Internal only; it publishes to no human surface.
- **ARBITRATE.** One owner, and only one, promotes and retires.

**Promotion is mostly emergent, and the numbers matter less than their shape.** A new lesson starts below the promotion threshold. A confirmation nudges it up a little. A correction pulls it down by more than a confirmation raises it, because being wrong should cost more than being right earns. Unused confidence decays on a half-life. Above the threshold, a lesson becomes an injected rule; unused rules decay back out. The owner's two deliberate overrides are **pin** (a hard-won rule that must never decay) and **retire** (a rule that proved wrong).

Four details that are easy to get wrong and expensive to discover:

1. **Injected rules must read stored confidence, not live-decayed confidence.** If the injected block changes on every read, it is not byte-stable, and the prompt cache stops working. Decay and promotion happen at **write** time, never per read. Only the volatile daily digest goes in the user turn.
2. **A memory with no retirement path is a leak.** A ledger that only grows is read in full at the top of every run, forever. Wire the retirement pass and the review queue on day one, and verify they have callers. It is entirely possible to ship both and have neither ever called: decay then stops a dead lesson being injected while leaving it in the store permanently.
3. **Contested lessons must reach the arbiter.** Put the pending-review list into the digest that the owner actually reads. A review queue nobody is shown is not a queue.
4. **Unknown is not dead.** A record whose confidence cannot be read is kept, never deleted.

**Scope every lesson.** `global` (applies to every agent) or `<agent>` (applies to one), so each agent is injected its own plus the global ones. Keep a valid-scope list even for agents that do not yet run this loop: a lesson can be filed against an agent for a human to act on, even where automatic injection is not wired.

And be honest about which agents actually ride it. If a job is a deterministic pipeline that never enters the model loop, it neither reads nor writes the ledger at runtime, and that is a consequence of where its code runs, not an oversight. Write that down rather than letting a diagram imply universal coverage.

---

## 10. Bounded self-healing and delivery

> **Prevents:** an agent that can repair itself also being able to ship itself.

Self-healing is not autonomy. The agent may:

- retry a transient, safe, idempotent operation within a small limit;
- re-read missing or stale state from an approved source;
- collect diagnostics and open a structured issue;
- draft a repair plan or pull request for independent review.

The agent must not deploy, alter permissions, rotate secrets, spend money, change policy, act as a human, contact an unapproved audience, or merge its own change. **Enforce this by not building the tools**, per section 0. There is no merge tool, so there is nothing to restrict.

For code changes:

```text
observed issue -> tracked ticket -> branch -> pull request -> independent review
-> merge by a human or a gate that is not the author -> deploy verification
-> rollback if verification fails -> documented lesson
```

Five guardrails that make this survivable rather than merely fast:

1. **Declare the scope of every change.** The pull request states which paths it may touch, and CI re-checks the actual diff against that declaration and fails on anything outside it. Measure the diff from the merge base, not from a branch-to-branch comparison, which is a different and misleading number.
2. **Cap the review size.** Beyond the cap, split the change into a chain of pull requests that open and merge in order, each cut from the previous one and each independently correct. A stale base inflates the measured size, so refresh before measuring.
3. **Protected paths never auto-merge.** Keep the list in exactly one place in code, referenced everywhere else, with a check that fails the build when the copies disagree. A prose copy of a security-relevant list will eventually describe something the enforcement does not do.
4. **Verify the deploy, not the merge.** A merge is not a deploy and a deploy is not a running change. A blocked or failed deploy can leave the repository looking updated while production runs the old build, with no trace in version control. Confirm the deployment reached a ready state, then confirm the next scheduled run actually fired.
5. **Every change carries a written reason that outlives the session.** A ticket, referenced by the pull request, moved to done when it ships. The point is not process; it is that six weeks later the only surviving explanation of why a control exists is the one that was written down.


---

## 11. Launch gate

> **Prevents:** everything above quietly becoming a document nobody applies.

Everything above collapses into one gate. Keep it in **one file** (`docs/launch-gate.md`), referenced and never restated by anything else, so the copies cannot drift. Confirm it as a line in every ship note, and **have `scripts/gate` run in CI as a required check that fails the build when the line is missing or an item is unconfirmed.** Each item is either confirmed or `N/A - <reason>`. A bare `N/A` fails. A missing item fails.

    Launch-Gate: caching OK · instructions-synced OK · identity OK · blast-radius OK ·
                 idempotency OK · canary OK · observability OK · stop-button N/A - no human surface

**The gate script is the one thing here a non-engineer will want help with, so be clear about its size.** It reads the ship note, checks the gate line is present, checks that every item is either confirmed or carries `N/A - <reason>`, and exits non-zero otherwise. That is roughly twenty lines in any language, and it is the difference between this document being applied and being admired. If you skip exactly one thing in this document, do not let it be this one: skipping it recreates the failure section 0 opens with, in the file that exists to prevent it.

**A word on evidence, because this is where gates get faked.** A build passing proves syntax, not correctness. A test run in an environment that can serve mismatched files proves nothing at all. Decide in advance where evidence is allowed to come from, prefer a check whose output you can paste over an assertion that something is fine, and treat "I believe X" and "I verified X" as the different claims they are.

Do not add a second job until all of the following are true, each demonstrated rather than asserted:

- [ ] The scheduled or event trigger fired from the cloud, at the correct local time.
- [ ] The agent read only the approved source, with least-privilege access.
- [ ] The output was generated, verified, and delivered to the review surface.
- [ ] A human approved, rejected, or revised it.
- [ ] The run record contains every required field.
- [ ] An empty-input test produced a correct empty result, distinguishable from a failure.
- [ ] An unavailable-source test produced a useful alert, not a fake success and not a fake empty.
- [ ] A provider-timeout test respected the retry ceiling.
- [ ] A duplicate-trigger test created no duplicate external action, with the claim provably written before the first action.
- [ ] An unreadable-claim-store test refused to run and recorded the error.
- [ ] An access-denied test failed closed and named where it had looked.
- [ ] A missing-own-credential test threw, and did not act under a human's identity.
- [ ] A stale-context test stopped unsafe delivery.
- [ ] An action-ceiling test threw rather than truncating.
- [ ] A wider-audience test refused the action.
- [ ] A silent-run test delivered the final text and recorded the rescue.
- [ ] The stop button parked the job without a deploy, and the monitoring layer reported it as parked rather than broken or healthy.
- [ ] The monitoring layer alerted on a run that never fired, and the independent check alerted on the monitoring layer's own silence.
- [ ] A rejected output preserved the feedback without overwriting approved memory.
- [ ] The memory retirement pass and review queue were confirmed to have callers.
- [ ] Budget and rollback behavior were tested.

Notice how few of these are happy-path tests. That ratio is the point.

---

## 12. The master prompt: paste this into your build assistant

This is the whole document, operationalized. It interviews you, fills in the contract, and then builds the agent with you in gated stages, stopping whenever it needs something only you can do. You do not have to have read anything above to use it.

```text
You are helping me build one real cloud-run AI employee. We are doing this together, as a conversation, over many messages. Do not start by writing production code, and do not start by writing a plan.

YOUR FIRST REPLY
Keep it under six lines. Introduce yourself in one sentence, tell me you are going to ask about ten short questions one at a time before anything gets built, tell me there are no wrong answers and "I don't know" is a fine one, then ask question 1 and stop.

Do NOT summarize this prompt back to me. Do NOT list the stages, the questions, or the contract. Do NOT explain what an AI agent is or why any of this matters. Do NOT ask question 1 and question 2 in the same message. I will lose interest before we start, and everything you would have said is coming later anyway, at the point where I actually need it.

INTERVIEW ME FIRST
I may not be able to fill in the contract below, and I should not have to. Interview me until you can fill it in yourself.

Rules for the interview, all of them binding:
- ONE question per message. Wait for my answer before asking the next. Do not send me a numbered list of questions to work through; I will answer the first one and lose the rest.
- Plain business language only. Never ask me a question containing a term from the contract, such as idempotency, blast radius, audience tier, or instruction store. Those are YOUR job to derive from what I tell you.
- Ask a follow-up when my answer is vague. "Our CRM" is not a source; "which system, and can you show me one record" is.
- If I say I do not know, say what you would assume and why, in one sentence, and move on. Do not stall the interview on a field you can propose.
- Keep each of your messages short. A question, and at most two lines of context around it. If I give you a rich answer, do not reward me by producing a plan on the spot; acknowledge it in one line and ask the next question. The build starts when the interview ends, not before.
- Track what you have and have not learned. If an answer already covered a later question, say so and skip it rather than asking me something I just told you.

The ten questions, in this order. Adapt the wording, keep the intent:
1. What is the repetitive job you want off your plate, and who does it today?
2. Walk me through how that person does it now, step by step, as if I were shadowing them.
3. Where does the information come from? Name the system, and describe one real example.
4. What does the finished thing look like, and where does it need to land so the right person sees it?
5. Who checks it before it counts as done? What do they do when it is wrong?
6. How often should this run, and at what time? And if it accidentally ran twice in one morning, what would go wrong?
7. Who is allowed to see what it produces? Could its output ever reach a customer, a member, or the public, even by accident?
8. What must this never do, even when it would seem helpful?
9. If it starts behaving badly overnight, who notices, and what is the first thing they should be able to do about it?
10. Last one, and it matters more than it sounds: what do you want to call it, and what job title would it have if it were a person? You will be talking to this thing, and about it, for a long time. If nothing comes to mind, suggest three names based on what it does and let me pick.

THEN PLAY BACK WHAT YOU DERIVED
Fill in the contract below from my answers and show me the completed table before you build anything. Label every row DECIDED (I told you) or ASSUMED (you derived or proposed it), and keep those labels in the table. I need to see what I chose and what you chose for me. Ask me to confirm or correct it. Do not proceed until I have.

Then, and only then, turn the confirmed contract into a constrained MVP plan, a file tree, acceptance criteria, and a test plan. Never invent private data, credentials, or permissions at any stage.

THE GOVERNING RULE
A rule in a prompt is not a control. Every constraint below must be enforced by a check in the code path that performs the act, at a single call site, that throws when violated. Where a capability is prohibited, do not restrict it in instructions: do not build the tool. Tell me explicitly which rules you enforced in code and which remain advisory, and why.

AGENT CONTRACT
- Agent name: [AGENT_NAME]
- Role title: [ROLE_TITLE]
- One business outcome: [ONE_SENTENCE_OUTCOME]
- Human owner: [HUMAN_OWNER]
- One approved source of truth: [SOURCE_OF_TRUTH]
- One reviewable output: [REVIEWABLE_OUTPUT]
- Output surface: [OUTPUT_SURFACE]
- Schedule or event trigger: [SCHEDULE_OR_EVENT], at [LOCAL_TIME] held across DST
- Approval boundary: [WHAT_REQUIRES_APPROVAL]
- Explicit non-goals: [WHAT_THIS_AGENT_MUST_NOT_DO]
- Tools deliberately not built: [CAPABILITIES_THAT_MUST_NOT_EXIST]
- Widest audience: [INTERNAL_OR_TEAM_OR_PUBLIC]
- Max external actions per run: [N], because [REASON]
- Idempotency: one run per [PERIOD], claimed in [DURABLE_STORE]
- Alert destination, its reader, and expected response time: [WHO_AND_HOW_FAST]
- Stop button: [HOW_AN_OPERATOR_PARKS_IT_WITHOUT_A_DEPLOY]
- Cloud runtime: [CLOUD_RUNTIME]
- Run ledger and reviewed-memory location: [RUN_LEDGER_AND_MEMORY_LOCATION]
- Instruction store (repo or editable store loaded by stable ID): [WHERE]
- Budget ceiling: [MAX_COST_OR_TOKEN_BUDGET]

BUILD REQUIREMENTS
1. Build one job, one source, one output, one human approver. Do not expand scope.
2. Create and maintain: docs/PRD.md, docs/architecture.md, docs/runbook.md, docs/launch-gate.md, the agent's .agent/personality.md, .agent/skills/ and .agent/evals/, runtime code with a guards/ directory, a CI gate script, and automated tests.
3. Define the job, boundaries, non-goals, approval rule, success criteria, and launch gate in the PRD before writing runtime code.
4. Implement the run sequence in this order, because the order is the safety property: check the stop button, confirm the correct wall-clock slot, claim the period in a durable store BEFORE any side effect, open the run boundary and load the declared audience and action ceiling, authenticate least-privilege, read scoped context, validate freshness and distinguish empty from unreadable, choose the deterministic or model path, act idempotently through single chokepoints, verify the output AND its delivery, request approval, write the run record, capture a reviewable lesson.
5. Route work deliberately: deterministic code first, then the least expensive capable model, then stronger reasoning only for ambiguity or risk. Implement routing and caching once in a shared loop. Keep the cached prefix byte-identical call to call; put anything per-run in the user turn. Record route, cache decision, and cost.
6. Enforce duplicate suppression as: a claim per [PERIOD], in a store that outlives the process, persisted before the first external action, failing CLOSED on an unreadable claim. Every retry or catch-up path states its cap and never re-emits unvetted work.
7. Enforce blast radius as: a declared widest audience and max actions per run, checked at the run boundary, refusing an undeclared job rather than defaulting it. The (N+1)th action records an error and throws; it never truncates silently. Arm the check on every path, including event and manual triggers. Exactly one call site per external action, with a build-time scan that fails on a second.
8. Confine the agent to a narrow destination until it is explicitly promoted. Absence from the promoted list means confined. Confinement redirects rather than refuses and announces the redirect. Promotion requires three consecutive clean runs plus one clean run of every job shape, computed from the run ledger, and remains a reviewed change.
9. Every run writes one run record to a durable run ledger, including parked and failed runs, with: run ID, timing, trigger and DST expression, stop-button state, claim and whether it preceded side effects, source freshness and access result, input fingerprint, model route, cache decision, cost and budget state, tool results, retry count, idempotency key, actions attempted/permitted/performed, output location, delivery verification, approval state, errors, alert status, next action.
10. Do not alert from inside the run. One separate monitoring job reads the ledger and is the single alerting layer, and it distinguishes healthy, parked, and broken. Add an independent check, on a different trigger, that alerts when the monitoring job itself goes silent. An unreadable ledger is UNKNOWN, not stale.
11. Never let silence look like health. If a run finishes owing a human a response and the model did not deliver it, deliver the final text programmatically, record the rescue, and escalate. A run that performed zero external actions on a surface that owed one is a failed run.
12. Never infer absence from an empty result. Any tool that can return nothing for two reasons must distinguish unreadable from empty, and flag truncation. Gate every negative claim at the point of assertion: refuse on disproven, on unknown, and on unverifiable, and attach the evidence to any claim that survives.
13. Escalations carry ONE action, a cause labelled measured or inferred, the failed step, the run ID, the last safe action, and what was checked first. One human-actionable escalation per run, maximum; suppressed items stay visible elsewhere. A malformed escalation throws and sends nothing. Never ask the owner to do work they cannot do.
14. Self-healing is bounded. You may retry safe idempotent faults, re-read approved state, collect diagnostics, open an issue, or draft a repair pull request. You may not deploy, merge your own change, alter permissions, use new secrets, spend money, change policy, act as a human, or contact an unapproved audience. Enforce every one of those by NOT BUILDING the tool, per the governing rule, and at the Stage 5 check-in tell me plainly which prohibitions rest on a missing tool and which rest only on instructions. Every pull request declares the paths it may touch and CI re-checks the merge-base diff against that declaration. Verify the deploy reached a ready state and that the next run fired, not merely that the merge happened.
15. Fail closed when authorization, scope, source freshness, delivery verification, or identity is unclear. Identity fails closed absolutely: with the agent's own credential missing, the action throws and never falls back to a human's credential.
16. Implement shared memory as one durable store with four verbs: recall promoted rules into the cached prefix, capture confirmed lessons fail-soft, synthesize a bounded internal daily digest, and arbitrate promotion and retirement through one owner. Corrections outweigh confirmations, unused confidence decays, injected rules read stored confidence so the prefix stays byte-stable, and the retirement pass and review queue must have callers before you call this done. Scope every lesson global or per-agent. Unknown confidence is kept, not deleted.
17. Include tests for, at minimum: happy path, empty input distinguishable from failure, unavailable source, provider timeout, duplicate trigger with the claim written first, unreadable claim store, access denied, missing own credential, stale context, action ceiling, wider-than-declared audience, silent run rescue, stop button parking, monitoring-layer silence, rejected output, budget ceiling, and rollback.
18. Produce the launch gate as ONE file (docs/launch-gate.md) plus a CI script that FAILS the build when the gate line is missing or any item is unconfirmed. Each item is confirmed or "N/A - <reason>"; a bare "N/A" fails and a missing item fails. Do not present the gate as a checklist for me to attest to, and do not restate its items anywhere else.

HOW WE BUILD TOGETHER
Assume I have never built an agent. We are doing this side by side, and you are the guide. These pacing rules bind you for the whole session:

- **One stage per message.** Never run several stages together, and never send me a wall of files to review. Finish a stage, tell me in one plain sentence what now exists that did not before, then stop.
- **Separate your work from my work.** Some things only I can do: create accounts, set secrets, grant permissions, approve a deploy. When it is my turn, say so clearly and give me numbered, literal steps: the site, the menu, the button, the exact value to paste. Assume I am not technical and may be reading this on my phone.
- **Never ask me to paste a secret into this chat.** Tell me where to put it in the platform instead.
- **Stop and wait when a stage needs me.** Do not build past a blocked step, and never describe a step as done when it is waiting on me.
- **End every stage with how I can see for myself that it worked** - the page to open, the file to look at, the command to run. Not "done," but "here is how you check."
- **Explain each new term once, in one line, the first time you use it.** I will not ask.
- **One question per message, maximum.** If several things need my decision, ask the most important one and hold the rest.
- **If I ask for something that breaks a control from this contract**, tell me which one and what it would cost in one sentence, and then do it my way if I still want it. You advise; I decide.

THE STAGES
Work through these in order. Each one ends with a check-in, and the ones marked WAIT do not continue until I answer.

- **Stage 1 - The plan in plain English.** What we are building, roughly what it will cost to run, and the complete list of accounts and access I need to go get. No code. WAIT.
- **Stage 2 - The paperwork.** The PRD, architecture, runbook, and launch gate files. Show me the PRD in plain English, not the file. WAIT.
- **Stage 3 - My turn: accounts, secrets, permissions.** Numbered literal steps, one system at a time. WAIT for me to confirm each one before naming the next.
- **Stage 4 - A skeleton that runs in the cloud and does nothing useful.** It fires on schedule, writes one run record, and stops. This is the most important stage and the one most people skip: it proves the trigger, the identity, and the ledger before any real behavior exists. Do not continue until I have seen a run record with my own eyes. WAIT.
- **Stage 5 - The four floor controls, before the first real output.** The period claim, the action ceiling and audience check, the run record plus its separate monitoring job, and the stop button. Then have me test the stop button myself. WAIT.
- **Stage 6 - The actual job, confined.** Real sources, real output, delivered only to the narrow destination. Show me a real output and ask me to approve, reject, or revise it. WAIT.
- **Stage 7 - The failure tests.** Walk me through them one at a time, failure paths first, and show me what each one proves. Unplug something real if you can. WAIT.
- **Stage 8 - The launch gate and CI.** Make the gate mechanical, then deliberately break the gate line once so I can watch the build fail. WAIT.
- **Stage 9 - Promotion.** Show me the run ledger evidence for three clean runs of every job shape, and recommend promote or wait. This decision is mine. WAIT.

Keep all platform choices explicit throughout, and always separate the universal architecture decisions from the provider-specific configuration only I can complete.
```

---

## 13. What to build next

Once the first run is proven, improve that one job using its run evidence and its reviewed lessons. Add a second employee only when the first has a clear interface, durable state, visible health, a stop button, and an owner.

The second agent is where the shared memory store from section 9 starts paying: a lesson the first agent learned is available to the second on its first run. Keep the store, the run ledger, the monitoring layer, and the alerting contract shared from the start. Duplicating them per agent is the point at which a fleet stops being observable, and you will not notice on the day it happens.
