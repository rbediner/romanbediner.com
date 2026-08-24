"""Pages 5-14: the contract, the plan, the paperwork, keys, the empty run, cron."""

from kit import (
    W, H, M, CW, INK, MUTED, FAINT, CARD_MUTED, ACCENT, TINT, TINT_STRONG, BORDER,
    NAVY, WHITE, OK, OK_TINT, WARN, WARN_TINT, STOP, STOP_TINT, SURFACE,
    line, wrap, para, eyebrow, display, card, hairline, pill, chrome, opener,
    step_header, do_this, you_should_see, bullets, table, node, diamond, arrow,
)
import kit


def _session(c, page, num, minutes, title, deck, kicker=None):
    chrome(c, page, kicker or f"Session {num}")
    y = step_header(c, num, f"SESSION {num}  ·  {minutes}", title, H - 118)
    return para(c, deck, M, y - 6, CW - 20, 9.8, 14.4)


def _warnbox(c, y, title, body, tone=WARN, fill=WARN_TINT, h=None):
    inner = CW - 36
    lines_ = wrap(body, inner, 8.6)
    h = h or (34 + len(lines_) * 11.6)
    card(c, M, y - h, CW, h, fill, fill, 9, elevate=False)
    eyebrow(c, title, M + 18, y - 18, tone)
    b = y - 33
    for ln in lines_:
        line(c, ln, M + 18, b, 8.6, INK)
        b -= 11.6
    return y - h


# ================================================== 05  your contract
def p05_contract(c):
    chrome(c, 5, "Session 0 output")
    y = display(c, "Read it back before it builds", H - 106, 27)
    y = para(c,
             "When the interview ends it fills in the contract and shows it to you. Every row is "
             "labelled DECIDED (you said it) or ASSUMED (it worked it out). Read the ASSUMED rows. "
             "That is the whole point of this page: you see what you chose and what was chosen for you.",
             M, y - 8, CW - 20, 9.6, 14.2)

    y -= 12
    rows = [
        ["Name", "Scout, Inbound Inquiry Analyst", "DECIDED"],
        ["The job", "Summarise yesterday's inbound inquiries so none sit unanswered", "DECIDED"],
        ["Source", "One read-only query on the shared inbound mailbox", "DECIDED"],
        ["Output", "One draft brief: who wrote in, what they asked, suggested next step", "DECIDED"],
        ["Runs", "Weekdays 08:00 local, held at 08:00 across both DST states", "DECIDED"],
        ["Who checks", "Head of Sales approves, rejects, or revises", "DECIDED"],
        ["Never does", "Reply to an inquirer. Edit the CRM. Spend money.", "DECIDED"],
        ["Tools not built", "No send-to-external tool. No CRM write tool. No payment key.", "ASSUMED"],
        ["Audience", "team - the owner and one internal channel, never a customer", "ASSUMED"],
        ["Max actions", "1 delivery per run, because the job produces exactly one brief", "ASSUMED"],
        ["Runs once per", "local business day, claimed before it sends anything", "ASSUMED"],
        ["Stop button", "An env flag the operator sets with no deploy", "ASSUMED"],
    ]
    body = []
    for label, value, tag in rows:
        body.append([label, value, tag])
    b = table(c, ["Field", "What it will build", "Source"], body, M, y,
              [78, CW - 148, 70], row_h=25, size=7.7)

    _warnbox(c, b - 18, "The one thing to check here",
             "Every ASSUMED row is a decision made on your behalf. If one is wrong, say so now: "
             "changing 'audience' after it has already emailed a customer is an incident, not an edit.")

    card(c, M, 74, CW, 62, TINT, TINT_STRONG, 9, elevate=False)
    eyebrow(c, "Say this to move on", M + 18, 122)
    line(c, "\"Confirmed. Audience should be team-only, and never a customer. Start Session 1.\"",
         M + 18, 104, 9, INK, kit.MEDIUM)
    line(c, "Nothing gets built until you say something like that.", M + 18, 88, 8.4, MUTED)


