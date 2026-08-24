"""Generate The Agentic Fleet Control Plane PDF.

This source intentionally uses vector typography, rules, cards, and diagrams so
the downloadable artifact remains sharp, selectable, and easy to revise.
Run with the bundled workspace Python runtime:
  <bundled-python> scripts/asset-generation/agentic-fleet-control-plane/generate_agentic_fleet_control_plane.py
"""

from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas


# Keep all generated output in the canonical public download location.
# The generator sits three directories below the repository root.
ROOT = Path(__file__).resolve().parents[3]
OUTPUT = ROOT / "assets" / "downloads" / "agentic-fleet-control-plane-roman-bediner.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = 720, 405
MARGIN = 36

# These values are sampled/approximated from the reference publication system.
NAVY = HexColor("#09172B")
CARD = HexColor("#11223A")
CARD_ALT = HexColor("#0D1D32")
BLUE = HexColor("#3C78FF")
BLUE_SOFT = HexColor("#6F9DE0")
MUTED = HexColor("#9CADC1")
RULE = HexColor("#29415F")
GREEN = HexColor("#28B8A5")
ORANGE = HexColor("#D87800")
PURPLE = HexColor("#8D4CE0")
RED = HexColor("#C64C73")

# macOS includes Arial, which closely matches the reference PDF's sans-serif
# publication voice. Register it when available; Helvetica remains the safe
# fallback for other machines.
FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
for candidate, name in [
    ("/System/Library/Fonts/Supplemental/Arial.ttf", "RBArial"),
    ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", "RBArial-Bold"),
]:
    if Path(candidate).exists():
        pdfmetrics.registerFont(TTFont(name, candidate))
if "RBArial" in pdfmetrics.getRegisteredFontNames():
    FONT_REGULAR, FONT_BOLD = "RBArial", "RBArial-Bold"


def set_fill(canvas, color):
    """Set the canvas fill color with a short, readable call site."""
    canvas.setFillColor(color)


def text(canvas, value, x, y, size=12, color=white, font=FONT_REGULAR, align="left"):
    """Draw one line of text with predictable alignment."""
    canvas.setFont(font, size)
    canvas.setFillColor(color)
    if align == "center":
        canvas.drawCentredString(x, y, value)
    elif align == "right":
        canvas.drawRightString(x, y, value)
    else:
        canvas.drawString(x, y, value)


def wrap(value, max_chars):
    """Wrap prose without relying on rasterized or HTML text."""
    words, lines, current = value.split(), [], ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and len(candidate) > max_chars:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def paragraph(canvas, value, x, y, width, size=11, leading=15, color=MUTED, max_chars=None):
    """Draw a wrapped paragraph and return the next available y position."""
    chars = max_chars or max(20, int(width / (size * 0.52)))
    for line in wrap(value, chars):
        text(canvas, line, x, y, size, color)
        y -= leading
    return y


def rect(canvas, x, y, w, h, fill=CARD, stroke=None, radius=3):
    """Draw a restrained publication card."""
    canvas.setFillColor(fill)
    if stroke:
        canvas.setStrokeColor(stroke)
        canvas.setLineWidth(0.7)
    else:
        canvas.setStrokeColor(fill)
    canvas.roundRect(x, y, w, h, radius, fill=1, stroke=1 if stroke else 0)


def rule(canvas, x1, y1, x2, y2, color=RULE, width=0.7):
    """Draw a thin vector rule or connector."""
    canvas.setStrokeColor(color)
    canvas.setLineWidth(width)
    canvas.line(x1, y1, x2, y2)


def footer(canvas, page_number, section="agentic fleet control plane"):
    """Match the reference's low-contrast footer treatment."""
    text(canvas, f"Roman Bediner   romanbediner.com/{section}", PAGE_W - MARGIN, 18, 7.5, HexColor("#61758E"), align="right")
    text(canvas, f"{page_number:02d}", MARGIN, 18, 7.5, HexColor("#61758E"))


def base(canvas, page_number, section="agentic fleet control plane"):
    """Paint the shared dark page and footer."""
    set_fill(canvas, NAVY)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    footer(canvas, page_number, section)


def kicker(canvas, value, x, y):
    """Draw the small blue section label used throughout the reference."""
    text(canvas, value.upper(), x, y, 9, BLUE, FONT_BOLD)


