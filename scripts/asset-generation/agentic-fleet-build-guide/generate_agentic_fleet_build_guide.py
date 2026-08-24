"""Generate the public Agentic Fleet Build Guide PDF.

This is a build artifact, not a marketing deck. It gives a first-time builder a
safe, cloud-first sequence for building one reliable agent and then growing a
fleet. It intentionally excludes private routes, credentials, records, and
internal operating instructions.
"""

from pathlib import Path
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas


# Generated files intentionally land in the public, version-controlled asset paths.
ROOT = Path(__file__).resolve().parents[3]
OUTPUT = ROOT / "assets" / "downloads" / "agentic-fleet-build-guide-roman-bediner.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

W, H, MARGIN = 612, 792, 44
NAVY, INK, PAPER = HexColor("#09172B"), HexColor("#10233C"), HexColor("#F7F9FE")
CARD, CARD_ALT, RULE = HexColor("#112A4A"), HexColor("#EAF0FB"), HexColor("#B9C8DF")
BLUE, BLUE_SOFT, TEAL, PURPLE, ORANGE, RED = (HexColor("#2860DC"), HexColor("#79A2FF"),
    HexColor("#18A996"), HexColor("#7E5BE4"), HexColor("#D67A00"), HexColor("#C44D72"))
MUTED, WHITE = HexColor("#62738C"), HexColor("#FFFFFF")

REGULAR, BOLD = "Helvetica", "Helvetica-Bold"
for path, name in [
    ("/System/Library/Fonts/Supplemental/Arial.ttf", "RBArial"),
    ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", "RBArialBold"),
]:
    if Path(path).exists():
        pdfmetrics.registerFont(TTFont(name, path))
if "RBArial" in pdfmetrics.getRegisteredFontNames():
    REGULAR, BOLD = "RBArial", "RBArialBold"


def text(c, value, x, y, size=10, color=INK, font=REGULAR, align="left"):
    """Draw a single line using the guide's compact, consistent type system."""
    c.setFont(font, size)
    c.setFillColor(color)
    if align == "center":
        c.drawCentredString(x, y, value)
    elif align == "right":
        c.drawRightString(x, y, value)
    else:
        c.drawString(x, y, value)


def wrap(value, width, size, font=REGULAR):
    """Wrap by rendered width so long headings never collide or clip."""
    words, lines, line = value.split(), [], ""
    for word in words:
        proposed = f"{line} {word}".strip()
        if line and pdfmetrics.stringWidth(proposed, font, size) > width:
            lines.append(line)
            line = word
        else:
            line = proposed
    if line:
        lines.append(line)
    return lines


def paragraph(c, value, x, y, width, size=10, leading=14, color=MUTED, font=REGULAR):
    """Draw wrapped prose and return the next safe vertical position."""
    for line in wrap(value, width, size, font):
        text(c, line, x, y, size, color, font)
        y -= leading
    return y


def base(c, page, section):
    """Paint the shared paper page, navigation rule, and public-safe footer."""
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(BLUE)
    c.rect(MARGIN, H - 42, 42, 3, fill=1, stroke=0)
    text(c, section.upper(), MARGIN, H - 62, 8.5, BLUE, BOLD)
    c.setStrokeColor(RULE)
    c.setLineWidth(.5)
    c.line(MARGIN, 34, W - MARGIN, 34)
    text(c, f"{page:02d}", MARGIN, 18, 8, MUTED, BOLD)
    text(c, "Roman Bediner  |  Agentic Fleet Build Guide", W - MARGIN, 18, 8, MUTED, align="right")


def heading(c, value, y, width=W - (2 * MARGIN), size=28):
    """Draw an editorial heading with spacing that is calculated from wrapping."""
    for line in wrap(value, width, size, BOLD):
        text(c, line, MARGIN, y, size, INK, BOLD)
        y -= size * 1.13
    return y


def panel(c, x, y, w, h, accent=BLUE, fill=WHITE):
    """Draw a readable build-guide panel with a stable colored identity rail."""
    c.setFillColor(fill)
    c.setStrokeColor(RULE)
    c.setLineWidth(.7)
    c.roundRect(x, y, w, h, 7, fill=1, stroke=1)
    c.setFillColor(accent)
    c.roundRect(x, y + h - 4, w, 4, 3, fill=1, stroke=0)


