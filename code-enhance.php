<?php
/**
 * Plugin Name:       Code Enhance
 * Description:       Extends the core Code block with language selection (Prism) and a configurable copy button.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Zain Syed
 * Author URI:        https://github.com/zeddotes
 * Plugin URI:        https://github.com/zeddotes/wp-code-enhance-block
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       code-enhance
 *
 * @package CodeEnhance
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CODE_ENHANCE_VERSION', '1.0.0' );
define( 'CODE_ENHANCE_FILE', __FILE__ );
define( 'CODE_ENHANCE_DIR', plugin_dir_path( __FILE__ ) );
define( 'CODE_ENHANCE_URL', plugin_dir_url( __FILE__ ) );

/**
 * Enqueue editor script that extends core/code.
 */
function code_enhance_enqueue_editor_assets() {
	$asset_file = CODE_ENHANCE_DIR . 'build/index.asset.php';

	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = include $asset_file;

	wp_enqueue_script(
		'code-enhance-editor',
		CODE_ENHANCE_URL . 'build/index.js',
		$asset['dependencies'],
		$asset['version'],
		true
	);

	wp_set_script_translations( 'code-enhance-editor', 'code-enhance' );
}
add_action( 'enqueue_block_editor_assets', 'code_enhance_enqueue_editor_assets' );

/**
 * Load editor canvas styles (iframe-safe via enqueue_block_assets).
 */
function code_enhance_enqueue_editor_styles() {
	if ( ! is_admin() ) {
		return;
	}

	$asset_file = CODE_ENHANCE_DIR . 'build/index.asset.php';
	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = include $asset_file;
	$editor_css = CODE_ENHANCE_DIR . 'build/index.css';

	if ( file_exists( $editor_css ) ) {
		wp_enqueue_style(
			'code-enhance-editor',
			CODE_ENHANCE_URL . 'build/index.css',
			array(),
			$asset['version']
		);
	}
}
add_action( 'enqueue_block_assets', 'code_enhance_enqueue_editor_styles' );

/**
 * Enqueue frontend Prism + copy-button assets on singular views.
 */
function code_enhance_enqueue_frontend_assets() {
	if ( ! is_singular() ) {
		return;
	}

	$asset_file = CODE_ENHANCE_DIR . 'build/view.asset.php';

	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = include $asset_file;

	wp_enqueue_script(
		'code-enhance-view',
		CODE_ENHANCE_URL . 'build/view.js',
		$asset['dependencies'],
		$asset['version'],
		array(
			'strategy'  => 'defer',
			'in_footer' => true,
		)
	);

	$view_css = CODE_ENHANCE_DIR . 'build/view.css';
	if ( file_exists( $view_css ) ) {
		wp_enqueue_style(
			'code-enhance-prism',
			CODE_ENHANCE_URL . 'build/view.css',
			array(),
			$asset['version']
		);
	}

	$style_file = CODE_ENHANCE_DIR . 'build/style-view.css';
	if ( file_exists( $style_file ) ) {
		wp_enqueue_style(
			'code-enhance-view',
			CODE_ENHANCE_URL . 'build/style-view.css',
			array( 'code-enhance-prism' ),
			$asset['version']
		);
	}
}
add_action( 'wp_enqueue_scripts', 'code_enhance_enqueue_frontend_assets' );
