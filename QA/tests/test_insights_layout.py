import re
import unittest
from pathlib import Path


class FrameworkLayoutTest(unittest.TestCase):
    """Validate Framework structure, refined content hierarchy, and visual contracts."""

    @classmethod
    def setUpClass(cls):
        cls.root = Path(__file__).resolve().parents[2]
        cls.framework_html = (cls.root / "framework/index.html").read_text(encoding="utf-8")
        cls.redirect_html = (cls.root / "insights/index.html").read_text(encoding="utf-8")
        cls.framework_css = (cls.root / "styles/framework.css").read_text(encoding="utf-8")

    def test_framework_has_six_sections_and_anchor_nav(self):
        section_ids = ["opportunity", "design", "integration", "execution", "signals", "evolution"]
        for section_id in section_ids:
            self.assertIn(f'id="{section_id}"', self.framework_html)
            self.assertIn(f'href="#{section_id}"', self.framework_html)

        self.assertEqual(self.framework_html.count('class="framework-section framework-card insight-card"'), 6)
        self.assertIn("<h1>The AI-Enabled Operations Framework</h1>", self.framework_html)
        self.assertIn(
            '<h2 class="framework-subtitle">Insights and Briefs on Productizing Operations for Modern AI-Enabled Work</h2>',
            self.framework_html,
        )

    def test_framework_section_heading_hierarchy_and_bullet_count(self):
        expected_h3 = {
            "opportunity": "Productizing Operations for Modern AI-Enabled Work",
            "design": "Operations as a Product for Scalable Execution",
            "integration": "Integrating AI as an Operating Layer",
            "execution": "Operational Lanes for Scalable Execution",
            "signals": "Steering Execution with Operational Signals",
            "evolution": "Designing Adaptive Guardrails for Agentic Work",
        }

        blocks = re.findall(
            r'<section id="([a-z-]+)" class="framework-section framework-card insight-card">([\s\S]*?)</section>',
            self.framework_html,
        )
        self.assertEqual(len(blocks), 6)

        for stage_id, block in blocks:
            self.assertIn(f'<h2 class="stage-label">{stage_id.capitalize()}</h2>', block)
            self.assertIn(f'<h3 class="stage-title">{expected_h3[stage_id]}</h3>', block)
            self.assertEqual(block.count("<li>"), 5, f"{stage_id} must contain exactly 5 bullets")

    def test_flow_arrows_only_between_sections(self):
        self.assertEqual(self.framework_html.count('class="framework-arrow framework-transition"'), 3)
        section_blocks = re.findall(r'<section id="[a-z-]+" class="framework-section framework-card insight-card">([\s\S]*?)</section>', self.framework_html)
        self.assertTrue(section_blocks)
        for block in section_blocks:
            self.assertNotIn('framework-arrow', block)

    def test_legacy_expand_collapse_removed(self):
        self.assertNotIn('insight-toggle', self.framework_html)
        self.assertNotIn('brief-content', self.framework_html)
        self.assertNotIn('insights-toggle.js', self.framework_html)

    def test_framework_css_readability_and_indicator_rules(self):
        self.assertRegex(self.framework_css, r"--framework-max-width:\s*860px;")
        self.assertRegex(self.framework_css, r"\.framework-progress-line\s*\{[^}]*height:\s*3px;[^}]*opacity:\s*0\.35;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-progress\s*\{[^}]*max-width:\s*700px;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-progress-markers span\s*\{[^}]*width:\s*10px;[^}]*height:\s*10px;[^}]*opacity:\s*0\.5;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-section\s*\{[^}]*margin:\s*0 0 64px 0;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-section ul\s*\{[^}]*line-height:\s*1\.6;[^}]*margin-top:\s*14px;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-section li\s*\{[^}]*margin-bottom:\s*10px;[^}]*max-width:\s*none;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-icon\s*\{[^}]*width:\s*(3[6-9]|40)px;[^}]*height:\s*(3[6-9]|40)px;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-icon\s*\{[^}]*position:\s*relative;[^}]*top:\s*-8px;", re.S)
        self.assertRegex(self.framework_css, r"#integration\s+\.framework-icon\s*\{[^}]*top:\s*-10px;", re.S)
        self.assertRegex(self.framework_css, r"#execution\s+\.framework-icon\s*\{[^}]*top:\s*-12px;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-header\s*\{[^}]*align-items:\s*center;[^}]*gap:\s*12px;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-pill\s*\{[^}]*margin-bottom:\s*8px;[^}]*font-weight:\s*600;[^}]*letter-spacing:\s*0\.04em;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-main \.executive-callout\s*\{[^}]*background:\s*#f6f8ff;[^}]*border-left:\s*3px solid #3b6cff;[^}]*padding:\s*20px;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-section h3\s*\{[^}]*margin-top:\s*6px;[^}]*margin-bottom:\s*14px;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-arrow svg\s*\{[^}]*stroke:\s*#3b6cff;[^}]*stroke-width:\s*2;[^}]*opacity:\s*0\.75;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-section\s*\{[^}]*padding:\s*32px;[^}]*border-radius:\s*12px;", re.S)
        self.assertRegex(self.framework_css, r"\.card-body\s*\{[^}]*max-width:\s*760px;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-transition\s*\{[^}]*margin:\s*28px 0;[^}]*display:\s*flex;[^}]*justify-content:\s*center;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-rail\s*\{[^}]*width:\s*2px;[^}]*background:\s*rgba\(80,\s*110,\s*255,\s*0\.15\);", re.S)

    def test_bottom_transition_targets_services(self):
        self.assertIn('href="/services/"', self.framework_html)
        self.assertIn("THE EXECUTION LAYER", self.framework_html)
        self.assertIn("Transition to Services →", self.framework_html)

    def test_icon_contract_black_structure_plus_blue_node(self):
        icons_dir = self.root / "assets/icons/framework"
        for icon_name in [
            "opportunity-network",
            "design-blueprint",
            "integration-merger",
            "execution-workflow",
            "signals-telemetry",
            "evolution-feedback",
        ]:
            png_path = icons_dir / f"{icon_name}.png"
            self.assertTrue(png_path.exists(), f"{icon_name}.png must exist in assets/icons/framework")

    def test_redirect_page_points_to_framework(self):
        self.assertIn('http-equiv="refresh"', self.redirect_html)
        self.assertIn('url=/framework/', self.redirect_html)
        self.assertIn('rel="canonical" href="https://romanbediner.com/framework/"', self.redirect_html)


if __name__ == "__main__":
    unittest.main()
