# Contributing to Code Enhance

Thanks for helping improve Code Enhance. Collaboration is welcome — issues, discussions, and pull requests.

## Open an issue

Use GitHub Issues: [zeddotes/code-enhance/issues](https://github.com/zeddotes/code-enhance/issues)

- **Bug report** — unexpected behavior in the editor or on the frontend. Include WordPress version, theme, steps to reproduce, and screenshots when useful.
- **Feature request** — describe the authoring problem and how the feature would help. Check existing issues first to avoid duplicates.
- **Question** — usage or development questions are fine as issues if there is no discussion thread yet.

Please search open and closed issues before filing a new one.

## Pull requests

1. Fork the repo and create a branch from `main`.
2. Keep changes focused; match existing code style.
3. Run `npm install` and `npm run build` locally; fix any build failures.
4. Open a PR against `main` with a clear description of *why* the change exists.
5. Link related issues (`Fixes #123`).

CI must pass on the PR before merge.

## Development setup

```bash
git clone https://github.com/zeddotes/code-enhance.git
cd code-enhance
nvm use
npm install
npm start
```

Symlink or copy the plugin into a local WordPress `wp-content/plugins/` directory and activate **Code Enhance**.

## Releases

Version is defined in `package.json` (keep `readme.txt` / plugin header in sync).

Merging to `main` with a **new** `package.json` version creates a GitHub Release and attaches the WordPress-ready zip. Merges that do not bump the version still run CI but skip creating a duplicate release tag.