def card(c, x, y, w, h, label, title_value, body, accent=BLUE):
    """Draw one bounded card so dense material remains scannable in the PDF."""
    panel(c, x, y, w, h, accent)
    text(c, label.upper(), x + 14, y + h - 22, 7.5, accent, BOLD)
    title_y = y + h - 42
    for line in wrap(title_value, w - 28, 12, BOLD):
        text(c, line, x + 14, title_y, 12, INK, BOLD)
        title_y -= 14
    paragraph(c, body, x + 14, title_y - 5, w - 28, 8.7, 11.5, MUTED)


def numbered_row(c, n, title_value, body, y, accent=BLUE):
    """Draw a practical instruction row used in the build sequence pages."""
    c.setFillColor(accent)
    c.circle(MARGIN + 11, y + 3, 11, fill=1, stroke=0)
    text(c, str(n), MARGIN + 11, y, 8.5, WHITE, BOLD, "center")
    text(c, title_value, MARGIN + 34, y, 11, INK, BOLD)
    return paragraph(c, body, MARGIN + 34, y - 16, W - MARGIN - (MARGIN + 34), 9, 12, MUTED) - 11


def cover(c):
    """Set the honest promise: teach a build, not reveal private operations."""
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(BLUE)
    c.rect(MARGIN, H - 76, 60, 4, fill=1, stroke=0)
    text(c, "PUBLIC BUILD ARTIFACT", MARGIN, H - 100, 10, BLUE_SOFT, BOLD)
    text(c, "Agentic Fleet", MARGIN, H - 178, 43, WHITE, BOLD)
    text(c, "Build Guide", MARGIN, H - 230, 43, WHITE, BOLD)
    paragraph(c, "A practical cloud-first guide to build one useful AI employee, make it reliable, and grow a governed fleet without exposing private operating details.", MARGIN, H - 284, 420, 15, 21, HexColor("#D1DCEB"))
    c.setStrokeColor(BLUE)
    c.setLineWidth(1.3)
    c.line(MARGIN, 152, W - MARGIN, 152)
    text(c, "START WITH ONE USEFUL JOB. EARN THE FLEET.", MARGIN, 125, 12, WHITE, BOLD)
    text(c, "Roman Bediner  |  romanbediner.com/resources/agentic-ai-employees", MARGIN, 78, 9, BLUE_SOFT)
    text(c, "12-page implementation companion", MARGIN, 53, 9, HexColor("#8EA4C1"))


def page_start(c):
    base(c, 2, "Start here")
    y = heading(c, "Build one useful agent before you build a fleet.", H - 104)
    paragraph(c, "A fleet is not eight chatbots with job titles. It is a set of bounded systems that can produce useful work, leave evidence, ask for a decision when they need one, and get better without silently changing themselves.", MARGIN, y - 12, W - 2 * MARGIN, 11, 16, MUTED)
    card(c, MARGIN, 420, 248, 142, "1. Job", "Pick one repeated outcome", "Example: turn a defined cloud folder into one morning briefing. Avoid a broad role such as 'run marketing.'", BLUE)
    card(c, 320, 420, 248, 142, "2. Human moment", "Choose the review surface", "Use a Slack DM or email with a clear approve, reject, or revise action. The first version should make a human decision easy.", TEAL)
    card(c, MARGIN, 252, 248, 142, "3. Boundary", "Name what cannot happen", "State prohibited actions, spending limits, data limits, and when the run must stop and escalate.", ORANGE)
    card(c, 320, 252, 248, 142, "4. Proof", "Define success before code", "Write one measurable result, a visible completion record, and what a failed run should tell the operator.", PURPLE)
    text(c, "Your first-agent canvas", MARGIN, 208, 12, INK, BOLD)
    panel(c, MARGIN, 76, W - 2 * MARGIN, 106, BLUE, CARD_ALT)
    text(c, "INPUT", MARGIN + 16, 150, 8, BLUE, BOLD)
    text(c, "What cloud source arrives?", MARGIN + 16, 132, 10, INK, BOLD)
    text(c, "OUTPUT", MARGIN + 190, 150, 8, TEAL, BOLD)
    text(c, "What useful artifact is produced?", MARGIN + 190, 132, 10, INK, BOLD)
    text(c, "REVIEW", MARGIN + 16, 105, 8, PURPLE, BOLD)
    text(c, "Who approves or corrects it?", MARGIN + 16, 87, 10, INK, BOLD)
    text(c, "EVIDENCE", MARGIN + 190, 105, 8, ORANGE, BOLD)
    text(c, "Where is completion or failure recorded?", MARGIN + 190, 87, 10, INK, BOLD)


