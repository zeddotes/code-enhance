/**
 * Shared Prism setup (languages + default theme).
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

import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/themes/prism-okaidia.css';

/**
 * Highlight source for a Prism language id.
 *
 * @param {string} code     Source code.
 * @param {string} language Prism language id (empty = plain escape).
 * @return {string} HTML string.
 */
export function highlightCode( code, language ) {
	const source = code || '';

	if ( ! language || ! Prism.languages[ language ] ) {
		return Prism.util.encode( source );
	}

	return Prism.highlight( source, Prism.languages[ language ], language );
}

export default Prism;
