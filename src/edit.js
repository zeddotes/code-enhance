/**
 * Custom core/code editor: Prism preview, tab capture, indent settings.
 */
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { useEffect, useLayoutEffect, useMemo, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { applyIndent } from './indent';
import {
	COPY_POSITION_OPTIONS,
	COPY_VISIBILITY_OPTIONS,
	LANGUAGE_OPTIONS,
	TAB_SIZE_OPTIONS,
} from './languages';
import { highlightCode } from './prism';

/**
 * Decode common HTML entities from stored RichText content.
 *
 * @param {string} value Stored content.
 * @return {string} Plain text.
 */
function toPlainText( value ) {
	if ( ! value ) {
		return '';
	}

	if ( ! /[&<]/.test( value ) ) {
		return value;
	}

	const el = document.createElement( 'textarea' );
	el.innerHTML = value;
	return el.value;
}

/**
 * Count display lines (minimum 1).
 *
 * @param {string} value Plain text.
 * @return {number} Line count.
 */
function countLines( value ) {
	if ( ! value ) {
		return 1;
	}
	return value.split( '\n' ).length;
}

/**
 * Code Enhance block edit UI (replaces core Code edit).
 *
 * @param {Object} props Block edit props.
 * @return {JSX.Element} Editor UI.
 */
export default function CodeEnhanceEdit( props ) {
	const { attributes, setAttributes } = props;
	const {
		content = '',
		language = '',
		showCopy = true,
		copyPosition = 'top-right',
		copyVisibility = 'hover',
		tabSize = 4,
		indentWithSpaces = true,
		showLineNumbers = false,
	} = attributes;

	const plainContent = useMemo( () => toPlainText( content ), [ content ] );
	const lineCount = useMemo(
		() => countLines( plainContent ),
		[ plainContent ]
	);

	const textareaRef = useRef( null );
	const highlightRef = useRef( null );
	const gutterRef = useRef( null );
	const pendingSelection = useRef( null );

	const highlighted = useMemo(
		() => highlightCode( plainContent, language ) + '\n',
		[ plainContent, language ]
	);

	const languageClass = language ? `language-${ language }` : '';
	const resolvedTabSize = Number( tabSize ) || 4;

	const blockProps = useBlockProps( {
		className: [
			'code-enhance-editor',
			languageClass,
			showCopy ? 'has-copy-button' : '',
			showLineNumbers ? 'show-line-numbers' : '',
		]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			tabSize: resolvedTabSize,
			MozTabSize: resolvedTabSize,
		},
	} );

	useEffect( () => {
		if ( ! pendingSelection.current || ! textareaRef.current ) {
			return;
		}
		const { start, end } = pendingSelection.current;
		textareaRef.current.focus();
		textareaRef.current.setSelectionRange( start, end );
		pendingSelection.current = null;
	}, [ plainContent ] );

	useLayoutEffect( () => {
		const textarea = textareaRef.current;
		if ( ! textarea ) {
			return;
		}

		textarea.style.height = 'auto';
		textarea.style.height = `${ textarea.scrollHeight }px`;
	}, [ plainContent, showLineNumbers, resolvedTabSize ] );

	const syncScroll = () => {
		if ( ! textareaRef.current ) {
			return;
		}
		const { scrollTop, scrollLeft } = textareaRef.current;
		if ( highlightRef.current ) {
			highlightRef.current.scrollTop = scrollTop;
			highlightRef.current.scrollLeft = scrollLeft;
		}
		if ( gutterRef.current ) {
			gutterRef.current.scrollTop = scrollTop;
		}
	};

	const updateContent = ( next, nextSelection ) => {
		if ( nextSelection ) {
			pendingSelection.current = nextSelection;
		}
		setAttributes( { content: next } );
	};

	const onKeyDown = ( event ) => {
		if ( event.key !== 'Tab' ) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const textarea = event.target;
		const result = applyIndent( {
			value: textarea.value,
			selectionStart: textarea.selectionStart,
			selectionEnd: textarea.selectionEnd,
			outdent: event.shiftKey,
			indentWithSpaces,
			tabSize: resolvedTabSize,
		} );

		updateContent( result.value, {
			start: result.selectionStart,
			end: result.selectionEnd,
		} );
	};

	const lineNumberMarks = useMemo( () => {
		const marks = [];
		for ( let i = 1; i <= lineCount; i++ ) {
			marks.push( <span key={ i }>{ i }</span> );
		}
		return marks;
	}, [ lineCount ] );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Code Enhance', 'code-enhance' ) }
					initialOpen={ true }
				>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Language', 'code-enhance' ) }
						value={ language }
						options={ LANGUAGE_OPTIONS }
						onChange={ ( value ) =>
							setAttributes( { language: value } )
						}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Show line numbers', 'code-enhance' ) }
						checked={ !! showLineNumbers }
						onChange={ ( value ) =>
							setAttributes( { showLineNumbers: value } )
						}
					/>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Tab size', 'code-enhance' ) }
						value={ String( resolvedTabSize ) }
						options={ TAB_SIZE_OPTIONS }
						onChange={ ( value ) =>
							setAttributes( { tabSize: Number( value ) } )
						}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Indent with spaces', 'code-enhance' ) }
						help={ __(
							'When enabled, Tab inserts spaces instead of a tab character.',
							'code-enhance'
						) }
						checked={ !! indentWithSpaces }
						onChange={ ( value ) =>
							setAttributes( { indentWithSpaces: value } )
						}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Show copy button', 'code-enhance' ) }
						checked={ !! showCopy }
						onChange={ ( value ) =>
							setAttributes( { showCopy: value } )
						}
					/>
					{ showCopy && (
						<>
							<SelectControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __(
									'Copy button position',
									'code-enhance'
								) }
								value={ copyPosition }
								options={ COPY_POSITION_OPTIONS }
								onChange={ ( value ) =>
									setAttributes( { copyPosition: value } )
								}
							/>
							<SelectControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __(
									'Copy button visibility',
									'code-enhance'
								) }
								value={ copyVisibility }
								options={ COPY_VISIBILITY_OPTIONS }
								onChange={ ( value ) =>
									setAttributes( { copyVisibility: value } )
								}
							/>
						</>
					) }
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ showLineNumbers && (
					<div
						ref={ gutterRef }
						className="code-enhance-line-numbers"
						aria-hidden="true"
					>
						{ lineNumberMarks }
					</div>
				) }
				<pre
					ref={ highlightRef }
					className={ `code-enhance-highlight ${ languageClass }` }
					aria-hidden="true"
				>
					<code
						className={ languageClass }
						dangerouslySetInnerHTML={ { __html: highlighted } }
					/>
				</pre>
				<textarea
					ref={ textareaRef }
					className="code-enhance-textarea"
					value={ plainContent }
					rows={ lineCount }
					spellCheck={ false }
					autoCapitalize="off"
					autoComplete="off"
					autoCorrect="off"
					aria-label={ __( 'Code', 'code-enhance' ) }
					onScroll={ syncScroll }
					onKeyDown={ onKeyDown }
					onChange={ ( event ) => {
						updateContent( event.target.value, {
							start: event.target.selectionStart,
							end: event.target.selectionEnd,
						} );
					} }
				/>
			</div>
		</>
	);
}