def page_architecture(c):
    base(c, 3, "Cloud-first architecture")
    y = heading(c, "Use four layers. Keep the responsibility of each layer clear.", H - 104)
    paragraph(c, "Choose managed cloud services your team can observe and maintain. The specific vendor can change. The contract between layers should not.", MARGIN, y - 12, W - 2 * MARGIN, 11, 16)
    items = [
        ("1. Behavior", "PRD, job instructions, policies, and evaluation examples.", PURPLE),
        ("2. Runtime", "Scheduled or event-driven code that reads inputs, runs tools, and records outcomes.", BLUE),
        ("3. State", "Shared memory, queue state, approvals, run ledger, and durable source records.", TEAL),
        ("4. Surfaces", "Slack, email, dashboards, APIs, and human review points where work is consumed.", ORANGE),
    ]
    y = 514
    for label, body, accent in items:
        panel(c, MARGIN, y, W - 2 * MARGIN, 77, accent)
        c.setFillColor(accent); c.circle(MARGIN + 21, y + 39, 11, fill=1, stroke=0)
        text(c, label.split('.')[0], MARGIN + 21, y + 36, 8.5, WHITE, BOLD, "center")
        text(c, label[3:], MARGIN + 45, y + 47, 12, INK, BOLD)
        paragraph(c, body, MARGIN + 45, y + 28, W - 2 * MARGIN - 61, 9, 12)
        y -= 96
    panel(c, MARGIN, 92, W - 2 * MARGIN, 74, BLUE, HexColor("#EAF2FF"))
    text(c, "Cloud-only baseline", MARGIN + 16, 140, 10, BLUE, BOLD)
    paragraph(c, "Put source files, runtime, records, and integrations in managed cloud systems. A personal laptop can be a development tool, never the only place the agent can run or remember.", MARGIN + 16, 121, W - 2 * MARGIN - 32, 9.3, 12)


def page_hivemind(c):
    base(c, 4, "Shared memory")
    y = heading(c, "Hivemind turns shared context into a working loop.", H - 104)
    paragraph(c, "Hivemind is the public name for the shared-memory pattern informing this fleet: retrieve the right context before work, capture the verified lesson after work, and let stale memory lose authority. It is credited here without linking out to a third party.", MARGIN, y - 12, W - 2 * MARGIN, 10.6, 15)
    labels = [("RECALL", "Retrieve only the scoped, relevant instructions and prior evidence.", BLUE), ("ACT", "Run the bounded job and cite the source material used.", TEAL), ("CAPTURE", "Write a compact lesson only after review or measurable confirmation.", PURPLE)]
    x = MARGIN
    for label, body, accent in labels:
        card(c, x, 395, 160, 150, label, label.title(), body, accent)
        x += 176
    text(c, "Memory rules worth implementing", MARGIN, 350, 13, INK, BOLD)
    y = 318
    for n, title_value, body, accent in [
        (1, "Scope it", "Separate company-wide context from a role, project, or customer context. Never retrieve every memory for every job.", BLUE),
        (2, "Ground it", "Store source links, decision dates, and confidence. A remembered assertion is not the same thing as verified evidence.", TEAL),
        (3, "Correct it", "Human rejection, a failed evaluation, or a new source should amend or supersede the old lesson.", PURPLE),
        (4, "Let it fade", "Reduce the influence of stale, unconfirmed context instead of letting old instructions silently govern new work.", ORANGE),
    ]:
        y = numbered_row(c, n, title_value, body, y, accent)


def page_routing_cache(c):
    base(c, 5, "Performance and cost")
    y = heading(c, "Treat model routing and caching as explicit product policy.", H - 104)
    paragraph(c, "Do not let every task default to the most expensive model or recompute stable work. Put the decision in a small, reviewable policy layer and measure it by job.", MARGIN, y - 12, W - 2 * MARGIN, 10.8, 15)
    card(c, MARGIN, 420, 248, 152, "ROUTING", "Send the job to the right capability", "Start deterministic when rules can solve it. Use a lighter model for extraction and classification. Escalate to a stronger model only for ambiguity, synthesis, or high-stakes review.", BLUE)
    card(c, 320, 420, 248, 152, "CACHING", "Keep stable instructions stable", "Separate a byte-stable system prefix from dynamic run data. Cache reusable context where your provider supports it. Match cache lifetime to the job cadence and invalidate when policy changes.", TEAL)
    panel(c, MARGIN, 252, W - 2 * MARGIN, 124, PURPLE, CARD_ALT)
    text(c, "A simple routing decision", MARGIN + 16, 345, 11, PURPLE, BOLD)
    text(c, "1. Can a deterministic rule answer it?", MARGIN + 16, 318, 10, INK, BOLD)
    text(c, "2. If not, what is the cheapest model that meets the quality bar?", MARGIN + 16, 294, 10, INK, BOLD)
    text(c, "3. Is the output high-impact enough to require a stronger model or human review?", MARGIN + 16, 270, 10, INK, BOLD)
    text(c, "Measure each job", MARGIN, 214, 12, INK, BOLD)
    paragraph(c, "Record quality signals, latency, token or request cost, cache hit rate, retries, and human correction rate. A model policy improves when it is observable, not when it is assumed.", MARGIN, 191, W - 2 * MARGIN, 9.5, 13)


