# Roman Bediner diagram style

This is the required website style for blog diagrams. Inspect `assets/blog/company-brain-team.svg`, `assets/blog/community-loop.svg`, `styles/blog.css` and the actual page before drawing. The topic changes; the visual system remains continuous with the site.

## Typography and surface

- Cormorant Garamond for diagram titles and principal labels; DM Sans for captions, supporting labels and controls. The blog generator maps SVG source fonts onto the loaded site font classes. Check the actual computed font in the browser; fallback artwork alone is insufficient.
- Paper `#FCFBF3`, subtle grid `#EEF1E6`, white panels, line `#DCE3EA`, ink `#16222E` and muted text `#5B6B7A`.
- Blue `#104275` and navy `#0B2E52` mean structure or flow; gold `#B7A369` means human authority/decision; red `#AB1D37` means independent review or risk. Green is reserved for a genuinely verified health/production state.
- Thin borders, restrained 8–12px radii and generous internal space. Use meaningful labels rather than decorative emojis, repeated icons or a new illustration style. Do not import the source publisher's visual design.

## Meaning and legibility

Explain the article's actual argument. Keep labels short without inventing outcomes or operating mechanisms. Distinguish reporting, review, decisions and feedback with clear labeled paths. Common memory/state must visibly cover all actual consumers, using one shared layer/enclosure when many arrows would be cluttered.

Measure text with the loaded website fonts. Keep labels inside their panels and leave a visible gap between multiline title bounds; test at least8px for deliberately separated title lines. Caption illustrative examples accurately. Each SVG has a title, description, role and useful accessible label.

## Website behavior and acceptance

Use the existing blog diagram wrapper and runtime. The inline diagram fits its frame at phone widths without internal horizontal scrolling. Keep the visible site-style Expand to full screen button. Expanded viewing supports real two-finger pinch in/out, pan, Zoom controls, Fit, keyboard access and Close/Escape with focus and page-scroll restoration.

Inspect desktop and phone screenshots, all label bounds, connector semantics and frame overflow. Exercise actual touch gestures. A page-level overflow check or a screenshot of a different diagram cannot establish this diagram's acceptance.