# ================================================== 06  session 1 plan
def p06_plan(c):
    y = _session(c, 6, 1, "20 MINUTES", "Get the plan in plain English",
                 "No code yet. You are checking that it understood the job, and finding out what "
                 "you need to go and get before anything can run.")

    y = do_this(c, M, y - 12, CW, [
        "Say:  \"Give me Stage 1. Plain English only, no code.\"",
        "",
        "Ask it to end with the full list of accounts and access I",
        "need to create, because that is the next session and I",
        "want to do it in one sitting.",
    ], "SAY THIS")

    y = you_should_see(c, M, y - 12, CW, [
        "What it will build, in language you could repeat to a colleague.",
        "A rough running cost per month, and what drives it.",
        "A numbered list of accounts, keys and permissions YOU must create.",
        "No files written yet, and no code shown.",
    ])

    y -= 16
    eyebrow(c, "Red flags at this stage", M, y)
    y -= 15
    y = bullets(c, [
        "It starts writing code. Stop it: \"Stage 1 is the plan. No code.\"",
        "It plans two jobs, or a second agent. Cut it back to one.",
        "It cannot say what it needs from you. It has not thought it through.",
        "It skips the cost question. Ask directly, before you build.",
    ], M, y, CW - 20, 8.9, 12.2, STOP)

    _warnbox(c, 168, "Your stopping rule for the whole guide",
             "If you cannot explain, out loud, what this agent does and who reads its output, do not "
             "continue to Session 2. Every control after this point assumes that sentence exists.",
             ACCENT, TINT)


# ================================================== 07  session 2 paperwork
def p07_paperwork(c):
    y = _session(c, 7, 2, "15 MINUTES", "Four documents, written before the code",
                 "These are not bureaucracy. They are the only reason a change six weeks from now "
                 "can be judged right or wrong. Ask for all four plus docs/launch-gate.md, then "
                 "read the PRD.")

    y -= 6
    docs = [
        ("docs/PRD.md", "What it does, for whom, and what it must never do.",
         "Could a stranger build the right thing from this?"),
        ("docs/architecture.md", "Trigger, data path, state, tools, authority boundaries.",
         "Where does each piece of information live?"),
        ("docs/runbook.md", "How to operate it, read an alert, and park it.",
         "Could someone else fix it at 7am without you?"),
        (".agent/personality.md", "Its voice, its limits, and what it must escalate.",
         "Would you recognise its writing as its own?"),
    ]
    for i, (name, what, test) in enumerate(docs):
        cy = y - 20 - i * 62
        card(c, M, cy - 42, CW, 54, WHITE, BORDER, 9)
        line(c, name, M + 16, cy - 4, 9.4, ACCENT, kit.MONO)
        line(c, what, M + 16, cy - 19, 8.8, INK)
        line(c, "Read it and ask: " + test, M + 16, cy - 33, 8.1, MUTED)

    y = y - 20 - 4 * 62

    y = you_should_see(c, M, y - 6, CW, [
        "Four files that exist on disk, not four descriptions of files.",
        "A PRD you can read in two minutes and disagree with.",
        "Your ASSUMED rows from Session 0 written down as real decisions.",
    ])

    _warnbox(c, y - 14, "Say this if the PRD reads like marketing",
             "\"Rewrite the PRD so a stranger could build the right thing from it and a reviewer "
             "could reject a change that breaks it. Be specific about what it must never do.\"",
             ACCENT, TINT)