def page_integrations(c):
    base(c, 6, "Inputs, tools, and review")
    y = heading(c, "Integrations should be narrow, observable, and easy to reverse.", H - 104)
    paragraph(c, "The agent only needs the inputs and permissions required for its declared job. Add integrations after the first useful result, not before.", MARGIN, y - 12, W - 2 * MARGIN, 10.8, 15)
    card(c, MARGIN, 413, 160, 150, "INPUT", "Cloud sources", "Use a cloud folder, structured table, inbox, or API. Record exactly which source records informed the output.", BLUE)
    card(c, 226, 413, 160, 150, "ACTION", "A small tool set", "Wrap external calls in clients with timeouts, permissions, idempotency, and human-readable errors.", TEAL)
    card(c, 402, 413, 160, 150, "REVIEW", "Slack or email", "Send the outcome to a human surface with clear approve, reject, and revise actions.", PURPLE)
    panel(c, MARGIN, 240, W - 2 * MARGIN, 130, ORANGE, HexColor("#FFF7E9"))
    text(c, "Integration contract", MARGIN + 16, 340, 11, ORANGE, BOLD)
    y = 315
    for rule_value in [
        "Authenticate with service identities or scoped tokens, never a human fallback identity.",
        "Use idempotency keys or a durable state record before a write so retries cannot duplicate the action.",
        "Show what happened: source, timestamp, result, error category, and next owner.",
        "Make a failed integration legible: source returned nothing, permission issue, timeout, or provider outage.",
    ]:
        text(c, "•", MARGIN + 16, y, 11, ORANGE, BOLD)
        y = paragraph(c, rule_value, MARGIN + 30, y, W - 2 * MARGIN - 46, 9.1, 12, MUTED) - 5
    paragraph(c, "Slack is a surface, not the system of record. Keep durable workflow state and completion evidence in a reliable cloud record even when Slack is where the human sees the work.", MARGIN, 183, W - 2 * MARGIN, 9.4, 13)


def page_reliability(c):
    base(c, 7, "Reliability")
    y = heading(c, "Nothing should fail silently. Design the recovery path before launch.", H - 104)
    paragraph(c, "A run is not complete because a model returned text. It is complete when its output, side effect, and evidence record agree or a visible escalation owns the mismatch.", MARGIN, y - 12, W - 2 * MARGIN, 10.7, 15)
    steps = [("1", "START", "Create a run ID and record expected input and deadline.", BLUE), ("2", "DO", "Execute with timeouts, bounded retries, and idempotent writes.", TEAL), ("3", "VERIFY", "Read back the destination or check an independent success signal.", PURPLE), ("4", "ESCALATE", "Classify the failure, preserve evidence, and name the human or repair workflow.", RED)]
    x = MARGIN
    for n, label, body, accent in steps:
        card(c, x, 405, 116, 142, n, label, body, accent)
        x += 130
    text(c, "Minimum run record", MARGIN, 359, 12, INK, BOLD)
    rows = [
        ("Heartbeat", "last started, last completed, next expected run"),
        ("Result", "input references, output location, approval state"),
        ("Failure", "category, retry count, source response, owner"),
        ("Recovery", "retry safely, repair with review, or roll back"),
    ]
    y = 325
    for label, body in rows:
        panel(c, MARGIN, y - 19, W - 2 * MARGIN, 41, BLUE if label in ("Heartbeat", "Result") else ORANGE, WHITE)
        text(c, label.upper(), MARGIN + 14, y, 8, INK, BOLD)
        text(c, body, MARGIN + 113, y, 9, MUTED)
        y -= 55
    paragraph(c, "Use alerts for conditions that need attention, not every event. A useful alert says what failed, what evidence exists, what was attempted, and what should happen next.", MARGIN, 80, W - 2 * MARGIN, 9.4, 13)


