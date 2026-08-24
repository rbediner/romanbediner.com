"""Design kit for the Agentic Fleet Build Guide PDF.

Everything visual lives here so the page content stays readable prose. The
palette, type scale, and surface treatments are taken from romanbediner.com's
own tokens (styles/site.css) rather than approximated: Cormorant Garamond for
display, DM Sans for everything else, one accent blue on white.
"""

from pathlib import Path

from reportlab.lib.colors import HexColor, Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ---------------------------------------------------------------- geometry
W, H = 612.0, 792.0          # US Letter portrait, matching the web preview
M = 54.0                     # generous editorial margin
CW = W - 2 * M               # content width

# ------------------------------------------------------------------ colour
# Sourced from styles/site.css custom properties.
INK = HexColor("#111111")        # --text-color
MUTED = HexColor("#5B6675")
FAINT = HexColor("#8A94A3")
PAPER = HexColor("#FFFFFF")      # --bg-color
SURFACE = HexColor("#F6F7F8")    # --surface-color
CARD_MUTED = HexColor("#F8FAFC") # --surface-card-muted
ACCENT = HexColor("#2457D6")     # --accent-blue / --surface-accent
ACCENT_DEEP = HexColor("#16357F")
TINT = HexColor("#EFF3FF")       # rgba(59,108,255,.07) flattened on white
TINT_STRONG = HexColor("#DDE6FF")
BORDER = HexColor("#DFE4EC")     # rgba(43,72,122,.14) flattened on white
NAVY = HexColor("#0C1B33")
WHITE = HexColor("#FFFFFF")
OK = HexColor("#0F7B6C")
OK_TINT = HexColor("#E8F6F3")
WARN = HexColor("#B4531B")
WARN_TINT = HexColor("#FDF1E7")
STOP = HexColor("#A8323F")
STOP_TINT = HexColor("#FBEEF0")


def shadow_color(alpha):
    """Approximate the site's soft blue-grey elevation shadow."""
    return Color(15 / 255, 35 / 255, 70 / 255, alpha=alpha)


# ------------------------------------------------------------------- fonts
FONT_DIR = Path(__file__).resolve().parent / "fonts"
_FACES = {
    "display": "Cormorant-SemiBold",
    "display-light": "Cormorant-Light",
    "body": "DMSans-Regular",
    "medium": "DMSans-Medium",
    "bold": "DMSans-Bold",
}
DISPLAY = LIGHT = BODY = MEDIUM = BOLD = "Helvetica"
MONO = "Courier"


def register_fonts():
    """Embed the vendored brand faces; fall back only if a file is missing."""
    global DISPLAY, LIGHT, BODY, MEDIUM, BOLD
    loaded = {}
    for key, name in _FACES.items():
        path = FONT_DIR / f"{name}.ttf"
        if path.exists():
            pdfmetrics.registerFont(TTFont(name, str(path)))
            loaded[key] = name
    DISPLAY = loaded.get("display", "Helvetica-Bold")
    LIGHT = loaded.get("display-light", "Helvetica")
    BODY = loaded.get("body", "Helvetica")
    MEDIUM = loaded.get("medium", "Helvetica")
    BOLD = loaded.get("bold", "Helvetica-Bold")
    return loaded


# ------------------------------------------------------------------- text
def tw(value, size, font):
    """Measured width, so nothing in this document relies on guesswork."""
    return pdfmetrics.stringWidth(value, font, size)


def line(c, value, x, y, size=9.5, color=INK, font=None, align="left", tracking=0):
    """Draw one line. Letter-spacing needs a text object; Canvas has no setter."""
    font = font or BODY
    c.setFillColor(color)
    if tracking:
        width = tw(value, size, font) + tracking * max(len(value) - 1, 0)
        start = x - width / 2 if align == "center" else x - width if align == "right" else x
        t = c.beginText(start, y)
        t.setFont(font, size)
        t.setFillColor(color)
        t.setCharSpace(tracking)
        t.textOut(value)
        # Tc lives in the page graphics state and is NOT reset by drawString,
        # so an un-reset text object silently letter-spaces the whole page.
        t.setCharSpace(0)
        c.drawText(t)
        return
    c.setFont(font, size)
    if align == "center":
        c.drawCentredString(x, y, value)
    elif align == "right":
        c.drawRightString(x, y, value)
    else:
        c.drawString(x, y, value)


