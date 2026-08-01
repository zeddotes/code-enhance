/**
 * Custom core/code editor: Prism preview, tab capture, indent settings.
 */
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { useEffect, useLayoutEffect, useMemo, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { applyIndent } from './indent';
import {
	COPY_ALIGN_OPTIONS,
	COPY_PLACEMENT_OPTIONS,
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
 * Non-interactive copy toolbar preview for the editor.
 *
 * @param {Object} props          Props.
 * @param {string} props.align    left|center|right.
 * @param {string} props.placement before|after.
 * @return {JSX.Element} Toolbar.
 */
function CopyBarPreview( { align } ) {
	return (
		<div
			className={ `code-enhance-copy-bar copy-align-${ align }` }
			aria-hidden="true"
		>
			<button type="button" className="code-enhance-copy" tabIndex={ -1 }>
				{ __( 'Copy', 'code-enhance' ) }
			</button>
		</div>
	);
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
		copyPlacement = 'after',
		copyAlign = 'right',
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
	const placement = copyPlacement === 'before' ? 'before' : 'after';
	const align = [ 'left', 'center', 'right' ].includes( copyAlign )
		? copyAlign
		: 'right';

	const blockProps = useBlockProps( {
		className: [
			'code-enhance-shell',
			showCopy ? 'has-copy-button' : '',
		]
			.filter( Boolean )
			.join( ' ' ),
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

	const copyBar = showCopy ? <CopyBarPreview align={ align } /> : null;

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
									'Copy button placement',
									'code-enhance'
								) }
								value={ placement }
								options={ COPY_PLACEMENT_OPTIONS }
								onChange={ ( value ) =>
									setAttributes( { copyPlacement: value } )
								}
							/>
							<SelectControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __(
									'Copy button alignment',
									'code-enhance'
								) }
								value={ align }
								options={ COPY_ALIGN_OPTIONS }
								onChange={ ( value ) =>
									setAttributes( { copyAlign: value } )
								}
							/>
						</>
					) }
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ showCopy && placement === 'before' && copyBar }
				<div
					className={ [
						'code-enhance-editor',
						languageClass,
						showLineNumbers ? 'show-line-numbers' : '',
					]
						.filter( Boolean )
						.join( ' ' ) }
					style={ {
						tabSize: resolvedTabSize,
						MozTabSize: resolvedTabSize,
					} }
				>
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
				{ showCopy && placement === 'after' && copyBar }
			</div>
		</>
	);
}
