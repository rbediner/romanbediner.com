"""Generate the public Agentic Fleet Build Guide PDF.

This is intentionally a construction manual, not a marketing presentation. It
walks a first-time builder through one runnable cloud agent: its PRD, files,
runtime, state, model policy, Slack review surface, observability, recovery,
tests, and controlled path to a fleet. The guide uses public-safe examples and
never contains private routes, credentials, identifiers, or internal playbooks.
"""

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas


# Generated files deliberately land in the version-controlled public asset paths.
ROOT = Path(__file__).resolve().parents[3]
OUTPUT = ROOT / "assets" / "downloads" / "agentic-fleet-build-guide-roman-bediner.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

# Letter portrait keeps the web preview readable on desktop and mobile alike.
W, H, MARGIN = 612, 792, 42
NAVY, INK, PAPER = HexColor("#09172B"), HexColor("#10233C"), HexColor("#F7F9FE")
WHITE, RULE, MUTED = HexColor("#FFFFFF"), HexColor("#C8D4E4"), HexColor("#5B6B7A")
BLUE, TEAL, PURPLE, ORANGE, RED = (
    HexColor("#2860DC"), HexColor("#138C80"), HexColor("#7652D6"),
    HexColor("#C66B00"), HexColor("#B43B61"),
)
BLUE_WASH, TEAL_WASH, PURPLE_WASH, ORANGE_WASH, RED_WASH = (
    HexColor("#EAF1FF"), HexColor("#E8F8F4"), HexColor("#F0ECFF"),
    HexColor("#FFF3E2"), HexColor("#FFF0F4"),
)

REGULAR, BOLD, MONO = "Helvetica", "Helvetica-Bold", "Courier"
for path, name in [
    ("/System/Library/Fonts/Supplemental/Arial.ttf", "RBArial"),
    ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", "RBArialBold"),
]:
    if Path(path).exists():
        pdfmetrics.registerFont(TTFont(name, path))
if "RBArial" in pdfmetrics.getRegisteredFontNames():
    REGULAR, BOLD = "RBArial", "RBArialBold"


def text(c, value, x, y, size=10, color=INK, font=REGULAR, align="left"):
    """Draw one line using the guide's stable, high-contrast type system."""
    c.setFont(font, size)
    c.setFillColor(color)
    if align == "center":
        c.drawCentredString(x, y, value)
    elif align == "right":
        c.drawRightString(x, y, value)
    else:
        c.drawString(x, y, value)


def wrap(value, width, size, font=REGULAR):
    """Wrap by measured glyph width so content never depends on guesswork."""
    words, lines, current = value.split(), [], ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and pdfmetrics.stringWidth(candidate, font, size) > width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines or [""]


def paragraph(c, value, x, y, width, size=9.5, leading=13, color=MUTED, font=REGULAR):
    """Draw wrapped copy and return the next baseline below it."""
    for line in wrap(value, width, size, font):
        text(c, line, x, y, size, color, font)
        y -= leading
    return y


def panel(c, x, y, width, height, accent=BLUE, fill=WHITE):
    """Use the same quiet contained surface for every practical module."""
    c.setFillColor(fill)
    c.setStrokeColor(RULE)
    c.setLineWidth(0.65)
    c.roundRect(x, y, width, height, 7, fill=1, stroke=1)
    c.setFillColor(accent)
    c.roundRect(x, y + height - 4, width, 4, 3, fill=1, stroke=0)


def rule(c, x1, y, x2, color=RULE):
    """Draw a hairline divider without turning the guide into a dashboard."""
    c.setStrokeColor(color)
    c.setLineWidth(0.55)
    c.line(x1, y, x2, y)


def base(c, page, section):
    """Paint shared paper, section label, and a trustworthy navigation footer."""
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(BLUE)
    c.rect(MARGIN, H - 40, 44, 3, fill=1, stroke=0)
    text(c, section.upper(), MARGIN, H - 61, 8.3, BLUE, BOLD)
    rule(c, MARGIN, 34, W - MARGIN)
    text(c, f"{page:02d}", MARGIN, 18, 8, MUTED, BOLD)
    text(c, "Roman Bediner  |  Agentic Fleet Build Guide", W - MARGIN, 18, 8, MUTED, align="right")


def heading(c, value, y, size=27, width=W - 2 * MARGIN):
    """Render editorial headings with room for a useful first read."""
    for line in wrap(value, width, size, BOLD):
        text(c, line, MARGIN, y, size, INK, BOLD)
        y -= size * 1.12
    return y


def intro(c, page, section, title, deck):
    """Start a page consistently and return the y position for its body."""
    base(c, page, section)
    y = heading(c, title, H - 104)
    return paragraph(c, deck, MARGIN, y - 10, W - 2 * MARGIN, 10.4, 14.5)


def card(c, x, y, width, height, label, title, body, accent=BLUE, fill=WHITE):
    """Place one self-contained instruction with a clear purpose and action."""
    panel(c, x, y, width, height, accent, fill)
    text(c, label.upper(), x + 14, y + height - 22, 7.5, accent, BOLD)
    title_y = y + height - 41
    for line in wrap(title, width - 28, 11.5, BOLD):
        text(c, line, x + 14, title_y, 11.5, INK, BOLD)
        title_y -= 13.5
    paragraph(c, body, x + 14, title_y - 5, width - 28, 8.55, 11.3, MUTED)


def bullet_list(c, items, x, y, width, accent=BLUE, size=9.1, leading=12):
    """Draw dense but legible actions, returning the next available baseline."""
    for item in items:
        text(c, "-", x, y, size + 1, accent, BOLD)
        y = paragraph(c, item, x + 14, y, width - 14, size, leading, INK) - 5
    return y