# ================================================== 08  session 3 keys
def p08_keys(c):
    y = _session(c, 8, 3, "30 MINUTES  ·  YOUR TURN", "Accounts, keys and permissions",
                 "This is the one session the assistant cannot do for you. It will give you numbered "
                 "steps for each system. Do them one at a time and confirm each before asking for the next.")

    y = do_this(c, M, y - 12, CW, [
        "Say:  \"Stage 3. One system at a time. Give me numbered steps",
        "       with the exact page and button names. Wait for me to",
        "       confirm before moving to the next system.\"",
    ], "SAY THIS")

    y -= 14
    eyebrow(c, "The three rules that keep this safe", M, y)
    y -= 16
    rules = [
        ("Never paste a key into the chat", "Put it in the platform's secret store. If it asks you "
         "to paste one, say no and ask where it belongs instead."),
        ("Give it the narrowest access that works", "Read-only on one folder or one mailbox, not "
         "your whole account. You can widen it later; you cannot un-leak it."),
        ("Make it its own identity", "Its own service account or bot, never your personal login. "
         "If its credential is missing it must fail loudly, never fall back to acting as you."),
    ]
    for i, (t, b) in enumerate(rules):
        cy = y - i * 54
        card(c, M, cy - 42, CW, 44, CARD_MUTED, BORDER, 8, elevate=False, accent=STOP)
        line(c, t, M + 16, cy - 12, 9.2, INK, kit.BOLD)
        para(c, b, M + 16, cy - 25, CW - 34, 8.2, 10.8, MUTED)

    y = y - 3 * 54

    y = you_should_see(c, M, y - 4, CW, [
        "Each key stored in the cloud platform's secret manager, not in a file and not in chat.",
        "A short list in the runbook naming who owns each key and when it gets rotated.",
        "The key values themselves written down nowhere, including the runbook.",
    ])

    _warnbox(c, y - 14, "If you get stuck here, you are not behind",
             "This session defeats more first builds than any other. If a permission screen does not "
             "match the steps you were given, paste what you actually see and ask it to re-derive the "
             "steps from that. Do not guess and do not grant broader access to move on.")


# ================================================== 09  session 4 empty run
def p09_empty_run(c):
    y = _session(c, 9, 4, "30 MINUTES", "Deploy something that does nothing",
                 "The most skipped step, and the one that decides whether the rest of this works. "
                 "You are going to put an agent in the cloud that reads nothing and produces nothing, "
                 "purely to prove the schedule fires, the identity works, and the run leaves a record.")

    y = do_this(c, M, y - 10, CW, [
        "Say:  \"Stage 4. Deploy a scheduled job that does no real work.",
        "       It must: fire on the schedule, write one run record, and",
        "       stop. No sources, no model call, no output. Then tell me",
        "       how to trigger it manually so I don't wait until tomorrow.\"",
    ], "SAY THIS")

    y = you_should_see(c, M, y - 12, CW, [
        "A URL or dashboard where the job is registered, with its schedule visible.",
        "A run record you can open with your own eyes: a run ID, a start time, an outcome.",
        "A second run record after you trigger it manually.",
    ])

    y -= 18
    eyebrow(c, "Why this page exists", M, y)
    y = para(c,
             "Almost everyone builds the clever part first and discovers three days later that the "
             "schedule never fired, or that the agent had no permission to write anything, or that "
             "nothing anywhere recorded that it ran. Those are infrastructure problems wearing an "
             "AI costume. Separate them now, while there is nothing else to blame.",
             M, y - 14, CW - 20, 9.2, 13.4)

    _warnbox(c, y - 12, "Do not continue until you have seen a run record",
             "Not a log line that scrolled past. A durable record you can go back and open tomorrow. "
             "If you cannot find one, the agent has no memory of its own life and every later chapter "
             "of this guide is unenforceable.", STOP, STOP_TINT)