def wrap(value, width, size, font=None):
    font = font or BODY
    words, lines, cur = value.split(), [], ""
    for word in words:
        cand = f"{cur} {word}".strip()
        if cur and tw(cand, size, font) > width:
            lines.append(cur)
            cur = word
        else:
            cur = cand
    if cur:
        lines.append(cur)
    return lines


def para(c, value, x, y, width, size=9.4, leading=14.2, color=MUTED, font=None):
    """Draw a wrapped paragraph and return the next free baseline."""
    font = font or BODY
    for ln in wrap(value, width, size, font):
        line(c, ln, x, y, size, color, font)
        y -= leading
    return y


def eyebrow(c, value, x, y, color=ACCENT, size=7.4):
    """Small tracked-out label. The site uses these above every section."""
    line(c, value.upper(), x, y, size, color, BOLD, tracking=1.3)


def display(c, value, y, size=30, width=CW, color=INK, leading_ratio=1.06, x=M):
    """Large Cormorant heading, the single strongest brand signal."""
    for ln in wrap(value, width, size, DISPLAY):
        line(c, ln, x, y, size, color, DISPLAY)
        y -= size * leading_ratio
    return y


# --------------------------------------------------------------- surfaces
def shadow(c, x, y, w, h, r=10, spread=3.0, layers=5):
    """Fake the site's soft elevation with stacked translucent rounded rects."""
    for i in range(layers, 0, -1):
        grow = spread * i / layers
        c.setFillColor(shadow_color(0.030))
        c.roundRect(x - grow, y - grow - 1.2, w + 2 * grow, h + 2 * grow, r + grow,
                    fill=1, stroke=0)


def card(c, x, y, w, h, fill=WHITE, border=BORDER, r=10, elevate=True, accent=None):
    """The site's card surface: white, hairline border, soft shadow."""
    if elevate:
        shadow(c, x, y, w, h, r)
    c.setFillColor(fill)
    c.setStrokeColor(border)
    c.setLineWidth(0.7)
    c.roundRect(x, y, w, h, r, fill=1, stroke=1)
    if accent:
        c.saveState()
        p = c.beginPath()
        p.roundRect(x, y, w, h, r)
        c.clipPath(p, stroke=0)
        c.setFillColor(accent)
        c.rect(x, y, 3.0, h, fill=1, stroke=0)
        c.restoreState()


def hairline(c, x1, y, x2, color=BORDER, width=0.7):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x1, y, x2, y)


def pill(c, value, x, y, color=ACCENT, fill=TINT, size=7.2, pad=7, height=15):
    """Small status/label chip."""
    w = tw(value.upper(), size, BOLD) + 2 * pad
    c.setFillColor(fill)
    c.setStrokeColor(fill)
    c.roundRect(x, y, w, height, height / 2, fill=1, stroke=0)
    line(c, value.upper(), x + pad, y + 4.6, size, color, BOLD, tracking=0.7)
    return w


# ------------------------------------------------------------ page chrome
def chrome(c, page, kicker, tone=ACCENT):
    """Shared page furniture: paper, running eyebrow, footer rule and folio."""
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(tone)
    c.rect(M, H - 52, 26, 2.4, fill=1, stroke=0)
    eyebrow(c, kicker, M, H - 70, tone)
    hairline(c, M, 40, W - M)
    line(c, f"{page:02d}", M, 26, 7.6, FAINT, BOLD, tracking=0.6)
    line(c, "Roman Bediner   ·   romanbediner.com", W - M, 26, 7.6, FAINT, align="right")


