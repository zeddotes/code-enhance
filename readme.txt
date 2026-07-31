=== Code Enhance ===
Contributors: zeddotes
Tags: code, syntax highlighting, prism, copy, gutenberg
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Extends the core Code block with language selection (Prism.js) and a configurable copy button.

== Description ==

Code Enhance adds inspector controls to the WordPress core Code block:

* Language select for Prism.js syntax highlighting on the frontend
* Optional copy button with corner position (top/bottom × left/right)
* Copy button visibility: on hover or always visible

No separate block type — authors keep using the standard Code block.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/code-enhance` (or this directory name).
2. Run `npm install` and `npm run build` if `build/` is not present.
3. Activate the plugin through the Plugins screen.
4. Insert a Code block and open the **Code Enhance** panel in the sidebar.

== Frequently Asked Questions ==

= Does this replace the core Code block? =

No. It extends `core/code` via block filters.

= Where does highlighting run? =

On the frontend only, via a bundled Prism.js build.

== Changelog ==

= 1.0.0 =
* Initial release: language select, Prism highlighting, configurable copy button.