def numbered(c, number, title, body, x, y, width, accent=BLUE):
    """Draw one ordered build step with an intentionally visible sequence."""
    c.setFillColor(accent)
    c.circle(x + 10, y + 3, 10, fill=1, stroke=0)
    text(c, str(number), x + 10, y, 8, WHITE, BOLD, "center")
    text(c, title, x + 29, y, 10.3, INK, BOLD)
    return paragraph(c, body, x + 29, y - 15, width - 29, 8.9, 12, MUTED) - 10


def code_block(c, label, lines, x, y, width, accent=BLUE):
    """Render copyable pseudo-files without pretending they are runnable secrets."""
    line_height, padding = 12, 14
    height = 28 + len(lines) * line_height + 12
    panel(c, x, y - height, width, height, accent, HexColor("#F0F4FA"))
    text(c, label.upper(), x + padding, y - 20, 7.2, accent, BOLD)
    baseline = y - 39
    for line in lines:
        text(c, line, x + padding, baseline, 7.7, INK, MONO)
        baseline -= line_height
    return y - height


def table(c, headers, rows, x, y, widths, row_height=34):
    """Draw a compact decision table; all values wrap inside their cell."""
    total = sum(widths)
    c.setFillColor(NAVY)
    c.roundRect(x, y - row_height, total, row_height, 5, fill=1, stroke=0)
    cursor = x
    for header, width in zip(headers, widths):
        text(c, header.upper(), cursor + 8, y - 21, 7.2, WHITE, BOLD)
        cursor += width
    baseline = y - row_height
    for index, row in enumerate(rows):
        fill = WHITE if index % 2 == 0 else HexColor("#F0F4FA")
        c.setFillColor(fill)
        c.setStrokeColor(RULE)
        c.rect(x, baseline - row_height, total, row_height, fill=1, stroke=1)
        cursor = x
        for value, width in zip(row, widths):
            lines = wrap(value, width - 14, 7.8, BOLD if cursor == x else REGULAR)
            text_y = baseline - 13
            for line in lines[:2]:
                text(c, line, cursor + 7, text_y, 7.8, INK, BOLD if cursor == x else REGULAR)
                text_y -= 9.5
            cursor += width
        baseline -= row_height
    return baseline


def cover(c):
    """Set the honest promise: a usable first agent, not private operations."""
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(BLUE)
    c.rect(MARGIN, H - 74, 60, 4, fill=1, stroke=0)
    text(c, "PUBLIC BUILD ARTIFACT", MARGIN, H - 99, 10, HexColor("#82A8FF"), BOLD)
    text(c, "Agentic Fleet", MARGIN, H - 179, 43, WHITE, BOLD)
    text(c, "Build Guide", MARGIN, H - 232, 43, WHITE, BOLD)
    paragraph(c, "A step-by-step construction manual for one dependable cloud AI employee: its job contract, files, runtime, model policy, Slack review, observability, recovery, and path to a governed fleet.", MARGIN, H - 286, 470, 14.6, 20.5, HexColor("#D5DFEE"))
    c.setStrokeColor(BLUE)
    c.setLineWidth(1.2)
    c.line(MARGIN, 167, W - MARGIN, 167)
    text(c, "BUILD ONE REAL JOB. MAKE ITS FAILURE VISIBLE. THEN EARN THE NEXT ROLE.", MARGIN, 137, 10.5, WHITE, BOLD)
    text(c, "24-page implementation guide", MARGIN, 78, 9, HexColor("#9BB0CA"))
    text(c, "Roman Bediner  |  romanbediner.com/resources/agentic-ai-employees", MARGIN, 54, 8.8, HexColor("#82A8FF"))


def contents(c):
    """Give a newcomer a map so the guide can be used in working order."""
    base(c, 2, "How to use this guide")
    y = heading(c, "Build in order. Stop after the first useful proof.", H - 104)
    paragraph(c, "This is not a mandate to build a fleet in one sprint. Pages 3 through 19 get one agent to a controlled production pilot. The remaining pages make the system repeatable.", MARGIN, y - 11, W - 2 * MARGIN, 10.4, 14.5)
    sections = [
        ("01", "Frame the job", "3-6", BLUE),
        ("02", "Create the build contract", "7-10", TEAL),
        ("03", "Run it in the cloud", "11-15", PURPLE),
        ("04", "Make it reliable", "16-19", ORANGE),
        ("05", "Scale with control", "20-24", RED),
    ]
    y = 508
    for number, label, pages, accent in sections:
        panel(c, MARGIN, y, W - 2 * MARGIN, 57, accent)
        text(c, number, MARGIN + 16, y + 22, 17, accent, BOLD)
        text(c, label, MARGIN + 66, y + 30, 12, INK, BOLD)
        text(c, f"pages {pages}", W - MARGIN - 16, y + 30, 8.5, MUTED, BOLD, "right")
        y -= 70
    panel(c, MARGIN, 84, W - 2 * MARGIN, 72, BLUE, BLUE_WASH)
    text(c, "Your stopping rule", MARGIN + 15, 132, 10.3, BLUE, BOLD)
    paragraph(c, "Do not add a second agent until a real person has received the first output, corrected it if needed, and you can explain the last successful run and the last failed run from evidence.", MARGIN + 15, 112, W - 2 * MARGIN - 30, 9.1, 12.3, INK)