def opener(c, page, kicker, title, deck=None, tone=ACCENT, size=30):
    """Start a page and return the baseline where its body may begin."""
    chrome(c, page, kicker, tone)
    y = display(c, title, H - 108, size)
    if deck:
        y = para(c, deck, M, y - 8, CW - 40, 10.2, 15.2, MUTED)
    return y


# ------------------------------------------------------------- components
def step_header(c, number, label, title, y, tone=ACCENT):
    """The numbered session marker that makes this guide a sequence."""
    c.setFillColor(tone)
    c.circle(M + 13, y + 4, 13, fill=1, stroke=0)
    line(c, str(number), M + 13, y + 0.4, 11, WHITE, BOLD, "center")
    eyebrow(c, label, M + 34, y + 10, tone)
    line(c, title, M + 34, y - 5, 13.5, INK, BOLD)
    return y - 26


def do_this(c, x, y, w, lines_, label="DO THIS", tone=ACCENT):
    """A literal, copyable instruction block. The spine of the whole guide."""
    lh, pad = 11.6, 13
    h = 26 + len(lines_) * lh + 11
    card(c, x, y - h, w, h, CARD_MUTED, BORDER, 9, elevate=False, accent=tone)
    eyebrow(c, label, x + pad, y - 17, tone, 6.9)
    b = y - 33
    for ln in lines_:
        line(c, ln, x + pad, b, 7.9, INK, MONO)
        b -= lh
    return y - h


def you_should_see(c, x, y, w, items, label="YOU SHOULD SEE", tone=OK, fill=OK_TINT):
    """Every step ends with a checkable result, never just 'done'."""
    pad = 13
    inner = w - 2 * pad - 12
    height = 26
    wrapped = [wrap(i, inner, 8.4) for i in items]
    height += sum(len(x_) * 11.4 for x_ in wrapped) + 6 * len(items)
    card(c, x, y - height, w, height, fill, fill, 9, elevate=False)
    eyebrow(c, label, x + pad, y - 17, tone, 6.9)
    b = y - 33
    for group in wrapped:
        c.setFillColor(tone)
        c.circle(x + pad + 3, b + 3, 2.2, fill=1, stroke=0)
        for ln in group:
            line(c, ln, x + pad + 12, b, 8.4, INK)
            b -= 11.4
        b -= 6
    return y - height


def bullets(c, items, x, y, width, size=8.9, leading=12.4, tone=ACCENT, color=INK, gap=5):
    for item in items:
        c.setFillColor(tone)
        c.circle(x + 2.4, y + 3.2, 2.2, fill=1, stroke=0)
        y = para(c, item, x + 12, y, width - 12, size, leading, color) - gap
    return y


def table(c, headers, rows, x, y, widths, row_h=30, head_h=24, zebra=True,
          tone=NAVY, size=7.9):
    """Compact reference table with the site's hairline treatment."""
    total = sum(widths)
    c.setFillColor(tone)
    c.roundRect(x, y - head_h, total, head_h, 6, fill=1, stroke=0)
    c.setFillColor(tone)
    c.rect(x, y - head_h, total, 6, fill=1, stroke=0)
    cx = x
    for head, w in zip(headers, widths):
        line(c, head.upper(), cx + 9, y - head_h + 8.6, 6.8, WHITE, BOLD, tracking=0.8)
        cx += w
    b = y - head_h
    for i, row in enumerate(rows):
        h = row_h
        c.setFillColor(CARD_MUTED if (zebra and i % 2) else WHITE)
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.6)
        c.rect(x, b - h, total, h, fill=1, stroke=1)
        cx = x
        for j, (val, w) in enumerate(zip(row, widths)):
            f = BOLD if j == 0 else BODY
            col = INK if j == 0 else MUTED
            ls = wrap(val, w - 18, size, f)
            ty = b - 12
            for ln in ls[:3]:
                line(c, ln, cx + 9, ty, size, col, f)
                ty -= 9.4
            cx += w
        b -= h
    return b


