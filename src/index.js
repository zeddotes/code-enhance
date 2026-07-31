/**
 * Extends core/code with language + copy-button controls.
 */
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { cloneElement, Children, isValidElement } from '@wordpress/element';

import {
	COPY_POSITION_OPTIONS,
	COPY_VISIBILITY_OPTIONS,
	LANGUAGE_OPTIONS,
} from './languages';
import './editor.scss';

const BLOCK_NAME = 'core/code';

/**
 * Register Code Enhance attributes on core/code.
 *
 * @param {Object} settings Block settings.
 * @param {string} name     Block name.
 * @return {Object} Filtered settings.
 */
function addCodeEnhanceAttributes( settings, name ) {
	if ( name !== BLOCK_NAME ) {
		return settings;
	}

	return {
		...settings,
		attributes: {
			...settings.attributes,
			language: {
				type: 'string',
				default: '',
			},
			showCopy: {
				type: 'boolean',
				default: true,
			},
			copyPosition: {
				type: 'string',
				default: 'top-right',
			},
			copyVisibility: {
				type: 'string',
				default: 'hover',
			},
		},
	};
}

addFilter(
	'blocks.registerBlockType',
	'code-enhance/attributes',
	addCodeEnhanceAttributes
);

/**
 * Merge class names, dropping empties.
 *
 * @param {...string} classNames Class name fragments.
 * @return {string} Merged className.
 */
function mergeClassNames( ...classNames ) {
	return classNames.filter( Boolean ).join( ' ' ).replace( /\s+/g, ' ' ).trim();
}

/**
 * Add copy-related classes/data attrs on the saved <pre>.
 *
 * @param {Object} props      Extra props.
 * @param {Object} blockType  Block type.
 * @param {Object} attributes Block attributes.
 * @return {Object} Filtered props.
 */
function addCodeEnhanceExtraProps( props, blockType, attributes ) {
	if ( blockType.name !== BLOCK_NAME ) {
		return props;
	}

	const {
		showCopy = true,
		copyPosition = 'top-right',
		copyVisibility = 'hover',
	} = attributes;

	if ( ! showCopy ) {
		return props;
	}

	return {
		...props,
		className: mergeClassNames(
			props.className,
			'has-copy-button',
			`copy-position-${ copyPosition }`,
			`copy-visibility-${ copyVisibility }`
		),
		'data-copy-position': copyPosition,
		'data-copy-visibility': copyVisibility,
	};
}

addFilter(
	'blocks.getSaveContent.extraProps',
	'code-enhance/extra-props',
	addCodeEnhanceExtraProps
);

/**
 * Add language-* class on the inner <code> element for Prism.
 *
 * @param {Object} element    Save element.
 * @param {Object} blockType  Block type.
 * @param {Object} attributes Block attributes.
 * @return {Object} Filtered element.
 */
function addCodeEnhanceSaveElement( element, blockType, attributes ) {
	if ( blockType.name !== BLOCK_NAME || ! element || ! attributes?.language ) {
		return element;
	}

	const languageClass = `language-${ attributes.language }`;

	const children = Children.map( element.props.children, ( child ) => {
		if ( ! isValidElement( child ) || child.type !== 'code' ) {
			return child;
		}

		return cloneElement( child, {
			className: mergeClassNames( child.props.className, languageClass ),
		} );
	} );

	return cloneElement( element, {
		className: mergeClassNames( element.props.className, languageClass ),
	}, children );
}

addFilter(
	'blocks.getSaveElement',
	'code-enhance/save-element',
	addCodeEnhanceSaveElement
);

/**
 * Inspector controls for language and copy button.
 */
const withCodeEnhanceControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		if ( props.name !== BLOCK_NAME ) {
			return <BlockEdit { ...props } />;
		}

		const { attributes, setAttributes } = props;
		const {
			language = '',
			showCopy = true,
			copyPosition = 'top-right',
			copyVisibility = 'hover',
		} = attributes;

		return (
			<>
				<BlockEdit { ...props } />
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
									label={ __( 'Copy button position', 'code-enhance' ) }
									value={ copyPosition }
									options={ COPY_POSITION_OPTIONS }
									onChange={ ( value ) =>
										setAttributes( { copyPosition: value } )
									}
								/>
								<SelectControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={ __( 'Copy button visibility', 'code-enhance' ) }
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
			</>
		);
	};
}, 'withCodeEnhanceControls' );

addFilter(
	'editor.BlockEdit',
	'code-enhance/inspector-controls',
	withCodeEnhanceControls
);