def page_job_canvas(c):
    """Force a precise first job before architecture or models enter the conversation."""
    intro(c, 3, "First decision", "Choose a job, not a job title.", "A first agent succeeds because its output and authority are deliberately small. A vague role such as 'CMO agent' cannot be tested. A repeated outcome can.")
    card(c, MARGIN, 420, 248, 145, "JOB", "One bounded result", "Example: turn approved cloud inputs into one Morning Market Brief by 9:00 AM on weekdays.", BLUE)
    card(c, 322, 420, 248, 145, "RECEIVER", "One human moment", "A named operator reads the draft in Slack or email, then approves, rejects, or asks for a revision.", TEAL)
    card(c, MARGIN, 248, 248, 145, "LIMIT", "One authority boundary", "The agent may draft and summarize. It may not publish, spend money, alter source data, or impersonate a human.", ORANGE)
    card(c, 322, 248, 248, 145, "PROOF", "One evidence record", "Every run leaves a run ID, input references, output location, reviewer state, and failure reason if it stops.", PURPLE)
    panel(c, MARGIN, 93, W - 2 * MARGIN, 106, BLUE, BLUE_WASH)
    text(c, "Fill this in before writing code", MARGIN + 16, 167, 10, BLUE, BOLD)
    bullet_list(c, ["Trigger: [schedule or event]", "Allowed inputs: [specific cloud sources]", "Output: [format, recipient, deadline]", "Human owner: [role that approves or corrects]", "Failure owner: [role that receives a loud alert]"], MARGIN + 16, 145, W - 2 * MARGIN - 32, BLUE, 8.8, 11.2)


def page_worked_example(c):
    """Keep every later technical choice anchored in a complete starter example."""
    intro(c, 4, "Worked example", "Use a Morning Market Brief to make the pattern concrete.", "The example is intentionally ordinary. It proves the complete loop with low-risk inputs and a human approval point. Substitute your own job after you understand the contracts.")
    table(c, ["Part", "Concrete example", "Definition of done"], [
        ("Trigger", "Weekdays at 8:30 AM", "One run begins once. Duplicate triggers reuse the run ID."),
        ("Input", "Approved cloud folder plus one market-data API", "Each source is logged with timestamp and version or URL."),
        ("Output", "Five-bullet brief posted as a Slack draft", "The owner can approve, reject, or request a revision."),
        ("Write", "Approved brief stored in a durable record", "A retry cannot post or store a second final brief."),
        ("Escalation", "Missing input, timeout, or bad source", "The owner receives a specific alert before the deadline."),
    ], MARGIN, 502, [88, 225, 215], 49)
    panel(c, MARGIN, 159, W - 2 * MARGIN, 105, TEAL, TEAL_WASH)
    text(c, "The build sequence", MARGIN + 16, 232, 10.3, TEAL, BOLD)
    paragraph(c, "First make a deterministic draft from sample inputs. Next add the model only where it improves synthesis. Then add the Slack approval action. Last, break it on purpose and prove the alert and retry behavior.", MARGIN + 16, 210, W - 2 * MARGIN - 32, 9.5, 13, INK)
    text(c, "Do not start with more agents. Start with a traceable result.", MARGIN + 16, 176, 9.5, INK, BOLD)


def page_definition_done(c):
    """Turn 'it works' into testable acceptance criteria a newcomer can use."""
    intro(c, 5, "Acceptance criteria", "Define done before implementation makes it feel done.", "A useful agent has a testable user outcome, a visible limit, a durable record, and a failure path. This table is the minimum release contract for your first pilot.")
    table(c, ["Question", "A passing answer"], [
        ("Useful?", "The reviewer can identify a good result in under one minute and correct a bad one."),
        ("Bounded?", "Allowed data, tool actions, spending, and approval requirements are written down."),
        ("Recoverable?", "A timed-out or duplicate run stops safely and names an owner and next action."),
        ("Observable?", "An operator can see the last run, its inputs, output, cost, and review state."),
        ("Maintainable?", "The PRD, code, tests, deployment instruction, and rollback instruction agree."),
    ], MARGIN, 513, [125, 403], 52)
    panel(c, MARGIN, 136, W - 2 * MARGIN, 94, ORANGE, ORANGE_WASH)
    text(c, "Release gate", MARGIN + 16, 203, 10.3, ORANGE, BOLD)
    paragraph(c, "If any answer is unknown, it is a named backlog item, not an assumption. Do not call the system autonomous when it cannot show a human what it did or what happened when it failed.", MARGIN + 16, 181, W - 2 * MARGIN - 32, 9.3, 12.7, INK)


def page_prd(c):
    """Show the exact PRD fields that turn an idea into an engineering contract."""
    intro(c, 6, "The living PRD", "Write the one-page build contract before you create the agent.", "The PRD is the source of truth for user value and safety. Update it whenever behavior, infrastructure, or a visible promise changes. A prompt alone is not a product requirement.")
    code_block(c, "docs/PRD.md", [
        "# [AGENT_NAME]", "User and outcome: [who receives what, when]", "Allowed inputs: [cloud sources and freshness]", "Output and review: [format, owner, approve/reject action]", "Forbidden actions: [writes, spend, publishing, data limits]", "Success: [measurable acceptance criteria]", "Failure: [alert owner, retry policy, rollback condition]",
    ], MARGIN, 540, W - 2 * MARGIN, BLUE)
    panel(c, MARGIN, 236, W - 2 * MARGIN, 112, PURPLE, PURPLE_WASH)
    text(c, "A PRD review question", MARGIN + 16, 315, 10.2, PURPLE, BOLD)
    paragraph(c, "Could a new engineer build the first version without inventing product behavior? Could a reviewer reject a change that violates this contract? If not, make the requirement more specific.", MARGIN + 16, 292, W - 2 * MARGIN - 32, 9.5, 13, INK)
    text(c, "Keep implementation details in architecture and runbook files, not hidden in a model prompt.", MARGIN + 16, 255, 9, INK, BOLD)


