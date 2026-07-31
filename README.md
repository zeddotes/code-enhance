# Code Enhance

[![CI](https://github.com/zeddotes/wp-code-enhance-block/actions/workflows/ci.yml/badge.svg)](https://github.com/zeddotes/wp-code-enhance-block/actions/workflows/ci.yml)
[![Release](https://github.com/zeddotes/wp-code-enhance-block/actions/workflows/release.yml/badge.svg)](https://github.com/zeddotes/wp-code-enhance-block/actions/workflows/release.yml)
[![License: GPL v2 or later](https://img.shields.io/badge/License-GPL%20v2%2B-blue.svg)](./LICENSE)

WordPress plugin that extends the core **Code** block (`core/code`) for technical authors — language-aware Prism highlighting, line numbers, tab/indent controls, and a configurable copy button.

No separate block type. Authors keep inserting the standard Code block; Code Enhance adds a **Code Enhance** panel in the sidebar.

**Repository:** [github.com/zeddotes/wp-code-enhance-block](https://github.com/zeddotes/wp-code-enhance-block)

## Features

- Language select with Prism.js highlighting in the block editor and on the frontend
- Optional line numbers
- Tab stays inside the block and indents; Shift+Tab outdents
- Indent with spaces or tabs; tab size 2 / 4 / 8
- Optional copy button (corner position + hover / always)
- Bundled Prism (no CDN, no remote calls)

## Requirements

- WordPress 6.0+
- PHP 7.4+
- Node 24+ (development / packaging only)

## Install (WordPress)

### From a release zip

1. Download `code-enhance-*.zip` from [Releases](https://github.com/zeddotes/wp-code-enhance-block/releases).
2. In WP Admin → **Plugins → Add New → Upload Plugin**, upload the zip and activate **Code Enhance**.
3. Edit a post, insert a **Code** block, open the **Code Enhance** panel.

### From source

```bash
git clone https://github.com/zeddotes/wp-code-enhance-block.git
cd wp-code-enhance-block
nvm use
npm install
npm run build
```

Copy or symlink this directory into `wp-content/plugins/` (folder name can be `code-enhance`), then activate the plugin.

## Development

```bash
nvm use
npm install
npm start          # watch build
```

| Script | Purpose |
|--------|---------|
| `npm start` | Development watch build |
| `npm run build` | Production assets into `build/` |
| `npm run package` | Build + WordPress upload zip in `dist/` |

Packaging produces:

- `dist/code-enhance-<version>.zip`
- `dist/code-enhance.zip`

Zip layout matches WordPress upload expectations: one root folder `code-enhance/` containing `code-enhance.php`, `readme.txt`, and `build/`.

## CI and releases

| Workflow | Trigger | What it does |
|----------|---------|----------------|
| [CI](.github/workflows/ci.yml) | Pull requests and pushes to `main` | `npm ci`, build, verify assets, package zip, upload artifact |
| [Release](.github/workflows/release.yml) | Push to `main` | If `v<package.json version>` does not exist yet, package the plugin and create a GitHub Release with the zip attached |

To cut a new release: bump the version in `package.json`, `readme.txt` (`Stable tag`), and `code-enhance.php`, open a PR, merge to `main`. The Release workflow tags `vX.Y.Z` and publishes the zip.

Merges that do not change the version still run CI; they do not recreate an existing tag.

## Contributing

Collaboration is welcome.

- **Bugs and features:** open an issue using the templates — [New issue](https://github.com/zeddotes/wp-code-enhance-block/issues/new/choose)
- **Browse issues:** [Issues](https://github.com/zeddotes/wp-code-enhance-block/issues)
- **Pull requests:** fork, branch from `main`, keep changes focused, ensure CI passes

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, issue guidelines, and the release versioning rule.

## Project layout

```
code-enhance.php          # Plugin bootstrap + asset enqueue
src/                      # Editor + frontend sources
build/                    # Compiled assets (generated)
bin/package-plugin.sh     # WordPress zip packager
readme.txt                # WordPress.org-style readme
```

## License

GPL-2.0-or-later. See [LICENSE](./LICENSE).

Prism.js is MIT-licensed and bundled in the build.

## Author

[Zain Syed](https://github.com/zeddotes) ([@zeddotes](https://github.com/zeddotes))
