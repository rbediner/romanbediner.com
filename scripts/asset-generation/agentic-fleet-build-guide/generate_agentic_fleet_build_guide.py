"""Generate the public Agentic Fleet Build Guide PDF.

This is a step-by-step user guide, not a reference encyclopedia. A reader who has
never built an agent should be able to open it beside a build assistant and be
walked from nothing to one agent that runs on a schedule while they sleep,
records what it did, refuses to do it twice, and can be stopped.

Every page answers three questions in order: what you are doing, exactly what to
do, and how you check that it worked. Design language is taken from
romanbediner.com's own tokens - Cormorant Garamond display, DM Sans body, one
accent blue on white.
"""

from pathlib import Path

from reportlab.pdfgen.canvas import Canvas

from kit import (
    W, H, M, CW,
    INK, MUTED, FAINT, PAPER, SURFACE, CARD_MUTED, ACCENT, ACCENT_DEEP, TINT,
    TINT_STRONG, BORDER, NAVY, WHITE, OK, OK_TINT, WARN, WARN_TINT, STOP, STOP_TINT,
    register_fonts, line, wrap, para, eyebrow, display, card, hairline, pill,
    chrome, opener, step_header, do_this, you_should_see, bullets, table,
    node, diamond, arrow, shadow, tw,
)
import kit

ROOT = Path(__file__).resolve().parents[3]
import os
# While the rewrite is in progress, GUIDE_OUT can redirect the build to a staging
# path so the live downloadable artifact is never left half-written.
OUTPUT = Path(os.environ.get("GUIDE_OUT") or
              (ROOT / "assets" / "downloads" / "agentic-fleet-build-guide-roman-bediner.pdf"))
OUTPUT.parent.mkdir(parents=True, exist_ok=True)


# =========================================================== 01  cover
def p01_cover(c):
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # A quiet grid motif: the run ledger, abstracted.
    c.setStrokeColor(kit.Color(1, 1, 1, alpha=0.06))
    c.setLineWidth(0.6)
    for i in range(14):
        c.line(M, H - 250 - i * 15, W - M, H - 250 - i * 15)

    c.setFillColor(ACCENT)
    c.rect(M, H - 96, 34, 3, fill=1, stroke=0)
    line(c, "FREE BUILD GUIDE", M, H - 118, 8.4, kit.HexColor("#8FB0FF"), kit.BOLD,
         tracking=1.6)

    y = display(c, "Build your first", H - 196, 46, CW - 30, WHITE, 1.02)
    y = display(c, "AI employee", y, 46, CW - 30, kit.HexColor("#8FB0FF"), 1.02)

    para(c,
         "A step-by-step guide to one agent that runs on a schedule while you sleep, "
         "proves what it did, refuses to do it twice, and stops when you tell it to.",
         M, y - 16, 430, 13.2, 19.4, kit.HexColor("#C6D2E6"))

    c.setFillColor(kit.Color(1, 1, 1, alpha=0.07))
    c.roundRect(M, 168, CW, 118, 10, fill=1, stroke=0)
    line(c, "WHAT YOU WILL HAVE AT THE END", M + 22, 258, 7.2,
         kit.HexColor("#8FB0FF"), kit.BOLD, tracking=1.2)
    outcomes = [
        "One agent, live in the cloud, running on its own schedule",
        "Proof of every run it made, including the runs that failed",
        "A stop button, and a canary that keeps it away from customers",
    ]
    b = 238
    for item in outcomes:
        c.setFillColor(ACCENT)
        c.circle(M + 25, b + 3, 2.4, fill=1, stroke=0)
        line(c, item, M + 36, b, 9.4, kit.HexColor("#E4EBF6"))
        b -= 19

    hairline(c, M, 128, W - M, kit.Color(1, 1, 1, alpha=0.16))
    line(c, "NINE SESSIONS  ·  24 PAGES  ·  NO PRIOR EXPERIENCE ASSUMED", M, 104,
         8.6, WHITE, kit.BOLD, tracking=1.1)
    line(c, "Roman Bediner   ·   romanbediner.com/resources/agentic-ai-employees",
         M, 74, 8.8, kit.HexColor("#8FB0FF"))