def title(canvas, value, x, y, size=25, width=None):
    """Draw a white heading, wrapping only when a width is supplied."""
    if not width:
        text(canvas, value, x, y, size, white, FONT_BOLD)
        return y - size * 1.2
    lines = wrap(value, max(18, int(width / (size * 0.52))))
    for line in lines:
        text(canvas, line, x, y, size, white, FONT_BOLD)
        y -= size * 1.15
    return y


def card(canvas, x, y, w, h, label, heading, body, accent=BLUE):
    """Draw a compact reference-style information card."""
    rect(canvas, x, y, w, h, CARD)
    canvas.setFillColor(accent)
    canvas.rect(x, y + h - 3, w, 3, fill=1, stroke=0)
    text(canvas, label.upper(), x + 12, y + h - 19, 7.5, accent, FONT_BOLD)
    text(canvas, heading, x + 12, y + h - 39, 12, white, FONT_BOLD)
    paragraph(canvas, body, x + 12, y + h - 57, w - 24, size=9, leading=12, max_chars=max(22, int(w / 6.5)))


def cover(canvas):
    """Create a balanced editorial title page, not a centered poster lockup."""
    base(canvas, 1)
    kicker(canvas, "First-party build report", 54, 315)
    title(canvas, "AGENTIC FLEET CONTROL PLANE", 54, 255, 31, 360)
    rule(canvas, 54, 128, 408, 128, BLUE, 1.2)
    text(canvas, "Eight AI employees. One accountable operating system.", 54, 103, 15, white, FONT_REGULAR)
    text(canvas, "A public field guide from Roman Bediner's Fractional COO work", 54, 80, 9.5, MUTED)
    rule(canvas, 480, 115, 480, 294, BLUE, 1.5)
    text(canvas, "PUBLIC FIELD GUIDE", 502, 274, 8, BLUE, FONT_BOLD)
    text(canvas, "01  THE CONTROL PLANE", 502, 238, 10, white, FONT_BOLD)
    text(canvas, "02  THE EMPLOYEES", 502, 210, 10, white, FONT_BOLD)
    text(canvas, "03  THE ROUTER", 502, 182, 10, white, FONT_BOLD)
    text(canvas, "04  THE RELEASE LOOP", 502, 154, 10, white, FONT_BOLD)
    text(canvas, "romanbediner.com/resources/agentic-ai-employees", PAGE_W / 2, 32, 8.5, BLUE, FONT_REGULAR, "center")


def page_problem(canvas):
    """Explain the failure mode the architecture is designed to address."""
    base(canvas, 2)
    kicker(canvas, "The problem", MARGIN, 365)
    title(canvas, "The failure point is not strategy. It's execution.", MARGIN, 312, 25, 315)
    paragraph(canvas, "As teams scale and AI adoption accelerates, execution fragments across tools, teams, and decision layers. The operating model breaks before the strategy does.", MARGIN, 190, 300, 12, 17, MUTED, 44)
    rect(canvas, MARGIN, 52, 290, 70, HexColor("#142849"))
    canvas.setFillColor(BLUE)
    canvas.rect(MARGIN, 52, 3, 70, fill=1, stroke=0)
    paragraph(canvas, "A framework doesn't add process. It adds the structure that makes speed sustainable.", MARGIN + 16, 100, 255, 10, 13, white, 40)
    card(canvas, 366, 245, 150, 116, "01", "Handoffs lose context", "Work arrives incomplete; teams interpret instead of execute.", BLUE)
    card(canvas, 524, 245, 150, 116, "02", "Status isn't trustworthy", "Reports show green while queues age underneath.", PURPLE)
    card(canvas, 366, 116, 150, 116, "03", "AI amplifies ambiguity", "Speed without structure multiplies inconsistency at scale.", GREEN)
    card(canvas, 524, 116, 150, 116, "04", "Ownership is unclear", "Decisions happen by availability, not defined authority.", ORANGE)