# ================================================== 10  diagram: one run
def p10_run_diagram(c):
    y = opener(c, 10, "The shape of every run", "What happens, in order, every time",
               "Three gates run before the agent is allowed to touch anything real. The order is "
               "the safety property, not a style preference.", ACCENT, 27)

    # Row 1 geometry is solved so the three boxes plus two gaps land inside CW.
    BW, GATE, BH, GAP = 140, 166, 52, 20
    row1 = y - 46
    span = BW + GAP + GATE + GAP + BW
    left = M + (CW - span) / 2

    kit.wb_box(c, left, row1 - BH, BW, BH, "Schedule fires", "06:00 local, from the cloud")
    kit.wb_arrow(c, left + BW, row1 - BH / 2, left + BW + GAP, row1 - BH / 2)

    x2 = left + BW + GAP
    kit.wb_box(c, x2, row1 - BH, GATE, BH, "Three gates",
               "stopped? right hour? ran today?")
    kit.wb_arrow(c, x2 + GATE, row1 - BH / 2, x2 + GATE + GAP, row1 - BH / 2)

    x3 = x2 + GATE + GAP
    kit.wb_box(c, x3, row1 - BH, BW, BH, "Claim the day", "written before anything leaves")

    # the break path: any gate that holds ends the run without side effects
    stop_y = row1 - BH - 54
    kit.wb_arrow(c, x2 + GATE / 2, row1 - BH - 3, x2 + GATE / 2, stop_y + 30,
                 kit.WB_RED, "held", dashed=True)
    kit.wb_box(c, x2 - 6, stop_y - 2, GATE + 12, 32, "Stop. Record why.", None,
               kit.WB_RED_WASH, kit.WB_RED, INK, dashed=True, title_size=8.6)

    row2 = stop_y - 78
    steps = [("Do the work", "code first, model only if needed"),
             ("Deliver once", "through one call site"),
             ("Verify it landed", "not merely 'no error'")]
    step_w = (CW - 2 * GAP) / 3
    for i, (title, sub) in enumerate(steps):
        x = M + i * (step_w + GAP)
        kit.wb_box(c, x, row2 - BH, step_w, BH, title, sub)
        if i:
            kit.wb_arrow(c, x - GAP, row2 - BH / 2, x, row2 - BH / 2)

    # wrap the flow into the START of row 2, not into its end
    kit.wb_elbow(c, x3 + BW / 2, row1 - BH - 3, M + step_w / 2, row2 + 6)

    row3 = row2 - BH - 56
    xr = M + 2 * (step_w + GAP)
    kit.wb_arrow(c, xr + step_w / 2, row2 - BH - 3, xr + step_w / 2, row3 + 6)
    kit.wb_box(c, M, row3 - 44, CW, 44, "Write the run record",
               "success, failure or parked - every single time, or nothing downstream can see it")

    ny = kit.wb_note(c,
                     "the three gates run BEFORE the source is read. move one of them later and "
                     "you have built an agent that can act twice, act while parked, or act an "
                     "hour early.", M, row3 - 64, CW)

    kit.wb_legend(c, [("gold", "the run continues"), ("red", "the run stops, and says why"),
                      ("navy", "a step that always happens")], M, ny - 14, CW)

    _warnbox(c, ny - 44, "Two boxes people leave out, and regret",
             "Verify it landed: a model that finished without erroring has not delivered anything, "
             "so check the thing exists where it was meant to go. And write the record even when "
             "the run failed - especially then. A failed run that leaves no trace is "
             "indistinguishable from a run that never happened.", ACCENT, TINT)