# =========================================================== 02  how to use
def p02_how_to_use(c):
    chrome(c, 2, "How to use this guide")
    y = display(c, "Nine sessions. One at a time.", H - 106, 30)
    y = para(c,
             "Open this beside a build assistant such as Claude, and work one session per "
             "sitting. Each one ends with something you can check with your own eyes. Do not "
             "read ahead and do not batch them: the order is what keeps the agent safe.",
             M, y - 8, CW - 30, 10.2, 15.2)

    y -= 14
    sessions = [
        ("0", "The interview", "p.4", "Answer ten plain questions. Nothing gets built."),
        ("1-2", "Plan and paperwork", "p.6", "Agree what it does before any code exists."),
        ("3", "Accounts and keys", "p.8", "Your turn. The only step you do alone."),
        ("4", "The empty run", "p.9", "Deploy something that does nothing, on a schedule."),
        ("5", "The four controls", "p.13", "Claim, ceiling, record, stop button."),
        ("6-7", "The real job, then break it", "p.18", "Confined output, then deliberate failure."),
        ("8-9", "Gate it and promote it", "p.20", "Make the rules mechanical, then widen the audience."),
    ]
    top = y
    for i, (num, title, page, note) in enumerate(sessions):
        row_y = top - i * 41
        card(c, M, row_y - 32, CW, 33, WHITE, BORDER, 8, elevate=False,
             accent=ACCENT if i < 5 else kit.HexColor("#7C8DB5"))
        line(c, num, M + 18, row_y - 15, 11.5, ACCENT, kit.BOLD)
        line(c, title, M + 62, row_y - 15, 10.4, INK, kit.BOLD)
        line(c, note, M + 212, row_y - 15, 8.6, MUTED)
        line(c, page, W - M - 16, row_y - 15, 8, FAINT, kit.BOLD, "right")

    box_y = 92
    card(c, M, box_y, CW, 112, TINT, TINT_STRONG, 10, elevate=False)
    eyebrow(c, "If you build only four things, build these", M + 20, box_y + 90)
    four = [
        "A claim written before it acts, so it cannot run twice",
        "A declared limit on how far and how loud one run can go",
        "A record of every run, and one separate job that reads them",
        "A stop button that parks this agent without a deploy",
    ]
    b = box_y + 68
    for i, item in enumerate(four):
        line(c, f"0{i + 1}", M + 20, b, 8.2, ACCENT, kit.BOLD)
        line(c, item, M + 42, b, 8.9, INK)
        b -= 16