# ---------------------------------------------------------------- diagrams
def node(c, x, y, w, h, title, sub=None, fill=WHITE, border=ACCENT, tone=INK, r=8,
         title_size=8.6):
    card(c, x, y, w, h, fill, border, r, elevate=False)
    if sub:
        ty = y + h - 17
        for ln in wrap(title, w - 16, title_size, BOLD)[:2]:
            line(c, ln, x + w / 2, ty, title_size, tone, BOLD, "center")
            ty -= 10.2
        for ln in wrap(sub, w - 14, 7.1)[:2]:
            line(c, ln, x + w / 2, ty - 1, 7.1, MUTED, BODY, "center")
            ty -= 8.6
    else:
        lines_ = wrap(title, w - 16, title_size, BOLD)[:2]
        ty = y + h / 2 + (len(lines_) - 1) * 5.2 - 3
        for ln in lines_:
            line(c, ln, x + w / 2, ty, title_size, tone, BOLD, "center")
            ty -= 10.4


def diamond(c, cx, cy, w, h, label, fill=WARN_TINT, border=WARN):
    p = c.beginPath()
    p.moveTo(cx, cy + h / 2)
    p.lineTo(cx + w / 2, cy)
    p.lineTo(cx, cy - h / 2)
    p.lineTo(cx - w / 2, cy)
    p.close()
    c.setFillColor(fill)
    c.setStrokeColor(border)
    c.setLineWidth(0.9)
    c.drawPath(p, fill=1, stroke=1)
    ls = wrap(label, w - 26, 7.4, BOLD)[:2]
    ty = cy + (len(ls) - 1) * 4.4 - 2
    for ln in ls:
        line(c, ln, cx, ty, 7.4, INK, BOLD, "center")
        ty -= 8.8


def arrow(c, x1, y1, x2, y2, color=ACCENT, label=None, width=1.0, dashed=False,
          label_side="above"):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    if dashed:
        c.setDash(2.4, 2.4)
    c.line(x1, y1, x2, y2)
    c.setDash()
    import math
    ang = math.atan2(y2 - y1, x2 - x1)
    size = 4.6
    p = c.beginPath()
    p.moveTo(x2, y2)
    p.lineTo(x2 - size * math.cos(ang - 0.42), y2 - size * math.sin(ang - 0.42))
    p.lineTo(x2 - size * math.cos(ang + 0.42), y2 - size * math.sin(ang + 0.42))
    p.close()
    c.setFillColor(color)
    c.drawPath(p, fill=1, stroke=0)
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        off = 5.5 if label_side == "above" else -11
        line(c, label, mx, my + off, 6.8, color, BOLD, "center")


# ============================================================ NC Courage diagrams
# The `.wb` diagram language from the NC Courage portal, ported to reportlab:
# navy boxes with white titles and pale-blue sublines, gold flow arrows, and a
# red dashed break path carrying ONE red monospace annotation that states the
# takeaway. Four to eight boxes. One story, never an IKEA manual.
WB_NAVY = HexColor("#0C2340")
WB_SUB = HexColor("#C9D2DE")
WB_GOLD = HexColor("#C6A24C")
WB_RED = HexColor("#C10E2B")
WB_RED_WASH = HexColor("#FDF0F2")


def wb_box(c, x, y, w, h, title, sub=None, fill=WB_NAVY, border=None, title_color=WHITE,
           sub_color=WB_SUB, dashed=False, title_size=9.0, sub_size=7.4):
    """One diagram box. Raises if its own text will not fit inside its rect."""
    c.setFillColor(fill)
    c.setStrokeColor(border or fill)
    c.setLineWidth(1.1)
    if dashed:
        c.setDash(3.0, 2.4)
    c.roundRect(x, y, w, h, 6, fill=1, stroke=1)
    c.setDash()

    inner = w - 18
    tlines = wrap(title, inner, title_size, BOLD)
    slines = wrap(sub, inner, sub_size, BODY) if sub else []
    need = len(tlines) * (title_size + 2.4) + (len(slines) * (sub_size + 2.2) if slines else 0)
    if need > h - 10:
        raise ValueError(f"wb_box text does not fit: {title!r} needs {need:.1f}pt in {h:.1f}pt")
    for ln in tlines + slines:
        if tw(ln, title_size if ln in tlines else sub_size,
              BOLD if ln in tlines else BODY) > inner:
            raise ValueError(f"wb_box line overflows its rect: {ln!r}")

    ty = y + h / 2 + need / 2 - title_size
    for ln in tlines:
        line(c, ln, x + w / 2, ty, title_size, title_color, BOLD, "center")
        ty -= title_size + 2.4
    for ln in slines:
        line(c, ln, x + w / 2, ty + 1.5, sub_size, sub_color, BODY, "center")
        ty -= sub_size + 2.2