def page_files(c):
    """Name the files the user explicitly asked for, with practical purpose for each."""
    intro(c, 7, "Project anatomy", "Give the agent files a human can inspect and change safely.", "Personality and skill files should be readable behavior contracts. The runtime should be thin, deterministic where possible, and wired to durable state. Put the knowledge where a reviewer expects it.")
    code_block(c, "recommended repository", [
        "docs/PRD.md                 # purpose, authority, acceptance", "docs/architecture.md        # components and data flow", "docs/runbook.md             # operate, alert, rollback", ".agent/personality.md        # voice, judgment boundaries", ".agent/skills/brief.md       # exact job instructions", ".agent/evals/brief-cases.md  # expected and failing cases", "src/run.ts                   # orchestration entry point", "src/tools/                   # narrow, typed external clients", "src/state/                   # run ledger and idempotency", "tests/                       # unit, integration, failure tests",
    ], MARGIN, 545, W - 2 * MARGIN, TEAL)
    panel(c, MARGIN, 192, W - 2 * MARGIN, 118, BLUE, BLUE_WASH)
    text(c, "Personality file: what belongs there", MARGIN + 16, 277, 10.1, BLUE, BOLD)
    bullet_list(c, ["Role voice and audience expectation", "Evidence standard: distinguish source fact, inference, and unknown", "Authority boundary: draft only unless a separate reviewed tool grants action", "Escalation behavior: ask rather than guess when source, scope, or confidence is inadequate"], MARGIN + 16, 253, W - 2 * MARGIN - 32, BLUE, 8.8, 11.2)


def page_skill_contract(c):
    """Translate one agent skill into a reproducible sequence, not a vague system prompt."""
    intro(c, 8, "Skill contract", "Make the job instruction executable, reviewable, and testable.", "A skill file is a compact procedure. It says what the agent receives, what it must do in order, what it may not do, and how it demonstrates a successful result.")
    code_block(c, ".agent/skills/morning-market-brief.md", [
        "Purpose: produce a five-bullet decision brief.", "Inputs: approved folder, approved market-data endpoint.", "Steps: validate freshness; extract facts; synthesize; cite sources.", "Output: Slack draft with source list and confidence notes.", "Never: publish externally, alter a source, infer a missing number.", "Escalate: source is stale, incomplete, inaccessible, or contradictory.", "Done: owner can approve the draft; run ledger has evidence.",
    ], MARGIN, 536, W - 2 * MARGIN, PURPLE)
    panel(c, MARGIN, 231, W - 2 * MARGIN, 115, ORANGE, ORANGE_WASH)
    text(c, "Skill test", MARGIN + 16, 312, 10.2, ORANGE, BOLD)
    paragraph(c, "Give the skill a representative input, an empty input, a stale input, and a conflicting input. The agent must either produce the stated output or escalate with the correct reason. This is the beginning of an evaluation suite.", MARGIN + 16, 289, W - 2 * MARGIN - 32, 9.4, 13, INK)


def page_architecture(c):
    """Make cloud components and responsibility boundaries concrete without vendor lock-in."""
    intro(c, 9, "Cloud architecture", "Use managed components with one clear responsibility each.", "The vendor can change. The contract should not. Keep the first runtime cloud-only so a laptop is a development surface, never the only place an agent can run, remember, or recover.")
    boxes = [
        (MARGIN, 422, "TRIGGER", "Schedule or event", "Starts one identifiable run.", BLUE),
        (183, 422, "RUNTIME", "Serverless worker", "Executes the job and controls retries.", TEAL),
        (324, 422, "STATE", "Durable record", "Holds run, approval, and idempotency state.", PURPLE),
        (465, 422, "SURFACE", "Slack or email", "Presents a draft and human decision.", ORANGE),
    ]
    for x, y_pos, label, title, body, accent in boxes:
        card(c, x, y_pos, 105, 128, label, title, body, accent)
    rule(c, MARGIN + 105, 485, 183, BLUE)
    rule(c, 288, 485, 324, TEAL)
    rule(c, 429, 485, 465, PURPLE)
    table(c, ["Layer", "Its contract", "Do not put here"], [
        ("Behavior", "PRD, personality, skills, evaluations", "Secrets or silent runtime state"),
        ("Runtime", "Calls tools, enforces timeouts, records outcomes", "Business truth that vanishes on restart"),
        ("State", "Run ledger, approvals, memory, dedupe keys", "Unreviewed model narration"),
        ("Surface", "Human review and notification", "The only copy of the result or audit trail"),
    ], MARGIN, 328, [90, 249, 189], 45)


def page_trigger_state(c):
    """Explain scheduled and event-based work with idempotency from the first run."""
    intro(c, 10, "Triggers and state", "A trigger starts work. Durable state decides whether work is safe to repeat.", "Schedules, webhooks, and queue events are all allowed. None of them are a guarantee that a job starts exactly once. Design each run so duplicate delivery is safe.")
    y = 515
    for n, title, body, accent in [
        (1, "Create a deterministic run key", "Use the job name plus its intended period or source event ID. Store it before doing side effects.", BLUE),
        (2, "Lock or reject a duplicate", "If that run key is already in progress or completed, return the existing record instead of starting over.", TEAL),
        (3, "Record every transition", "planned -> running -> awaiting_review -> approved or failed. Never infer state from a Slack message alone.", PURPLE),
        (4, "Verify the destination", "Read back a stored output or inspect an independent success signal before marking a run complete.", ORANGE),
    ]:
        y = numbered(c, n, title, body, MARGIN, y, W - 2 * MARGIN, accent)
    code_block(c, "minimal run record", [
        "run_id, job_name, trigger_key, status, started_at, ended_at", "input_refs[], output_ref, review_state, retry_count, cost_estimate", "failure_category, failure_detail, recovery_action, escalation_owner",
    ], MARGIN, 178, W - 2 * MARGIN, BLUE)