def page_engineering(c):
    base(c, 8, "Safe improvement")
    y = heading(c, "A self-improving fleet still needs independent checks.", H - 104)
    paragraph(c, "Learning becomes an engineering change only after a signal is captured, a change is reviewed, and production behavior is verified. No single agent should write, approve, and ship its own change.", MARGIN, y - 12, W - 2 * MARGIN, 10.7, 15)
    cards = [
        ("SIGNAL", "A human correction, failed run, or recurring friction becomes a clearly framed improvement ticket.", ORANGE),
        ("CHANGE", "A builder agent or engineer works in a branch with tests, updated documentation, and a rollback plan.", BLUE),
        ("REVIEW", "An independent reviewer checks the proposed change against the PRD, tests, security, and user intent.", PURPLE),
        ("VERIFY", "After release, observe the real behavior, confirm the intended evidence, then capture a reviewed memory.", TEAL),
    ]
    positions = [(MARGIN, 420), (320, 420), (MARGIN, 245), (320, 245)]
    for (label, body, accent), (x, y_pos) in zip(cards, positions):
        card(c, x, y_pos, 248, 146, label, label.title(), body, accent)
    panel(c, MARGIN, 95, W - 2 * MARGIN, 105, RED, HexColor("#FFF0F4"))
    text(c, "The independence rule", MARGIN + 16, 165, 11, RED, BOLD)
    paragraph(c, "Separate the authority to propose a change from the authority to approve and deploy it. Protect secrets, permissions, production deployment, and high-impact actions with review gates. This is how speed remains accountable.", MARGIN + 16, 143, W - 2 * MARGIN - 32, 9.5, 13)


def page_cost_quality(c):
    base(c, 9, "Quality and economics")
    y = heading(c, "Make quality, cost, and trust visible in one operating view.", H - 104)
    paragraph(c, "The objective is not maximum autonomy. It is reliable useful work at the appropriate cost, with a human able to see and correct the system.", MARGIN, y - 12, W - 2 * MARGIN, 10.7, 15)
    metrics = [
        ("QUALITY", "acceptance rate, correction rate, evaluation pass rate", BLUE),
        ("SPEED", "time to useful output, queue age, missed schedule", TEAL),
        ("COST", "cost per completed job, model tier mix, cache hit rate", PURPLE),
        ("TRUST", "approved changes, escalation clarity, recoverable failures", ORANGE),
    ]
    y = 490
    for label, body, accent in metrics:
        panel(c, MARGIN, y, W - 2 * MARGIN, 63, accent)
        text(c, label, MARGIN + 16, y + 36, 9, accent, BOLD)
        paragraph(c, body, MARGIN + 130, y + 36, W - 2 * MARGIN - 146, 10, 13, INK)
        y -= 79
    panel(c, MARGIN, 114, W - 2 * MARGIN, 98, BLUE, CARD_ALT)
    text(c, "A better optimization question", MARGIN + 16, 179, 11, BLUE, BOLD)
    paragraph(c, "Instead of asking 'How do we make the agent cheaper?', ask: 'Which part of this job creates value, which part needs judgment, and which part can be cached, simplified, or handled deterministically?'", MARGIN + 16, 157, W - 2 * MARGIN - 32, 9.8, 13)


def page_prd(c):
    base(c, 10, "Build contract")
    y = heading(c, "Write the PRD before you build. Keep it alive after you launch.", H - 104)
    paragraph(c, "A lightweight PRD is the agent's operating contract. It prevents a vague ambition from becoming an untestable system and gives reviewers something concrete to protect.", MARGIN, y - 12, W - 2 * MARGIN, 10.7, 15)
    sections = [
        ("Outcome and user", "Who receives what useful result, when, and in what review surface?", BLUE),
        ("Inputs and boundaries", "What sources are allowed? What actions are prohibited or require approval?", ORANGE),
        ("Workflow and state", "What happens in order, what is stored, and what makes a retry safe?", TEAL),
        ("Success and failure", "How is quality evaluated, what proves completion, and who owns recovery?", PURPLE),
    ]
    y = 486
    for label, body, accent in sections:
        panel(c, MARGIN, y, W - 2 * MARGIN, 73, accent)
        text(c, label, MARGIN + 16, y + 46, 11, INK, BOLD)
        paragraph(c, body, MARGIN + 16, y + 25, W - 2 * MARGIN - 32, 9.4, 12)
        y -= 89
    panel(c, MARGIN, 104, W - 2 * MARGIN, 106, BLUE, HexColor("#EAF2FF"))
    text(c, "The documentation gate", MARGIN + 16, 177, 11, BLUE, BOLD)
    paragraph(c, "When behavior, infrastructure, or a user-facing promise changes, update the PRD, operating diagram, and tests in the same change. A system without current documentation creates hidden risk for its next human or agent operator.", MARGIN + 16, 155, W - 2 * MARGIN - 32, 9.4, 12)