def wb_arrow(c, x1, y1, x2, y2, color=WB_GOLD, label=None, dashed=False, width=1.6,
             label_offset=7):
    """Gold flow arrow, or a red dashed break. Marker-end, like the portal SVGs."""
    import math
    c.setStrokeColor(color)
    c.setLineWidth(width)
    if dashed:
        c.setDash(3.4, 2.6)
    ang = math.atan2(y2 - y1, x2 - x1)
    head = 6.2
    c.line(x1, y1, x2 - head * 0.72 * math.cos(ang), y2 - head * 0.72 * math.sin(ang))
    c.setDash()
    p = c.beginPath()
    p.moveTo(x2, y2)
    p.lineTo(x2 - head * math.cos(ang - 0.40), y2 - head * math.sin(ang - 0.40))
    p.lineTo(x2 - head * math.cos(ang + 0.40), y2 - head * math.sin(ang + 0.40))
    p.close()
    c.setFillColor(color)
    c.drawPath(p, fill=1, stroke=0)
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        horizontal = abs(y2 - y1) < abs(x2 - x1)
        lx = mx if horizontal else mx + 15
        ly = my + label_offset if horizontal else my
        line(c, label, lx, ly, 6.9, color, BOLD, "center" if horizontal else "left")


def wb_note(c, value, x, y, width):
    """The single red monospace annotation. It is the takeaway, so keep it >=11px
    equivalent and strictly inside bounds."""
    lines_ = wrap(value, width, 8.0, MONO)
    for ln in lines_:
        line(c, ln, x, y, 8.0, WB_RED, MONO)
        y -= 11.0
    return y


def wb_legend(c, items, x, y, width):
    """Small keyed legend, the way the portal architecture diagrams close."""
    hairline(c, x, y + 13, x + width, BORDER)
    cx = x
    for kind, label in items:
        if kind == "gold":
            wb_arrow(c, cx, y, cx + 20, y, WB_GOLD, width=1.4)
        elif kind == "red":
            wb_arrow(c, cx, y, cx + 20, y, WB_RED, dashed=True, width=1.4)
        elif kind == "navy":
            c.setFillColor(WB_NAVY)
            c.roundRect(cx, y - 4, 20, 9, 2, fill=1, stroke=0)
        else:
            c.setFillColor(WHITE)
            c.setStrokeColor(WB_RED)
            c.setLineWidth(1.0)
            c.setDash(2.6, 2.0)
            c.roundRect(cx, y - 4, 20, 9, 2, fill=1, stroke=1)
            c.setDash()
        line(c, label, cx + 26, y - 2.6, 7.2, MUTED)
        cx += 26 + tw(label, 7.2, BODY) + 22


def wb_elbow(c, x1, y1, x2, y2, color=WB_GOLD, width=1.6, label=None):
    """Down, across, then down into the next row - so a wrapped flow still reads
    into the START of the next row rather than into its end."""
    mid = (y1 + y2) / 2
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x1, y1, x1, mid)
    c.line(x1, mid, x2, mid)
    wb_arrow(c, x2, mid, x2, y2, color, width=width)
    if label:
        line(c, label, (x1 + x2) / 2, mid + 6, 6.9, color, BOLD, "center")