# ================================================== 11  cron
def p11_cron(c):
    y = opener(c, 11, "Making it run itself", "Cron: the five numbers that start it",
               "A cron expression is how you tell a cloud platform when to run something. It is five "
               "fields separated by spaces. This is the entire syntax.", ACCENT, 27)

    box_y = y - 18
    card(c, M, box_y - 132, CW, 132, NAVY, NAVY, 10, elevate=False)
    # Field positions are MEASURED from the monospace advance so the tick marks
    # land under their own glyphs rather than under a guess.
    size = 26
    adv = kit.tw("0", size, kit.MONO)
    fields = [("0", "minute"), ("6", "hour"), ("*", "day of month"),
              ("*", "month"), ("1-5", "day of week")]
    x0 = M + 30
    cursor = 0
    label_x = []
    for value, _ in fields:
        label_x.append(x0 + (cursor + len(value) / 2) * adv)
        line(c, value, x0 + cursor * adv, box_y - 44, size, WHITE, kit.MONO)
        cursor += len(value) + 3
    for (value, lab), cx in zip(fields, label_x):
        c.setStrokeColor(kit.HexColor("#5C79B8"))
        c.setLineWidth(0.7)
        c.line(cx, box_y - 54, cx, box_y - 64)
        line(c, lab, cx, box_y - 76, 7.0, kit.HexColor("#9FB6E6"), kit.BOLD, "center")
    line(c, "= 06:00, Monday to Friday", M + 30, box_y - 102, 10.5,
         kit.HexColor("#8FB0FF"), kit.MEDIUM)
    line(c, "An asterisk means 'every'. 1-5 means Monday through Friday.",
         M + 30, box_y - 118, 8.2, kit.HexColor("#C6D2E6"))

    y = box_y - 150
    b = table(c, ["You want", "You write", "Reads as"],
              [["Every weekday at 6am", "0 6 * * 1-5", "minute 0, hour 6, Mon-Fri"],
               ["Every day at 6am", "0 6 * * *", "minute 0, hour 6, every day"],
               ["Every hour, on the hour", "0 * * * *", "minute 0 of every hour"],
               ["Every 15 minutes", "*/15 * * * *", "every 15th minute"],
               ["First of the month, 9am", "0 9 1 * *", "day 1, hour 9"]],
              M, y, [150, 120, CW - 270], row_h=25, size=7.9)

    y = _warnbox(c, b - 18, "Almost every cloud scheduler runs on UTC, not your time",
                 "That single fact is the most common reason a first agent quietly runs at the wrong "
                 "hour for half the year. The next page is entirely about it. Do not set a schedule "
                 "until you have read it.", WARN, WARN_TINT)

    y -= 20
    eyebrow(c, "Where the schedule actually lives", M, y)
    y -= 15
    bullets(c, [
        "In your cloud platform's configuration file, committed to version control - never typed "
        "into a dashboard and forgotten. A schedule nobody can find is a schedule nobody can fix.",
        "Named in one place your assistant can list back to you, so you can ask \"what is scheduled "
        "to run, and when?\" and get a complete answer.",
        "With a manual trigger alongside it, so you never have to wait until tomorrow to test a change.",
    ], M, y, CW - 20, 8.7, 12.0, ACCENT)


# ================================================== 12  DST
def p12_dst(c):
    y = opener(c, 12, "The trap that gets everyone", "Your 6am becomes 7am twice a year",
               "Cloud schedulers fire on UTC. Your clock changes twice a year. UTC does not. So a job "
               "pinned to one UTC hour silently drifts by an hour every spring and autumn.", WARN, 27)

    y -= 16
    colw = (CW - 16) / 2
    card(c, M, y - 96, colw, 96, STOP_TINT, STOP_TINT, 9, elevate=False)
    eyebrow(c, "What people write", M + 16, y - 20, STOP)
    line(c, "0 11 * * 1-5", M + 16, y - 42, 13, INK, kit.MONO)
    para(c, "\"11:00 UTC is 6am my time.\" True in winter. In summer it fires at 7am and nobody "
            "notices for months.", M + 16, y - 60, colw - 32, 8.3, 11.2, INK)

    card(c, M + colw + 16, y - 96, colw, 96, OK_TINT, OK_TINT, 9, elevate=False)
    eyebrow(c, "What actually works", M + colw + 32, y - 20, OK)
    line(c, "0 11 * * 1-5", M + colw + 32, y - 40, 11.5, INK, kit.MONO)
    line(c, "0 10 * * 1-5", M + colw + 32, y - 55, 11.5, INK, kit.MONO)
    para(c, "Register both. The job checks the local hour when it wakes and does nothing on the "
            "wrong one.", M + colw + 32, y - 72, colw - 32, 8.3, 11.2, INK)

    y -= 112
    y = do_this(c, M, y, CW, [
        "Say:  \"Register the schedule at BOTH the standard-time and",
        "       daylight-time UTC hours, and have the job exit doing",
        "       nothing when it wakes on the wrong one. Log which",
        "       expression fired in the run record.\"",
    ], "SAY THIS")

    y -= 16
    eyebrow(c, "Test the schedule in three minutes, not in a day", M, y)
    y -= 15
    y = bullets(c, [
        "Ask for a manual trigger URL or command so you can fire it on demand.",
        "Temporarily set the schedule to every 5 minutes, watch two runs land, then set it back.",
        "Check the run record says which UTC expression fired, and what local hour it thought it was.",
        "Put a note in the runbook: the local time this must hold, and which DST state you assumed.",
    ], M, y, CW - 20, 8.9, 12.3, ACCENT)

    _warnbox(c, y - 12, "Never hardcode your offset",
             "Do not write 'UTC-5' anywhere. Read the local time from a real timezone library at run "
             "time. An offset written into code is correct for about half the year, and wrong silently.")