def page_ten_moves(c):
    base(c, 11, "First implementation")
    y = heading(c, "The first ten moves from idea to a working AI employee.", H - 104)
    moves = [
        ("Choose the job", "Pick one narrow, repeated job with a clear receiver."),
        ("Write the contract", "Create the one-page PRD and name the non-negotiable boundaries."),
        ("Create the foundation", "Set up a cloud repository, managed runtime, and durable source-of-truth record."),
        ("Connect one input", "Use one cloud input and store a representative evaluation set."),
        ("Prove the flow", "Build a deterministic version before adding a model where possible."),
        ("Add model policy", "Add routing policy, stable prompt structure, and cacheable context."),
        ("Create the review", "Send one draft to Slack or email with approval and correction controls."),
        ("Make failures visible", "Create a run ledger, heartbeats, readable errors, and safe retry behavior."),
        ("Test the edge cases", "Test the happy path, empty input, bad input, provider failure, and duplicate retry."),
        ("Pilot and learn", "Launch a limited pilot, review corrections, and turn verified lessons into backlog items."),
    ]
    y -= 6
    for n, (title_value, body) in enumerate(moves, 1):
        y = numbered_row(c, n, title_value, body, y, BLUE if n % 2 else TEAL)


def page_checklist(c):
    base(c, 12, "Release checklist")
    y = heading(c, "Do not call it autonomous until you can answer these questions.", H - 104)
    paragraph(c, "Use this as a release conversation with the operator, engineer, and reviewer. If an answer is unknown, it is a build task, not an acceptable assumption.", MARGIN, y - 12, W - 2 * MARGIN, 10.6, 15)
    groups = [
        ("Useful", ["Can a real user name the job and recognize a good result?", "Is there a smaller first version that delivers value sooner?"], BLUE),
        ("Bounded", ["Are data access, actions, approvals, and escalation limits explicit?", "Can the system fail closed instead of impersonating a human or guessing?"], ORANGE),
        ("Observable", ["Can an operator see the last run, current state, and evidence of the result?", "Does every failure name an owner and next action?"], TEAL),
        ("Maintainable", ["Are PRD, diagrams, tests, deployment, and rollback instructions current?", "Does an independent reviewer gate meaningful changes?"], PURPLE),
    ]
    y = 486
    for label, questions, accent in groups:
        panel(c, MARGIN, y, W - 2 * MARGIN, 78, accent)
        text(c, label.upper(), MARGIN + 16, y + 51, 9, accent, BOLD)
        q_y = y + 33
        for question in questions:
            text(c, "□", MARGIN + 16, q_y, 11, INK, BOLD)
            text(c, question, MARGIN + 34, q_y, 9.2, INK)
            q_y -= 19
        y -= 94
    panel(c, MARGIN, 92, W - 2 * MARGIN, 74, BLUE, CARD_ALT)
    text(c, "Build the next role only when the first role creates a real, visible need for it.", MARGIN + 16, 134, 11, INK, BOLD)
    paragraph(c, "That is how a project manager creates the case for an improvement engineer, a reviewer, or an orchestrator: through evidence, not org-chart theater.", MARGIN + 16, 113, W - 2 * MARGIN - 32, 9.3, 12)


def main():
    """Create all twelve vector pages and set stable, searchable PDF metadata."""
    c = Canvas(str(OUTPUT), pagesize=(W, H), pageCompression=1)
    c.setTitle("Agentic Fleet Build Guide")
    c.setAuthor("Roman Bediner")
    c.setSubject("A practical cloud-first guide for building a reliable agentic fleet")
    for maker in [cover, page_start, page_architecture, page_hivemind, page_routing_cache,
                  page_integrations, page_reliability, page_engineering, page_cost_quality,
                  page_prd, page_ten_moves, page_checklist]:
        maker(c)
        c.showPage()
    c.save()
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
