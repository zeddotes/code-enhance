/**
 * Extends core/code with language, copy button, editor highlighting, and tabs.
 */
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { cloneElement, Children, isValidElement } from '@wordpress/element';

import CodeEnhanceEdit from './edit';
import './style.scss';
import './editor.scss';

const BLOCK_NAME = 'core/code';

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
			copyPlacement: {
				type: 'string',
				default: 'after',
			},
			copyAlign: {
				type: 'string',
				default: 'right',
			},
			tabSize: {
				type: 'number',
				default: 4,
			},
			indentWithSpaces: {
				type: 'boolean',
				default: true,
			},
			showLineNumbers: {
				type: 'boolean',
				default: false,
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
 * Add copy-related classes/data attrs and tab-size on the saved <pre>.
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
		copyPlacement = 'after',
		copyAlign = 'right',
		tabSize = 4,
		showLineNumbers = false,
	} = attributes;

	const resolvedTabSize = Number( tabSize ) || 4;
	const placement = copyPlacement === 'before' ? 'before' : 'after';
	const align = [ 'left', 'center', 'right' ].includes( copyAlign )
		? copyAlign
		: 'right';
	const extraClasses = [];

	if ( showLineNumbers ) {
		extraClasses.push( 'line-numbers' );
	}

	if ( showCopy ) {
		extraClasses.push(
			'has-copy-button',
			`copy-placement-${ placement }`,
			`copy-align-${ align }`
		);
	}

	const next = {
		...props,
		className: mergeClassNames( props.className, ...extraClasses ),
		style: {
			...( props.style || {} ),
			tabSize: resolvedTabSize,
			MozTabSize: resolvedTabSize,
		},
		'data-tab-size': String( resolvedTabSize ),
	};

	if ( showCopy ) {
		next[ 'data-copy-placement' ] = placement;
		next[ 'data-copy-align' ] = align;
	}

	return next;
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

	return cloneElement(
		element,
		{
			className: mergeClassNames( element.props.className, languageClass ),
		},
		children
	);
}

addFilter(
	'blocks.getSaveElement',
	'code-enhance/save-element',
	addCodeEnhanceSaveElement
);

/**
 * Replace core Code edit with the Code Enhance editor.
 */
const withCodeEnhanceEdit = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		if ( props.name !== BLOCK_NAME ) {
			return <BlockEdit { ...props } />;
		}

		return <CodeEnhanceEdit { ...props } />;
	};
}, 'withCodeEnhanceEdit' );

addFilter( 'editor.BlockEdit', 'code-enhance/edit', withCodeEnhanceEdit );
