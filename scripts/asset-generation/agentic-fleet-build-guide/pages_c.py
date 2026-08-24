"""Pages 15-24: evidence, alerting, the stop button, canary, failure tests,
bounded self-healing, the gate, promotion, shared memory, and what comes next."""

from kit import (
    W, H, M, CW, INK, MUTED, FAINT, CARD_MUTED, ACCENT, TINT, TINT_STRONG, BORDER,
    NAVY, WHITE, OK, OK_TINT, WARN, WARN_TINT, STOP, STOP_TINT, SURFACE,
    line, wrap, para, eyebrow, display, card, hairline, pill, chrome, opener,
    step_header, do_this, you_should_see, bullets, table, node, diamond, arrow,
)
import kit
from pages_b import _session, _warnbox


# ================================================== 15  observability
def p15_observability(c):
    y = _session(c, 15, 5, "PART 3 OF 4", "Observability: proof, and one watcher",
                 "If you cannot answer \"what happened at 6am?\" without guessing, you do not operate "
                 "this agent yet. Two things fix that: a record from every run, and exactly one job "
                 "whose whole purpose is to read those records.")

    y = do_this(c, M, y - 10, CW, [
        "Say:  \"Every run writes one record, including runs that fail",
        "       and runs that are parked. Then build ONE separate job",
        "       that reads those records on a schedule and is the only",
        "       thing that alerts me. Individual runs must NOT alert.\"",
    ], "SAY THIS")

    y -= 14
    eyebrow(c, "The six fields that matter most", M, y)
    y -= 15
    fields = [
        ("run_id", "one id threaded through everything this run touched"),
        ("outcome", "ok, failed, or parked - never blank"),
        ("claim", "did it claim the day, and did that happen before it acted"),
        ("actions", "how many external actions, against the declared ceiling"),
        ("delivered", "proof the output actually landed, not just 'no error'"),
        ("next_action", "if something is wrong, the one thing a human should do"),
    ]
    colw = (CW - 16) / 2
    for i, (k, v) in enumerate(fields):
        cx = M + (i % 2) * (colw + 16)
        cy = y - (i // 2) * 34
        line(c, k, cx, cy, 8.6, ACCENT, kit.MONO)
        para(c, v, cx, cy - 11, colw - 10, 7.9, 10.2, MUTED)

    y -= 3 * 34 + 8

    _warnbox(c, y, "Why runs must not send their own alerts",
             "A run that crashes can shout. A run that never started cannot. Crash-only alerting is "
             "blind to the exact failure you care about most: the 6am job that simply did not happen. "
             "Only a separate watcher reading the records can see an absence.", ACCENT, TINT)

    you_should_see(c, M, 168, CW, [
        "Three states that never blur together: healthy, parked, and broken.",
        "Delete a run record on purpose and watch the watcher notice the gap.",
    ])


# ================================================== 16  failure diagram
def p16_alert_diagram(c):
    y = opener(c, 16, "How a problem reaches a person",
               "Silence is the failure you cannot see",
               "A run that crashes can shout. A run that never started cannot. Only something "
               "reading the records can notice an absence.", WARN, 27)

    BW, BH, GAP = 150, 52, 30
    row1 = y - 48
    xs = [M, M + BW + GAP, M + 2 * (BW + GAP)]

    kit.wb_box(c, xs[0], row1 - BH, BW, BH, "Every run", "writes its own record")
    kit.wb_arrow(c, xs[0] + BW, row1 - BH / 2, xs[1], row1 - BH / 2)
    kit.wb_box(c, xs[1], row1 - BH, BW, BH, "One watcher", "reads them on a schedule")
    kit.wb_arrow(c, xs[1] + BW, row1 - BH / 2, xs[2], row1 - BH / 2)
    kit.wb_box(c, xs[2], row1 - BH, BW, BH, "A second check", "watches the watcher itself")

    row2 = row1 - BH - 66
    kit.wb_arrow(c, xs[1] + BW / 2, row1 - BH - 3, xs[1] + BW / 2, row2 + 6,
                 kit.WB_RED, "a record is missing", dashed=True, label_offset=0)
    kit.wb_box(c, M + 40, row2 - 46, CW - 80, 46, "Alert exactly one person",
               "one action  ·  one cause, measured or inferred  ·  the run id  ·  what was tried",
               kit.WB_RED_WASH, kit.WB_RED, INK, MUTED, dashed=True)

    ny = kit.wb_note(c,
                     "one alert per run, maximum. if three things are wrong, send the worst one "
                     "and say how many others are waiting. a vague alarm at 3am is worse than a "
                     "clean line in a log.", M, row2 - 66, CW)

    ny = _warnbox(c, ny - 16, "The failure this page exists for",
                  "A run can finish with no error, no crash and a clean success code, having "
                  "written its answer as text that was then thrown away. Nothing alerts, because "
                  "nothing failed. If a run owed a person a reply and delivered nothing, that is a "
                  "failed run - record it as one and deliver the text yourself.", ACCENT, TINT)

    ny -= 22
    eyebrow(c, "What every alert must carry", M, ny)
    ny -= 15
    bullets(c, [
        "One action. Not a status report with a problem buried in it - the one thing to do.",
        "One cause, labelled measured or inferred. An inferred cause is written as a hypothesis, "
        "so nobody acts on a guess believing it was a finding.",
        "The failed step, the run id, and what the system already tried before waking you.",
        "Never a request to do work the reader cannot do. An alert asking a non-engineer to read "
        "logs is a defect in the alert, not in the reader.",
    ], M, ny, CW - 20, 8.7, 12.0, ACCENT)


# ================================================== 17  stop button
def p17_stop(c):
    y = _session(c, 17, 5, "PART 4 OF 4", "Build the stop button before you need it",
                 "One day it will misbehave. You want a switch that stops this one agent, right now, "
                 "without a deploy, without a developer, and without taking anything else down.")

    y = do_this(c, M, y - 12, CW, [
        "Say:  \"Add a stop switch for THIS job that I can set without a",
        "       deploy. When it is set, the job still wakes, records that",
        "       it is PARKED, and returns success without doing anything.",
        "       A manual or forced run must NOT bypass it.\"",
    ], "SAY THIS")

    y -= 14
    b = table(c, ["State", "What it means", "What the watcher says"],
              [["Healthy", "Ran, did its job, left a record", "Nothing. This is normal."],
               ["Parked", "You stopped it on purpose", "\"News is parked\" - not an alarm"],
               ["Broken", "Tried to run and could not", "An alert with one action"]],
              M, y, [76, 210, CW - 286], row_h=27, size=7.9)

    _warnbox(c, b - 16, "Three rules that make it a real stop button",
             "It must stop the JOB, not just the sending - a switch that only silences output hides a "
             "runaway while it keeps burning money and changing data. It must be per-agent, because "
             "your platform's global 'disable all schedules' is an outage for everything else. And a "
             "forced run must not defeat it, or it is not a stop button.", STOP, STOP_TINT)

    you_should_see(c, M, 196, CW, [
        "Set the switch, trigger the job by hand, and watch it record PARKED and do nothing.",
        "The watcher reports it as parked, not as broken and not as healthy.",
        "Unset it, trigger again, and watch it work normally.",
    ])

    line(c, "That is Session 5 complete. Your agent now has all four floor controls.",
         M, 108, 9.2, ACCENT, kit.MEDIUM)


# ================================================== 18  canary
def p18_canary(c):
    y = _session(c, 18, 6, "45 MINUTES", "Now build the real job - on a leash",
                 "Only now does it do actual work. Its first real outputs go somewhere narrow, "
                 "where a mistake costs nothing, until it has earned a wider audience.")

    # Geometry is solved around the decision box so the two outcomes fan out
    # symmetrically and nothing can reach back up into the deck text.
    BW, BH, GATE, FAN = 150, 52, 128, 40
    xg = M + BW + 28
    xr = xg + GATE + 40
    right_w = CW + M - xr
    cy = y - 44 - FAN - BH          # centre line of the decision box

    kit.wb_box(c, M, cy - BH / 2, BW, BH, "Real output", "real sources, real work")
    kit.wb_arrow(c, M + BW, cy, xg, cy)
    kit.wb_box(c, xg, cy - BH / 2, GATE, BH, "Promoted yet?", "a reviewed decision")

    up_y = cy + FAN
    down_y = cy - FAN - BH
    kit.wb_box(c, xr, up_y, right_w, BH, "The real audience", "only once promoted")
    kit.wb_box(c, xr, down_y, right_w, BH, "Your private channel",
               "redirected, and the message says so",
               kit.WB_RED_WASH, kit.WB_RED, INK, MUTED, dashed=True)

    kit.wb_arrow(c, xg + GATE, cy + 9, xr, up_y + BH / 2, kit.WB_GOLD)
    kit.wb_arrow(c, xg + GATE, cy - 9, xr, down_y + BH / 2, kit.WB_RED, dashed=True)
    # Labels sit clear of BOTH diagonals: each line rises ~1.4pt per pt of run,
    # so at +8 the gold line is only ~11pt above centre. Place well beyond that.
    line(c, "yes", xg + GATE + 8, cy + 42, 7.0, kit.WB_GOLD, kit.BOLD)
    # the red diagonal drops ~1.42pt per pt of run, so across the label's own
    # width it reaches cy-54; sit clearly below that, still left of the box.
    line(c, "not yet", xg + GATE + 8, cy - 64, 7.0, kit.WB_RED, kit.BOLD)

    ny = kit.wb_note(c,
                     "absent from the promoted list means confined. a new agent is held back by "
                     "forgetting, never exposed by forgetting.", M, down_y - 26, CW)

    ny -= 14
    eyebrow(c, "What earns promotion", M, ny)
    ny -= 15
    ny = bullets(c, [
        "Three consecutive clean runs. Not one - one run proves the happy path, and the happy "
        "path is not where new agents fail.",
        "At least one clean run of every different job it owns. Three clean daily runs say "
        "nothing about the weekly one.",
        "Clean means: healthy record, nothing sent outside the narrow target, no alert raised, "
        "and the claim written before it acted.",
        "A run that errored is not clean and resets the count to zero. It does not merely fail "
        "to count.",
    ], M, ny, CW - 20, 8.7, 12.0, ACCENT)

    _warnbox(c, ny - 8, "Redirect, never refuse",
             "A refusal proves your guard works and proves nothing about the agent. You want to "
             "watch it do the real job - real sources, real output, real claim - with only the "
             "audience narrowed.", ACCENT, TINT)


# ================================================== 19  break it
def p19_break_it(c):
    y = _session(c, 19, 7, "40 MINUTES", "Now break it on purpose",
                 "Evaluation and QA for an agent is mostly failure testing. Work down this list one row "
                 "at a time and watch each result with your own eyes. This is the session that turns a "
                 "demo into something you can leave running.")

    rows = [
        ["Nothing to report", "A correct empty result, clearly different from a failure"],
        ["Source unreachable", "Says unreadable. Never reports an empty day"],
        ["Source times out", "Retries within its stated limit, then fails loudly"],
        ["Fired twice", "Second run does nothing and names the existing claim"],
        ["Claim store unreadable", "Refuses to run and records the error"],
        ["Permission removed", "Fails closed, names what access it needed"],
        ["Its own key missing", "Throws. Never acts using your identity instead"],
        ["Over the action limit", "Records an error and throws, never silently truncates"],
        ["Wrong audience", "Refuses to send and says why"],
        ["Produced nothing", "Delivers its text anyway, records the rescue, escalates"],
        ["Stop switch set", "Records PARKED, returns success, changes nothing"],
        ["Output rejected", "Keeps the feedback, does not overwrite what was approved"],
    ]
    b = table(c, ["Break this", "It must do this"], rows, M, y - 8,
              [180, CW - 180], row_h=22, size=7.7)

    _warnbox(c, b - 16, "Notice how few of these are happy-path tests",
             "That ratio is the point. Every one of these rows exists because it went wrong for "
             "somebody. Ask your assistant to write them as automated tests so they run again on "
             "every future change, not once tonight.", ACCENT, TINT)

    line(c, "Do not skip the row you are most confident about. That is usually the one.",
         M, 96, 8.8, MUTED)


# ================================================== 20  self-healing
def p20_self_healing(c):
    y = _session(c, 20, 8, "PART 1 OF 2", "Bounded self-healing",
                 "An agent can fix some of its own problems. It must never be able to ship its own "
                 "changes. The line between those two is the whole subject.")

    y -= 6
    colw = (CW - 16) / 2
    card(c, M, y - 128, colw, 128, OK_TINT, OK_TINT, 9, elevate=False)
    eyebrow(c, "It may do this alone", M + 16, y - 20, OK)
    bullets(c, ["Retry a safe, repeatable failure a few times",
                "Re-read state it is allowed to read",
                "Collect diagnostics and open a ticket",
                "Draft a fix for a human to review"],
            M + 14, y - 40, colw - 28, 8.2, 11.0, OK)

    card(c, M + colw + 16, y - 128, colw, 128, STOP_TINT, STOP_TINT, 9, elevate=False)
    eyebrow(c, "It must never do this", M + colw + 32, y - 20, STOP)
    bullets(c, ["Deploy, or merge its own change",
                "Change permissions or rotate a secret",
                "Spend money, or contact a new audience",
                "Act as a human being"],
            M + colw + 30, y - 40, colw - 28, 8.2, 11.0, STOP)

    y -= 146
    _warnbox(c, y, "Do not restrict a dangerous power in writing. Remove the tool.",
             "An agent that must not merge its own code should not have a merge tool at all. An agent "
             "that must not spend money should hold no payment credential. A rule written in a prompt "
             "is a request to a system that guesses. A missing tool cannot be talked around. Ask which "
             "of your prohibitions are enforced by absence, and which are only instructions.",
             STOP, STOP_TINT)

    y -= 108
    eyebrow(c, "When it does propose a code change", M, y)
    y -= 16
    bw, bh, gap = 92, 34, 10
    stages = [("Ticket", ACCENT), ("Branch", ACCENT), ("Review", WARN), ("Merge", WARN),
              ("Verify deploy", OK), ("Roll back", STOP)]
    for i, (t, tone) in enumerate(stages):
        x = M + i * (bw - 16 + gap)
        node(c, x, y - bh, bw - 16, bh, t, None, WHITE, tone, INK, 7, 7.8)
        if i:
            arrow(c, x - gap, y - bh / 2, x, y - bh / 2, MUTED, width=0.8)
    para(c, "A Staff Engineer review - a person, or an independent reviewer that is not the author - "
            "sits between Branch and Merge. Verify the deploy, not the merge: a merge is not a "
            "deploy, and a deploy is not a running change.",
         M, y - bh - 18, CW - 20, 8.4, 11.4, MUTED)


# ================================================== 21  the gate
def p21_gate(c):
    y = _session(c, 21, 8, "PART 2 OF 2", "Make the rules mechanical",
                 "Everything in this guide is advice until something refuses when it is broken. This is "
                 "the session that turns your launch gate from a document into a check.")

    y = do_this(c, M, y - 12, CW, [
        "Say:  \"Put the launch gate in ONE file and write a script that",
        "       runs in CI. It fails the build when the gate line is",
        "       missing, or any item is unconfirmed. 'N/A' alone fails;",
        "       'N/A - <reason>' passes. Then break it on purpose so I",
        "       can watch the build go red.\"",
    ], "SAY THIS")

    y -= 12
    card(c, M, y - 54, CW, 54, NAVY, NAVY, 9, elevate=False)
    line(c, "Launch-Gate:  schedule OK · claim OK · ceiling OK · record OK ·", M + 18, y - 24, 8.6,
         kit.HexColor("#CFE0FF"), kit.MONO)
    line(c, "              watcher OK · stop-button OK · canary OK", M + 18, y - 38, 8.6,
         kit.HexColor("#CFE0FF"), kit.MONO)

    y -= 70
    y = you_should_see(c, M, y, CW, [
        "A build that goes red when you delete one word from that line.",
        "A gate kept in exactly one file, referenced everywhere else, so copies cannot drift.",
    ])

    _warnbox(c, y - 14, "An advisory gate is not a gate",
             "A checklist a person confirms is a promise. The same checklist run by CI is a control. "
             "Things ship with items written down as unmet, by people who meant well, because nothing "
             "refused. This one script is the difference between this guide being applied and being "
             "admired.", ACCENT, TINT)

    line(c, "This is also the step most people skip, and it is about twenty lines of code.",
         M, 108, 8.8, MUTED)


# ================================================== 22  promotion
def p22_promotion(c):
    y = _session(c, 22, 9, "20 MINUTES", "Widen the audience, on evidence",
                 "The last session. You decide, from the record rather than from a feeling, whether this "
                 "agent is ready to reach the audience you originally intended.")

    y = do_this(c, M, y - 12, CW, [
        "Say:  \"Show me, from the run records: how many consecutive",
        "       clean runs, whether every job shape has had a clean run,",
        "       every alert raised, and what I corrected. Recommend",
        "       promote or wait. The decision is mine.\"",
    ], "SAY THIS")

    y -= 14
    b = table(c, ["Look at", "Ready when"],
              [["Consecutive clean runs", "Three or more, with no error resetting the count"],
               ["Every job shape", "Each distinct job has had at least one clean run"],
               ["Corrections you made", "Falling, and each one captured as a test"],
               ["Alerts raised", "Each one was real, actionable, and you knew what to do"],
               ["Cost per useful result", "Known, and you are willing to pay it"],
               ["The 6am question", "You can explain the last good run and the last bad one"]],
              M, y, [170, CW - 170], row_h=25, size=7.9)

    _warnbox(c, b - 16, "Promotion is a change, not a mood",
             "Make it an explicit, reviewed edit with a date and a reason, the same as any other "
             "change. If it goes wrong you want to know exactly when the audience widened, and why "
             "somebody thought it was ready.", ACCENT, TINT)

    line(c, "Then stop. Do not add a second agent this week.", M, 132, 10.5, INK, kit.MEDIUM)
    para(c, "Run this one for a fortnight. The corrections you make in that time are worth more than "
            "anything you would build instead.", M, 116, CW - 30, 8.8, 12.0)


# ================================================== 23  memory + spend
def p23_memory(c):
    y = opener(c, 23, "Once it is running", "Teaching it, and what to spend on thinking",
               "Two things you will want in month two: an agent that stops repeating last month's "
               "mistake, and a bill that does not surprise you.", ACCENT, 27)

    y -= 12
    eyebrow(c, "Shared memory: the Hivemind pattern", M, y)
    y -= 16
    bw, bh, gap = 108, 40, 12
    verbs = [("Recall", "load proven rules\nat the start"),
             ("Capture", "write a lesson\nonly once confirmed"),
             ("Synthesise", "one cheap nightly\nsummary"),
             ("Arbitrate", "one owner promotes\nand retires")]
    for i, (t, s) in enumerate(verbs):
        x = M + i * (bw + gap)
        node(c, x, y - bh - 6, bw, bh + 6, t, s.replace("\n", " "), WHITE, ACCENT)
        if i:
            arrow(c, x - gap, y - bh / 2 - 6, x, y - bh / 2 - 6)

    y -= 74
    y = bullets(c, [
        "A lesson starts unproven. Confirmation nudges it up; a correction pulls it down harder, because being wrong should cost more than being right earns.",
        "Unused lessons fade. Above a threshold, a lesson becomes a rule the agent is given every run.",
        "A memory with no retirement path is a leak: it only grows, and it is read in full on every single run. Wire the fade and the review queue on day one, and check they are actually called.",
        "One person owns promoting and retiring. Never the agent itself.",
    ], M, y, CW - 20, 8.6, 11.8, ACCENT)

    y -= 10
    hairline(c, M, y, W - M)
    y -= 18
    eyebrow(c, "Model routing and caching, in two lines", M, y)
    y -= 16
    y = bullets(c, [
        "Model routing: use plain code for anything with a right answer, the cheapest model for sorting and formatting, and an expensive one only for judgement. Record which route each run took.",
        "Caching: keep the unchanging instructions byte-for-byte identical between runs so they can be cached, and put anything that changes per run - times, counts, today's data - outside that block. One live number in the wrong place silently disables the saving and nothing errors.",
    ], M, y, CW - 20, 8.6, 11.8, ACCENT)

    _warnbox(c, y - 8, "Neither of these belongs in week one",
             "Get one agent running, watched, and stoppable first. Memory and cost tuning are what you "
             "do to an agent that already works.", WARN, WARN_TINT)


# ================================================== 24  what next
def p24_next(c):
    chrome(c, 24, "Where to go next")
    y = display(c, "You have one. Here is when to build two.", H - 106, 26)
    y = para(c,
             "A second agent should remove a constraint the first one cannot. Before you start, you "
             "should be able to answer all four of these about it, in one sentence each.",
             M, y - 8, CW - 20, 9.6, 14.0)

    y -= 12
    qs = [("The job", "What repeated result can the first agent not safely own?"),
          ("The handoff", "What does it receive, what does it return, and who owns a mismatch?"),
          ("The memory", "What may it read, what may it write, what must it never see?"),
          ("The authority", "What can it do alone, and what must it only ever propose?")]
    for i, (t, q) in enumerate(qs):
        cy = y - i * 46
        card(c, M, cy - 34, CW, 38, WHITE, BORDER, 8, elevate=False, accent=ACCENT)
        line(c, t, M + 16, cy - 13, 9.2, ACCENT, kit.BOLD)
        line(c, q, M + 106, cy - 13, 8.7, INK)

    y -= 4 * 46 + 6
    _warnbox(c, y, "Share the plumbing, not the agent",
             "Keep one run ledger, one watcher, one alerting contract and one memory store across every "
             "agent you add. Duplicating them per agent is the exact moment a fleet stops being "
             "observable, and you will not notice on the day it happens.", ACCENT, TINT)

    card(c, M, 92, CW, 118, NAVY, NAVY, 10, elevate=False)
    eyebrow(c, "The companion to this guide", M + 22, 188, kit.HexColor("#8FB0FF"))
    line(c, "Agent Builder Starter Prompt", M + 22, 166, 15, WHITE, kit.MEDIUM)
    para(c, "Paste it into your build assistant and it runs the interview on page 4, fills in your "
            "contract, then builds with you through the nine sessions in this guide.",
         M + 22, 148, CW - 60, 8.8, 12.0, kit.HexColor("#C6D2E6"))
    line(c, "romanbediner.com/resources/agentic-ai-employees", M + 22, 112, 9,
         kit.HexColor("#8FB0FF"), kit.MONO)