def page_layers(canvas):
    """Show the actual end-to-end architecture from the AI Employees page."""
    base(canvas, 2)
    kicker(canvas, "The architecture", MARGIN, 365)
    title(canvas, "The stack, end to end", MARGIN, 330, 23)
    paragraph(canvas, "The repo is the body. Hivemind holds shared memory and operating behavior. Each run retrieves the relevant context, acts through clients, leaves a heartbeat, and carries work to surfaces the organization can verify.", MARGIN, 294, 640, 10, 13, MUTED, 108)

    # Three clear lanes replace the previous collection of small floating
    # cards: trigger and behavior, execution and evidence, then surfaces.
    rect(canvas, 259, 239, 202, 30, CARD, BLUE)
    text(canvas, "VERCEL CRON", 360, 256, 9, white, FONT_BOLD, "center")
    text(canvas, "scheduled trigger", 360, 244, 7.5, BLUE_SOFT, FONT_REGULAR, "center")
    rule(canvas, 360, 239, 360, 218, BLUE_SOFT, 1.2)
    rect(canvas, 222, 153, 276, 65, HexColor("#172B50"), BLUE)
    text(canvas, "THE BODY", 242, 198, 8, BLUE_SOFT, FONT_BOLD)
    text(canvas, "Vercel runtime", 242, 178, 16, white, FONT_BOLD)
    text(canvas, "scheduling  /  auth  /  agent loop", 242, 162, 8.5, MUTED)
    rect(canvas, 520, 163, 152, 45, CARD_ALT, PURPLE)
    text(canvas, "HIVEMIND", 534, 190, 7.5, HexColor("#C18BFF"), FONT_BOLD)
    text(canvas, "shared memory + skills", 534, 175, 8.7, white, FONT_BOLD)
    text(canvas, "retrieved at run time", 534, 164, 7.5, MUTED)
    rule(canvas, 498, 185, 520, 185, HexColor("#C18BFF"), 1.2)
    rect(canvas, 48, 163, 142, 45, CARD_ALT, GREEN)
    text(canvas, "PROOF", 62, 190, 7.5, HexColor("#49D3C0"), FONT_BOLD)
    text(canvas, "heartbeat ledger", 62, 175, 9.5, white, FONT_BOLD)
    text(canvas, "every run leaves evidence", 62, 164, 7, MUTED)
    rule(canvas, 190, 185, 222, 185, GREEN, 1.2)
    rule(canvas, 360, 153, 360, 127, BLUE_SOFT, 1.2)
    rect(canvas, 271, 89, 178, 38, CARD, BLUE)
    text(canvas, "INTEGRATION CLIENTS", 360, 110, 8.5, white, FONT_BOLD, "center")
    text(canvas, "outbound API surface", 360, 98, 7.5, MUTED, FONT_REGULAR, "center")
    rule(canvas, 360, 89, 360, 75, RULE, 1.0)
    for x, heading, body in [(42, "TEAM WORKSPACE", "the surface"), (269, "STRUCTURED TRACKER", "shared state"), (496, "EXTERNAL DATA", "CRM / community")]:
        rule(canvas, 360, 75, x + 89, 61, RULE, 1.0)
        rect(canvas, x, 28, 178, 33, CARD_ALT, RULE)
        text(canvas, heading, x + 89, 47, 7.6, white, FONT_BOLD, "center")
        text(canvas, body, x + 89, 36, 7.2, MUTED, FONT_REGULAR, "center")


def page_org(canvas):
    """Name the public fleet roles without exposing private operating details."""
    base(canvas, 3)
    kicker(canvas, "The employees", MARGIN, 365)
    title(canvas, "Eight named agents. Clear jobs. One human authority boundary.", MARGIN, 330, 21, 610)
    paragraph(canvas, "The names are public. The private channels, records, and operating instructions are not. Each role has a lane, a memory, and a controlled route to action.", MARGIN, 272, 640, 10, 13, MUTED, 108)
    rect(canvas, 155, 224, 410, 36, HexColor("#142849"), BLUE)
    text(canvas, "HUMAN OWNER  >  DIRECTOR OF FLEET ORCHESTRATION & ENGINEERING", 360, 240, 9.2, white, FONT_BOLD, "center")
    text(canvas, "direction, protected decisions, and accountable operation", 360, 228, 7.5, MUTED, FONT_REGULAR, "center")
    roles = [
        ("PROJECT MANAGER", "work and commitments", BLUE),
        ("CHIEF OF STAFF", "knowledge and briefs", PURPLE),
        ("REVOPS ENGINEER", "revenue intelligence", GREEN),
        ("IMPROVEMENT ENGINEER", "learning and backlog", ORANGE),
        ("AI CORRESPONDENT", "editorial intelligence", BLUE),
        ("SOLUTION ARCHITECT", "member proposals", PURPLE),
    ]
    positions = [(48, 162), (286, 162), (524, 162), (48, 92), (286, 92), (524, 92)]
    for (label, sub, accent), (x, y) in zip(roles, positions):
        rect(canvas, x, y, 148, 50, CARD_ALT, RULE)
        canvas.setFillColor(accent)
        canvas.rect(x, y + 47, 148, 3, fill=1, stroke=0)
        text(canvas, label, x + 10, y + 28, 7.4, white, FONT_BOLD)
        text(canvas, sub, x + 10, y + 14, 7.2, MUTED)
    rect(canvas, 518, 224, 166, 36, CARD, RED)
    text(canvas, "STAFF ENGINEER", 601, 242, 9, white, FONT_BOLD, "center")
    text(canvas, "independent review gate", 601, 230, 7.2, RED, FONT_REGULAR, "center")
    text(canvas, "No single agent writes, approves, and ships its own change.", 360, 42, 10.5, BLUE_SOFT, FONT_BOLD, "center")


