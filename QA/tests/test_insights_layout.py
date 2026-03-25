import re
import unittest
from pathlib import Path


class FrameworkLayoutTest(unittest.TestCase):
    """Validate framework hub + brief placeholder route contracts."""

    @classmethod
    def setUpClass(cls):
        cls.root = Path(__file__).resolve().parents[2]
        cls.framework_html = (cls.root / "framework/index.html").read_text(encoding="utf-8")
        cls.framework_css = (cls.root / "styles/framework.css").read_text(encoding="utf-8")

        cls.stages = [
            {
                "id": "opportunity",
                "label": "Opportunity",
                "title": "Productizing Operations for Modern AI-Enabled Work",
                "brief": "/framework/opportunity/productizing-operations/",
                "next": "/framework/design/operations-as-product/",
            },
            {
                "id": "design",
                "label": "Design",
                "title": "Operations as a Product for Scalable Execution",
                "brief": "/framework/design/operations-as-product/",
                "next": "/framework/integration/ai-operating-layer/",
            },
            {
                "id": "integration",
                "label": "Integration",
                "title": "Integrating AI as an Operating Layer",
                "brief": "/framework/integration/ai-operating-layer/",
                "next": "/framework/execution/operational-lanes/",
            },
            {
                "id": "execution",
                "label": "Execution",
                "title": "Operational Lanes for Scalable Execution",
                "brief": "/framework/execution/operational-lanes/",
                "next": "/framework/signals/operational-signals/",
            },
            {
                "id": "signals",
                "label": "Signals",
                "title": "Steering Execution with Operational Signals",
                "brief": "/framework/signals/operational-signals/",
                "next": "/framework/evolution/agentic-guardrails/",
            },
            {
                "id": "evolution",
                "label": "Evolution",
                "title": "Designing Adaptive Guardrails for Agentic Work",
                "brief": "/framework/evolution/agentic-guardrails/",
                "next": "/framework/opportunity/productizing-operations/",
            },
        ]

    def test_framework_header_and_thesis_contract(self):
        self.assertIn('<p class="framework-label">FRAMEWORK</p>', self.framework_html)
        self.assertIn('<h1>The AI-Enabled Operations Framework</h1>', self.framework_html)
        self.assertIn(
            '<h2 class="framework-subtitle">Insights and Briefs on Productizing Operations for Modern AI-Enabled Work</h2>',
            self.framework_html,
        )
        self.assertIn('class="executive-callout framework-intro-block framework-thesis-block"', self.framework_html)
        self.assertIn('Modern organizations rarely struggle with strategy.', self.framework_html)
        self.assertIn('They stall when execution fragments across teams, tools, and decision layers.', self.framework_html)
        self.assertRegex(
            self.framework_html,
            r'<ul class="service-list">\s*<li>Design operations as a system</li>\s*<li>Integrate AI directly into execution</li>\s*<li>Evolve operating models as automation expands</li>',
            re.S,
        )

    def test_framework_cards_remain_vertical_with_links(self):
        blocks = re.findall(
            r'<section id="([a-z-]+)" data-stage="([a-z-]+)" class="framework-section framework-card insight-card">([\s\S]*?)</section>',
            self.framework_html,
        )
        self.assertEqual(len(blocks), 6)
        self.assertEqual(self.framework_html.count('class="framework-arrow framework-transition"'), 5)
        self.assertNotIn('class="framework-stage-nav"', self.framework_html)
        self.assertIn('class="framework-progress framework-diagram"', self.framework_html)
        self.assertIn('href="#opportunity"', self.framework_html)
        self.assertIn('href="#evolution"', self.framework_html)
        self.assertIn('<script src="/scripts/runtime/framework-stage-nav.js"></script>', self.framework_html)
        self.assertNotIn('class="stage-label"', self.framework_html)

        for index, (stage_id, data_stage, block) in enumerate(blocks):
            stage = self.stages[index]
            self.assertEqual(stage_id, stage["id"])
            self.assertEqual(data_stage, stage["id"])
            self.assertIn(
                f'<span class="framework-pill stage-pill badge-phase stage-{stage_id}">{stage["label"]}</span>',
                block,
            )
            self.assertIn(
                f'<h3 class="stage-title"><a class="framework-title-link" href="{stage["brief"]}">{stage["title"]}</a></h3>',
                block,
            )
            self.assertIn(f'<a class="framework-brief-band" href="{stage["brief"]}"', block)
            self.assertIn('class="service-list"', block)
            self.assertEqual(block.count('<li>'), 5)
            self.assertNotIn('framework-arrow', block)

    def test_brief_pages_content_and_next_stage_contract(self):
        for stage in self.stages:
            file_path = self.root / stage["brief"].strip("/") / "index.html"
            self.assertTrue(file_path.exists(), f"Missing brief page: {stage['brief']}")
            html = file_path.read_text(encoding="utf-8")

            self.assertIn('<p class="framework-label">FRAMEWORK</p>', html)
            self.assertIn(
                f'<span class="framework-pill stage-pill badge-phase stage-{stage["id"]}">{stage["label"]}</span>',
                html,
            )
            self.assertIn(f'<h1>{stage["title"]}</h1>', html)
            self.assertIn('class="framework-progress framework-diagram"', html)
            self.assertIn(f'<span class="badge-phase framework-diagram-pill current-stage stage-{stage["id"]}">{stage["label"]}</span>', html)
            self.assertNotRegex(html, r'class="[^"]*current-stage[^"]*" href=')
            self.assertEqual(html.count('class="framework-progress-marker"'), 6)
            if stage["id"] in {"opportunity", "design", "integration", "execution"}:
                self.assertIn('class="framework-brief-article"', html)
                if stage["id"] == "opportunity":
                    self.assertIn('<h2>What starts to break first</h2>', html)
                elif stage["id"] == "integration":
                    self.assertIn('<h2>Integration Maturity</h2>', html)
                elif stage["id"] == "execution":
                    self.assertIn('<h2>Lane Anatomy (Structured View)</h2>', html)
                else:
                    self.assertIn('<h2>What operational design makes explicit</h2>', html)
                if stage["id"] == "integration":
                    self.assertIn('class="brief-section integration-maturity"', html)
                else:
                    self.assertIn('class="brief-section brief-inset-list-section"', html)
                self.assertIn('class="service-list"', html)
                self.assertNotIn('Brief in Development', html)
                self.assertNotIn('Content coming soon.', html)
            else:
                self.assertIn('Brief in Development', html)
                self.assertIn('Content coming soon.', html)
            self.assertIn(f'href="{stage["next"]}"', html)
            self.assertIn('<meta name="ga4-measurement-id" content="G-DVHD0KL633" />', html)
            self.assertIn('<script src="/scripts/runtime/ga4-bootstrap.js" defer></script>', html)
            self.assertRegex(html, r'<meta name="description" content="[^"]+" />')
            self.assertRegex(html, r'<link rel="canonical" href="https://romanbediner\.com/framework/[^"]+" />')
            self.assertRegex(html, r'<meta property="og:title" content="[^"]+" />')
            self.assertRegex(html, r'<meta property="og:description" content="[^"]+" />')
            self.assertIn('<meta property="og:type" content="article" />', html)
            self.assertRegex(html, r'<meta property="og:url" content="https://romanbediner\.com/framework/[^"]+" />')
            self.assertIn('<meta property="og:image" content="https://romanbediner.com/assets/og/framework-preview.png" />', html)
            self.assertIn('<meta name="twitter:card" content="summary_large_image" />', html)
            self.assertRegex(html, r'<meta name="twitter:title" content="[^"]+" />')
            self.assertRegex(html, r'<meta name="twitter:description" content="[^"]+" />')
            self.assertIn('<meta name="twitter:image" content="https://romanbediner.com/assets/og/framework-preview.png" />', html)

    def test_framework_css_contracts(self):
        self.assertRegex(self.framework_css, r"\.framework-diagram\s*\{[^}]*position:\s*sticky;[^}]*top:\s*90px;[^}]*z-index:\s*50;", re.S)
        self.assertRegex(self.framework_css, r"html\s*\{[^}]*scroll-behavior:\s*smooth;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-card\s*\{[^}]*scroll-margin-top:\s*160px;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-progress-line\s*\{[^}]*background:\s*#c6cdd8;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-progress-dot\s*\{[^}]*width:\s*10px;[^}]*height:\s*10px;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-progress-marker\.is-active\s+\.framework-progress-dot\s*\{[^}]*scale\(1\.25\);", re.S)
        self.assertRegex(self.framework_css, r"\.framework-progress-link:hover\s*\{[^}]*filter:\s*brightness\(0\.96\);", re.S)
        self.assertRegex(
            self.framework_css,
            r"\.framework-brief-main\s*>\s*\.framework-pill\s*\{[^}]*border:\s*2px\s+solid\s+currentColor;[^}]*background:\s*transparent;[^}]*cursor:\s*default;[^}]*pointer-events:\s*none;",
            re.S,
        )
        self.assertRegex(
            self.framework_css,
            r"\.brief-sticky-stage\s*\{[^}]*border:\s*2px\s+solid\s+currentColor;[^}]*background:\s*transparent;",
            re.S,
        )
        self.assertRegex(self.framework_css, r"\.framework-arrow svg\s*\{[^}]*stroke:\s*#8792a1;[^}]*stroke-width:\s*2\.2;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-brief-band\s*\{[^}]*display:\s*flex;[^}]*justify-content:\s*space-between;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-brief-band:hover\s*\{[^}]*color:\s*#2563eb;[^}]*background:\s*#eef4ff;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-brief-band:hover\s+\.framework-brief-arrow\s*\{[^}]*translateX\(4px\);", re.S)
        self.assertRegex(self.framework_css, r"\.framework-section:hover\s*\{[^}]*translateY\(-2px\);", re.S)


if __name__ == "__main__":
    unittest.main()