# ================================================== 13  day claim
def p13_claim(c):
    y = _session(c, 13, 5, "PART 1 OF 4", "Make it impossible to run twice",
                 "Schedules fire twice more often than anyone expects: a retry, a redeploy, two cloud "
                 "instances waking together. If your agent sends things, it will one day send them twice.")

    y -= 8
    card(c, M, y - 92, CW, 92, CARD_MUTED, BORDER, 9, elevate=False, accent=STOP)
    eyebrow(c, "A real incident, and it is always this one", M + 18, y - 20, STOP)
    para(c, "A publishing job fired at 09:15 and again at 09:33. Both were inside the same hour, so an "
            "hour-based guard let both through. The second run republished the entire first run's work: "
            "122 messages into a channel real people read. Nothing errored. Every log was green.",
         M + 18, y - 38, CW - 36, 8.8, 12.2, INK)

    y = do_this(c, M, y - 108, CW, [
        "Say:  \"Add a run claim for this job. Four requirements:",
        "       1. the claim covers the whole business DAY, not the hour",
        "       2. it lives in storage that survives the process restarting",
        "       3. it is written BEFORE the first thing that leaves the system",
        "       4. if the claim can't be read, DON'T run, and record the error\"",
    ], "SAY THIS")

    y -= 14
    eyebrow(c, "Why each of the four matters", M, y)
    y -= 15
    y = bullets(c, [
        "The day, not the hour: two runs in one hour is the case that actually happens.",
        "Storage that survives: an in-memory note cannot see a second copy of your job running elsewhere.",
        "Written first: a claim written at the end means a run that sent, then crashed, leaves no trace it ever ran.",
        "Fail closed: an unreadable claim means UNKNOWN, not 'hasn't run'. Refusing to run is loud; running twice is not.",
    ], M, y, CW - 20, 8.7, 12.0, ACCENT)

    you_should_see(c, M, y - 10, CW, [
        "Trigger the job twice in a row by hand. The second run does nothing and says why.",
        "The run record for run two shows it found an existing claim.",
    ])


# ================================================== 14  ceiling
def p14_ceiling(c):
    y = _session(c, 14, 5, "PART 2 OF 4", "Cap how far and how loud one run can go",
                 "A cost limit will not save you here. A hundred short messages into a customer channel "
                 "is a serious incident that costs almost nothing. Distance and volume are their own axis.")

    y = do_this(c, M, y - 12, CW, [
        "Say:  \"Declare, in code, the widest audience this job may reach",
        "       and the maximum number of external actions one run may",
        "       perform. Check it when the run opens. An undeclared job",
        "       must be REFUSED, never given a default. Going over the",
        "       limit records an error and throws - it never silently stops.\"",
    ], "SAY THIS")

    y -= 14
    b = table(c, ["Audience", "Means", "Example"],
              [["internal", "Only you and your logs", "A private ops channel nobody reads"],
               ["team", "Colleagues, your own inbox", "The owner's direct messages"],
               ["public", "Customers or members", "A channel your members read"]],
              # The final row has two real audience descriptions. Give the
              # middle column enough room so they never collide in the PDF.
              M, y, [80, 184, CW - 264], row_h=26, size=7.9)

    _warnbox(c, b - 16, "One door, not two",
             "There must be exactly ONE place in the code that sends. If a second function can also "
             "send, your limit is not a limit. Ask for a check that fails the build when a second "
             "sending path appears. The 122-message incident happened because a second code path "
             "ignored a cap that was working perfectly in the first one.", STOP, STOP_TINT)

    you_should_see(c, M, 178, CW, [
        "Ask it to set the limit to 1 and then try to send twice. The second attempt throws.",
        "The refusal appears in the run record as an error, not as a quiet success.",
        "The declared audience is written in code you can point at, not described in a prompt.",
    ])