def page_secrets(c):
    """Make least privilege and fail-closed behavior part of the base build, not a patch."""
    intro(c, 11, "Identity and access", "Use service identities, narrow scopes, and a hard stop when access is wrong.", "An agent should never quietly borrow a human identity, reach for a broader token, or keep trying an action it is not authorized to perform. Access failure is an observable system event.")
    table(c, ["Need", "Safe implementation", "Bad fallback"], [
        ("Read a folder", "Dedicated service identity with read-only access to one folder", "A founder's personal drive token"),
        ("Post a review", "Slack app restricted to approved channel or direct-message scope", "A generic bot that can post anywhere"),
        ("Call an API", "Secret manager reference and scoped API key", "A credential copied into a prompt or repository"),
        ("Write a result", "Single durable collection/table with idempotency key", "Multiple unaudited writes across chat messages"),
    ], MARGIN, 514, [107, 240, 181], 53)
    panel(c, MARGIN, 143, W - 2 * MARGIN, 100, RED, RED_WASH)
    text(c, "Fail closed", MARGIN + 16, 215, 10.3, RED, BOLD)
    paragraph(c, "On missing permission, missing secret, unexpected tool scope, or an unapproved destination: stop the run, preserve the evidence, and alert the owner. Do not impersonate a human, invent a route, or downgrade the restriction.", MARGIN + 16, 193, W - 2 * MARGIN - 32, 9.4, 13, INK)


def page_model_routing(c):
    """Turn model selection into a policy that can be reviewed, tested, and tuned."""
    intro(c, 12, "Model routing", "Select capability by task and risk, not by habit.", "Model routing is an operating policy. Start with deterministic logic where it works. Escalate only when ambiguity, synthesis, or impact justifies the additional cost and review.")
    table(c, ["Task shape", "Default route", "Escalate when"], [
        ("Parse, format, validate", "Deterministic code", "Rules cannot resolve the input safely"),
        ("Extract or classify", "Lightweight model", "Confidence is below threshold or data conflicts"),
        ("Synthesize a brief", "Judgment model", "Output could drive a high-impact decision"),
        ("Approve code or risky action", "Independent reviewer plus human gate", "Always for production changes and irreversible actions"),
    ], MARGIN, 513, [142, 174, 212], 53)
    panel(c, MARGIN, 140, W - 2 * MARGIN, 110, PURPLE, PURPLE_WASH)
    text(c, "Route record", MARGIN + 16, 220, 10.3, PURPLE, BOLD)
    bullet_list(c, ["model tier and route reason", "quality or confidence signal", "estimated cost and latency", "whether a human review gate was required"], MARGIN + 16, 197, W - 2 * MARGIN - 32, PURPLE, 8.9, 11.2)


def page_caching(c):
    """Teach stable-prefix caching as a concrete build decision rather than a buzzword."""
    intro(c, 13, "Caching", "Keep stable instructions stable. Keep live facts outside the cached boundary.", "Caching is useful only when it preserves correctness. Treat the prompt prefix as a versioned asset, choose a lifetime that matches the job cadence, and invalidate on policy or source changes.")
    card(c, MARGIN, 400, 160, 155, "STABLE PREFIX", "Cacheable context", "System behavior, personality, skill procedure, approved examples, and static reference material with a version.", BLUE, BLUE_WASH)
    card(c, 226, 400, 160, 155, "DYNAMIC INPUT", "Never assume fresh", "Current source records, user instructions, time-sensitive facts, approvals, and run-specific evidence.", TEAL, TEAL_WASH)
    card(c, 402, 400, 160, 155, "POLICY", "Measure and invalidate", "Record hit rate and savings. Expire at the job cadence. Flush on a changed skill, policy, or reference version.", PURPLE, PURPLE_WASH)
    panel(c, MARGIN, 168, W - 2 * MARGIN, 150, ORANGE, ORANGE_WASH)
    text(c, "Cache decision checklist", MARGIN + 16, 289, 10.3, ORANGE, BOLD)
    bullet_list(c, ["Is the content byte-stable and safe to reuse across runs?", "Does the TTL end before the content becomes misleading?", "Can the run log identify the prompt or policy version used?", "Will a policy change invalidate the cache automatically or through an explicit operation?"], MARGIN + 16, 267, W - 2 * MARGIN - 32, ORANGE, 8.9, 11.5)


def page_hivemind(c):
    """Explain Hivemind as a public-safe shared-memory pattern with authority controls."""
    intro(c, 14, "Shared memory", "Use the Hivemind pattern: recall, act, verify, capture, fade.", "Hivemind is the public name for the shared-memory pattern informing this fleet. It is credited here without linking to external systems. The rule is simple: memory helps work only when its authority and freshness are visible.")
    steps = [("RECALL", "Retrieve only role, project, or customer context relevant to this run.", BLUE), ("ACT", "Use the bounded skill and cite the source records that informed the result.", TEAL), ("VERIFY", "Confirm the outcome through human review, evaluation, or an independent success signal.", PURPLE), ("CAPTURE", "Write a short, scoped lesson with source, date, and confidence.", ORANGE), ("FADE", "Reduce stale or unconfirmed memory influence instead of silently treating it as truth.", RED)]
    x = MARGIN
    for label, body, accent in steps:
        card(c, x, 392, 100, 145, label, label.title(), body, accent)
        x += 107
    table(c, ["Memory field", "Required value"], [
        ("Scope", "organization, role, project, or customer boundary"),
        ("Grounding", "source reference, decision date, and confidence"),
        ("Authority", "advisory, reviewed, or superseded"),
        ("Lifecycle", "created, reviewed, corrected, expires or fades"),
    ], MARGIN, 326, [140, 388], 43)