def page_brain_body(canvas):
    """Show the body/brain split and the two controlled update paths."""
    base(canvas, 5)
    kicker(canvas, "The core idea", MARGIN, 365)
    title(canvas, "The repo is the body. The cloud brain holds behavior.", MARGIN, 330, 21, 560)
    paragraph(canvas, "A code repository holds the runtime: scheduling, authentication, the agent loop, integration clients, engineering workflows, and deployment safeguards. A cloud drive folder holds behavior that can change as plain skill files.", MARGIN, 270, 650, 10.5, 14, MUTED, 108)
    rect(canvas, 36, 144, 290, 92, CARD, BLUE)
    text(canvas, "THE BODY > CODE REPO", 52, 212, 9, BLUE, FONT_BOLD)
    paragraph(canvas, "Scheduling, auth, agent loops, integrations, engineering workflows, and production safeguards. Shipped by Git.", 52, 190, 250, 10, 14, white, 43)
    rect(canvas, 394, 144, 290, 92, CARD, PURPLE)
    text(canvas, "THE BRAIN > CLOUD DRIVE", 410, 212, 9, PURPLE, FONT_BOLD)
    paragraph(canvas, "Skill files, memory, and operating rules. Edited like documents; consumed at runtime.", 410, 190, 250, 10, 14, white, 43)
    rule(canvas, 326, 190, 394, 190, BLUE_SOFT, 1.1)
    text(canvas, "loaded at runtime", 360, 201, 8, MUTED, FONT_REGULAR, "center")
    text(canvas, "TWO UPDATE PATHS", MARGIN, 111, 8.5, BLUE, FONT_BOLD)
    card(canvas, 36, 58, 312, 42, "Change behavior", "Edit a skill file", "Live on the next run, no deploy.", BLUE)
    card(canvas, 372, 58, 312, 42, "Change the system", "Open a branch and PR", "Independent review, deployment verification, rollback.", ORANGE)


def page_routing(canvas):
    """Make model choice and reliability legible as operating policy."""
    base(canvas, 4)
    kicker(canvas, "Intelligence routing", MARGIN, 365)
    title(canvas, "The fleet does not use one model for every job", MARGIN, 330, 21, 430)
    paragraph(canvas, "Model choice becomes an operational policy. Routine work gets speed; judgment and production gates get deeper reasoning. The authority of each job stays visible.", MARGIN, 270, 430, 10.5, 14, MUTED, 64)
    routes = [
        ("FAST", "classification, extraction, routine reports", "low cost / low latency", BLUE),
        ("CAPABLE", "coordination, synthesis, code changes", "balanced reasoning", PURPLE),
        ("DEEP", "review, recovery, production judgment", "reserved for risk", ORANGE),
    ]
    y = 180
    for label, jobs, consequence, accent in routes:
        rect(canvas, MARGIN, y, 290, 48, CARD)
        canvas.setFillColor(accent)
        canvas.rect(MARGIN, y, 5, 48, fill=1, stroke=0)
        text(canvas, label, 56, y + 30, 9, accent, FONT_BOLD)
        text(canvas, jobs, 110, y + 30, 9.5, white, FONT_BOLD)
        text(canvas, consequence, 110, y + 14, 8.5, MUTED)
        y -= 60
    kicker(canvas, "The reliability loop", 382, 214)
    title(canvas, "Report and recover", 382, 184, 20)
    for x, label, body, accent in [(382, "HEARTBEAT", "did it run?", BLUE), (482, "DIGEST", "what happened?", PURPLE), (582, "RECOVER", "what now?", GREEN)]:
        rect(canvas, x, 94, 86, 53, CARD_ALT, RULE)
        text(canvas, label, x + 43, 126, 7.2, accent, FONT_BOLD, "center")
        text(canvas, body, x + 43, 109, 8, white, FONT_REGULAR, "center")
        if x < 582:
            text(canvas, ">", x + 91, 113, 13, BLUE_SOFT, FONT_BOLD, "center")
    paragraph(canvas, "Reporting is not a dashboard bolted on afterward. It closes the distance between autonomous action and accountable operations.", 382, 70, 280, 10, 14, MUTED, 48)


