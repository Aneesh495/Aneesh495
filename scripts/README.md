# Profile project link checker

This read-only GitHub API integration checks that the repositories linked from
the profile README are available, public, active, and not archived.

It uses the [GitHub CLI](https://cli.github.com/) to make REST API requests.
Install `gh`, authenticate with `gh auth login`, and run it with Python 3.10 or newer:

```sh
python3 scripts/check_project_links.py
```

The default README path is relative to the script, so the command also works
from another working directory. To check another Markdown file:

```sh
python3 scripts/check_project_links.py --readme path/to/README.md
```

Repeated repository links are checked once. Any unavailable, private, disabled,
or archived target makes the command exit with status 1. An unreadable input or
an input without repository links produces a usage error.

The GitHub CLI manages authentication and respects `GH_TOKEN` or `GITHUB_TOKEN`
when those environment variables are set. GitHub's API rate limits still apply.
The script does not read or print authentication credentials and does not create
or modify GitHub resources. Requests explicitly target `github.com` even when
the CLI's default host is an Enterprise instance.

Support: [parthas6@purdue.edu](mailto:parthas6@purdue.edu).