def page_slack(c):
    """Show Slack as a narrow human review surface, not the system of record."""
    intro(c, 15, "Slack review surface", "Use Slack to make a human decision easy, not to hide workflow state.", "A Slack app can deliver the draft, collect a decision, and expose an escalation. Durable state and evidence live elsewhere. The human should be able to understand the request in one screen.")
    panel(c, MARGIN, 309, W - 2 * MARGIN, 240, TEAL, WHITE)
    text(c, "Example review message", MARGIN + 16, 520, 9.8, TEAL, BOLD)
    text(c, "Morning Market Brief is ready for review", MARGIN + 16, 489, 13, INK, BOLD)
    paragraph(c, "Run: MB-2026-08-24 | Inputs: folder 08:20, market API 08:28 | Confidence: normal", MARGIN + 16, 465, W - 2 * MARGIN - 32, 8.7, 11.5, MUTED)
    rule(c, MARGIN + 16, 445, W - MARGIN - 16)
    paragraph(c, "1. Competitor launch activity increased in the approved source set. 2. Two items need manual confirmation before any external claim. 3. Full source list is attached to the durable run record.", MARGIN + 16, 423, W - 2 * MARGIN - 32, 9.3, 13, INK)
    for index, (label, accent) in enumerate([("Approve", TEAL), ("Request revision", PURPLE), ("Escalate issue", RED)]):
        x = MARGIN + 16 + index * 146
        c.setFillColor(accent)
        c.roundRect(x, 342, 128, 29, 6, fill=1, stroke=0)
        text(c, label, x + 64, 352, 8.4, WHITE, BOLD, "center")
    panel(c, MARGIN, 148, W - 2 * MARGIN, 104, ORANGE, ORANGE_WASH)
    text(c, "Action handler requirements", MARGIN + 16, 223, 10.1, ORANGE, BOLD)
    paragraph(c, "Authenticate the user, validate the run and current state, write the decision once with an idempotency key, acknowledge the action, and leave a durable audit record. Never trust a button click as the only proof.", MARGIN + 16, 200, W - 2 * MARGIN - 32, 9.3, 12.7, INK)


def page_observability(c):
    """Make traces, logs, metrics, and operator evidence actionable to a beginner."""
    intro(c, 16, "Observability", "If you cannot explain the last run, you do not yet operate the agent.", "Use a shared run ID across trigger, tool calls, model route, output, approval, and alert. Structured records make incident triage possible. A dashboard is optional. Evidence is not.")
    table(c, ["Signal", "Capture", "Operator question it answers"], [
        ("Trace", "run ID and step timing", "Where did this run spend time or stop?"),
        ("Log", "structured event and source response", "What exactly happened, with what inputs?"),
        ("Metric", "success, latency, cost, cache, corrections", "Is quality or economics changing over time?"),
        ("Record", "output, review decision, recovery action", "What did the user receive and what is its status?"),
    ], MARGIN, 510, [84, 206, 238], 55)
    code_block(c, "minimum structured event", [
        "event=run.step_completed run_id=... step=source_validate", "job=morning_market_brief status=ok latency_ms=...", "input_ref=... output_ref=... route=judgment cache=hit",
    ], MARGIN, 223, W - 2 * MARGIN, BLUE)
    text(c, "Capture facts. Keep the human-readable explanation in the alert or review surface.", MARGIN, 136, 9.2, INK, BOLD)


def page_failure(c):
    """Operationalize 'fail aloud' with distinct categories, not a generic error message."""
    intro(c, 17, "Failure design", "Make every failure loud, classified, and recoverable when safe.", "A model response is not success. A run completes only when its output, intended side effect, and evidence record agree. Every mismatch should create a visible owner and next step.")
    table(c, ["Failure", "Automatic action", "Human-facing alert"], [
        ("Input missing or stale", "Stop before model call", "Which source was missing, deadline, owner"),
        ("Provider timeout", "Bounded retry with same run key", "Attempts, last error, retry window"),
        ("Access denied", "Fail closed, no fallback identity", "Required scope or secret reference, owner"),
        ("Duplicate delivery", "Return existing run record", "No alert unless state is inconsistent"),
        ("Output verification failed", "Do not mark complete; preserve evidence", "Output location, expected check, recovery option"),
    ], MARGIN, 510, [130, 196, 202], 51)
    panel(c, MARGIN, 137, W - 2 * MARGIN, 111, RED, RED_WASH)
    text(c, "A good alert answers four things", MARGIN + 16, 217, 10.1, RED, BOLD)
    bullet_list(c, ["What failed, in plain language", "What evidence is available and where", "What the system already attempted", "Who owns the next decision and by when"], MARGIN + 16, 195, W - 2 * MARGIN - 32, RED, 8.9, 11.2)


