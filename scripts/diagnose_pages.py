#!/usr/bin/env python3
"""
GitHub Pages diagnostics for rbediner/romanbediner.com.

Checks:
1) Root CNAME existence/content
2) Required root HTML files
3) Custom-domain related config files
4) _config.yml conflicts
5) Repo default branch and (if available) Pages source branch/path
6) GET /repos/{owner}/{repo}/pages API report
"""

import json
import os
import urllib.error
import urllib.request
from pathlib import Path


OWNER = "rbediner"
REPO = "romanbediner.com"
EXPECTED_DOMAIN = "romanbediner.com"
# Route refactor: clean URL folders are canonical; only homepage remains root-level HTML.
REQUIRED_ROOT_FILES = ["index.html", "about/index.html", "services/index.html", "connect/index.html", "insights/index.html"]


def api_get(url: str, token: str):
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "pages-diagnostic-script",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return resp.getcode(), json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(body)
        except json.JSONDecodeError:
            parsed = {"raw": body}
        return exc.code, parsed
    except urllib.error.URLError as exc:
        return 0, {"error": f"network_error: {exc.reason}"}


def check_cname(repo_root: Path):
    cname = repo_root / "CNAME"
    if not cname.exists():
        return {"present": False, "content": None, "valid": False}
    content = cname.read_text(encoding="utf-8")
    trimmed = content.strip()
    valid = trimmed == EXPECTED_DOMAIN and content in {EXPECTED_DOMAIN, EXPECTED_DOMAIN + "\n"}
    return {"present": True, "content": trimmed, "valid": valid}


def check_required_files(repo_root: Path):
    out = {}
    for rel in REQUIRED_ROOT_FILES:
        out[rel] = (repo_root / rel).exists()
    return out


def check_config_conflicts(repo_root: Path):
    cfg_path = repo_root / "_config.yml"
    if not cfg_path.exists():
        return {"present": False, "conflicts": []}
    text = cfg_path.read_text(encoding="utf-8", errors="replace")
    conflicts = []
    for key in ("url:", "baseurl:", "cname:", "domain:", "custom_domain:"):
        if key in text:
            conflicts.append(key.rstrip(":"))
    return {"present": True, "conflicts": conflicts}


def internal_link_check(repo_root: Path):
    # Refactor: ensure internal links align with clean URL routes and reject removed /contact/ route.
    pages = [repo_root / rel for rel in REQUIRED_ROOT_FILES]
    non_root_hits = []
    root_hits = 0
    for page in pages:
        if not page.exists():
            continue
        text = page.read_text(encoding="utf-8", errors="replace")
        for rel in (
            'href="index.html"',
            'href="about.html"',
            'href="services.html"',
            'href="contact.html"',
            'href="/contact/"',
        ):
            if rel in text:
                non_root_hits.append((page.name, rel))
        for root_rel in ('href="/"', 'href="/about/"', 'href="/services/"', 'href="/connect/"', 'href="/insights/"'):
            root_hits += text.count(root_rel)
    return {"root_relative_hits": root_hits, "non_root_hits": non_root_hits}