# =========================================================== 03  autonomous
def p03_autonomous(c):
    y = opener(c, 3, "First, the word itself",
               "What “autonomous” actually means",
               "Most people who say they built an agent built a chat window they still have to "
               "open. An autonomous agent is different in four specific, checkable ways. If any "
               "one of these is missing, you have an assistant, not an employee.", ACCENT)

    y -= 16
    reqs = [
        ("It starts without you", "A schedule or an event fires it. Nobody opens a tab, "
         "nobody types a prompt, nobody remembers."),
        ("It runs somewhere else", "On a cloud machine that is awake when your laptop is "
         "shut. If it only runs on your computer, it stops when you close it."),
        ("It leaves proof", "Every run writes a record: what it read, what it did, what it "
         "delivered, and what went wrong. You can answer “what happened at 6am?”"),
        ("It can be stopped", "One switch parks it without a deploy, and the difference "
         "between parked, broken and healthy is visible."),
    ]
    colw = (CW - 16) / 2
    for i, (title, body) in enumerate(reqs):
        cx = M + (i % 2) * (colw + 16)
        cy = y - (i // 2) * 96 - 84
        card(c, cx, cy, colw, 84, WHITE, BORDER, 9)
        line(c, f"0{i + 1}", cx + 15, cy + 62, 8, ACCENT, kit.BOLD, tracking=0.8)
        line(c, title, cx + 15, cy + 45, 10.6, INK, kit.BOLD)
        para(c, body, cx + 15, cy + 31, colw - 30, 8.3, 11.2, MUTED)

    ty = y - 210
    table(c,
          ["", "A chat assistant", "An autonomous agent"],
          [["Starts", "You open it and type", "A cron schedule fires it at 06:00"],
           ["Runs on", "Your laptop, while you watch", "A cloud function, while you sleep"],
           ["Evidence", "Scrollback you will lose", "A run record you can query"],
           ["Failure", "You notice, eventually", "It alerts a named person, same day"],
           ["Stopping", "Close the tab", "A switch that parks it and says so"]],
          M, ty, [86, 200, CW - 286], row_h=27)

    hairline(c, M, 118, W - M)
    para(c, "The rest of this guide is how you get each of those four properties, in the "
            "order that makes them safe. The single most common failure is building the "
            "clever part first and the evidence last, which produces an agent nobody can "
            "trust and nobody can debug.",
         M, 102, CW - 20, 9.2, 13.4, MUTED)


# =========================================================== 04  session 0
def p04_interview(c):
    chrome(c, 4, "Session 0")
    y = step_header(c, 0, "SESSION ZERO  ·  20 MINUTES", "Let it interview you", H - 118)
    y = para(c,
             "You do not need to know what to build in technical terms. Download the Agent "
             "Builder Starter Prompt, paste the whole thing into your build assistant, and "
             "answer its questions in plain English. It fills in the technical contract itself.",
             M, y - 6, CW - 30, 9.8, 14.6)

    y = do_this(c, M, y - 14, CW, [
        "1.  Open romanbediner.com/resources/agentic-ai-employees",
        "2.  Download 'Agent Builder Starter Prompt' (a .md text file)",
        "3.  Open Claude, ChatGPT, or your build assistant of choice",
        "4.  Paste the ENTIRE file as your first message",
        "5.  Answer the questions it asks, one at a time",
    ], "DO THIS FIRST")

    y = you_should_see(c, M, y - 14, CW, [
        "A reply under six lines that introduces itself and asks ONE question.",
        "No summary of the prompt, no lecture, no list of everything it plans to do.",
        "If it dumps a wall of text or asks five questions at once, say: "
        "“Re-read YOUR FIRST REPLY and try again.”",
    ])

    y -= 18
    eyebrow(c, "What it will ask you", M, y)
    y -= 16
    qs = [
        "What repetitive job do you want off your plate, and who does it today?",
        "Walk me through how they do it now, step by step.",
        "Where does the information come from? Name the system.",
        "What does the finished thing look like, and where does it need to land?",
        "Who checks it before it counts as done?",
        "How often should it run, and what breaks if it ran twice one morning?",
        "Who is allowed to see the output? Could it ever reach a customer?",
        "What must it never do, even when that would seem helpful?",
        "If it misbehaves overnight, who notices and what can they do?",
        "What do you want to call it?",
    ]
    colw = (CW - 18) / 2
    for i, q in enumerate(qs):
        cx = M + (i % 2) * (colw + 18)
        cy = y - (i // 2) * 25
        line(c, f"{i + 1:02d}", cx, cy, 7.6, ACCENT, kit.BOLD)
        para(c, q, cx + 17, cy, colw - 20, 8.2, 10.4, MUTED)

    card(c, M, 66, CW, 52, WARN_TINT, WARN_TINT, 9, elevate=False)
    eyebrow(c, "There are no wrong answers here", M + 18, 102, WARN)
    para(c, "“I don't know” is a valid answer to any of these. It will tell you what it "
            "would assume instead, and mark that row ASSUMED so you can see it later.",
         M + 18, 88, CW - 36, 8.6, 11.4, INK)


def main():
    register_fonts()
    c = Canvas(str(OUTPUT), pagesize=(W, H), pageCompression=1)
    c.setTitle("Agentic Fleet Build Guide")
    c.setAuthor("Roman Bediner")
    c.setSubject("A step-by-step guide to building one autonomous cloud AI employee")
    for maker in PAGES:
        maker(c)
        c.showPage()
    c.save()
    print(f"Wrote {OUTPUT} ({len(PAGES)} pages)")


from pages_b import (
    p05_contract, p06_plan, p07_paperwork, p08_keys, p09_empty_run,
    p10_run_diagram, p11_cron, p12_dst, p13_claim, p14_ceiling,
)
from pages_c import (
    p15_observability, p16_alert_diagram, p17_stop, p18_canary, p19_break_it,
    p20_self_healing, p21_gate, p22_promotion, p23_memory, p24_next,
)

PAGES = [
    p01_cover, p02_how_to_use, p03_autonomous, p04_interview,
    p05_contract, p06_plan, p07_paperwork, p08_keys, p09_empty_run,
    p10_run_diagram, p11_cron, p12_dst, p13_claim, p14_ceiling,
    p15_observability, p16_alert_diagram, p17_stop, p18_canary, p19_break_it,
    p20_self_healing, p21_gate, p22_promotion, p23_memory, p24_next,
]

if __name__ == "__main__":
    main()