def page_self_healing(c):
    """Separate safe automatic repair from changes that require independent human control."""
    intro(c, 18, "Bounded self-healing", "Automate repairs that are reversible and known. Escalate changes that alter authority or behavior.", "Self-healing is not a license for an agent to rewrite itself in production. Use a documented recovery matrix. Anything that changes permissions, policy, code, prompts, spend, or external impact has a review gate.")
    table(c, ["Condition", "Safe automatic response", "Must escalate"], [
        ("Transient timeout", "Retry with exponential backoff and same idempotency key", "Retry budget exhausted or deadline threatened"),
        ("Stale cache", "Invalidate known version and rerun once", "Reason for staleness is unknown"),
        ("Malformed source", "Quarantine input and record validation error", "Schema or source contract must change"),
        ("Quality regression", "Route to review and open an improvement ticket", "Any production prompt or code change"),
    ], MARGIN, 510, [128, 203, 197], 56)
    panel(c, MARGIN, 145, W - 2 * MARGIN, 96, PURPLE, PURPLE_WASH)
    text(c, "Recovery rule", MARGIN + 16, 215, 10.2, PURPLE, BOLD)
    paragraph(c, "The recovery routine records what it did and verifies its outcome. It never hides a failing condition by silently changing the success definition, bypassing review, or pretending a human approved the result.", MARGIN + 16, 193, W - 2 * MARGIN - 32, 9.35, 12.7, INK)


def page_engineering(c):
    """Show the safe improvement loop the user wants their named AI employees to follow."""
    intro(c, 19, "Engineering loop", "No single agent writes, approves, and ships its own change.", "The fleet can surface improvement ideas and prepare a change. Independent review, protected merge, deployment verification, and rollback keep speed accountable. This is where behavior changes become engineering work.")
    stages = [
        ("SIGNAL", "A correction, failed run, or recurring friction becomes a specific ticket with evidence.", ORANGE),
        ("BUILD", "A builder works in a branch with tests, docs, and an explicit rollback condition.", BLUE),
        ("REVIEW", "An independent Staff Engineer checks PRD alignment, security, tests, and blast radius.", PURPLE),
        ("VERIFY", "After deployment, a health check confirms real behavior or triggers a revert.", TEAL),
    ]
    positions = [(MARGIN, 394), (322, 394), (MARGIN, 218), (322, 218)]
    for (label, body, accent), (x, y_pos) in zip(stages, positions):
        card(c, x, y_pos, 248, 146, label, label.title(), body, accent)
    panel(c, MARGIN, 94, W - 2 * MARGIN, 90, RED, RED_WASH)
    text(c, "Independent authority boundary", MARGIN + 16, 158, 10.1, RED, BOLD)
    paragraph(c, "The proposer cannot be the only approver. Production access, irreversible changes, new permissions, and policy edits require an independent human gate. Treat a change that fails verification as an incident, not a lesson quietly folded into memory.", MARGIN + 16, 136, W - 2 * MARGIN - 32, 9.25, 12.4, INK)


def page_evals(c):
    """Give a test matrix that proves practical reliability beyond happy-path demos."""
    intro(c, 20, "Evaluation and QA", "Test the job, the boundary, and the failure path before a human depends on it.", "An evaluation set does not need to be large to be useful. Start with representative samples and failure cases. Add a case whenever a real reviewer corrects the agent or an incident exposes a gap.")
    table(c, ["Case", "Expected behavior", "Evidence"], [
        ("Happy path", "Draft uses allowed inputs and meets the output format", "Approval-ready output plus source references"),
        ("Empty input", "Stops before synthesis and names the missing source", "Failure event and owner alert"),
        ("Stale input", "Marks freshness issue and requests a decision", "Timestamp and escalation"),
        ("Provider outage", "Retries safely, then fails loudly", "Retry record and alert"),
        ("Duplicate event", "Does not produce a second write or post", "Same run record is returned"),
        ("Rejected output", "Captures correction as reviewed feedback, not silent truth", "Review decision and backlog item"),
    ], MARGIN, 517, [115, 248, 165], 45)
    text(c, "Keep evaluation cases in version control beside the skill they protect.", MARGIN, 156, 9.4, INK, BOLD)


def page_pilot(c):
    """Give the reader a controlled first production launch that does not overpromise autonomy."""
    intro(c, 21, "Pilot launch", "Pilot with a small audience, a fixed cadence, and a visible owner.", "Your first production period is research, not a victory lap. Watch each run. Gather corrections. Review cost and recovery behavior. Use the evidence to decide whether the job is ready to run more often or for more people.")
    y = 513
    for n, title, body, accent in [
        (1, "Select a pilot owner", "One human receives every output and has authority to stop or revise the pilot.", BLUE),
        (2, "Set a short review window", "Run for a stated period with a known cadence. Do not quietly expand scope mid-pilot.", TEAL),
        (3, "Review daily evidence", "Check outputs, corrections, failures, retries, latency, cost, and cache behavior.", PURPLE),
        (4, "Decide with a scorecard", "Keep, change, pause, or scale only after the acceptance criteria are met.", ORANGE),
    ]:
        y = numbered(c, n, title, body, MARGIN, y, W - 2 * MARGIN, accent)
    panel(c, MARGIN, 137, W - 2 * MARGIN, 98, BLUE, BLUE_WASH)
    text(c, "Pilot scorecard", MARGIN + 16, 207, 10.1, BLUE, BOLD)
    paragraph(c, "Acceptance rate, correction rate, missed deadline rate, failed-run recovery time, cost per approved result, and whether the owner can explain one successful and one failed run without engineering help.", MARGIN + 16, 185, W - 2 * MARGIN - 32, 9.35, 12.5, INK)