def main():
    repo_root = Path(__file__).resolve().parents[1]
    token = os.getenv("GITHUB_TOKEN", "").strip()

    cname = check_cname(repo_root)
    files = check_required_files(repo_root)
    cfg = check_config_conflicts(repo_root)
    links = internal_link_check(repo_root)

    repo_url = f"https://api.github.com/repos/{OWNER}/{REPO}"
    pages_url = f"{repo_url}/pages"
    repo_code, repo_data = api_get(repo_url, token)
    pages_code, pages_data = api_get(pages_url, token)

    warnings = []
    fixes = []

    if not cname["present"]:
        warnings.append("CNAME is missing at repository root.")
        fixes.append("Create root CNAME file containing exactly: romanbediner.com")
    elif not cname["valid"]:
        warnings.append(f"CNAME content is invalid: {cname['content']!r}")
        fixes.append("Set CNAME content to exactly romanbediner.com (optionally trailing newline only).")

    missing = [f for f, ok in files.items() if not ok]
    if missing:
        warnings.append(f"Missing required root files: {', '.join(missing)}")
        fixes.append("Restore canonical route files: index.html, about/index.html, services/index.html, connect/index.html, insights/index.html")

    if cfg["present"] and cfg["conflicts"]:
        warnings.append(f"_config.yml contains potentially conflicting keys: {', '.join(cfg['conflicts'])}")
        fixes.append("Remove/align conflicting _config.yml domain/baseurl settings.")

    if links["non_root_hits"]:
        warnings.append("Found non-root-relative internal links in primary pages.")
        fixes.append("Use clean root-relative links such as /about/, /services/, and /connect/.")

    if repo_code == 0:
        warnings.append("Repository API check could not run due to network/DNS error in current environment.")
        fixes.append("Run this script from a network-enabled environment (or rerun with proper network access).")
    elif repo_code != 200:
        warnings.append(f"Repository API check failed with HTTP {repo_code}.")
        fixes.append("Verify repository owner/name and API access.")
    else:
        if repo_data.get("default_branch") != "main":
            warnings.append(f"Default branch is {repo_data.get('default_branch')!r}, expected 'main'.")
            fixes.append("Set default branch to main in repository settings.")

    if pages_code == 0:
        warnings.append("Pages API check could not run due to network/DNS error in current environment.")
        fixes.append("Run this script from a network-enabled environment; optionally set GITHUB_TOKEN for full Pages details.")
    elif pages_code != 200:
        warnings.append(
            f"Pages API endpoint returned HTTP {pages_code}; unable to verify source path/domain state from API."
        )
        fixes.append(
            "Set GITHUB_TOKEN (repo admin scope) and rerun script to fetch /pages details; verify Pages source is main + /(root)."
        )

    print("GitHub Pages Diagnostic Report")
    print("=" * 32)
    print(f"Repository: {OWNER}/{REPO}")
    print()

    print("1) CNAME")
    print(f"- Present: {cname['present']}")
    print(f"- Content: {cname['content']!r}")
    print(f"- Valid exact value: {cname['valid']}")
    print()

    print("2) Required Root Files")
    for file_name, ok in files.items():
        print(f"- {file_name}: {'OK' if ok else 'MISSING'}")
    print()

    print("3) Custom Domain Config Files")
    print(f"- _config.yml present: {cfg['present']}")
    if cfg["present"]:
        print(f"- Potential domain keys found: {cfg['conflicts']}")
    else:
        print("- No _config.yml file detected")
    print()

    print("4) Internal Link Path Audit")
    print(f"- Root-relative link hits: {links['root_relative_hits']}")
    print(f"- Non-root-relative hits: {len(links['non_root_hits'])}")
    for page, rel in links["non_root_hits"][:10]:
        print(f"  - {page}: {rel}")
    print()

    print("5) Repository + Pages API Validation")
    print(f"- Repo API HTTP status: {repo_code}")
    if repo_code == 200:
        print(f"- Default branch: {repo_data.get('default_branch')}")
        print(f"- has_pages: {repo_data.get('has_pages')}")
    print(f"- Pages API HTTP status: {pages_code}")
    if pages_code == 200:
        # GitHub returns 'cname' in this endpoint; report both names for clarity.
        print(f"- custom_domain/cname: {pages_data.get('cname')}")
        source = pages_data.get("source") or {}
        print(f"- source branch: {source.get('branch')}")
        print(f"- source path: {source.get('path')}")
        print(f"- status: {pages_data.get('status')}")
    else:
        print(f"- Pages API response: {pages_data}")
    print()

    print("Warnings")
    if warnings:
        for item in warnings:
            print(f"- {item}")
    else:
        print("- None")
    print()

    print("Suggested Fixes")
    if fixes:
        for item in fixes:
            print(f"- {item}")
    else:
        print("- No fixes required")


if __name__ == "__main__":
    main()
