"""Offline regressions for the profile's GitHub API integration."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

import check_project_links as checker


class ProjectLinksTests(unittest.TestCase):
    def result(self, metadata):
        return subprocess.CompletedProcess([], 0, json.dumps(metadata), "")

    def test_repository_urls_are_deduplicated(self):
        text = "[a](https://github.com/alice/project) [b](https://github.com/alice/project.git)"
        self.assertEqual(checker.repositories(text), ["alice/project"])

    def test_active_public_repository_passes(self):
        with patch.object(checker.subprocess, "run", return_value=self.result({"private": False, "archived": False})) as run:
            self.assertIsNone(checker.check_repository("alice/project"))
        self.assertEqual(run.call_args.args[0][2:4], ["--hostname", "github.com"])

    def test_ineligible_repository_states_fail(self):
        for field in ("private", "archived", "disabled"):
            with self.subTest(field=field), patch.object(checker.subprocess, "run", return_value=self.result({field: True})):
                self.assertIn(field, checker.check_repository("alice/project"))

    def test_api_failure_is_reported(self):
        result = subprocess.CompletedProcess([], 1, "", "gh: Not Found (HTTP 404)")
        with patch.object(checker.subprocess, "run", return_value=result):
            self.assertIn("404", checker.check_repository("alice/missing"))

    def test_invalid_json_is_reported(self):
        with patch.object(checker.subprocess, "run", return_value=subprocess.CompletedProcess([], 0, "not JSON", "")):
            self.assertIn("invalid JSON", checker.check_repository("alice/project"))

    def test_missing_cli_and_timeout_are_reported(self):
        for error in (FileNotFoundError("gh"), subprocess.TimeoutExpired("gh", 30)):
            with self.subTest(error=type(error).__name__), patch.object(checker.subprocess, "run", side_effect=error):
                self.assertIn("could not read", checker.check_repository("alice/project"))

    def test_empty_markdown_is_a_usage_error(self):
        with tempfile.TemporaryDirectory() as directory:
            readme = Path(directory) / "README.md"
            readme.write_text("No project links here", encoding="utf-8")
            result = subprocess.run([sys.executable, str(Path(checker.__file__)), "--readme", str(readme)],
                                    capture_output=True, text=True)
        self.assertEqual(result.returncode, 2)
        self.assertIn("no GitHub repository links found", result.stderr)


if __name__ == "__main__":
    unittest.main()
