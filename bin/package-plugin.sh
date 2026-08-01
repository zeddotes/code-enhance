#!/usr/bin/env bash
# Build and zip Code Enhance for WordPress Plugins → Upload Plugin.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGIN_SLUG="code-enhance"
VERSION="$(node -p "require('${ROOT}/package.json').version")"
DIST_DIR="${ROOT}/dist"
STAGE_DIR="${DIST_DIR}/.stage/${PLUGIN_SLUG}"
ZIP_NAME="${PLUGIN_SLUG}-${VERSION}.zip"
ZIP_PATH="${DIST_DIR}/${ZIP_NAME}"

cd "${ROOT}"

# Prefer nvm locally; CI uses actions/setup-node.
if [[ -z "${CI:-}" && -s "${HOME}/.nvm/nvm.sh" ]]; then
	# shellcheck source=/dev/null
	. "${HOME}/.nvm/nvm.sh"
	nvm use
fi

if [[ ! -d node_modules ]]; then
	if [[ -n "${CI:-}" ]]; then
		npm ci
	else
		npm install
	fi
fi

npm run build

if [[ ! -f build/index.js || ! -f build/view.js || ! -f build/index.asset.php || ! -f build/view.asset.php ]]; then
	echo "error: build output missing required assets" >&2
	exit 1
fi

# Shared styles may land on either entry depending on imports.
if [[ ! -f build/style-view.css && ! -f build/style-index.css ]]; then
	echo "error: build output missing style-*.css" >&2
	exit 1
fi

rm -rf "${DIST_DIR}/.stage"
mkdir -p "${STAGE_DIR}"

# Runtime payload only — matches WP upload expectations (one plugin root folder).
cp "${ROOT}/code-enhance.php" "${STAGE_DIR}/"
cp "${ROOT}/readme.txt" "${STAGE_DIR}/"
cp -R "${ROOT}/build" "${STAGE_DIR}/build"

# Drop source maps and junk if present.
find "${STAGE_DIR}" -name '*.map' -delete
find "${STAGE_DIR}" -name '.DS_Store' -delete

rm -f "${ZIP_PATH}" "${DIST_DIR}/${PLUGIN_SLUG}.zip"

(
	cd "${DIST_DIR}/.stage"
	zip -r "${ZIP_PATH}" "${PLUGIN_SLUG}" -x '*.DS_Store'
)

# Convenience alias without version for quick uploads.
cp "${ZIP_PATH}" "${DIST_DIR}/${PLUGIN_SLUG}.zip"

rm -rf "${DIST_DIR}/.stage"

echo "Created ${ZIP_PATH}"
echo "Also:   ${DIST_DIR}/${PLUGIN_SLUG}.zip"
echo
echo "Upload either zip via WP Admin → Plugins → Add New → Upload Plugin."
unzip -l "${ZIP_PATH}" | head -n 40