def page_roster(c):
    """Name the public roles while holding the private organization details outside the guide."""
    intro(c, 22, "The public roster", "Name roles by their lane, not by an illusion of unconstrained autonomy.", "These are public names and accountability boundaries from the Agentic Society fleet. The private channels, records, routes, schedules, and operating instructions remain private. Add a role only when evidence from the first role creates the need.")
    roles = [
        ("Human Owner", "Direction and protected decisions", ORANGE),
        ("Director of Fleet Orchestration and Engineering", "Orchestration and delivery", BLUE),
        ("Staff Engineer", "Independent review gate", RED),
        ("Project Manager", "Work and commitments", BLUE),
        ("Chief of Staff", "Knowledge and briefs", PURPLE),
        ("RevOps Engineer", "Revenue intelligence", TEAL),
        ("Improvement Engineer", "Tested learning backlog", ORANGE),
        ("AI Correspondent", "Editorial intelligence", BLUE),
        ("Solution Architect", "Member proposals and design", PURPLE),
    ]
    x_positions, y_positions = [MARGIN, 222, 402], [450, 344, 238]
    for index, (role, lane, accent) in enumerate(roles):
        row, col = divmod(index, 3)
        x, y_pos = x_positions[col], y_positions[row]
        # Roster labels are intentionally denser than normal cards, but keep all
        # long role names within the card instead of letting summaries clip.
        panel(c, x, y_pos, 168, 92, accent)
        text(c, "ROLE", x + 14, y_pos + 69, 7.2, accent, BOLD)
        title_y = y_pos + 49
        for line in wrap(role, 140, 9.6, BOLD):
            text(c, line, x + 14, title_y, 9.6, INK, BOLD)
            title_y -= 11
        paragraph(c, lane, x + 14, max(y_pos + 12, title_y - 1), 140, 7.7, 9.2, MUTED)
    panel(c, MARGIN, 103, W - 2 * MARGIN, 92, RED, RED_WASH)
    text(c, "Fleet boundary", MARGIN + 16, 169, 10.1, RED, BOLD)
    paragraph(c, "No role owns its own production change from proposal through approval and release. Every role has a lane, a memory scope, an observable work record, and a controlled route to human authority.", MARGIN + 16, 147, W - 2 * MARGIN - 32, 9.3, 12.5, INK)


def page_scale(c):
    """Show how the second agent is justified by contracts rather than an org-chart impulse."""
    intro(c, 23, "From one agent to a fleet", "Add a role only when you can define its contract with the first role.", "The second agent should remove a real constraint. It needs a different job, a different authority boundary, a handoff contract, a memory scope, and a shared way to leave evidence.")
    table(c, ["Before adding a role", "Answer this"], [
        ("Job boundary", "What repeated result cannot the first role safely or usefully own?"),
        ("Handoff", "What input does it receive, what output does it return, and who owns a mismatch?"),
        ("Memory", "What may it recall, write, correct, or never see?"),
        ("Authority", "What can it propose, execute, or only ask a human to decide?"),
        ("Reliability", "How will a missing handoff, stale state, or duplicate request fail aloud?"),
    ], MARGIN, 510, [165, 363], 51)
    panel(c, MARGIN, 137, W - 2 * MARGIN, 103, TEAL, TEAL_WASH)
    text(c, "A practical second role", MARGIN + 16, 214, 10.2, TEAL, BOLD)
    paragraph(c, "If the Morning Market Brief pilot creates recurring corrections, an Improvement Engineer can turn those reviewed corrections into test cases and proposed changes. It does not rewrite the live skill or deploy itself. That division makes the fleet more capable without weakening control.", MARGIN + 16, 192, W - 2 * MARGIN - 32, 9.25, 12.5, INK)


def page_starter(c):
    """Close with a usable starter prompt and a reminder to build the operating system around it."""
    intro(c, 24, "Start here", "Use the Starter Prompt, then keep the files and evidence around it.", "The downloadable Agent Builder Starter Prompt gives you a copy-ready first instruction. Fill the bracketed fields, attach it to the PRD and skill contract in this guide, and do not skip the run record, evaluation, or failure path.")
    code_block(c, "starter prompt opening", [
        "You are [AGENT_NAME]. Your sole job is [OUTCOME].", "You may read only [ALLOWED_SOURCES] and produce [OUTPUT].", "You must leave a run record with source references and status.", "If input, access, freshness, confidence, or verification is inadequate:", "stop safely, preserve evidence, and alert [ESCALATION_OWNER].", "Never publish, spend, alter source records, or impersonate a human.",
    ], MARGIN, 528, W - 2 * MARGIN, BLUE)
    panel(c, MARGIN, 194, W - 2 * MARGIN, 123, PURPLE, PURPLE_WASH)
    text(c, "Download the copy-ready Starter Prompt", MARGIN + 16, 282, 10.5, PURPLE, BOLD)
    text(c, "romanbediner.com/assets/downloads/agent-builder-starter-prompt.md", MARGIN + 16, 257, 8.7, INK, BOLD)
    paragraph(c, "Use this guide when you need the surrounding operating system: project files, cloud routine, model policy, caching, Slack review, Hivemind memory, observability, self-healing, tests, and independent delivery control.", MARGIN + 16, 230, W - 2 * MARGIN - 32, 9.35, 12.7, INK)
    text(c, "A reliable agent is not a clever prompt. It is a useful job with evidence and a human boundary.", MARGIN, 127, 10.2, INK, BOLD)


def main():
    """Create the complete searchable, vector 24-page construction manual."""
    c = Canvas(str(OUTPUT), pagesize=(W, H), pageCompression=1)
    c.setTitle("Agentic Fleet Build Guide")
    c.setAuthor("Roman Bediner")
    c.setSubject("A practical construction manual for a reliable cloud AI employee and governed agentic fleet")
    pages = [
        cover, contents, page_job_canvas, page_worked_example, page_definition_done,
        page_prd, page_files, page_skill_contract, page_architecture, page_trigger_state,
        page_secrets, page_model_routing, page_caching, page_hivemind, page_slack,
        page_observability, page_failure, page_self_healing, page_engineering, page_evals,
        page_pilot, page_roster, page_scale, page_starter,
    ]
    for maker in pages:
        maker(c)
        c.showPage()
    c.save()
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
