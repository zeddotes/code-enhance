/**
 * Frontend: Prism highlighting + copy button injection.
 */
import Prism from 'prismjs';

import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-scss';

import 'prismjs/themes/prism-okaidia.css';
import './style.scss';

const COPY_LABEL = 'Copy';
const COPIED_LABEL = 'Copied';
const COPIED_MS = 2000;

/**
 * Copy text with Clipboard API and execCommand fallback.
 *
 * @param {string} text Text to copy.
 * @return {Promise<boolean>} Whether copy succeeded.
 */
async function copyText( text ) {
	if ( navigator.clipboard && window.isSecureContext ) {
		try {
			await navigator.clipboard.writeText( text );
			return true;
		} catch ( err ) {
			// Fall through to execCommand.
		}
	}

	const textarea = document.createElement( 'textarea' );
	textarea.value = text;
	textarea.setAttribute( 'readonly', '' );
	textarea.style.position = 'fixed';
	textarea.style.opacity = '0';
	document.body.appendChild( textarea );
	textarea.select();

	let ok = false;
	try {
		ok = document.execCommand( 'copy' );
	} catch ( err ) {
		ok = false;
	}

	document.body.removeChild( textarea );
	return ok;
}

/**
 * Inject a copy button into a code block wrapper.
 *
 * @param {HTMLElement} blockEl .wp-block-code element.
 */
function enhanceCopyButton( blockEl ) {
	if ( blockEl.querySelector( '.code-enhance-copy' ) ) {
		return;
	}

	const codeEl = blockEl.querySelector( 'code' );
	if ( ! codeEl ) {
		return;
	}

	const button = document.createElement( 'button' );
	button.type = 'button';
	button.className = 'code-enhance-copy';
	button.textContent = COPY_LABEL;
	button.setAttribute( 'aria-label', COPY_LABEL );

	button.addEventListener( 'click', async () => {
		const ok = await copyText( codeEl.textContent || '' );
		if ( ! ok ) {
			return;
		}

		button.textContent = COPIED_LABEL;
		button.classList.add( 'is-copied' );

		window.setTimeout( () => {
			button.textContent = COPY_LABEL;
			button.classList.remove( 'is-copied' );
		}, COPIED_MS );
	} );

	blockEl.appendChild( button );
}

/**
 * Initialize Prism and copy buttons.
 */
function init() {
	const blocks = document.querySelectorAll( '.wp-block-code' );

	blocks.forEach( ( blockEl ) => {
		if ( blockEl.classList.contains( 'has-copy-button' ) ) {
			enhanceCopyButton( blockEl );
		}
	} );

	Prism.highlightAll();
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