def page_run(canvas):
    """Turn the operating lifecycle into a portable build sequence."""
    base(canvas, 5)
    kicker(canvas, "Inside a run", MARGIN, 365)
    title(canvas, "From engineering queue to verified production", MARGIN, 330, 21, 500)
    paragraph(canvas, "No single agent writes, approves, and ships its own change. The system separates initiative from authority and makes failure recoverable.", MARGIN, 272, 560, 10.5, 14, MUTED, 80)
    steps = [
        ("01", "Queue", "Rank friction from health, cost, and reliability signals.", BLUE),
        ("02", "Branch", "Create an isolated change and record its intended outcome.", PURPLE),
        ("03", "Review", "Run independent deterministic and adversarial checks.", RED),
        ("04", "Deploy", "Merge, deploy, and verify the live production surface.", ORANGE),
        ("05", "Recover", "Revert unhealthy releases; feed failure into the next loop.", GREEN),
    ]
    x_positions = [36, 170, 304, 438, 572]
    for (number, heading, body, accent), x in zip(steps, x_positions):
        rect(canvas, x, 105, 112, 112, CARD, accent)
        text(canvas, number, x + 12, 195, 9, accent, FONT_BOLD)
        text(canvas, heading, x + 12, 175, 10.5, white, FONT_BOLD)
        paragraph(canvas, body, x + 12, 154, 88, 7.4, 10, MUTED, 16)
        if x < 572:
            text(canvas, ">", x + 121, 158, 13, BLUE_SOFT, FONT_BOLD, "center")
    rect(canvas, 36, 55, 648, 28, HexColor("#142849"))
    text(canvas, "The operating consequence: autonomous work can be fast without being opaque.", 360, 65, 10.2, white, FONT_BOLD, "center")


def page_recipe(canvas):
    """Close with a balanced two-column implementation recipe."""
    base(canvas, 6)
    kicker(canvas, "Stand it up", MARGIN, 342)
    title(canvas, "Build autonomy that stays accountable.", 54, 286, 25, 285)
    paragraph(canvas, "A portable operating model for teams that want more autonomy without losing evidence, ownership, or recovery.", 54, 182, 260, 11, 15, MUTED, 42)
    text(canvas, "A MINIMAL RECIPE", 390, 286, 9, BLUE, FONT_BOLD)
    recipe = [
        ("1", "Define lanes", "Give each agent a job, memory, manager, and authority."),
        ("2", "Make loops visible", "Design work, engineering, and reliability as closed loops."),
        ("3", "Separate initiative / authority", "Let agents prepare; reserve high-downside decisions."),
        ("4", "Leave evidence", "Leave heartbeats, review records, and deployment evidence."),
        ("5", "Expand carefully", "Expand only when reporting and recovery work."),
    ]
    y = 252
    for number, heading, body in recipe:
        text(canvas, number, 390, y, 10.5, BLUE, FONT_BOLD)
        text(canvas, heading, 420, y, 10.5, white, FONT_BOLD)
        text(canvas, body, 420, y - 13, 8.5, MUTED)
        rule(canvas, 390, y - 23, 674, y - 23, RULE)
        y -= 38
    text(canvas, "AI is available to everyone.", 54, 76, 15, BLUE_SOFT, FONT_REGULAR)
    text(canvas, "An operating system for it is not.", 54, 54, 15, white, FONT_BOLD)
    text(canvas, "romanbediner.com/resources/agentic-ai-employees", PAGE_W / 2, 30, 8.5, BLUE, FONT_REGULAR, "center")


def build():
    """Generate the complete six-page public field guide."""
    canvas = Canvas(str(OUTPUT), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
    canvas.setTitle("The Agentic Fleet Control Plane")
    canvas.setAuthor("Roman Bediner")
    canvas.setSubject("A public field guide to an accountable AI employee fleet with named roles, model routing, independent review, and recoverable execution.")
    canvas.setKeywords("agentic AI employees, AI agent fleet, multi-agent orchestration, model routing, autonomous code review, AI operating model")
    for page in [cover, page_layers, page_org, page_routing, page_run, page_recipe]:
        page(canvas)
        canvas.showPage()
    canvas.save()
    print(OUTPUT)


if __name__ == "__main__":
    build()
