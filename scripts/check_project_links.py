#!/usr/bin/env python3
"""Check the profile's project links against GitHub's repository API."""

import argparse
import json
from pathlib import Path
import re
import subprocess


ROOT = Path(__file__).resolve().parents[1]
REPOSITORY_URL = re.compile(r"https://github\.com/([A-Za-z0-9-]+)/([A-Za-z0-9_.-]+)")


def repositories(markdown):
    return sorted({f"{owner}/{repo.removesuffix('.git')}"
                   for owner, repo in REPOSITORY_URL.findall(markdown)})


def check_repository(name):
    try:
        result = subprocess.run(
            ["gh", "api", "--hostname", "github.com", f"repos/{name}"],
            stdin=subprocess.DEVNULL, capture_output=True, text=True, timeout=30,
        )
    except (OSError, subprocess.TimeoutExpired) as error:
        return f"could not read repository metadata: {error}"
    if result.returncode:
        return result.stderr.strip().splitlines()[0] if result.stderr.strip() else "GitHub API request failed"
    try:
        metadata = json.loads(result.stdout)
    except ValueError:
        return "GitHub API returned invalid JSON"
    if metadata.get("private"):
        return "repository is private"
    if metadata.get("archived"):
        return "repository is archived"
    if metadata.get("disabled"):
        return "repository is disabled"
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--readme", type=Path, default=ROOT / "README.md")
    args = parser.parse_args()
    try:
        names = repositories(args.readme.read_text(encoding="utf-8"))
    except (OSError, UnicodeError) as error:
        parser.error(str(error))
    if not names:
        parser.error("no GitHub repository links found")
    failures = 0
    for name in names:
        error = check_repository(name)
        print(f"[FAIL] {name}: {error}" if error else f"[OK] {name}")
        failures += error is not None
    print(f"Checked {len(names)} repositories; {failures} failed")
    return int(failures != 0)


if __name__ == "__main__":
    raise SystemExit(main())
