/**
 * Indent / outdent helpers for the code textarea.
 */

/**
 * Build one indent unit.
 *
 * @param {boolean} indentWithSpaces Use spaces instead of a tab character.
 * @param {number}  tabSize          Spaces per indent when using spaces.
 * @return {string} Indent string.
 */
export function getIndentUnit( indentWithSpaces, tabSize ) {
	if ( indentWithSpaces ) {
		return ' '.repeat( Math.max( 1, tabSize ) );
	}
	return '\t';
}

/**
 * Characters to remove when outdenting a line.
 *
 * @param {string} line    Line text.
 * @param {number} tabSize Tab size for space outdent.
 * @return {number} Characters to remove.
 */
export function getOutdentLength( line, tabSize ) {
	if ( line.startsWith( '\t' ) ) {
		return 1;
	}

	const size = Math.max( 1, tabSize );
	let i = 0;
	while ( i < size && line[ i ] === ' ' ) {
		i++;
	}
	return i;
}

/**
 * Expand a selection to full line boundaries.
 *
 * @param {string} value          Full text.
 * @param {number} selectionStart Selection start.
 * @param {number} selectionEnd   Selection end.
 * @return {{ start: number, end: number }} Line block offsets.
 */
function getLineBlockRange( value, selectionStart, selectionEnd ) {
	const start = value.lastIndexOf( '\n', selectionStart - 1 ) + 1;
	let end = selectionEnd;

	// If the selection ends on a newline, keep that line out of the block.
	if ( end > start && value[ end - 1 ] === '\n' ) {
		end -= 1;
	}

	const nextBreak = value.indexOf( '\n', end );
	end = nextBreak === -1 ? value.length : nextBreak;

	return { start, end };
}

/**
 * Apply tab / shift-tab to textarea value and selection.
 *
 * @param {Object}  args                  Args.
 * @param {string}  args.value            Current value.
 * @param {number}  args.selectionStart   Selection start.
 * @param {number}  args.selectionEnd     Selection end.
 * @param {boolean} args.outdent          Whether to outdent.
 * @param {boolean} args.indentWithSpaces Spaces mode.
 * @param {number}  args.tabSize          Tab size.
 * @return {{ value: string, selectionStart: number, selectionEnd: number }} Result.
 */
export function applyIndent( {
	value,
	selectionStart,
	selectionEnd,
	outdent,
	indentWithSpaces,
	tabSize,
} ) {
	const unit = getIndentUnit( indentWithSpaces, tabSize );
	const hasSelection = selectionStart !== selectionEnd;

	if ( ! hasSelection && ! outdent ) {
		const next =
			value.slice( 0, selectionStart ) +
			unit +
			value.slice( selectionEnd );
		const cursor = selectionStart + unit.length;
		return {
			value: next,
			selectionStart: cursor,
			selectionEnd: cursor,
		};
	}

	const { start, end } = getLineBlockRange(
		value,
		selectionStart,
		selectionEnd
	);
	const block = value.slice( start, end );
	const lines = block.split( '\n' );

	let firstLineDelta = 0;
	let totalDelta = 0;

	const nextLines = lines.map( ( line, index ) => {
		if ( outdent ) {
			const remove = getOutdentLength( line, tabSize );
			if ( remove === 0 ) {
				return line;
			}
			if ( index === 0 ) {
				firstLineDelta = -Math.min( remove, selectionStart - start );
			}
			totalDelta -= remove;
			return line.slice( remove );
		}

		if ( index === 0 ) {
			firstLineDelta = unit.length;
		}
		totalDelta += unit.length;
		return unit + line;
	} );

	const nextValue =
		value.slice( 0, start ) + nextLines.join( '\n' ) + value.slice( end );

	return {
		value: nextValue,
		selectionStart: selectionStart + firstLineDelta,
		selectionEnd: selectionEnd + totalDelta,
	};
}
